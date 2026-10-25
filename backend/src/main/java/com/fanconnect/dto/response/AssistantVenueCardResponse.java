package com.fanconnect.dto.response;

import com.fanconnect.model.enums.OccupancyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistantVenueCardResponse {

    private Long id;
    private String name;
    private String city;
    private String address;
    private int capacity;
    private int availableSeats;
    private double occupancyPct;
    private OccupancyLevel occupancyLevel;
    private String reason;
    private Long matchId;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;
}
