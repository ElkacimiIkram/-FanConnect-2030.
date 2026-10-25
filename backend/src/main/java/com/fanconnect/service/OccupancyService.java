package com.fanconnect.service;

import com.fanconnect.dto.response.OccupancyResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface OccupancyService {

    OccupancyResponse getCafeOccupancy(Long cafeId, LocalDateTime dateTime);

    List<OccupancyResponse> getAllCafesOccupancy(LocalDateTime dateTime);
}