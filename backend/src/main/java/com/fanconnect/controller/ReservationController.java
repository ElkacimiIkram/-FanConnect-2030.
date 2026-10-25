package com.fanconnect.controller;

import com.fanconnect.dto.request.ReservationRequest;
import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.AvailabilityResponse;
import com.fanconnect.dto.response.ReservationResponse;
import com.fanconnect.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @deprecated Legacy café slot reservations — use {@code /fan/bookings} for match-day bookings.
 */
@Deprecated(since = "1.0", forRemoval = true)
@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Reservations (legacy)", description = "Deprecated — use Fan Bookings API")
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping("/availability")
    @Operation(summary = "Check café availability for a date/time slot")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> checkAvailability(
            @RequestParam Long cafeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime,
            @RequestParam(required = false) Integer partySize
    ) {
        AvailabilityResponse availability = reservationService.checkAvailability(cafeId, dateTime, partySize);
        return ResponseEntity.ok(ApiResponse.success(availability));
    }

    @PostMapping
    @Operation(summary = "Create and confirm a reservation")
    public ResponseEntity<ApiResponse<ReservationResponse>> create(@Valid @RequestBody ReservationRequest request) {
        ReservationResponse reservation = reservationService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reservation confirmed", reservation));
    }

    @GetMapping
    @Operation(summary = "List reservations for the current user")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> findByCurrentUser() {
        List<ReservationResponse> reservations = reservationService.findByCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get reservation by ID")
    public ResponseEntity<ApiResponse<ReservationResponse>> findById(@PathVariable Long id) {
        ReservationResponse reservation = reservationService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a reservation")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id) {
        reservationService.cancel(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled", null));
    }
}