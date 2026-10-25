package com.fanconnect.controller;

import com.fanconnect.dto.request.CreateCompetitionRequest;
import com.fanconnect.dto.request.CreateMatchRequest;
import com.fanconnect.dto.request.CreateUserRequest;
import com.fanconnect.dto.request.RejectBusinessRequest;
import com.fanconnect.dto.request.UpdateCompetitionRequest;
import com.fanconnect.dto.request.UpdateMatchRequest;
import com.fanconnect.dto.request.UpdateAdminUserRequest;
import com.fanconnect.dto.request.UpdateReservationStatusRequest;
import com.fanconnect.dto.response.AdminGlobalAnalyticsResponse;
import com.fanconnect.dto.response.AdminReservationResponse;
import com.fanconnect.dto.response.AdminRevenueResponse;
import com.fanconnect.dto.response.AdminStatsResponse;
import com.fanconnect.dto.response.AdminUserResponse;
import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.BusinessDetailResponse;
import com.fanconnect.dto.response.BusinessSummaryResponse;
import com.fanconnect.dto.response.CafeResponse;
import com.fanconnect.dto.response.CompetitionResponse;
import com.fanconnect.dto.response.MatchSummaryResponse;
import com.fanconnect.service.AdminService;
import com.fanconnect.service.BusinessService;
import com.fanconnect.service.CompetitionService;
import com.fanconnect.service.MatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Admin dashboard endpoints")
public class AdminController {

    private final AdminService adminService;
    private final BusinessService businessService;
    private final MatchService matchService;
    private final CompetitionService competitionService;

    @GetMapping("/stats")
    @Operation(summary = "Get platform statistics")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStatistics()));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Platform revenue and 25% commission analytics")
    public ResponseEntity<ApiResponse<AdminRevenueResponse>> getRevenue() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRevenue()));
    }

    @GetMapping("/analytics/global")
    @Operation(summary = "Global analytics: city heatmap, popular matches, top venues")
    public ResponseEntity<ApiResponse<AdminGlobalAnalyticsResponse>> getGlobalAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getGlobalAnalytics()));
    }

    @GetMapping("/users")
    @Operation(summary = "List all users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers()));
    }

    @PostMapping("/users")
    @Operation(summary = "Create a new user")
    public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        AdminUserResponse user = adminService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created", user));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update a user")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminUserRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("User updated", adminService.updateUser(id, request)));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    @GetMapping("/cafes")
    @Operation(summary = "List all cafés including inactive")
    public ResponseEntity<ApiResponse<List<CafeResponse>>> getAllCafes() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllCafes()));
    }

    @GetMapping("/businesses")
    @Operation(summary = "List all businesses")
    public ResponseEntity<ApiResponse<List<BusinessSummaryResponse>>> getAllBusinesses() {
        return ResponseEntity.ok(ApiResponse.success(businessService.findAllForAdmin()));
    }

    @GetMapping("/businesses/pending")
    @Operation(summary = "List businesses pending approval")
    public ResponseEntity<ApiResponse<List<BusinessSummaryResponse>>> getPendingBusinesses() {
        return ResponseEntity.ok(ApiResponse.success(businessService.findPendingForAdmin()));
    }

    @PutMapping("/businesses/{id}/approve")
    @Operation(summary = "Approve a business")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> approveBusiness(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Business approved",
                businessService.approveBusiness(id)
        ));
    }

    @PutMapping("/businesses/{id}/reject")
    @Operation(summary = "Reject a business")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> rejectBusiness(
            @PathVariable Long id,
            @Valid @RequestBody RejectBusinessRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Business rejected",
                businessService.rejectBusiness(id, request)
        ));
    }

    @PutMapping("/businesses/{id}/disable")
    @Operation(summary = "Disable an approved business")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> disableBusiness(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Business disabled",
                businessService.disableBusiness(id)
        ));
    }

    @GetMapping("/reservations")
    @Operation(summary = "List all reservations")
    public ResponseEntity<ApiResponse<List<AdminReservationResponse>>> getAllReservations() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllReservations()));
    }

    @PutMapping("/reservations/{id}/status")
    @Operation(summary = "Update reservation status")
    public ResponseEntity<ApiResponse<AdminReservationResponse>> updateReservationStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservationStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Reservation status updated",
                adminService.updateReservationStatus(id, request)
        ));
    }

    @DeleteMapping("/reservations/{id}")
    @Operation(summary = "Cancel a reservation")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(@PathVariable Long id) {
        adminService.cancelReservation(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled", null));
    }

    @GetMapping("/competitions")
    @Operation(summary = "List all competitions")
    public ResponseEntity<ApiResponse<List<CompetitionResponse>>> getAllCompetitions() {
        return ResponseEntity.ok(ApiResponse.success(competitionService.findAllForAdmin()));
    }

    @PostMapping("/competitions")
    @Operation(summary = "Create a competition")
    public ResponseEntity<ApiResponse<CompetitionResponse>> createCompetition(
            @Valid @RequestBody CreateCompetitionRequest request
    ) {
        CompetitionResponse created = competitionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Competition created", created));
    }

    @PutMapping("/competitions/{id}")
    @Operation(summary = "Update a competition")
    public ResponseEntity<ApiResponse<CompetitionResponse>> updateCompetition(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCompetitionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Competition updated",
                competitionService.update(id, request)
        ));
    }

    @DeleteMapping("/competitions/{id}")
    @Operation(summary = "Delete a competition")
    public ResponseEntity<ApiResponse<Void>> deleteCompetition(@PathVariable Long id) {
        competitionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Competition deleted", null));
    }

    @PostMapping("/competitions/{id}/sync")
    @Operation(summary = "Sync matches from football-data.org")
    public ResponseEntity<ApiResponse<Integer>> syncCompetition(@PathVariable Long id) {
        int synced = competitionService.syncCompetitionMatches(id);
        return ResponseEntity.ok(ApiResponse.success("Synced " + synced + " match(es)", synced));
    }

    @PostMapping("/competitions/sync-all")
    @Operation(summary = "Sync all active competitions from football-data.org")
    public ResponseEntity<ApiResponse<Integer>> syncAllCompetitions() {
        int synced = competitionService.syncAllCompetitionMatches();
        return ResponseEntity.ok(ApiResponse.success("Synced " + synced + " match(es)", synced));
    }

    @GetMapping("/matches")
    @Operation(summary = "List all football matches")
    public ResponseEntity<ApiResponse<List<MatchSummaryResponse>>> getAllMatches() {
        return ResponseEntity.ok(ApiResponse.success(matchService.findAllForAdmin()));
    }

    @PostMapping("/matches")
    @Operation(summary = "Create a football match")
    public ResponseEntity<ApiResponse<MatchSummaryResponse>> createMatch(
            @Valid @RequestBody CreateMatchRequest request
    ) {
        MatchSummaryResponse created = matchService.createMatch(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Match created", created));
    }

    @PutMapping("/matches/{id}")
    @Operation(summary = "Update a football match")
    public ResponseEntity<ApiResponse<MatchSummaryResponse>> updateMatch(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMatchRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Match updated",
                matchService.updateMatch(id, request)
        ));
    }

    @DeleteMapping("/matches/{id}")
    @Operation(summary = "Delete a football match")
    public ResponseEntity<ApiResponse<Void>> deleteMatch(@PathVariable Long id) {
        matchService.deleteMatch(id);
        return ResponseEntity.ok(ApiResponse.success("Match deleted", null));
    }
}