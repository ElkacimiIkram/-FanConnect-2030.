package com.fanconnect.mapper;

import com.fanconnect.dto.response.AdminReservationResponse;
import com.fanconnect.dto.response.AdminUserResponse;
import com.fanconnect.model.entity.Reservation;
import com.fanconnect.model.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {

    public AdminUserResponse toAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public AdminReservationResponse toAdminReservationResponse(Reservation reservation) {
        User user = reservation.getUser();
        return AdminReservationResponse.builder()
                .id(reservation.getId())
                .userId(user.getId())
                .userEmail(user.getEmail())
                .userFullName(user.getFirstName() + " " + user.getLastName())
                .cafeId(reservation.getCafe() != null ? reservation.getCafe().getId() : null)
                .cafeName(reservation.getCafe() != null ? reservation.getCafe().getName()
                        : reservation.getBusiness() != null ? reservation.getBusiness().getName() : null)
                .reservationDateTime(reservation.getReservationDateTime())
                .partySize(reservation.getPartySize())
                .status(reservation.getStatus())
                .specialRequests(reservation.getSpecialRequests())
                .createdAt(reservation.getCreatedAt())
                .build();
    }
}