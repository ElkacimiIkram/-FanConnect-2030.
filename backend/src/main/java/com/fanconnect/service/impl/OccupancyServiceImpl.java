package com.fanconnect.service.impl;

import com.fanconnect.dto.response.OccupancyResponse;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.model.entity.Cafe;
import com.fanconnect.model.enums.OccupancyLevel;
import com.fanconnect.model.enums.ReservationStatus;
import com.fanconnect.repository.CafeRepository;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.service.OccupancyService;
import com.fanconnect.util.OccupancyCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OccupancyServiceImpl implements OccupancyService {

    private static final List<ReservationStatus> ACTIVE_RESERVATION_STATUSES = List.of(
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED
    );

    private final CafeRepository cafeRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional(readOnly = true)
    public OccupancyResponse getCafeOccupancy(Long cafeId, LocalDateTime dateTime) {
        Cafe cafe = cafeRepository.findByIdAndActiveTrue(cafeId)
                .orElseThrow(() -> new ResourceNotFoundException("Café", cafeId));

        return calculateOccupancy(cafe, dateTime);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OccupancyResponse> getAllCafesOccupancy(LocalDateTime dateTime) {
        return cafeRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(cafe -> calculateOccupancy(cafe, dateTime))
                .toList();
    }

    private OccupancyResponse calculateOccupancy(Cafe cafe, LocalDateTime dateTime) {
        LocalDateTime slotStart = dateTime.truncatedTo(ChronoUnit.HOURS);
        LocalDateTime slotEnd = slotStart.plusHours(1);

        int bookedSeats = reservationRepository.sumPartySizeForCafeInTimeSlot(
                cafe.getId(),
                slotStart,
                slotEnd,
                ACTIVE_RESERVATION_STATUSES
        );

        int capacity = cafe.getCapacity();
        double occupancyPercentage = OccupancyCalculator.calculatePercentage(bookedSeats, capacity);
        OccupancyLevel level = OccupancyCalculator.resolveLevel(occupancyPercentage);

        return OccupancyResponse.builder()
                .cafeId(cafe.getId())
                .cafeName(cafe.getName())
                .slotStart(slotStart)
                .slotEnd(slotEnd)
                .capacity(capacity)
                .bookedSeats(bookedSeats)
                .availableSeats(Math.max(capacity - bookedSeats, 0))
                .occupancyPercentage(occupancyPercentage)
                .level(level)
                .build();
    }

}