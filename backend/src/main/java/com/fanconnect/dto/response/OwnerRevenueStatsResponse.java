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
public class OwnerRevenueStatsResponse {

    private long totalBookings;
    private BigDecimal grossRevenue;
    private BigDecimal ownerPayout;
    private BigDecimal platformFee;
    private BigDecimal commissionRate;
    private String currency;
}