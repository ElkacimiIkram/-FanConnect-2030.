package com.fanconnect.dto.request;

import lombok.Data;

@Data
public class ConfirmPaymentRequest {

    /** Required when Stripe is enabled — ID returned after card confirmation */
    private String paymentIntentId;
}