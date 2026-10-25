package com.fanconnect.dto.response;

import com.fanconnect.model.enums.SpaceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessSpaceResponse {

    private Long id;
    private String name;
    private SpaceType spaceType;
    private String description;
    private int capacity;
    private int numberOfTables;
    private BigDecimal matchDayPrice;
}