package com.fanconnect.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReservationRequest {

    @NotNull
    private Long cafeId;

    @NotNull
    @Future
    private LocalDateTime reservationDateTime;

    @NotNull
    @Min(1)
    private Integer partySize;

    @Size(max = 500)
    private String specialRequests;
}