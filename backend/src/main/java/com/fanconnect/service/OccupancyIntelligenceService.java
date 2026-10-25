package com.fanconnect.service;

import com.fanconnect.dto.response.OccupancyIntelligenceResponse;

public interface OccupancyIntelligenceService {

    OccupancyIntelligenceResponse getIntelligence(Long businessId, Long matchId);
}