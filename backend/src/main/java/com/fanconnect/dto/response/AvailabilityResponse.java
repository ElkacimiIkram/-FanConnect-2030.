package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResponse {

    private Long cafeId;
    private String cafeName;
    private LocalDateTime slotStart;
    private LocalDateTime slotEnd;
    private int capacity;
    private int bookedSeats;
    private int availableSeats;
    private boolean canReserve;
}