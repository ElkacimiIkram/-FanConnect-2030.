package com.fanconnect.service.impl;

import com.fanconnect.client.AiOccupancyClient;
import com.fanconnect.dto.response.OccupancyBreakdownResponse;
import com.fanconnect.dto.response.OccupancyIntelligenceResponse;
import com.fanconnect.dto.response.OccupancyPredictionResponse;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.service.OccupancyIntelligenceService;
import com.fanconnect.service.OccupancyPredictionService;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Primary
public class CompositeOccupancyPredictionService implements OccupancyPredictionService {

    private final OccupancyIntelligenceService occupancyIntelligenceService;
    private final AiOccupancyClient aiOccupancyClient;

    public CompositeOccupancyPredictionService(
            @Lazy OccupancyIntelligenceService occupancyIntelligenceService,
            AiOccupancyClient aiOccupancyClient
    ) {
        this.occupancyIntelligenceService = occupancyIntelligenceService;
        this.aiOccupancyClient = aiOccupancyClient;
    }

    @Override
    @Transactional(readOnly = true)
    public OccupancyPredictionResponse predict(
            Business business,
            FootballMatch match,
            OccupancyBreakdownResponse breakdown
    ) {
        OccupancyIntelligenceResponse intelligence = occupancyIntelligenceService.getIntelligence(
                business.getId(),
                match.getId()
        );
        return aiOccupancyClient.toPredictionResponse(intelligence);
    }
}