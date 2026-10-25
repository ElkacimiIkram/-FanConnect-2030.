package com.fanconnect.dto.response;

import com.fanconnect.model.enums.BusinessStatus;
import com.fanconnect.model.enums.BusinessType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessSummaryResponse {

    private Long id;
    private String name;
    private BusinessType businessType;
    private String city;
    private String address;
    private int totalCapacity;
    private int totalTables;
    private BusinessStatus status;
    private String coverImageUrl;
    private BigDecimal minMatchDayPrice;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String googleMapsUrl;
    private Double distanceKm;
}