package com.fanconnect.dto.request;

import com.fanconnect.model.enums.ReservationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateReservationStatusRequest {

    @NotNull
    private ReservationStatus status;
}