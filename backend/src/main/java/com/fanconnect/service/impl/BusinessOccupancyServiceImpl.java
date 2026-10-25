package com.fanconnect.service.impl;

import com.fanconnect.dto.response.BusinessOccupancyResponse;
import com.fanconnect.dto.response.OccupancyBreakdownResponse;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.BusinessLiveOccupancy;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.BusinessStatus;
import com.fanconnect.model.enums.OccupancyLevel;
import com.fanconnect.model.enums.ReservationStatus;
import com.fanconnect.repository.BusinessRepository;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.service.BusinessOccupancyService;
import com.fanconnect.service.LiveOccupancyService;
import com.fanconnect.service.OccupancyPredictionService;
import com.fanconnect.util.OccupancyEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessOccupancyServiceImpl implements BusinessOccupancyService {

    private final BusinessRepository businessRepository;
    private final FootballMatchRepository footballMatchRepository;
    private final ReservationRepository reservationRepository;
    private final LiveOccupancyService liveOccupancyService;
    private final OccupancyPredictionService occupancyPredictionService;

    @Override
    @Transactional
    public BusinessOccupancyResponse getBusinessOccupancy(Long businessId, Long matchId) {
        Business business = businessRepository.findByIdAndStatus(businessId, BusinessStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));
        FootballMatch match = footballMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", matchId));

        return calculateOccupancy(business, match, true);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessOccupancyResponse getBusinessOccupancyReadOnly(Long businessId, Long matchId) {
        Business business = businessRepository.findByIdAndStatus(businessId, BusinessStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));
        FootballMatch match = footballMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", matchId));

        return calculateOccupancy(business, match, false);
    }

    @Override
    @Transactional
    public List<BusinessOccupancyResponse> getAllBusinessesOccupancy(Long matchId) {
        FootballMatch match = footballMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", matchId));

        return businessRepository.findByStatusOrderByNameAsc(BusinessStatus.APPROVED).stream()
                .map(business -> calculateOccupancy(business, match, true))
                .toList();
    }

    private BusinessOccupancyResponse calculateOccupancy(
            Business business,
            FootballMatch match,
            boolean recordSnapshot
    ) {
        int capacity = Math.max(business.getTotalCapacity(), 1);

        int checkedIn = reservationRepository.sumPartySizeForBusinessAndMatchAndStatus(
                business.getId(), match.getId(), ReservationStatus.CHECKED_IN);
        int confirmed = reservationRepository.sumPartySizeForBusinessAndMatchAndStatus(
                business.getId(), match.getId(), ReservationStatus.CONFIRMED);
        int pending = reservationRepository.sumPartySizeForBusinessAndMatchAndStatus(
                business.getId(), match.getId(), ReservationStatus.PENDING);

        BusinessLiveOccupancy liveReport = liveOccupancyService.findLatestReport(business, match);

        OccupancyBreakdownResponse breakdown = OccupancyEngine.computeBreakdown(
                capacity, checkedIn, confirmed, pending, liveReport);

        int effective = breakdown.getEffectiveOccupancy();
        double occupancyPercentage = OccupancyEngine.percentage(effective, capacity);
        OccupancyLevel level = OccupancyEngine.level(occupancyPercentage);

        if (recordSnapshot) {
            liveOccupancyService.recordSnapshot(
                    business, match, capacity, checkedIn, confirmed, pending, liveReport);
        }

        return BusinessOccupancyResponse.builder()
                .businessId(business.getId())
                .businessName(business.getName())
                .matchId(match.getId())
                .matchLabel(buildMatchLabel(match))
                .capacity(capacity)
                .bookedSeats(effective)
                .availableSeats(Math.max(capacity - effective, 0))
                .occupancyPercentage(occupancyPercentage)
                .level(level)
                .breakdown(breakdown)
                .prediction(occupancyPredictionService.predict(business, match, breakdown))
                .build();
    }

    private String buildMatchLabel(FootballMatch match) {
        return match.getHomeTeam() + " vs " + match.getAwayTeam();
    }
}