package com.fanconnect.dto.response;

import com.fanconnect.model.enums.OccupancyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessOccupancyResponse {

    private Long businessId;
    private String businessName;
    private Long matchId;
    private String matchLabel;
    private int capacity;
    /** Effective occupied seats (live formula). */
    private int bookedSeats;
    private int availableSeats;
    private double occupancyPercentage;
    private OccupancyLevel level;
    private OccupancyBreakdownResponse breakdown;
    private OccupancyPredictionResponse prediction;
}