package com.fanconnect.service.impl;

import com.fanconnect.dto.response.BusinessOccupancyResponse;
import com.fanconnect.dto.response.BusinessSummaryResponse;
import com.fanconnect.dto.response.MatchRecommendationsResponse;
import com.fanconnect.dto.response.OccupancyPredictionResponse;
import com.fanconnect.dto.response.VenueRecommendationResponse;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.mapper.BusinessMapper;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.BusinessStatus;
import com.fanconnect.model.enums.OccupancyRisk;
import com.fanconnect.model.enums.RecommendationReasonCode;
import com.fanconnect.repository.BusinessRepository;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.service.BusinessOccupancyService;
import com.fanconnect.service.RecommendationService;
import com.fanconnect.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private static final double[] RADIUS_STEPS_KM = {5.0, 10.0, 20.0};
    private static final int MIN_RESULTS = 3;
    private static final int DEFAULT_LIMIT = 10;

    private final FootballMatchRepository footballMatchRepository;
    private final BusinessRepository businessRepository;
    private final BusinessOccupancyService businessOccupancyService;
    private final BusinessMapper businessMapper;

    @Override
    @Transactional(readOnly = true)
    public MatchRecommendationsResponse recommendForMatch(
            Long matchId,
            Double latitude,
            Double longitude,
            Integer limit
    ) {
        FootballMatch match = footballMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", matchId));

        int resultLimit = limit != null && limit > 0 ? Math.min(limit, 50) : DEFAULT_LIMIT;
        boolean geoEnabled = latitude != null && longitude != null;

        List<Business> approved = businessRepository.findByStatusOrderByNameAsc(BusinessStatus.APPROVED);

        double searchRadiusKm = geoEnabled ? RADIUS_STEPS_KM[RADIUS_STEPS_KM.length - 1] : 0;
        boolean radiusExpanded = false;
        List<ScoredVenue> scored;

        if (geoEnabled) {
            scored = new ArrayList<>();
            for (int i = 0; i < RADIUS_STEPS_KM.length; i++) {
                double radius = RADIUS_STEPS_KM[i];
                scored = scoreWithinRadius(approved, match, latitude, longitude, radius);
                searchRadiusKm = radius;
                radiusExpanded = i > 0;
                if (scored.size() >= MIN_RESULTS) {
                    break;
                }
            }
        } else {
            scored = scoreWithinRadius(approved, match, null, null, null);
        }

        List<VenueRecommendationResponse> recommendations = scored.stream()
                .sorted(Comparator
                        .comparingInt(ScoredVenue::aiScore).reversed()
                        .thenComparing(ScoredVenue::distanceKm, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(resultLimit)
                .map(ScoredVenue::response)
                .toList();

        String userCity = recommendations.stream()
                .filter(r -> r.getDistanceKm() != null)
                .min(Comparator.comparing(VenueRecommendationResponse::getDistanceKm))
                .map(VenueRecommendationResponse::getCity)
                .orElse(null);

        return MatchRecommendationsResponse.builder()
                .matchId(match.getId())
                .matchLabel(match.getHomeTeam() + " vs " + match.getAwayTeam())
                .userCity(userCity)
                .searchRadiusKm(geoEnabled ? searchRadiusKm : null)
                .radiusExpanded(radiusExpanded)
                .geoEnabled(geoEnabled)
                .recommendations(recommendations)
                .build();
    }

    private List<ScoredVenue> scoreWithinRadius(
            List<Business> businesses,
            FootballMatch match,
            Double latitude,
            Double longitude,
            Double radiusKm
    ) {
        List<ScoredVenue> result = new ArrayList<>();
        boolean geoEnabled = latitude != null && longitude != null;

        for (Business business : businesses) {
            Double distanceKm = null;
            if (geoEnabled) {
                distanceKm = GeoUtils.distanceKm(
                        latitude,
                        longitude,
                        business.getLatitude(),
                        business.getLongitude()
                );
                if (distanceKm == null || distanceKm > radiusKm) {
                    continue;
                }
            }

            BusinessOccupancyResponse occupancy = businessOccupancyService.getBusinessOccupancyReadOnly(
                    business.getId(),
                    match.getId()
            );

            BusinessSummaryResponse summary = businessMapper.toSummary(business);
            summary.setDistanceKm(distanceKm);

            ScoredVenue scored = buildScoredVenue(
                    summary,
                    occupancy,
                    distanceKm,
                    radiusKm,
                    geoEnabled,
                    match
            );
            result.add(scored);
        }

        return result;
    }

    private ScoredVenue buildScoredVenue(
            BusinessSummaryResponse summary,
            BusinessOccupancyResponse occupancy,
            Double distanceKm,
            Double searchRadiusKm,
            boolean geoEnabled,
            FootballMatch match
    ) {
        double currentOcc = occupancy.getOccupancyPercentage();
        OccupancyPredictionResponse prediction = occupancy.getPrediction();
        double predictedOcc = prediction != null ? prediction.getProjectedPeakPercent() : currentOcc;
        OccupancyRisk risk = prediction != null ? prediction.getFullRisk() : OccupancyRisk.LOW;

        int capacity = Math.max(occupancy.getCapacity(), 1);
        int availableSeats = occupancy.getAvailableSeats();
        int availableTables = estimateAvailableTables(summary.getTotalTables(), availableSeats, capacity);

        double proximityScore = geoEnabled && distanceKm != null && searchRadiusKm != null && searchRadiusKm > 0
                ? Math.max(0, 100 * (1 - distanceKm / searchRadiusKm))
                : 50;
        double currentOccScore = Math.max(0, 100 - currentOcc);
        double predictedOccScore = Math.max(0, 100 - predictedOcc);
        double availabilityScore = Math.min(100, (availableSeats * 100.0) / capacity);
        double ratingScore = 50;
        double matchBoost = resolveMatchBoost(match);

        double aiScore;
        if (geoEnabled) {
            aiScore = proximityScore * 0.35
                    + currentOccScore * 0.20
                    + predictedOccScore * 0.20
                    + availabilityScore * 0.15
                    + ratingScore * 0.05
                    + matchBoost * 0.05;
        } else {
            aiScore = currentOccScore * 0.30
                    + predictedOccScore * 0.30
                    + availabilityScore * 0.25
                    + ratingScore * 0.10
                    + matchBoost * 0.05;
        }

        ReasonSelection reason = selectReason(
                geoEnabled,
                distanceKm,
                predictedOcc,
                availableSeats,
                searchRadiusKm
        );

        VenueRecommendationResponse response = VenueRecommendationResponse.builder()
                .id(summary.getId())
                .name(summary.getName())
                .businessType(summary.getBusinessType())
                .city(summary.getCity())
                .address(summary.getAddress())
                .totalCapacity(summary.getTotalCapacity())
                .totalTables(summary.getTotalTables())
                .status(summary.getStatus())
                .coverImageUrl(summary.getCoverImageUrl())
                .minMatchDayPrice(summary.getMinMatchDayPrice())
                .latitude(summary.getLatitude())
                .longitude(summary.getLongitude())
                .googleMapsUrl(summary.getGoogleMapsUrl())
                .distanceKm(distanceKm)
                .aiScore((int) Math.round(Math.min(100, Math.max(0, aiScore))))
                .currentOccupancyPct(round(currentOcc))
                .predictedOccupancyPct(round(predictedOcc))
                .availableSeats(availableSeats)
                .availableTables(availableTables)
                .occupancyLevel(occupancy.getLevel())
                .riskLevel(risk)
                .reason(reason.text())
                .reasonCode(reason.code())
                .build();

        return new ScoredVenue(response, (int) Math.round(aiScore), distanceKm);
    }

    private int estimateAvailableTables(int totalTables, int availableSeats, int capacity) {
        if (totalTables <= 0 || capacity <= 0) {
            return 0;
        }
        double seatsPerTable = (double) capacity / totalTables;
        return (int) Math.max(0, Math.floor(availableSeats / Math.max(seatsPerTable, 1)));
    }

    private double resolveMatchBoost(FootballMatch match) {
        String competition = match.getCompetition() != null ? match.getCompetition().toLowerCase() : "";
        if (competition.contains("world cup") || competition.contains("coupe du monde")) {
            return 15;
        }
        return 8;
    }

    private ReasonSelection selectReason(
            boolean geoEnabled,
            Double distanceKm,
            double predictedOcc,
            int availableSeats,
            Double searchRadiusKm
    ) {
        if (geoEnabled && distanceKm != null && distanceKm <= 2.0 && predictedOcc < 75) {
            return new ReasonSelection(
                    RecommendationReasonCode.CLOSEST_LOW_CROWD,
                    "Closest approved venue with available tables and low predicted crowd level."
            );
        }
        if (availableSeats >= 4) {
            return new ReasonSelection(
                    RecommendationReasonCode.AVAILABLE_TABLES,
                    "Good table availability for this match."
            );
        }
        if (predictedOcc < 70) {
            return new ReasonSelection(
                    RecommendationReasonCode.LOW_PREDICTED_PEAK,
                    "Low predicted crowd level at kickoff."
            );
        }
        if (geoEnabled && searchRadiusKm != null && searchRadiusKm > RADIUS_STEPS_KM[0]) {
            return new ReasonSelection(
                    RecommendationReasonCode.HIGH_MATCH_DEMAND_FALLBACK,
                    "Expanded search radius — limited nearby options for this match."
            );
        }
        return new ReasonSelection(
                RecommendationReasonCode.BEST_AVAILABILITY,
                "Best balance of distance, occupancy and availability."
        );
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private record ReasonSelection(RecommendationReasonCode code, String text) {}

    private record ScoredVenue(VenueRecommendationResponse response, int aiScore, Double distanceKm) {}
}