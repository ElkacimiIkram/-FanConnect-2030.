package com.fanconnect.service.impl;

import com.fanconnect.dto.request.ReservationRequest;
import com.fanconnect.dto.response.AvailabilityResponse;
import com.fanconnect.dto.response.ReservationResponse;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.exception.UnauthorizedException;
import com.fanconnect.mapper.ReservationMapper;
import com.fanconnect.model.entity.Cafe;
import com.fanconnect.model.entity.Reservation;
import com.fanconnect.model.entity.User;
import com.fanconnect.model.enums.ReservationStatus;
import com.fanconnect.repository.CafeRepository;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.repository.UserRepository;
import com.fanconnect.service.ReservationService;
import com.fanconnect.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private static final List<ReservationStatus> ACTIVE_RESERVATION_STATUSES = List.of(
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED
    );

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final CafeRepository cafeRepository;
    private final ReservationMapper reservationMapper;

    @Override
    @Transactional(readOnly = true)
    public AvailabilityResponse checkAvailability(Long cafeId, LocalDateTime dateTime, Integer partySize) {
        Cafe cafe = cafeRepository.findByIdAndActiveTrue(cafeId)
                .orElseThrow(() -> new ResourceNotFoundException("Café", cafeId));

        validateFutureDateTime(dateTime);

        LocalDateTime slotStart = getSlotStart(dateTime);
        LocalDateTime slotEnd = getSlotEnd(slotStart);
        int bookedSeats = getBookedSeats(cafeId, slotStart, slotEnd);
        int availableSeats = cafe.getCapacity() - bookedSeats;

        boolean canReserve = partySize == null || (partySize >= 1
                && partySize <= cafe.getCapacity()
                && partySize <= availableSeats);

        return AvailabilityResponse.builder()
                .cafeId(cafe.getId())
                .cafeName(cafe.getName())
                .slotStart(slotStart)
                .slotEnd(slotEnd)
                .capacity(cafe.getCapacity())
                .bookedSeats(bookedSeats)
                .availableSeats(Math.max(availableSeats, 0))
                .canReserve(canReserve)
                .build();
    }

    @Override
    @Transactional
    public ReservationResponse create(ReservationRequest request) {
        User user = getAuthenticatedUser();

        Cafe cafe = cafeRepository.findActiveByIdForUpdate(request.getCafeId())
                .orElseThrow(() -> new ResourceNotFoundException("Café", request.getCafeId()));

        validateFutureDateTime(request.getReservationDateTime());
        validatePartySize(request.getPartySize(), cafe.getCapacity());

        LocalDateTime slotStart = getSlotStart(request.getReservationDateTime());
        LocalDateTime slotEnd = getSlotEnd(slotStart);
        int bookedSeats = getBookedSeats(cafe.getId(), slotStart, slotEnd);
        int availableSeats = cafe.getCapacity() - bookedSeats;

        if (request.getPartySize() > availableSeats) {
            throw new BusinessException(
                    "Not enough availability. Only " + Math.max(availableSeats, 0) + " seats left for this time slot."
            );
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .cafe(cafe)
                .reservationDateTime(request.getReservationDateTime())
                .partySize(request.getPartySize())
                .status(ReservationStatus.CONFIRMED)
                .specialRequests(request.getSpecialRequests())
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);
        return reservationMapper.toResponse(savedReservation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> findByCurrentUser() {
        User user = getAuthenticatedUser();
        return reservationRepository.findByUserOrderByReservationDateTimeDesc(user).stream()
                .map(reservationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse findById(Long id) {
        User user = getAuthenticatedUser();
        Reservation reservation = reservationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", id));
        return reservationMapper.toResponse(reservation);
    }

    @Override
    @Transactional
    public void cancel(Long id) {
        User user = getAuthenticatedUser();
        Reservation reservation = reservationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", id));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BusinessException("Reservation is already cancelled");
        }
        if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
            throw new BusinessException("Completed reservations cannot be cancelled");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }

    private int getBookedSeats(Long cafeId, LocalDateTime slotStart, LocalDateTime slotEnd) {
        return reservationRepository.sumPartySizeForCafeInTimeSlot(
                cafeId,
                slotStart,
                slotEnd,
                ACTIVE_RESERVATION_STATUSES
        );
    }

    private LocalDateTime getSlotStart(LocalDateTime dateTime) {
        return dateTime.truncatedTo(ChronoUnit.HOURS);
    }

    private LocalDateTime getSlotEnd(LocalDateTime slotStart) {
        return slotStart.plusHours(1);
    }

    private void validateFutureDateTime(LocalDateTime dateTime) {
        if (dateTime == null || !dateTime.isAfter(LocalDateTime.now())) {
            throw new BusinessException("Reservation date and time must be in the future");
        }
    }

    private void validatePartySize(int partySize, int cafeCapacity) {
        if (partySize < 1) {
            throw new BusinessException("Party size must be at least 1");
        }
        if (partySize > cafeCapacity) {
            throw new BusinessException("Party size cannot exceed café capacity (" + cafeCapacity + ")");
        }
    }

    private User getAuthenticatedUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (!StringUtils.hasText(email)) {
            throw new UnauthorizedException("Not authenticated");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User account not found"));
    }
}