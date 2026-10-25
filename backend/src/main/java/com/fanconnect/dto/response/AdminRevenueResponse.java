package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRevenueResponse {

    private long totalPaidBookings;
    private BigDecimal totalGrossRevenue;
    private BigDecimal totalPlatformCommission;
    private BigDecimal totalOwnerPayouts;
    private BigDecimal commissionRate;
    private String currency;
    private List<AdminCommissionEntryResponse> recentCommissions;
}