package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntentResponse {

    private String clientSecret;
    private String paymentIntentId;
    private String publishableKey;
    private boolean stripeEnabled;
    private BigDecimal amount;
    private BigDecimal platformFee;
    private BigDecimal ownerPayout;
    private String currency;
}