package com.fanconnect.dto.request;

import com.fanconnect.model.enums.SpaceType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BusinessSpaceRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull
    private SpaceType spaceType;

    @Size(max = 500)
    private String description;

    @Min(1)
    private int capacity;

    @Min(1)
    private int numberOfTables;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal matchDayPrice;
}