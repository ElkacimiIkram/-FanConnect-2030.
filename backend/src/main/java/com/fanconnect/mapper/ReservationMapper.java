package com.fanconnect.mapper;

import com.fanconnect.dto.response.ReservationResponse;
import com.fanconnect.model.entity.Reservation;
import org.springframework.stereotype.Component;

@Component
public class ReservationMapper {

    public ReservationResponse toResponse(Reservation reservation) {
        ReservationResponse.ReservationResponseBuilder builder = ReservationResponse.builder()
                .id(reservation.getId())
                .userId(reservation.getUser().getId())
                .reservationDateTime(reservation.getReservationDateTime())
                .partySize(reservation.getPartySize())
                .status(reservation.getStatus())
                .specialRequests(reservation.getSpecialRequests())
                .totalPrice(reservation.getTotalPrice())
                .ticketCode(reservation.getTicketCode())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt());

        if (reservation.getCafe() != null) {
            builder.cafeId(reservation.getCafe().getId())
                    .cafeName(reservation.getCafe().getName());
        }

        if (reservation.getBusiness() != null) {
            builder.businessId(reservation.getBusiness().getId())
                    .businessName(reservation.getBusiness().getName());
        }

        if (reservation.getSpace() != null) {
            builder.spaceId(reservation.getSpace().getId())
                    .spaceName(reservation.getSpace().getName());
        }

        if (reservation.getTable() != null) {
            builder.tableId(reservation.getTable().getId())
                    .tableNumber(reservation.getTable().getTableNumber());
        }

        if (reservation.getMatch() != null) {
            builder.matchId(reservation.getMatch().getId())
                    .competition(reservation.getMatch().getCompetition())
                    .matchLabel(reservation.getMatch().getHomeTeam() + " vs " + reservation.getMatch().getAwayTeam());
        }

        return builder.build();
    }
}