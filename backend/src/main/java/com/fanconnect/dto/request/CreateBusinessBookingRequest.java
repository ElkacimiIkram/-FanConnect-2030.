package com.fanconnect.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateBusinessBookingRequest {

    @NotNull
    private Long matchId;

    @NotNull
    private Long businessId;

    @NotNull
    private Long spaceId;

    @NotNull
    private Long tableId;

    @NotNull
    @Min(1)
    private Integer partySize;

    @Size(max = 500)
    private String specialRequests;
}