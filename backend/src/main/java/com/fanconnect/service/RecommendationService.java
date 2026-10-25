package com.fanconnect.service;

import com.fanconnect.dto.response.MatchRecommendationsResponse;

public interface RecommendationService {

    MatchRecommendationsResponse recommendForMatch(
            Long matchId,
            Double latitude,
            Double longitude,
            Integer limit
    );
}