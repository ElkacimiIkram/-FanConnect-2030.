package com.fanconnect.dto.response;

import com.fanconnect.model.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerReservationResponse {

    private Long reservationId;
    private Long businessId;
    private String businessName;
    private String matchLabel;
    private String spaceName;
    private String tableNumber;
    private LocalDateTime reservationDateTime;
    private int partySize;
    private ReservationStatus status;
    private String ticketCode;
    private Instant checkedInAt;
    private BigDecimal grossAmount;
    private BigDecimal ownerPayout;
    private BigDecimal platformFee;
    private Long fanUserId;
    private String fanName;
    private String fanEmail;
    private String fanPhone;
    private String fanCity;
    private Instant createdAt;
}