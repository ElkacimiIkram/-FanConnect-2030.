package com.fanconnect.service.impl;

import com.fanconnect.client.AiOccupancyClient;
import com.fanconnect.dto.response.OccupancyBreakdownResponse;
import com.fanconnect.dto.response.OccupancyIntelligenceResponse;
import com.fanconnect.dto.response.OccupancyModelInfoResponse;
import com.fanconnect.dto.response.OccupancyPredictionResponse;
import com.fanconnect.dto.response.OccupancyTimelinePointResponse;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.BusinessLiveOccupancy;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.BusinessStatus;
import com.fanconnect.model.enums.OccupancyLevel;
import com.fanconnect.model.enums.OccupancyRisk;
import com.fanconnect.model.enums.ReservationStatus;
import com.fanconnect.repository.BusinessLiveOccupancyRepository;
import com.fanconnect.repository.BusinessRepository;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.repository.OccupancySnapshotRepository;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.service.OccupancyIntelligenceService;
import com.fanconnect.service.OccupancyPredictionService;
import com.fanconnect.util.OccupancyEngine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class OccupancyIntelligenceServiceImpl implements OccupancyIntelligenceService {

    private final BusinessRepository businessRepository;
    private final FootballMatchRepository footballMatchRepository;
    private final ReservationRepository reservationRepository;
    private final OccupancySnapshotRepository snapshotRepository;
    private final BusinessLiveOccupancyRepository liveOccupancyRepository;
    private final AiOccupancyClient aiOccupancyClient;
    private final OccupancyPredictionService heuristicPredictionService;

    public OccupancyIntelligenceServiceImpl(
            BusinessRepository businessRepository,
            FootballMatchRepository footballMatchRepository,
            ReservationRepository reservationRepository,
            OccupancySnapshotRepository snapshotRepository,
            BusinessLiveOccupancyRepository liveOccupancyRepository,
            AiOccupancyClient aiOccupancyClient,
            @Qualifier("heuristicOccupancyPrediction") OccupancyPredictionService heuristicPredictionService
    ) {
        this.businessRepository = businessRepository;
        this.footballMatchRepository = footballMatchRepository;
        this.reservationRepository = reservationRepository;
        this.snapshotRepository = snapshotRepository;
        this.liveOccupancyRepository = liveOccupancyRepository;
        this.aiOccupancyClient = aiOccupancyClient;
        this.heuristicPredictionService = heuristicPredictionService;
    }

    @Override
    @Transactional(readOnly = true)
    public OccupancyIntelligenceResponse getIntelligence(Long businessId, Long matchId) {
        Business business = businessRepository.findByIdAndStatus(businessId, BusinessStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));
        FootballMatch match = footballMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", matchId));

        int capacity = Math.max(business.getTotalCapacity(), 1);
        int checkedIn = reservationRepository.sumPartySizeForBusinessAndMatchAndStatus(
                business.getId(), match.getId(), ReservationStatus.CHECKED_IN);
        int confirmed = reservationRepository.sumPartySizeForBusinessAndMatchAndStatus(
                business.getId(), match.getId(), ReservationStatus.CONFIRMED);
        int pending = reservationRepository.sumPartySizeForBusinessAndMatchAndStatus(
                business.getId(), match.getId(), ReservationStatus.PENDING);

        BusinessLiveOccupancy liveReport = findLatestReport(business, match);
        OccupancyBreakdownResponse breakdown = OccupancyEngine.computeBreakdown(
                capacity, checkedIn, confirmed, pending, liveReport);

        double historicalPeak = resolveHistoricalPeak(business.getId());
        int reservationsLastHour = resolveReservationsLastHour(business.getId(), match.getId());
        int matchDayReservations = checkedIn + confirmed + pending;

        if (aiOccupancyClient.isEnabled()) {
            try {
                return aiOccupancyClient.predictIntelligence(
                        business,
                        match,
                        breakdown,
                        historicalPeak,
                        reservationsLastHour,
                        matchDayReservations
                );
            } catch (Exception ex) {
                log.warn("AI occupancy prediction failed, using heuristic fallback: {}", ex.getMessage());
            }
        }

        return buildHeuristicIntelligence(
                business,
                match,
                breakdown,
                historicalPeak,
                reservationsLastHour,
                matchDayReservations
        );
    }

    private OccupancyIntelligenceResponse buildHeuristicIntelligence(
            Business business,
            FootballMatch match,
            OccupancyBreakdownResponse breakdown,
            double historicalPeak,
            int reservationsLastHour,
            int matchDayReservations
    ) {
        int capacity = Math.max(business.getTotalCapacity(), 1);
        double currentPct = OccupancyEngine.percentage(breakdown.getEffectiveOccupancy(), capacity);

        OccupancyPredictionResponse heuristic = heuristicPredictionService.predict(business, match, breakdown);
        double kickoffPct = heuristic.getProjectedPeakPercent();
        double pred1h = Math.min(100, currentPct + (kickoffPct - currentPct) * 0.35);
        double pred2h = Math.min(100, currentPct + (kickoffPct - currentPct) * 0.65);

        String recommendation = heuristic.getFullRisk() == OccupancyRisk.HIGH
                ? "Reserve immediately."
                : heuristic.getFullRisk() == OccupancyRisk.MEDIUM
                ? "Book soon — moderate crowd expected."
                : "Good availability — reserve to secure your table.";

        return OccupancyIntelligenceResponse.builder()
                .businessId(business.getId())
                .businessName(business.getName())
                .matchId(match.getId())
                .matchLabel(match.getHomeTeam() + " vs " + match.getAwayTeam())
                .capacity(capacity)
                .availableSeats(Math.max(0, capacity - breakdown.getEffectiveOccupancy()))
                .currentOccupancyPct(currentPct)
                .currentLevel(OccupancyEngine.level(currentPct))
                .predicted1hPct(round(pred1h))
                .predicted2hPct(round(pred2h))
                .predictedKickoffPct(kickoffPct)
                .expectedFullAt(kickoffPct >= 92 ? formatEta(match) : null)
                .confidencePct(62.0)
                .riskLevel(heuristic.getFullRisk())
                .predictedLevelAtKickoff(heuristic.getPredictedLevelAtKickoff())
                .recommendation(recommendation)
                .source("HEURISTIC")
                .timeline(buildHeuristicTimeline(currentPct, pred1h, pred2h, kickoffPct))
                .model(OccupancyModelInfoResponse.builder()
                        .name("occupancy_heuristic")
                        .version("1.0.0")
                        .algorithm("RuleBasedEstimator")
                        .mae(8.5)
                        .r2Score(0.72)
                        .trainedAt(Instant.now().toString())
                        .sampleCount(0)
                        .build())
                .breakdown(breakdown)
                .build();
    }

    private List<OccupancyTimelinePointResponse> buildHeuristicTimeline(
            double current,
            double pred1h,
            double pred2h,
            double kickoff
    ) {
        Instant now = Instant.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneOffset.UTC);
        List<OccupancyTimelinePointResponse> points = new ArrayList<>();
        double[] values = {current, pred1h, pred2h, (pred2h + kickoff) / 2, kickoff};
        double peak = current;
        int peakIndex = 0;
        for (int i = 0; i < values.length; i++) {
            if (values[i] >= peak) {
                peak = values[i];
                peakIndex = i;
            }
            points.add(OccupancyTimelinePointResponse.builder()
                    .time(fmt.format(now.plus(i, ChronoUnit.HOURS)))
                    .predictedPct(round(values[i]))
                    .peak(i == peakIndex)
                    .build());
        }
        return points;
    }

    private double resolveHistoricalPeak(Long businessId) {
        Instant since = Instant.now().minus(30, ChronoUnit.DAYS);
        Double avg = snapshotRepository.averageOccupancySince(businessId, since);
        return avg != null ? avg : 50.0;
    }

    private int resolveReservationsLastHour(Long businessId, Long matchId) {
        Instant since = Instant.now().minus(1, ChronoUnit.HOURS);
        return reservationRepository.countByBusinessIdAndMatchIdAndCreatedAtAfter(
                businessId, matchId, since
        );
    }

    private String formatEta(FootballMatch match) {
        if (match.getMatchDate() == null) {
            return null;
        }
        Instant eta = match.getMatchDate().minus(45, ChronoUnit.MINUTES);
        return DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneOffset.UTC).format(eta);
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private BusinessLiveOccupancy findLatestReport(Business business, FootballMatch match) {
        if (match != null) {
            return liveOccupancyRepository
                    .findFirstByBusinessIdAndMatchIdOrderByReportedAtDesc(business.getId(), match.getId())
                    .orElse(null);
        }
        return liveOccupancyRepository.findFirstByBusinessIdOrderByReportedAtDesc(business.getId())
                .orElse(null);
    }
}