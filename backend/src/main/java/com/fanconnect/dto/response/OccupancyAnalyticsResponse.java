package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyAnalyticsResponse {

    private double currentOccupancyPercent;
    private double weeklyAveragePercent;
    private double monthlyAveragePercent;
    private List<DailyOccupancyPoint> weeklyTrend;
    private List<HourlyOccupancyPoint> peakHours;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyOccupancyPoint {
        private String date;
        private double averagePercent;
        private double peakPercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyOccupancyPoint {
        private int hour;
        private double averagePercent;
    }
}