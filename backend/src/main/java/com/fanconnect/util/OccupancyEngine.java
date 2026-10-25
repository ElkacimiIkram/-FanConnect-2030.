package com.fanconnect.util;

import com.fanconnect.dto.response.OccupancyBreakdownResponse;
import com.fanconnect.model.entity.BusinessLiveOccupancy;
import com.fanconnect.model.enums.OccupancyLevel;

import java.time.Duration;
import java.time.Instant;

public final class OccupancyEngine {

    public static final Duration OWNER_REPORT_FRESHNESS = Duration.ofMinutes(15);
    public static final double ARRIVAL_RATE = 0.85;
    public static final double PAYMENT_RATE = 0.60;

    private OccupancyEngine() {
    }

    /**
     * Real occupancy blends owner physical count with reservation signals.
     * <p>
     * Fresh owner report = ground truth (includes walk-ins and all present customers).
     * Without it, estimate from checked-in + weighted confirmed/pending reservations.
     */
    public static OccupancyBreakdownResponse computeBreakdown(
            int capacity,
            int checkedInSeats,
            int confirmedNotCheckedIn,
            int pendingReservations,
            BusinessLiveOccupancy liveReport
    ) {
        int safeCapacity = Math.max(capacity, 1);
        Integer ownerReported = liveReport != null ? liveReport.getCurrentCustomers() : null;
        Instant ownerReportedAt = liveReport != null ? liveReport.getReportedAt() : null;
        boolean fresh = isFresh(ownerReportedAt);

        int projectedConfirmed = (int) Math.round(confirmedNotCheckedIn * ARRIVAL_RATE);
        int projectedPending = (int) Math.round(pendingReservations * PAYMENT_RATE);
        int reservationOnlyEstimate = checkedInSeats + projectedConfirmed + projectedPending;

        int walkInEstimate = 0;
        int projectedArrivals = projectedConfirmed;
        int effective;
        int projectedPeak;

        if (ownerReported != null && fresh) {
            effective = ownerReported;
            walkInEstimate = Math.max(0, ownerReported - checkedInSeats);
            projectedPeak = Math.min(safeCapacity, ownerReported + projectedArrivals);
        } else {
            effective = reservationOnlyEstimate;
            if (ownerReported != null) {
                effective = Math.max(effective, ownerReported);
                walkInEstimate = Math.max(0, ownerReported - checkedInSeats);
            }
            projectedPeak = Math.min(safeCapacity, effective + projectedArrivals);
        }

        effective = Math.min(effective, safeCapacity);
        projectedPeak = Math.min(projectedPeak, safeCapacity);

        return OccupancyBreakdownResponse.builder()
                .ownerReportedCustomers(ownerReported)
                .ownerReportedAt(ownerReportedAt)
                .ownerReportFresh(fresh)
                .checkedInSeats(checkedInSeats)
                .confirmedNotCheckedIn(confirmedNotCheckedIn)
                .pendingReservations(pendingReservations)
                .walkInEstimate(walkInEstimate)
                .reservationOnlyEstimate(reservationOnlyEstimate)
                .projectedArrivals(projectedArrivals)
                .projectedPeakOccupancy(projectedPeak)
                .effectiveOccupancy(effective)
                .build();
    }

    public static double percentage(int effective, int capacity) {
        return OccupancyCalculator.calculatePercentage(effective, capacity);
    }

    public static OccupancyLevel level(double percentage) {
        return OccupancyCalculator.resolveLevel(percentage);
    }

    public static boolean isFresh(Instant reportedAt) {
        if (reportedAt == null) {
            return false;
        }
        return Duration.between(reportedAt, Instant.now()).compareTo(OWNER_REPORT_FRESHNESS) <= 0;
    }
}