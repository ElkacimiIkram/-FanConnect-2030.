package com.fanconnect.controller;

import com.fanconnect.dto.request.ConfirmPaymentRequest;
import com.fanconnect.dto.request.CreateBusinessBookingRequest;
import com.fanconnect.dto.response.PaymentIntentResponse;
import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.PaymentResponse;
import com.fanconnect.dto.response.ReservationResponse;
import com.fanconnect.dto.response.TableAvailabilityResponse;
import com.fanconnect.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/fan/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FAN_USER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Fan Bookings", description = "Match-day table booking for fans")
public class FanBookingController {

    private final BookingService bookingService;

    @GetMapping
    @Operation(summary = "List my match-day bookings and reservations")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> listMine() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.listMyBookings()));
    }

    @GetMapping("/tables")
    @Operation(summary = "List tables and availability for a space and match")
    public ResponseEntity<ApiResponse<List<TableAvailabilityResponse>>> getTables(
            @RequestParam Long businessId,
            @RequestParam Long spaceId,
            @RequestParam Long matchId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getAvailableTables(businessId, spaceId, matchId)
        ));
    }

    @PostMapping
    @Operation(summary = "Create a pending match-day booking (pay in step 7)")
    public ResponseEntity<ApiResponse<ReservationResponse>> create(
            @Valid @RequestBody CreateBusinessBookingRequest request
    ) {
        ReservationResponse booking = bookingService.createBusinessBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created — proceed to payment", booking));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking details (resume payment, ticket)")
    public ResponseEntity<ApiResponse<ReservationResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBooking(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a pending or confirmed booking")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", null));
    }

    @PostMapping("/{id}/payment-intent")
    @Operation(summary = "Create Stripe PaymentIntent for card payment")
    public ResponseEntity<ApiResponse<PaymentIntentResponse>> createPaymentIntent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.createPaymentIntent(id)));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Confirm payment after card charge (25% platform commission)")
    public ResponseEntity<ApiResponse<PaymentResponse>> pay(
            @PathVariable Long id,
            @RequestBody(required = false) ConfirmPaymentRequest request
    ) {
        PaymentResponse payment = bookingService.payForBooking(id, request);
        return ResponseEntity.ok(ApiResponse.success("Payment successful — ticket issued", payment));
    }

    @GetMapping("/{id}/ticket")
    @Operation(summary = "Get booking ticket")
    public ResponseEntity<ApiResponse<ReservationResponse>> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getTicket(id)));
    }

    @GetMapping("/{id}/ticket/pdf")
    @Operation(summary = "Download PDF ticket with QR code")
    public ResponseEntity<byte[]> downloadTicketPdf(@PathVariable Long id) {
        byte[] pdf = bookingService.downloadTicketPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ticket-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}