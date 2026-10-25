package com.fanconnect.service.impl;

import com.fanconnect.config.PaymentProperties;
import com.fanconnect.dto.request.ConfirmPaymentRequest;
import com.fanconnect.dto.request.CreateBusinessBookingRequest;
import com.fanconnect.dto.response.PaymentIntentResponse;
import com.fanconnect.dto.response.PaymentResponse;
import com.fanconnect.dto.response.ReservationResponse;
import com.fanconnect.dto.response.TableAvailabilityResponse;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.exception.ForbiddenException;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.mapper.ReservationMapper;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.BusinessSpace;
import com.fanconnect.model.entity.BusinessTable;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.entity.Payment;
import com.fanconnect.model.entity.Reservation;
import com.fanconnect.model.entity.User;
import com.fanconnect.model.enums.BusinessStatus;
import com.fanconnect.model.enums.MatchStatus;
import com.fanconnect.model.enums.NotificationType;
import com.fanconnect.model.enums.PaymentStatus;
import com.fanconnect.model.enums.ReservationStatus;
import com.fanconnect.repository.BusinessRepository;
import com.fanconnect.repository.BusinessSpaceRepository;
import com.fanconnect.repository.BusinessTableRepository;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.repository.PaymentRepository;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.repository.UserRepository;
import com.fanconnect.service.BookingService;
import com.fanconnect.service.NotificationService;
import com.fanconnect.service.StripePaymentService;
import com.fanconnect.service.TicketPdfService;
import com.fanconnect.util.PaymentCalculator;
import com.fanconnect.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private static final List<ReservationStatus> ACTIVE_STATUSES = List.of(
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED
    );

    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final BusinessRepository businessRepository;
    private final BusinessSpaceRepository businessSpaceRepository;
    private final BusinessTableRepository businessTableRepository;
    private final FootballMatchRepository footballMatchRepository;
    private final UserRepository userRepository;
    private final ReservationMapper reservationMapper;
    private final TicketPdfService ticketPdfService;
    private final StripePaymentService stripePaymentService;
    private final PaymentProperties paymentProperties;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<TableAvailabilityResponse> getAvailableTables(Long businessId, Long spaceId, Long matchId) {
        Business business = businessRepository.findByIdAndStatus(businessId, BusinessStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));

        BusinessSpace space = businessSpaceRepository.findByIdAndBusinessId(spaceId, business.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Space", spaceId));

        FootballMatch match = footballMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", matchId));

        if (match.getStatus() == MatchStatus.CANCELLED || match.getStatus() == MatchStatus.FINISHED) {
            throw new BusinessException("This match is no longer available for booking");
        }

        return businessTableRepository.findBySpaceIdAndActiveTrueOrderByTableNumberAsc(spaceId).stream()
                .map(table -> TableAvailabilityResponse.builder()
                        .id(table.getId())
                        .tableNumber(table.getTableNumber())
                        .capacity(table.getCapacity())
                        .available(!isTableBooked(table.getId(), matchId))
                        .matchDayPrice(space.getMatchDayPrice())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public ReservationResponse createBusinessBooking(CreateBusinessBookingRequest request) {
        User user = getCurrentUser();

        Business business = businessRepository.findByIdAndStatus(request.getBusinessId(), BusinessStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Business", request.getBusinessId()));

        BusinessSpace space = businessSpaceRepository.findByIdAndBusinessId(request.getSpaceId(), business.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Space", request.getSpaceId()));

        BusinessTable table = businessTableRepository.findByIdAndSpaceId(request.getTableId(), space.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Table", request.getTableId()));

        if (!table.isActive()) {
            throw new BusinessException("Selected table is not available");
        }

        FootballMatch match = footballMatchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Match", request.getMatchId()));

        if (match.getStatus() == MatchStatus.CANCELLED || match.getStatus() == MatchStatus.FINISHED) {
            throw new BusinessException("This match is no longer available for booking");
        }

        if (request.getPartySize() > table.getCapacity()) {
            throw new BusinessException(
                    "Party size cannot exceed table capacity (" + table.getCapacity() + ")"
            );
        }

        if (isTableBooked(table.getId(), match.getId())) {
            throw new BusinessException("This table is already booked for the selected match");
        }

        LocalDateTime reservationDateTime = LocalDateTime.ofInstant(
                match.getMatchDate(),
                ZoneId.systemDefault()
        );

        PaymentCalculator.Breakdown breakdown = PaymentCalculator.calculate(
                space.getMatchDayPrice(),
                paymentProperties.getCommissionRate()
        );

        Reservation reservation = Reservation.builder()
                .user(user)
                .business(business)
                .space(space)
                .table(table)
                .match(match)
                .reservationDateTime(reservationDateTime)
                .partySize(request.getPartySize())
                .status(ReservationStatus.PENDING)
                .specialRequests(request.getSpecialRequests())
                .totalPrice(breakdown.amount())
                .build();

        Reservation saved = reservationRepository.save(reservation);

        paymentRepository.save(Payment.builder()
                .reservation(saved)
                .amount(breakdown.amount())
                .platformFee(breakdown.platformFee())
                .ownerPayout(breakdown.ownerPayout())
                .currency("MAD")
                .status(PaymentStatus.PENDING)
                .paymentMethod(resolvePaymentMethod())
                .build());

        return reservationMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PaymentIntentResponse createPaymentIntent(Long reservationId) {
        User user = getCurrentUser();
        Reservation reservation = reservationRepository.findByIdAndUser(reservationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", reservationId));

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BusinessException("This booking is not awaiting payment");
        }

        Payment payment = paymentRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new BusinessException("Payment record not found"));

        if (stripePaymentService.isEnabled()) {
            return stripePaymentService.createPaymentIntent(reservation, payment);
        }

        return PaymentIntentResponse.builder()
                .stripeEnabled(false)
                .amount(payment.getAmount())
                .platformFee(payment.getPlatformFee())
                .ownerPayout(payment.getOwnerPayout())
                .currency(payment.getCurrency())
                .build();
    }

    @Override
    @Transactional
    public PaymentResponse payForBooking(Long reservationId, ConfirmPaymentRequest request) {
        User user = getCurrentUser();
        Reservation reservation = reservationRepository.findByIdAndUser(reservationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", reservationId));

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BusinessException("This booking is not awaiting payment");
        }

        Payment payment = paymentRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new BusinessException("Payment record not found"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new BusinessException("This booking is already paid");
        }

        if (stripePaymentService.isEnabled()) {
            if (request == null || !StringUtils.hasText(request.getPaymentIntentId())) {
                throw new BusinessException("paymentIntentId is required for card payment");
            }
            stripePaymentService.verifyPaymentSucceeded(request.getPaymentIntentId(), reservationId);
            payment.setStripePaymentIntentId(request.getPaymentIntentId());
            payment.setPaymentMethod("STRIPE");
        } else {
            payment.setPaymentMethod("SIMULATED");
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);

        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setTicketCode(generateTicketCode());
        Reservation saved = reservationRepository.save(reservation);

        sendPaymentNotifications(saved, payment, user);

        ReservationResponse reservationResponse = reservationMapper.toResponse(saved);

        return PaymentResponse.builder()
                .id(payment.getId())
                .reservationId(saved.getId())
                .amount(payment.getAmount())
                .platformFee(payment.getPlatformFee())
                .ownerPayout(payment.getOwnerPayout())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .ticketCode(saved.getTicketCode())
                .paidAt(payment.getPaidAt())
                .reservation(reservationResponse)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getTicket(Long reservationId) {
        User user = getCurrentUser();
        Reservation reservation = reservationRepository.findByIdAndUser(reservationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", reservationId));

        if (!StringUtils.hasText(reservation.getTicketCode())) {
            throw new BusinessException("No ticket available — complete payment first");
        }

        return reservationMapper.toResponse(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadTicketPdf(Long reservationId) {
        User user = getCurrentUser();
        Reservation reservation = reservationRepository.findByIdAndUser(reservationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", reservationId));

        if (!StringUtils.hasText(reservation.getTicketCode())) {
            throw new BusinessException("No ticket available — complete payment first");
        }

        initializeForPdf(reservation);
        return ticketPdfService.generateTicketPdf(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> listMyBookings() {
        User user = getCurrentUser();
        return reservationRepository.findByUserOrderByReservationDateTimeDesc(user).stream()
                .sorted(Comparator
                        .comparing((Reservation r) -> r.getStatus() != ReservationStatus.PENDING)
                        .thenComparing(Reservation::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toFanBookingResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getBooking(Long reservationId) {
        User user = getCurrentUser();
        Reservation reservation = reservationRepository.findByIdAndUser(reservationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", reservationId));
        return toFanBookingResponse(reservation);
    }

    @Override
    @Transactional
    public void cancelBooking(Long reservationId) {
        User user = getCurrentUser();
        Reservation reservation = reservationRepository.findByIdAndUser(reservationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", reservationId));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BusinessException("This booking is already cancelled");
        }
        if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
            throw new BusinessException("Completed bookings cannot be cancelled");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        paymentRepository.findByReservationId(reservationId).ifPresent(payment -> {
            if (payment.getStatus() == PaymentStatus.PAID) {
                payment.setStatus(PaymentStatus.REFUNDED);
            } else if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.FAILED);
            }
            paymentRepository.save(payment);
        });
    }

    private ReservationResponse toFanBookingResponse(Reservation reservation) {
        ReservationResponse response = reservationMapper.toResponse(reservation);
        paymentRepository.findByReservationId(reservation.getId())
                .ifPresent(payment -> response.setPaymentStatus(payment.getStatus()));
        return response;
    }

    private void initializeForPdf(Reservation reservation) {
        if (reservation.getMatch() != null) {
            reservation.getMatch().getHomeTeam();
        }
        if (reservation.getBusiness() != null) {
            reservation.getBusiness().getName();
            reservation.getBusiness().getAddress();
            reservation.getBusiness().getCity();
        }
        if (reservation.getSpace() != null) {
            reservation.getSpace().getName();
        }
        if (reservation.getTable() != null) {
            reservation.getTable().getTableNumber();
        }
    }

    private void sendPaymentNotifications(Reservation reservation, Payment payment, User fan) {
        String businessName = reservation.getBusiness() != null ? reservation.getBusiness().getName() : "—";
        String matchLabel = reservation.getMatch() != null
                ? reservation.getMatch().getHomeTeam() + " vs " + reservation.getMatch().getAwayTeam()
                : "—";
        String tableNumber = reservation.getTable() != null ? reservation.getTable().getTableNumber() : "—";
        String amount = payment.getAmount().toPlainString() + " MAD";

        notificationService.notifyUser(
                fan.getId(),
                NotificationType.PAYMENT_COMPLETED,
                "Paiement effectué",
                String.format(
                        "Votre paiement de %s pour %s (table %s, %s) est confirmé. Ticket: %s",
                        amount, businessName, tableNumber, matchLabel, reservation.getTicketCode()
                ),
                "RESERVATION",
                reservation.getId()
        );

        if (reservation.getBusiness() != null && reservation.getBusiness().getOwner() != null) {
            User owner = reservation.getBusiness().getOwner();
            String fanName = fan.getFirstName() + " " + fan.getLastName();
            String fanPhone = fan.getPhone() != null ? fan.getPhone() : "—";
            String fanCity = fan.getCity() != null ? fan.getCity() : "—";

            notificationService.notifyUser(
                    owner.getId(),
                    NotificationType.OWNER_NEW_BOOKING,
                    "Nouvelle réservation",
                    String.format(
                            "Fan: %s | Email: %s | Tél: %s | Ville: %s | %d personnes | Table %s | %s | %s",
                            fanName, fan.getEmail(), fanPhone, fanCity,
                            reservation.getPartySize(), tableNumber, matchLabel, businessName
                    ),
                    "RESERVATION",
                    reservation.getId()
            );
        }

        String adminReservationMsg = String.format(
                "Nouvelle réservation confirmée — %s %s | %s | Table %s | %d pers. | %s",
                fan.getFirstName(), fan.getLastName(), businessName, tableNumber,
                reservation.getPartySize(), matchLabel
        );
        notificationService.notifyAdmins(
                NotificationType.NEW_RESERVATION,
                "Nouvelle réservation",
                adminReservationMsg,
                "RESERVATION",
                reservation.getId()
        );

        String commissionMsg = String.format(
                "Commission 25%%: %s MAD sur %s MAD — %s | Fan: %s %s | Propriétaire reçoit %s MAD",
                payment.getPlatformFee().toPlainString(),
                payment.getAmount().toPlainString(),
                businessName,
                fan.getFirstName(), fan.getLastName(),
                payment.getOwnerPayout().toPlainString()
        );
        notificationService.notifyAdmins(
                NotificationType.ADMIN_COMMISSION,
                "Commission plateforme (+25%)",
                commissionMsg,
                "PAYMENT",
                payment.getId()
        );
    }

    private boolean isTableBooked(Long tableId, Long matchId) {
        return reservationRepository.existsByTableIdAndMatchIdAndStatusIn(
                tableId,
                matchId,
                ACTIVE_STATUSES
        );
    }

    private String resolvePaymentMethod() {
        return stripePaymentService.isEnabled() ? "STRIPE" : "SIMULATED";
    }

    private String generateTicketCode() {
        return "FC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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