package com.fanconnect.controller;

import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.MatchDetailResponse;
import com.fanconnect.dto.response.MatchRecommendationsResponse;
import com.fanconnect.dto.response.MatchSummaryResponse;
import com.fanconnect.service.LiveMatchFeedService;
import com.fanconnect.service.MatchService;
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

import java.util.List;

@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
@Tag(name = "Match Center", description = "FIFA World Cup matches for café reservations")
public class MatchController {

    private final MatchService matchService;
    private final LiveMatchFeedService liveMatchFeedService;
    private final RecommendationService recommendationService;

    @GetMapping
    @Operation(summary = "List upcoming World Cup matches")
    public ResponseEntity<ApiResponse<List<MatchSummaryResponse>>> listUpcoming() {
        return ResponseEntity.ok(ApiResponse.success(matchService.findUpcoming()));
    }

    @GetMapping("/live/{externalId}")
    @Operation(summary = "Get live match detail from football-data.org")
    public ResponseEntity<ApiResponse<MatchDetailResponse>> getLiveDetail(@PathVariable String externalId) {
        return ResponseEntity.ok(ApiResponse.success(liveMatchFeedService.getMatchDetail(externalId)));
    }

    @GetMapping("/detail/{localId}")
    @Operation(summary = "Get World Cup match detail by local id (e.g. FIFA 2030)")
    public ResponseEntity<ApiResponse<MatchDetailResponse>> getLocalDetail(@PathVariable Long localId) {
        return ResponseEntity.ok(ApiResponse.success(liveMatchFeedService.getLocalMatchDetail(localId)));
    }

    @GetMapping("/{id}/venues")
    @Operation(summary = "Proximity-first venue recommendations for this match")
    public ResponseEntity<ApiResponse<MatchRecommendationsResponse>> getMatchVenues(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "10") Integer limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                recommendationService.recommendForMatch(id, lat, lng, limit)
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get match summary")
    public ResponseEntity<ApiResponse<MatchSummaryResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(matchService.findById(id)));
    }
}