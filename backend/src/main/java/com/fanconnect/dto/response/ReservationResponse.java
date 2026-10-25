package com.fanconnect.dto.response;

import com.fanconnect.model.enums.PaymentStatus;
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
public class ReservationResponse {

    private Long id;
    private Long userId;
    private Long cafeId;
    private String cafeName;
    private Long businessId;
    private String businessName;
    private Long spaceId;
    private String spaceName;
    private Long tableId;
    private String tableNumber;
    private Long matchId;
    private String matchLabel;
    private String competition;
    private LocalDateTime reservationDateTime;
    private int partySize;
    private ReservationStatus status;
    private String specialRequests;
    private BigDecimal totalPrice;
    private String ticketCode;
    private PaymentStatus paymentStatus;
    private Instant createdAt;
    private Instant updatedAt;
}