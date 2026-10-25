package com.fanconnect.dto.response;

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
public class AdminCommissionEntryResponse {

    private Long paymentId;
    private Long reservationId;
    private String businessName;
    private String fanName;
    private BigDecimal grossAmount;
    private BigDecimal platformFee;
    private BigDecimal ownerPayout;
    private Instant paidAt;
}