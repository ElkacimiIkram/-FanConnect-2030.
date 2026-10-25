package com.fanconnect.controller;

import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.MatchRecommendationsResponse;
import com.fanconnect.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "Proximity-first AI venue recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/match/{matchId}")
    @Operation(summary = "Get proximity-first venue recommendations for a match")
    public ResponseEntity<ApiResponse<MatchRecommendationsResponse>> recommendForMatch(
            @PathVariable Long matchId,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "10") Integer limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                recommendationService.recommendForMatch(matchId, lat, lng, limit)
        ));
    }
}