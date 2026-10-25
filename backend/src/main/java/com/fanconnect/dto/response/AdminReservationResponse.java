package com.fanconnect.dto.response;

import com.fanconnect.model.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReservationResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private Long cafeId;
    private String cafeName;
    private LocalDateTime reservationDateTime;
    private int partySize;
    private ReservationStatus status;
    private String specialRequests;
    private Instant createdAt;
}