package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalUsers;
    private long totalCafes;
    private long activeCafes;
    private long totalReservations;
    private long confirmedReservations;
    private long pendingReservations;
    private long cancelledReservations;
}