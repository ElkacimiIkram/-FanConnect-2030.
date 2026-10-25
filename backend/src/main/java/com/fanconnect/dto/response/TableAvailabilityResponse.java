package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableAvailabilityResponse {

    private Long id;
    private String tableNumber;
    private int capacity;
    private boolean available;
    private BigDecimal matchDayPrice;
}