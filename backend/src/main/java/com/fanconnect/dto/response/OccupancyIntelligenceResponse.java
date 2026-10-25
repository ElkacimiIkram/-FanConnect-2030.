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
public class OccupancyIntelligenceResponse {

    private Long businessId;
    private String businessName;
    private Long matchId;
    private String matchLabel;
    private int capacity;
    private int availableSeats;
    private double currentOccupancyPct;
    private OccupancyLevel currentLevel;

    private double predicted1hPct;
    private double predicted2hPct;
    private double predictedKickoffPct;
    private String expectedFullAt;
    private double confidencePct;
    private OccupancyRisk riskLevel;
    private OccupancyLevel predictedLevelAtKickoff;
    private String recommendation;
    private String source;

    private List<OccupancyTimelinePointResponse> timeline;
    private OccupancyModelInfoResponse model;
    private OccupancyBreakdownResponse breakdown;
}