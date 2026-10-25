package com.fanconnect.controller;

import com.fanconnect.dto.request.VerifyTicketRequest;
import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.OwnerReservationResponse;
import com.fanconnect.dto.response.OwnerRevenueStatsResponse;
import com.fanconnect.dto.response.TicketVerificationResponse;
import com.fanconnect.service.OwnerAnalyticsService;
import com.fanconnect.service.OwnerTicketService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/owner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BUSINESS_OWNER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Owner Dashboard", description = "Revenue and reservations for business owners")
public class OwnerDashboardController {

    private final OwnerAnalyticsService ownerAnalyticsService;
    private final OwnerTicketService ownerTicketService;

    @GetMapping("/revenue")
    @Operation(summary = "Owner revenue stats (75% payout)")
    public ResponseEntity<ApiResponse<OwnerRevenueStatsResponse>> revenue() {
        return ResponseEntity.ok(ApiResponse.success(ownerAnalyticsService.getRevenueStats()));
    }

    @GetMapping("/reservations")
    @Operation(summary = "Confirmed reservations with fan details")
    public ResponseEntity<ApiResponse<List<OwnerReservationResponse>>> reservations() {
        return ResponseEntity.ok(ApiResponse.success(ownerAnalyticsService.getReservations()));
    }

    @PostMapping("/tickets/verify")
    @Operation(summary = "Verify a fan ticket QR/code before check-in")
    public ResponseEntity<ApiResponse<TicketVerificationResponse>> verifyTicket(
            @Valid @RequestBody VerifyTicketRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ownerTicketService.verifyTicket(request.getTicketCode())
        ));
    }

    @PostMapping("/tickets/check-in")
    @Operation(summary = "Check in a fan at the venue (marks ticket as used)")
    public ResponseEntity<ApiResponse<TicketVerificationResponse>> checkInTicket(
            @Valid @RequestBody VerifyTicketRequest request
    ) {
        TicketVerificationResponse result = ownerTicketService.checkInTicket(request.getTicketCode());
        return ResponseEntity.ok(ApiResponse.success("Check-in confirmé", result));
    }
}