package com.fanconnect.service.impl;

import com.fanconnect.config.PaymentProperties;
import com.fanconnect.dto.response.OwnerReservationResponse;
import com.fanconnect.dto.response.OwnerRevenueStatsResponse;
import com.fanconnect.exception.ForbiddenException;
import com.fanconnect.model.entity.Payment;
import com.fanconnect.model.entity.Reservation;
import com.fanconnect.model.entity.User;
import com.fanconnect.model.enums.PaymentStatus;
import com.fanconnect.repository.PaymentRepository;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.repository.UserRepository;
import com.fanconnect.service.OwnerAnalyticsService;
import com.fanconnect.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OwnerAnalyticsServiceImpl implements OwnerAnalyticsService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final PaymentProperties paymentProperties;

    @Override
    @Transactional(readOnly = true)
    public OwnerRevenueStatsResponse getRevenueStats() {
        User owner = getCurrentUser();
        PaymentStatus paid = PaymentStatus.PAID;

        return OwnerRevenueStatsResponse.builder()
                .totalBookings(paymentRepository.countPaidByOwner(owner.getId(), paid))
                .grossRevenue(paymentRepository.sumGrossByOwner(owner.getId(), paid))
                .ownerPayout(paymentRepository.sumOwnerPayoutByOwner(owner.getId(), paid))
                .platformFee(paymentRepository.sumPlatformFeeByOwner(owner.getId(), paid))
                .commissionRate(paymentProperties.getCommissionRate())
                .currency("MAD")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OwnerReservationResponse> getReservations() {
        User owner = getCurrentUser();
        return reservationRepository.findConfirmedByBusinessOwnerId(owner.getId()).stream()
                .map(this::toOwnerReservation)
                .toList();
    }

    private OwnerReservationResponse toOwnerReservation(Reservation reservation) {
        Payment payment = paymentRepository.findByReservationId(reservation.getId()).orElse(null);

        String matchLabel = null;
        if (reservation.getMatch() != null) {
            matchLabel = reservation.getMatch().getHomeTeam() + " vs " + reservation.getMatch().getAwayTeam();
        }

        User fan = reservation.getUser();

        return OwnerReservationResponse.builder()
                .reservationId(reservation.getId())
                .businessId(reservation.getBusiness() != null ? reservation.getBusiness().getId() : null)
                .businessName(reservation.getBusiness() != null ? reservation.getBusiness().getName() : null)
                .matchLabel(matchLabel)
                .spaceName(reservation.getSpace() != null ? reservation.getSpace().getName() : null)
                .tableNumber(reservation.getTable() != null ? reservation.getTable().getTableNumber() : null)
                .reservationDateTime(reservation.getReservationDateTime())
                .partySize(reservation.getPartySize())
                .status(reservation.getStatus())
                .ticketCode(reservation.getTicketCode())
                .checkedInAt(reservation.getCheckedInAt())
                .grossAmount(payment != null ? payment.getAmount() : reservation.getTotalPrice())
                .ownerPayout(payment != null ? payment.getOwnerPayout() : null)
                .platformFee(payment != null ? payment.getPlatformFee() : null)
                .fanUserId(fan.getId())
                .fanName(fan.getFirstName() + " " + fan.getLastName())
                .fanEmail(fan.getEmail())
                .fanPhone(fan.getPhone())
                .fanCity(fan.getCity())
                .createdAt(reservation.getCreatedAt())
                .build();
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