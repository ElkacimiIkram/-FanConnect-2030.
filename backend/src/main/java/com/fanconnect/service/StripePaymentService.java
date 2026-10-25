package com.fanconnect.service;

import com.fanconnect.dto.response.PaymentIntentResponse;
import com.fanconnect.model.entity.Payment;
import com.fanconnect.model.entity.Reservation;

public interface StripePaymentService {

    boolean isEnabled();

    PaymentIntentResponse createPaymentIntent(Reservation reservation, Payment payment);

    void verifyPaymentSucceeded(String paymentIntentId, Long reservationId);
}