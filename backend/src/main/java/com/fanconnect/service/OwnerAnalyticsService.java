package com.fanconnect.service;

import com.fanconnect.dto.response.OwnerReservationResponse;
import com.fanconnect.dto.response.OwnerRevenueStatsResponse;

import java.util.List;

public interface OwnerAnalyticsService {

    OwnerRevenueStatsResponse getRevenueStats();

    List<OwnerReservationResponse> getReservations();
}