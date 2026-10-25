package com.fanconnect.controller;

import com.fanconnect.dto.request.UpdateLiveOccupancyRequest;
import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.LiveOccupancyResponse;
import com.fanconnect.dto.response.OccupancyAnalyticsResponse;
import com.fanconnect.service.LiveOccupancyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/owner/businesses/{businessId}/occupancy")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BUSINESS_OWNER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Owner Occupancy", description = "Live occupancy management")
public class OwnerOccupancyController {

    private final LiveOccupancyService liveOccupancyService;

    @PutMapping("/live")
    @Operation(summary = "Update current customers inside")
    public ResponseEntity<ApiResponse<LiveOccupancyResponse>> updateLive(
            @PathVariable Long businessId,
            @Valid @RequestBody UpdateLiveOccupancyRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Affluence mise à jour",
                liveOccupancyService.updateLiveOccupancy(businessId, request)
        ));
    }

    @GetMapping("/live")
    @Operation(summary = "Get latest live occupancy report")
    public ResponseEntity<ApiResponse<LiveOccupancyResponse>> getLive(
            @PathVariable Long businessId,
            @RequestParam(required = false) Long matchId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                liveOccupancyService.getLatestLiveOccupancy(businessId, matchId)
        ));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Occupancy analytics for owner dashboard")
    public ResponseEntity<ApiResponse<OccupancyAnalyticsResponse>> analytics(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success(liveOccupancyService.getAnalytics(businessId)));
    }
}