package com.fanconnect.service.impl;

import com.fanconnect.dto.request.CreateUserRequest;
import com.fanconnect.dto.request.UpdateAdminUserRequest;
import com.fanconnect.dto.request.UpdateReservationStatusRequest;
import com.fanconnect.config.PaymentProperties;
import com.fanconnect.dto.response.AdminCityHeatmapItemResponse;
import com.fanconnect.dto.response.AdminCommissionEntryResponse;
import com.fanconnect.dto.response.AdminGlobalAnalyticsResponse;
import com.fanconnect.dto.response.AdminPopularMatchResponse;
import com.fanconnect.dto.response.AdminReservationResponse;
import com.fanconnect.dto.response.AdminRevenueResponse;
import com.fanconnect.dto.response.AdminStatsResponse;
import com.fanconnect.dto.response.AdminTopVenueResponse;
import com.fanconnect.dto.response.AdminUserResponse;
import com.fanconnect.dto.response.CafeResponse;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.mapper.AdminMapper;
import com.fanconnect.mapper.CafeMapper;
import com.fanconnect.model.entity.Payment;
import com.fanconnect.model.entity.Reservation;
import com.fanconnect.model.entity.User;
import com.fanconnect.model.enums.PaymentStatus;
import com.fanconnect.model.enums.ReservationStatus;
import com.fanconnect.repository.BusinessRepository;
import com.fanconnect.repository.CafeRepository;
import com.fanconnect.repository.OccupancySnapshotRepository;
import com.fanconnect.repository.PaymentRepository;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.repository.UserRepository;
import com.fanconnect.service.AdminService;
import com.fanconnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final CafeRepository cafeRepository;
    private final BusinessRepository businessRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final OccupancySnapshotRepository occupancySnapshotRepository;
    private final AdminMapper adminMapper;
    private final CafeMapper cafeMapper;
    private final UserService userService;
    private final PaymentProperties paymentProperties;

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getStatistics() {
        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalCafes(cafeRepository.count())
                .activeCafes(cafeRepository.countByActiveTrue())
                .totalReservations(reservationRepository.count())
                .confirmedReservations(reservationRepository.countByStatus(ReservationStatus.CONFIRMED))
                .pendingReservations(reservationRepository.countByStatus(ReservationStatus.PENDING))
                .cancelledReservations(reservationRepository.countByStatus(ReservationStatus.CANCELLED))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(adminMapper::toAdminUserResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminUserResponse createUser(CreateUserRequest request) {
        Long userId = userService.createUser(request).getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return adminMapper.toAdminUserResponse(user);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUser(Long id, UpdateAdminUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (StringUtils.hasText(request.getFirstName())) {
            user.setFirstName(request.getFirstName());
        }
        if (StringUtils.hasText(request.getLastName())) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        return adminMapper.toAdminUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CafeResponse> getAllCafes() {
        return cafeRepository.findAllByOrderByNameAsc().stream()
                .map(cafeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminReservationResponse> getAllReservations() {
        return reservationRepository.findAllByOrderByReservationDateTimeDesc().stream()
                .map(adminMapper::toAdminReservationResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminReservationResponse updateReservationStatus(Long id, UpdateReservationStatusRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", id));

        reservation.setStatus(request.getStatus());
        return adminMapper.toAdminReservationResponse(reservationRepository.save(reservation));
    }

    @Override
    @Transactional
    public void cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", id));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BusinessException("Reservation is already cancelled");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminRevenueResponse getRevenue() {
        PaymentStatus paid = PaymentStatus.PAID;
        BigDecimal gross = paymentRepository.sumGrossRevenue(paid);
        BigDecimal commission = paymentRepository.sumPlatformFees(paid);
        BigDecimal ownerPayouts = gross.subtract(commission);

        List<AdminCommissionEntryResponse> recent = paymentRepository
                .findRecentPaidPayments(paid, PageRequest.of(0, 20))
                .stream()
                .map(this::toCommissionEntry)
                .toList();

        return AdminRevenueResponse.builder()
                .totalPaidBookings(paymentRepository.countByStatus(paid))
                .totalGrossRevenue(gross)
                .totalPlatformCommission(commission)
                .totalOwnerPayouts(ownerPayouts)
                .commissionRate(paymentProperties.getCommissionRate())
                .currency("MAD")
                .recentCommissions(recent)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminGlobalAnalyticsResponse getGlobalAnalytics() {
        List<ReservationStatus> activeStatuses = List.of(
                ReservationStatus.CONFIRMED,
                ReservationStatus.CHECKED_IN
        );
        Instant since = Instant.now().minus(30, ChronoUnit.DAYS);

        Map<String, Integer> reservationCounts = new HashMap<>();
        for (Object[] row : reservationRepository.countReservationsByCity(activeStatuses)) {
            reservationCounts.put((String) row[0], ((Number) row[1]).intValue());
        }

        Map<String, Integer> venueCounts = new HashMap<>();
        for (Object[] row : businessRepository.countApprovedVenuesByCity()) {
            venueCounts.put((String) row[0], ((Number) row[1]).intValue());
        }

        Map<String, Double> occupancyByCity = new HashMap<>();
        for (Object[] row : occupancySnapshotRepository.averageOccupancyByCitySince(since)) {
            if (row[1] != null) {
                occupancyByCity.put((String) row[0], ((Number) row[1]).doubleValue());
            }
        }

        Set<String> cities = new HashSet<>();
        cities.addAll(reservationCounts.keySet());
        cities.addAll(venueCounts.keySet());

        int maxReservations = reservationCounts.values().stream()
                .max(Comparator.naturalOrder())
                .orElse(0);

        List<AdminCityHeatmapItemResponse> cityHeatmap = cities.stream()
                .map(city -> AdminCityHeatmapItemResponse.builder()
                        .city(city)
                        .venueCount(venueCounts.getOrDefault(city, 0))
                        .reservationCount(reservationCounts.getOrDefault(city, 0))
                        .averageOccupancyPct(roundPct(occupancyByCity.getOrDefault(city, 0.0)))
                        .heatLevel(computeHeatLevel(
                                reservationCounts.getOrDefault(city, 0),
                                maxReservations
                        ))
                        .build())
                .sorted(Comparator.comparingInt(AdminCityHeatmapItemResponse::getReservationCount).reversed())
                .toList();

        List<AdminPopularMatchResponse> popularMatches = new ArrayList<>();
        for (Object[] row : reservationRepository.findPopularMatchStats(
                activeStatuses,
                PageRequest.of(0, 10)
        )) {
            popularMatches.add(AdminPopularMatchResponse.builder()
                    .matchId(((Number) row[0]).longValue())
                    .homeTeam((String) row[1])
                    .awayTeam((String) row[2])
                    .competition((String) row[3])
                    .reservationCount(((Number) row[4]).intValue())
                    .totalPartySize(((Number) row[5]).intValue())
                    .build());
        }

        List<AdminTopVenueResponse> topVenues = new ArrayList<>();
        for (Object[] row : reservationRepository.findTopVenueStats(activeStatuses, PageRequest.of(0, 10))) {
            Long businessId = ((Number) row[0]).longValue();
            Double avgOccupancy = occupancySnapshotRepository.averageOccupancyForBusinessSince(businessId, since);
            topVenues.add(AdminTopVenueResponse.builder()
                    .businessId(businessId)
                    .name((String) row[1])
                    .city((String) row[2])
                    .reservationCount(((Number) row[3]).intValue())
                    .averageOccupancyPct(roundPct(avgOccupancy != null ? avgOccupancy : 0.0))
                    .build());
        }

        return AdminGlobalAnalyticsResponse.builder()
                .cityHeatmap(cityHeatmap)
                .popularMatches(popularMatches)
                .topVenues(topVenues)
                .build();
    }

    private static String computeHeatLevel(int reservationCount, int maxReservations) {
        if (maxReservations <= 0 || reservationCount <= 0) {
            return "COOL";
        }
        double ratio = (double) reservationCount / maxReservations;
        if (ratio >= 0.66) {
            return "HOT";
        }
        if (ratio >= 0.33) {
            return "WARM";
        }
        return "COOL";
    }

    private static double roundPct(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private AdminCommissionEntryResponse toCommissionEntry(Payment payment) {
        Reservation reservation = payment.getReservation();
        User fan = reservation.getUser();

        return AdminCommissionEntryResponse.builder()
                .paymentId(payment.getId())
                .reservationId(reservation.getId())
                .businessName(reservation.getBusiness() != null ? reservation.getBusiness().getName() : null)
                .fanName(fan.getFirstName() + " " + fan.getLastName())
                .grossAmount(payment.getAmount())
                .platformFee(payment.getPlatformFee())
                .ownerPayout(payment.getOwnerPayout())
                .paidAt(payment.getPaidAt())
                .build();
    }
}