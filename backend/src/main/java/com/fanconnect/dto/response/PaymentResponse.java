package com.fanconnect.dto.response;

import com.fanconnect.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private Long reservationId;
    private BigDecimal amount;
    private BigDecimal platformFee;
    private BigDecimal ownerPayout;
    private String currency;
    private PaymentStatus status;
    private String paymentMethod;
    private String ticketCode;
    private Instant paidAt;
    private ReservationResponse reservation;
}