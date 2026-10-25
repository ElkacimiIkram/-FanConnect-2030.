package com.fanconnect.service.impl;

import com.fanconnect.config.PaymentProperties;
import com.fanconnect.dto.response.PaymentIntentResponse;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.model.entity.Payment;
import com.fanconnect.model.entity.Reservation;
import com.fanconnect.repository.PaymentRepository;
import com.fanconnect.service.StripePaymentService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripePaymentServiceImpl implements StripePaymentService {

    private final PaymentProperties paymentProperties;
    private final PaymentRepository paymentRepository;

    @Override
    public boolean isEnabled() {
        if (!"stripe".equalsIgnoreCase(paymentProperties.getMode())) {
            return false;
        }
        String secret = paymentProperties.getStripeSecretKey();
        String publishable = paymentProperties.getStripePublishableKey();
        return StringUtils.hasText(secret)
                && StringUtils.hasText(publishable)
                && secret.startsWith("sk_")
                && publishable.startsWith("pk_");
    }

    @Override
    public PaymentIntentResponse createPaymentIntent(Reservation reservation, Payment payment) {
        if (!isEnabled()) {
            throw new BusinessException(
                    "Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to .env"
            );
        }

        try {
            Stripe.apiKey = paymentProperties.getStripeSecretKey();

            long amountMinor = toMinorUnits(payment.getAmount());

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountMinor)
                    .setCurrency("mad")
                    .putMetadata("reservationId", reservation.getId().toString())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            payment.setStripePaymentIntentId(intent.getId());
            payment.setPaymentMethod("STRIPE");
            paymentRepository.save(payment);

            return PaymentIntentResponse.builder()
                    .clientSecret(intent.getClientSecret())
                    .paymentIntentId(intent.getId())
                    .publishableKey(paymentProperties.getStripePublishableKey())
                    .stripeEnabled(true)
                    .amount(payment.getAmount())
                    .platformFee(payment.getPlatformFee())
                    .ownerPayout(payment.getOwnerPayout())
                    .currency(payment.getCurrency())
                    .build();
        } catch (StripeException ex) {
            log.error("Stripe PaymentIntent creation failed", ex);
            throw new BusinessException("Payment setup failed: " + ex.getUserMessage());
        }
    }

    @Override
    public void verifyPaymentSucceeded(String paymentIntentId, Long reservationId) {
        if (!isEnabled()) {
            throw new BusinessException("Stripe is not configured");
        }

        try {
            Stripe.apiKey = paymentProperties.getStripeSecretKey();
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);

            if (!"succeeded".equals(intent.getStatus())) {
                throw new BusinessException("Payment not completed. Status: " + intent.getStatus());
            }

            String metaReservationId = intent.getMetadata().get("reservationId");
            if (metaReservationId == null || !metaReservationId.equals(reservationId.toString())) {
                throw new BusinessException("Payment does not match this reservation");
            }
        } catch (StripeException ex) {
            log.error("Stripe payment verification failed", ex);
            throw new BusinessException("Payment verification failed: " + ex.getUserMessage());
        }
    }

    private long toMinorUnits(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();
    }
}