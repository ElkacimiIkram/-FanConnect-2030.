package com.fanconnect.service;

import com.fanconnect.dto.request.CreateUserRequest;
import com.fanconnect.dto.request.UpdateAdminUserRequest;
import com.fanconnect.dto.request.UpdateReservationStatusRequest;
import com.fanconnect.dto.response.AdminGlobalAnalyticsResponse;
import com.fanconnect.dto.response.AdminReservationResponse;
import com.fanconnect.dto.response.AdminRevenueResponse;
import com.fanconnect.dto.response.AdminStatsResponse;
import com.fanconnect.dto.response.AdminUserResponse;
import com.fanconnect.dto.response.CafeResponse;

import java.util.List;

public interface AdminService {

    AdminStatsResponse getStatistics();

    List<AdminUserResponse> getAllUsers();

    AdminUserResponse createUser(CreateUserRequest request);

    AdminUserResponse updateUser(Long id, UpdateAdminUserRequest request);

    void deleteUser(Long id);

    List<CafeResponse> getAllCafes();

    List<AdminReservationResponse> getAllReservations();

    AdminReservationResponse updateReservationStatus(Long id, UpdateReservationStatusRequest request);

    void cancelReservation(Long id);

    AdminRevenueResponse getRevenue();

    AdminGlobalAnalyticsResponse getGlobalAnalytics();
}