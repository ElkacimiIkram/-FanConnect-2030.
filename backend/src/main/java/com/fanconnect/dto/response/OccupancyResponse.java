package com.fanconnect.dto.response;

import com.fanconnect.model.enums.OccupancyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyResponse {

    private Long cafeId;
    private String cafeName;
    private LocalDateTime slotStart;
    private LocalDateTime slotEnd;
    private int capacity;
    private int bookedSeats;
    private int availableSeats;
    private double occupancyPercentage;
    private OccupancyLevel level;
}