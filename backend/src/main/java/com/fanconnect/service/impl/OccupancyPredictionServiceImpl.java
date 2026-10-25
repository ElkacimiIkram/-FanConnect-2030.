package com.fanconnect.service.impl;

import com.fanconnect.dto.response.OccupancyBreakdownResponse;
import com.fanconnect.dto.response.OccupancyPredictionResponse;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.OccupancyLevel;
import com.fanconnect.model.enums.OccupancyRisk;
import com.fanconnect.model.enums.ReservationStatus;
import com.fanconnect.repository.OccupancySnapshotRepository;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.service.OccupancyPredictionService;
import com.fanconnect.util.OccupancyCalculator;
import com.fanconnect.util.OccupancyEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service("heuristicOccupancyPrediction")
@RequiredArgsConstructor
public class OccupancyPredictionServiceImpl implements OccupancyPredictionService {

    private final OccupancySnapshotRepository snapshotRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional(readOnly = true)
    public OccupancyPredictionResponse predict(
            Business business,
            FootballMatch match,
            OccupancyBreakdownResponse breakdown
    ) {
        int capacity = Math.max(business.getTotalCapacity(), 1);
        double base = OccupancyEngine.percentage(breakdown.getEffectiveOccupancy(), capacity);
        double projectedPeak = OccupancyEngine.percentage(breakdown.getProjectedPeakOccupancy(), capacity);

        double popularityBoost = resolvePopularityBoost(match);
        double dayBoost = resolveDayBoost();
        double timeBoost = resolveTimeBoost();
        double historicalBoost = resolveHistoricalBoost(business.getId());
        double checkInVelocity = resolveCheckInVelocity(business.getId(), match.getId(), capacity);

        double adjustedPeak = Math.min(100, projectedPeak + popularityBoost + dayBoost + timeBoost
                + historicalBoost + checkInVelocity);

        OccupancyRisk risk;
        if (adjustedPeak > 85 || (base > 70 && minutesToKickoff(match) < 60)) {
            risk = OccupancyRisk.HIGH;
        } else if (adjustedPeak >= 60 || base >= 50) {
            risk = OccupancyRisk.MEDIUM;
        } else {
            risk = OccupancyRisk.LOW;
        }

        OccupancyLevel predictedLevel = OccupancyCalculator.resolveLevel(adjustedPeak);

        return OccupancyPredictionResponse.builder()
                .projectedPeakPercent(round(adjustedPeak))
                .fullRisk(risk)
                .predictedLevelAtKickoff(predictedLevel)
                .build();
    }

    private double resolvePopularityBoost(FootballMatch match) {
        String competition = match.getCompetition() != null ? match.getCompetition().toLowerCase() : "";
        if (competition.contains("world cup") || competition.contains("coupe du monde")) {
            return 12;
        }
        return 5;
    }

    private double resolveDayBoost() {
        int day = Instant.now().atZone(ZoneOffset.UTC).getDayOfWeek().getValue();
        return day >= 6 ? 8 : 0;
    }

    private double resolveTimeBoost() {
        int hour = Instant.now().atZone(ZoneOffset.UTC).getHour();
        if (hour >= 18 && hour <= 22) {
            return 6;
        }
        if (hour >= 12 && hour < 18) {
            return 3;
        }
        return 0;
    }

    private double resolveHistoricalBoost(Long businessId) {
        Instant since = Instant.now().minus(30, ChronoUnit.DAYS);
        Double avg = snapshotRepository.averageOccupancySince(businessId, since);
        if (avg == null) {
            return 0;
        }
        return Math.min(15, avg * 0.25);
    }

    private double resolveCheckInVelocity(Long businessId, Long matchId, int capacity) {
        int checkedInSeats = reservationRepository.sumPartySizeByBusinessAndMatchAndStatusIn(
                businessId,
                matchId,
                List.of(ReservationStatus.CHECKED_IN)
        );
        if (capacity <= 0 || checkedInSeats <= 0) {
            return 0;
        }
        return Math.min(10, (checkedInSeats * 100.0 / capacity) * 0.35);
    }

    private long minutesToKickoff(FootballMatch match) {
        if (match.getMatchDate() == null) {
            return Long.MAX_VALUE;
        }
        return Duration.between(Instant.now(), match.getMatchDate()).toMinutes();
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}