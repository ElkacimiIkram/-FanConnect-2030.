package com.fanconnect.controller;

import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.BusinessDetailResponse;
import com.fanconnect.dto.response.BusinessOccupancyResponse;
import com.fanconnect.dto.response.BusinessSummaryResponse;
import com.fanconnect.dto.response.OccupancyIntelligenceResponse;
import com.fanconnect.service.BusinessOccupancyService;
import com.fanconnect.service.BusinessService;
import com.fanconnect.service.OccupancyIntelligenceService;
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
@RequestMapping("/businesses")
@RequiredArgsConstructor
@Tag(name = "Businesses", description = "Public approved cafés & restaurants")
public class BusinessController {

    private final BusinessService businessService;
    private final BusinessOccupancyService businessOccupancyService;
    private final OccupancyIntelligenceService occupancyIntelligenceService;

    @GetMapping("/occupancy")
    @Operation(summary = "Occupancy level (green/orange/red) for all businesses on a match")
    public ResponseEntity<ApiResponse<List<BusinessOccupancyResponse>>> allOccupancy(
            @RequestParam Long matchId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                businessOccupancyService.getAllBusinessesOccupancy(matchId)
        ));
    }

    @GetMapping
    @Operation(summary = "List approved businesses (fans)")
    public ResponseEntity<ApiResponse<List<BusinessSummaryResponse>>> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radiusKm
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                businessService.findApprovedPublic(query, city, lat, lng, radiusKm)
        ));
    }

    @GetMapping("/{id}/occupancy")
    @Operation(summary = "Occupancy level for one business on a match")
    public ResponseEntity<ApiResponse<BusinessOccupancyResponse>> businessOccupancy(
            @PathVariable Long id,
            @RequestParam Long matchId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                businessOccupancyService.getBusinessOccupancy(id, matchId)
        ));
    }

    @GetMapping("/{id}/occupancy/intelligence")
    @Operation(summary = "AI Occupancy Intelligence Center for a business on a match")
    public ResponseEntity<ApiResponse<OccupancyIntelligenceResponse>> occupancyIntelligence(
            @PathVariable Long id,
            @RequestParam Long matchId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                occupancyIntelligenceService.getIntelligence(id, matchId)
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get approved business details")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(businessService.findApprovedPublicById(id)));
    }
}