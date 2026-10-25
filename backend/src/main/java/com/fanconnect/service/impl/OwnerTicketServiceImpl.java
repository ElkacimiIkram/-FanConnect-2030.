package com.fanconnect.service.impl;

import com.fanconnect.dto.response.TicketVerificationResponse;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.exception.ForbiddenException;
import com.fanconnect.model.entity.Reservation;
import com.fanconnect.model.entity.User;
import com.fanconnect.model.enums.NotificationType;
import com.fanconnect.model.enums.ReservationStatus;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.repository.UserRepository;
import com.fanconnect.service.LiveOccupancyService;
import com.fanconnect.service.NotificationService;
import com.fanconnect.service.OwnerTicketService;
import com.fanconnect.util.SecurityUtils;
import com.fanconnect.util.TicketCodeParser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class OwnerTicketServiceImpl implements OwnerTicketService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final LiveOccupancyService liveOccupancyService;

    @Override
    @Transactional(readOnly = true)
    public TicketVerificationResponse verifyTicket(String rawTicketCode) {
        User owner = getCurrentUser();
        String ticketCode = requireNormalizedCode(rawTicketCode);

        Reservation reservation = reservationRepository
                .findByTicketCodeAndBusinessOwnerId(ticketCode, owner.getId())
                .orElse(null);

        if (reservation == null) {
            return TicketVerificationResponse.builder()
                    .valid(false)
                    .canCheckIn(false)
                    .alreadyCheckedIn(false)
                    .message("Ticket introuvable ou n'appartient pas à vos établissements")
                    .ticketCode(ticketCode)
                    .build();
        }

        return buildResponse(reservation);
    }

    @Override
    @Transactional
    public TicketVerificationResponse checkInTicket(String rawTicketCode) {
        User owner = getCurrentUser();
        String ticketCode = requireNormalizedCode(rawTicketCode);

        Reservation reservation = reservationRepository
                .findByTicketCodeAndBusinessOwnerId(ticketCode, owner.getId())
                .orElseThrow(() -> new BusinessException(
                        "Ticket introuvable ou n'appartient pas à vos établissements"
                ));

        if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
            return buildResponse(reservation);
        }
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new BusinessException("Ce ticket n'est pas valide pour le check-in");
        }

        reservation.setStatus(ReservationStatus.CHECKED_IN);
        reservation.setCheckedInAt(Instant.now());
        Reservation saved = reservationRepository.save(reservation);

        User fan = saved.getUser();
        String businessName = saved.getBusiness() != null ? saved.getBusiness().getName() : "votre établissement";
        notificationService.notifyUser(
                fan.getId(),
                NotificationType.TICKET_CHECKED_IN,
                "Check-in confirmé",
                String.format(
                        "Bienvenue ! Votre ticket %s a été validé à %s. Bon match !",
                        ticketCode, businessName
                ),
                "RESERVATION",
                saved.getId()
        );

        if (saved.getBusiness() != null && saved.getMatch() != null) {
            liveOccupancyService.recordCheckIn(
                    saved.getBusiness(),
                    saved.getMatch(),
                    saved.getPartySize(),
                    owner
            );
        }

        return buildResponse(saved);
    }

    private TicketVerificationResponse buildResponse(Reservation reservation) {
        User fan = reservation.getUser();
        boolean alreadyCheckedIn = reservation.getStatus() == ReservationStatus.CHECKED_IN
                || reservation.getCheckedInAt() != null;
        boolean canCheckIn = reservation.getStatus() == ReservationStatus.CONFIRMED;

        String message;
        boolean valid;
        if (alreadyCheckedIn) {
            valid = true;
            message = "Ticket déjà utilisé — check-in effectué";
        } else if (reservation.getStatus() == ReservationStatus.CONFIRMED) {
            valid = true;
            message = "Ticket valide — prêt pour le check-in";
        } else if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            valid = false;
            message = "Ticket annulé";
        } else if (reservation.getStatus() == ReservationStatus.PENDING) {
            valid = false;
            message = "Paiement non effectué — ticket invalide";
        } else {
            valid = false;
            message = "Statut de réservation non valide";
        }

        String matchLabel = null;
        if (reservation.getMatch() != null) {
            matchLabel = reservation.getMatch().getHomeTeam() + " vs " + reservation.getMatch().getAwayTeam();
        }

        return TicketVerificationResponse.builder()
                .valid(valid)
                .canCheckIn(canCheckIn)
                .alreadyCheckedIn(alreadyCheckedIn)
                .message(message)
                .reservationId(reservation.getId())
                .ticketCode(reservation.getTicketCode())
                .status(reservation.getStatus())
                .businessName(reservation.getBusiness() != null ? reservation.getBusiness().getName() : null)
                .matchLabel(matchLabel)
                .spaceName(reservation.getSpace() != null ? reservation.getSpace().getName() : null)
                .tableNumber(reservation.getTable() != null ? reservation.getTable().getTableNumber() : null)
                .reservationDateTime(reservation.getReservationDateTime())
                .partySize(reservation.getPartySize())
                .fanUserId(fan.getId())
                .fanName(fan.getFirstName() + " " + fan.getLastName())
                .fanEmail(fan.getEmail())
                .fanPhone(fan.getPhone())
                .fanCity(fan.getCity())
                .checkedInAt(reservation.getCheckedInAt())
                .build();
    }

    private String requireNormalizedCode(String raw) {
        String ticketCode = TicketCodeParser.normalize(raw);
        if (!StringUtils.hasText(ticketCode)) {
            throw new BusinessException("Code ticket invalide");
        }
        return ticketCode;
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (!StringUtils.hasText(email)) {
            throw new ForbiddenException("Not authenticated");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ForbiddenException("User not found"));
    }
}