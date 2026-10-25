package com.fanconnect.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateLiveOccupancyRequest {

    private Long matchId;

    @NotNull
    @Min(0)
    private Integer currentCustomers;
}