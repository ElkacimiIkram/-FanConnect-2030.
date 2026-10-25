package com.fanconnect.service;

import com.fanconnect.dto.request.ReservationRequest;
import com.fanconnect.dto.response.AvailabilityResponse;
import com.fanconnect.dto.response.ReservationResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationService {

    AvailabilityResponse checkAvailability(Long cafeId, LocalDateTime dateTime, Integer partySize);

    ReservationResponse create(ReservationRequest request);

    List<ReservationResponse> findByCurrentUser();

    ReservationResponse findById(Long id);

    void cancel(Long id);
}