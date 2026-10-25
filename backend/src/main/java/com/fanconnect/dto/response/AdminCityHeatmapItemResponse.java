package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCityHeatmapItemResponse {

    private String city;
    private int venueCount;
    private int reservationCount;
    private double averageOccupancyPct;
    private String heatLevel;
}