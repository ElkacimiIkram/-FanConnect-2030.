package com.fanconnect.service;

import com.fanconnect.dto.response.BusinessOccupancyResponse;

import java.util.List;

public interface BusinessOccupancyService {

    BusinessOccupancyResponse getBusinessOccupancy(Long businessId, Long matchId);

    BusinessOccupancyResponse getBusinessOccupancyReadOnly(Long businessId, Long matchId);

    List<BusinessOccupancyResponse> getAllBusinessesOccupancy(Long matchId);
}