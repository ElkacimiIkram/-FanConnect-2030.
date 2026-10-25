package com.fanconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeoCoordinates {

    private BigDecimal latitude;
    private BigDecimal longitude;

    public boolean isPresent() {
        return latitude != null && longitude != null;
    }
}