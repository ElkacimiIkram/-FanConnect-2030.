package com.fanconnect.service.impl;

import com.fanconnect.dto.request.UpdateLiveOccupancyRequest;
import com.fanconnect.dto.response.LiveOccupancyResponse;
import com.fanconnect.dto.response.OccupancyAnalyticsResponse;
import com.fanconnect.dto.response.OccupancyBreakdownResponse;
import com.fanconnect.exception.ForbiddenException;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.BusinessLiveOccupancy;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.entity.OccupancySnapshot;
import com.fanconnect.model.entity.User;
import com.fanconnect.model.enums.OccupancyLevel;
import com.fanconnect.model.enums.ReservationStatus;
import com.fanconnect.repository.BusinessLiveOccupancyRepository;
import com.fanconnect.repository.BusinessRepository;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.repository.OccupancySnapshotRepository;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.repository.UserRepository;
import com.fanconnect.service.LiveOccupancyService;
import com.fanconnect.service.OccupancyPredictionService;
import com.fanconnect.util.OccupancyEngine;
import com.fanconnect.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LiveOccupancyServiceImpl implements LiveOccupancyService {

    private static final Duration SNAPSHOT_MIN_INTERVAL = Duration.ofMinutes(5);

    private final BusinessLiveOccupancyRepository liveOccupancyRepository;
    private final OccupancySnapshotRepository snapshotRepository;
    private final BusinessRepository businessRepository;
    private final FootballMatchRepository footballMatchRepository;
    private final ReservationRepository reservationRepository;
    private final OccupancyPredictionService occupancyPredictionService;
    private final UserRepository userRepository;

    public LiveOccupancyServiceImpl(
            BusinessLiveOccupancyRepository liveOccupancyRepository,
            OccupancySnapshotRepository snapshotRepository,
            BusinessRepository businessRepository,
            FootballMatchRepository footballMatchRepository,
            ReservationRepository reservationRepository,
            @Qualifier("heuristicOccupancyPrediction") OccupancyPredictionService occupancyPredictionService,
            UserRepository userRepository
    ) {
        this.liveOccupancyRepository = liveOccupancyRepository;
        this.snapshotRepository = snapshotRepository;
        this.businessRepository = businessRepository;
        this.footballMatchRepository = footballMatchRepository;
        this.reservationRepository = reservationRepository;
        this.occupancyPredictionService = occupancyPredictionService;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public LiveOccupancyResponse updateLiveOccupancy(Long businessId, UpdateLiveOccupancyRequest request) {
        User owner = getCurrentUser();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));

        if (!business.getOwner().getId().equals(owner.getId())) {
            throw new ForbiddenException("Not your business");
        }

        FootballMatch match = null;
        if (request.getMatchId() != null) {
            match = footballMatchRepository.findById(request.getMatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Match", request.getMatchId()));
        }

        int capacity = Math.max(business.getTotalCapacity(), 1);
        int current = request.getCurrentCustomers();
        double percent = OccupancyEngine.percentage(current, capacity);

        BusinessLiveOccupancy saved = liveOccupancyRepository.save(BusinessLiveOccupancy.builder()
                .business(business)
                .match(match)
                .currentCustomers(current)
                .availableSeats(Math.max(capacity - current, 0))
                .occupancyPercent(BigDecimal.valueOf(percent))
                .reportedBy(owner)
                .reportedAt(Instant.now())
                .source("OWNER_MANUAL")
                .build());

        return buildLiveResponse(business, match, saved, capacity);
    }

    @Override
    @Transactional(readOnly = true)
    public LiveOccupancyResponse getLatestLiveOccupancy(Long businessId, Long matchId) {
        User owner = getCurrentUser();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));

        if (!business.getOwner().getId().equals(owner.getId())) {
            throw new ForbiddenException("Not your business");
        }

        BusinessLiveOccupancy latest = findLatestReport(business, matchId != null
                ? footballMatchRepository.findById(matchId).orElse(null)
                : null);

        FootballMatch match = matchId != null
                ? footballMatchRepository.findById(matchId).orElse(null)
                : null;

        if (latest == null) {
            return buildLiveResponse(business, match, null, business.getTotalCapacity());
        }

        return buildLiveResponse(business, match, latest, business.getTotalCapacity());
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessLiveOccupancy findLatestReport(Business business, FootballMatch match) {
        if (match != null) {
            return liveOccupancyRepository
                    .findFirstByBusinessIdAndMatchIdOrderByReportedAtDesc(business.getId(), match.getId())
                    .orElse(null);
        }
        return liveOccupancyRepository.findFirstByBusinessIdOrderByReportedAtDesc(business.getId())
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public OccupancyAnalyticsResponse getAnalytics(Long businessId) {
        User owner = getCurrentUser();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));

        if (!business.getOwner().getId().equals(owner.getId())) {
            throw new ForbiddenException("Not your business");
        }

        Instant weekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        Instant monthAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        List<OccupancySnapshot> weekSnapshots = snapshotRepository.findSince(businessId, weekAgo);
        List<OccupancySnapshot> monthSnapshots = snapshotRepository.findSince(businessId, monthAgo);

        double weeklyAvg = weekSnapshots.stream()
                .mapToDouble(s -> s.getOccupancyPercent().doubleValue())
                .average()
                .orElse(0);

        Double monthlyAvg = snapshotRepository.averageOccupancySince(businessId, monthAgo);
        double monthly = monthlyAvg != null ? monthlyAvg : 0;

        Map<LocalDate, List<OccupancySnapshot>> byDay = new HashMap<>();
        for (OccupancySnapshot snapshot : weekSnapshots) {
            LocalDate day = snapshot.getSnapshotAt().atZone(ZoneOffset.UTC).toLocalDate();
            byDay.computeIfAbsent(day, ignored -> new ArrayList<>()).add(snapshot);
        }

        List<OccupancyAnalyticsResponse.DailyOccupancyPoint> weeklyTrend = byDay.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    double avg = entry.getValue().stream()
                            .mapToDouble(s -> s.getOccupancyPercent().doubleValue())
                            .average()
                            .orElse(0);
                    double peak = entry.getValue().stream()
                            .mapToDouble(s -> s.getOccupancyPercent().doubleValue())
                            .max()
                            .orElse(0);
                    return OccupancyAnalyticsResponse.DailyOccupancyPoint.builder()
                            .date(entry.getKey().toString())
                            .averagePercent(round(avg))
                            .peakPercent(round(peak))
                            .build();
                })
                .toList();

        Map<Integer, List<Double>> byHour = new HashMap<>();
        for (OccupancySnapshot snapshot : monthSnapshots) {
            if (snapshot.getHourOfDay() != null) {
                byHour.computeIfAbsent(snapshot.getHourOfDay().intValue(), ignored -> new ArrayList<>())
                        .add(snapshot.getOccupancyPercent().doubleValue());
            }
        }

        List<OccupancyAnalyticsResponse.HourlyOccupancyPoint> peakHours = byHour.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> OccupancyAnalyticsResponse.HourlyOccupancyPoint.builder()
                        .hour(entry.getKey())
                        .averagePercent(round(entry.getValue().stream()
                                .mapToDouble(Double::doubleValue)
                                .average()
                                .orElse(0)))
                        .build())
                .sorted(Comparator.comparing(OccupancyAnalyticsResponse.HourlyOccupancyPoint::getAveragePercent).reversed())
                .limit(8)
                .sorted(Comparator.comparingInt(OccupancyAnalyticsResponse.HourlyOccupancyPoint::getHour))
                .toList();

        BusinessLiveOccupancy latest = findLatestReport(business, null);
        double current = latest != null && latest.getOccupancyPercent() != null
                ? latest.getOccupancyPercent().doubleValue()
                : 0;

        return OccupancyAnalyticsResponse.builder()
                .currentOccupancyPercent(round(current))
                .weeklyAveragePercent(round(weeklyAvg))
                .monthlyAveragePercent(round(monthly))
                .weeklyTrend(weeklyTrend)
                .peakHours(peakHours)
                .build();
    }

    @Override
    @Transactional
    public void recordCheckIn(Business business, FootballMatch match, int partySize, User reportedBy) {
        if (partySize <= 0) {
            return;
        }

        int capacity = Math.max(business.getTotalCapacity(), 1);
        BusinessLiveOccupancy latest = findLatestReport(business, match);
        int baseCount = latest != null ? latest.getCurrentCustomers() : 0;
        int newCount = Math.min(capacity, baseCount + partySize);

        liveOccupancyRepository.save(BusinessLiveOccupancy.builder()
                .business(business)
                .match(match)
                .currentCustomers(newCount)
                .availableSeats(Math.max(capacity - newCount, 0))
                .occupancyPercent(BigDecimal.valueOf(OccupancyEngine.percentage(newCount, capacity)))
                .reportedBy(reportedBy)
                .reportedAt(Instant.now())
                .source("CHECK_IN_AUTO")
                .build());
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSnapshot(Business business, FootballMatch match, int capacity,
                               int checkedIn, int confirmed, int pending,
                               BusinessLiveOccupancy liveReport) {
        if (!shouldRecordSnapshot(business.getId(), match)) {
            return;
        }

        var breakdown = OccupancyEngine.computeBreakdown(capacity, checkedIn, confirmed, pending, liveReport);
        double percent = OccupancyEngine.percentage(breakdown.getEffectiveOccupancy(), capacity);
        OccupancyLevel level = OccupancyEngine.level(percent);

        Instant now = Instant.now();
        var zoned = now.atZone(ZoneOffset.UTC);

        snapshotRepository.save(OccupancySnapshot.builder()
                .business(business)
                .match(match)
                .snapshotAt(now)
                .capacity(capacity)
                .ownerReportedCount(breakdown.getOwnerReportedCustomers())
                .checkedInSeats(checkedIn)
                .confirmedNotArrived(confirmed)
                .pendingReservations(pending)
                .effectiveOccupancy(breakdown.getEffectiveOccupancy())
                .occupancyPercent(BigDecimal.valueOf(percent))
                .level(level)
                .dayOfWeek((short) zoned.getDayOfWeek().getValue())
                .hourOfDay((short) zoned.getHour())
                .build());
    }

    private LiveOccupancyResponse buildLiveResponse(
            Business business,
            FootballMatch match,
            BusinessLiveOccupancy report,
            int capacity
    ) {
        int safeCapacity = Math.max(capacity, 1);
        int currentCustomers = report != null ? report.getCurrentCustomers() : 0;
        double manualPercent = report != null && report.getOccupancyPercent() != null
                ? report.getOccupancyPercent().doubleValue()
                : OccupancyEngine.percentage(currentCustomers, safeCapacity);

        LiveOccupancyResponse.LiveOccupancyResponseBuilder builder = LiveOccupancyResponse.builder()
                .businessId(business.getId())
                .matchId(match != null ? match.getId() : null)
                .capacity(safeCapacity)
                .currentCustomers(currentCustomers)
                .availableSeats(report != null && report.getAvailableSeats() != null
                        ? report.getAvailableSeats()
                        : Math.max(safeCapacity - currentCustomers, 0))
                .occupancyPercentage(manualPercent)
                .level(OccupancyEngine.level(manualPercent))
                .reportedAt(report != null ? report.getReportedAt() : null)
                .fresh(report != null && OccupancyEngine.isFresh(report.getReportedAt()));

        if (match != null) {
            int checkedIn = reservationRepository.sumPartySizeForBusinessAndMatchAndStatus(
                    business.getId(), match.getId(), ReservationStatus.CHECKED_IN);
            int confirmed = reservationRepository.sumPartySizeForBusinessAndMatchAndStatus(
                    business.getId(), match.getId(), ReservationStatus.CONFIRMED);
            int pending = reservationRepository.sumPartySizeForBusinessAndMatchAndStatus(
                    business.getId(), match.getId(), ReservationStatus.PENDING);

            OccupancyBreakdownResponse breakdown = OccupancyEngine.computeBreakdown(
                    safeCapacity, checkedIn, confirmed, pending, report);
            double effectivePercent = OccupancyEngine.percentage(
                    breakdown.getEffectiveOccupancy(), safeCapacity);

            builder
                    .effectiveOccupancy(breakdown.getEffectiveOccupancy())
                    .effectiveOccupancyPercentage(effectivePercent)
                    .effectiveLevel(OccupancyEngine.level(effectivePercent))
                    .checkedInSeats(checkedIn)
                    .confirmedNotCheckedIn(confirmed)
                    .pendingReservations(pending)
                    .walkInEstimate(breakdown.getWalkInEstimate())
                    .reservationOnlyEstimate(breakdown.getReservationOnlyEstimate())
                    .breakdown(breakdown)
                    .prediction(occupancyPredictionService.predict(business, match, breakdown));
        }

        return builder.build();
    }

    private boolean shouldRecordSnapshot(Long businessId, FootballMatch match) {
        Instant threshold = Instant.now().minus(SNAPSHOT_MIN_INTERVAL);
        if (match != null) {
            return snapshotRepository.findFirstByBusinessIdAndMatchIdOrderBySnapshotAtDesc(businessId, match.getId())
                    .map(snapshot -> snapshot.getSnapshotAt().isBefore(threshold))
                    .orElse(true);
        }
        return snapshotRepository.findFirstByBusinessIdAndMatchIsNullOrderBySnapshotAtDesc(businessId)
                .map(snapshot -> snapshot.getSnapshotAt().isBefore(threshold))
                .orElse(true);
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (!StringUtils.hasText(email)) {
            throw new ForbiddenException("Not authenticated");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ForbiddenException("User not found"));
    }
}