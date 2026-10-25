package com.fanconnect.dto.response;

import com.fanconnect.model.enums.OccupancyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveOccupancyResponse {

    private Long businessId;
    private Long matchId;
    private int capacity;
    private int currentCustomers;
    private int availableSeats;
    private double occupancyPercentage;
    private OccupancyLevel level;
    private Instant reportedAt;
    private boolean fresh;
    /** Blended real occupancy (owner count + reservations). */
    private Integer effectiveOccupancy;
    private Double effectiveOccupancyPercentage;
    private OccupancyLevel effectiveLevel;
    private int checkedInSeats;
    private int confirmedNotCheckedIn;
    private int pendingReservations;
    private int walkInEstimate;
    private int reservationOnlyEstimate;
    private OccupancyBreakdownResponse breakdown;
    private OccupancyPredictionResponse prediction;
}