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
public class TicketVerificationResponse {

    private boolean valid;
    private boolean canCheckIn;
    private boolean alreadyCheckedIn;
    private String message;
    private Long reservationId;
    private String ticketCode;
    private ReservationStatus status;
    private String businessName;
    private String matchLabel;
    private String spaceName;
    private String tableNumber;
    private LocalDateTime reservationDateTime;
    private int partySize;
    private Long fanUserId;
    private String fanName;
    private String fanEmail;
    private String fanPhone;
    private String fanCity;
    private Instant checkedInAt;
}