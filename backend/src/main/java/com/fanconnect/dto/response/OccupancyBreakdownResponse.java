package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyBreakdownResponse {

    private Integer ownerReportedCustomers;
    private Instant ownerReportedAt;
    private boolean ownerReportFresh;
    private int checkedInSeats;
    private int confirmedNotCheckedIn;
    private int pendingReservations;
    private int walkInEstimate;
    /** Seats counted from app reservations only (no owner walk-in data). */
    private int reservationOnlyEstimate;
    /** Expected additional arrivals from confirmed bookings. */
    private int projectedArrivals;
    /** Peak occupancy before kickoff (current + expected arrivals). */
    private int projectedPeakOccupancy;
    private int effectiveOccupancy;
}