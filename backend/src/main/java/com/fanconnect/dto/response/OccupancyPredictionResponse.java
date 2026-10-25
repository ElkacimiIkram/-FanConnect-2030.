package com.fanconnect.dto.response;

import com.fanconnect.model.enums.OccupancyLevel;
import com.fanconnect.model.enums.OccupancyRisk;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyPredictionResponse {

    private double projectedPeakPercent;
    private OccupancyRisk fullRisk;
    private OccupancyLevel predictedLevelAtKickoff;

    private Double predicted1hPercent;
    private Double predicted2hPercent;
    private String expectedFullAt;
    private Double confidencePercent;
    private String recommendation;
    private String source;
    private List<OccupancyTimelinePointResponse> timeline;
    private OccupancyModelInfoResponse model;
}