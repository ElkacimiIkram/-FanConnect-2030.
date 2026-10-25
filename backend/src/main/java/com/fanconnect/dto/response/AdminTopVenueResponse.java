package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTopVenueResponse {

    private Long businessId;
    private String name;
    private String city;
    private int reservationCount;
    private double averageOccupancyPct;
}