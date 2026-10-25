package com.fanconnect.controller;

import com.fanconnect.dto.request.CafeRequest;
import com.fanconnect.dto.request.UpdateCafeRequest;
import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.CafeResponse;
import com.fanconnect.dto.response.OccupancyResponse;
import com.fanconnect.service.CafeService;
import com.fanconnect.service.OccupancyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/cafes")
@RequiredArgsConstructor
@Tag(name = "Cafés", description = "Café management endpoints")
public class CafeController {

    private final CafeService cafeService;
    private final OccupancyService occupancyService;

    @GetMapping("/occupancy")
    @Operation(summary = "Get occupancy level for all active cafés at a given time")
    public ResponseEntity<ApiResponse<List<OccupancyResponse>>> getAllOccupancy(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime
    ) {
        List<OccupancyResponse> occupancy = occupancyService.getAllCafesOccupancy(dateTime);
        return ResponseEntity.ok(ApiResponse.success(occupancy));
    }

    @GetMapping
    @Operation(summary = "List all active cafés")
    public ResponseEntity<ApiResponse<List<CafeResponse>>> findAll() {
        List<CafeResponse> cafes = cafeService.findAllActive();
        return ResponseEntity.ok(ApiResponse.success(cafes));
    }

    @GetMapping("/search")
    @Operation(summary = "Search active cafés by keyword and/or city")
    public ResponseEntity<ApiResponse<List<CafeResponse>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String city
    ) {
        List<CafeResponse> cafes = cafeService.search(q, city);
        return ResponseEntity.ok(ApiResponse.success(cafes));
    }

    @GetMapping("/{id}/occupancy")
    @Operation(summary = "Get occupancy level for a café at a given time")
    public ResponseEntity<ApiResponse<OccupancyResponse>> getCafeOccupancy(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime
    ) {
        OccupancyResponse occupancy = occupancyService.getCafeOccupancy(id, dateTime);
        return ResponseEntity.ok(ApiResponse.success(occupancy));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get café by ID")
    public ResponseEntity<ApiResponse<CafeResponse>> findById(@PathVariable Long id) {
        CafeResponse cafe = cafeService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(cafe));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('BUSINESS_OWNER', 'ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new café")
    public ResponseEntity<ApiResponse<CafeResponse>> create(@Valid @RequestBody CafeRequest request) {
        CafeResponse cafe = cafeService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Café created", cafe));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUSINESS_OWNER', 'ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update an existing café")
    public ResponseEntity<ApiResponse<CafeResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCafeRequest request
    ) {
        CafeResponse cafe = cafeService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Café updated", cafe));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUSINESS_OWNER', 'ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a café (soft delete)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        cafeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Café deleted", null));
    }
}