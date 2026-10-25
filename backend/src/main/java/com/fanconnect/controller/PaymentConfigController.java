package com.fanconnect.controller;

import com.fanconnect.config.PaymentProperties;
import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.PaymentConfigResponse;
import com.fanconnect.service.StripePaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment configuration")
public class PaymentConfigController {

    private final StripePaymentService stripePaymentService;
    private final PaymentProperties paymentProperties;

    @GetMapping("/config")
    @Operation(summary = "Get payment config for frontend (Stripe publishable key)")
    public ResponseEntity<ApiResponse<PaymentConfigResponse>> getConfig() {
        return ResponseEntity.ok(ApiResponse.success(PaymentConfigResponse.builder()
                .stripeEnabled(stripePaymentService.isEnabled())
                .publishableKey(paymentProperties.getStripePublishableKey())
                .mode(paymentProperties.getMode())
                .build()));
    }
}