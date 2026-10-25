package com.fanconnect.repository;

import com.fanconnect.model.entity.Reservation;
import com.fanconnect.model.entity.User;
import com.fanconnect.model.enums.ReservationStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserOrderByReservationDateTimeDesc(User user);

    Optional<Reservation> findByIdAndUser(Long id, User user);

    List<Reservation> findAllByOrderByReservationDateTimeDesc();

    long countByStatus(ReservationStatus status);

    @Query("""
            SELECT COALESCE(SUM(r.partySize), 0) FROM Reservation r
            WHERE r.cafe.id = :cafeId
            AND r.status IN :activeStatuses
            AND r.reservationDateTime >= :slotStart
            AND r.reservationDateTime < :slotEnd
            """)
    int sumPartySizeForCafeInTimeSlot(
            @Param("cafeId") Long cafeId,
            @Param("slotStart") LocalDateTime slotStart,
            @Param("slotEnd") LocalDateTime slotEnd,
            @Param("activeStatuses") List<ReservationStatus> activeStatuses
    );

    boolean existsByTableIdAndMatchIdAndStatusIn(
            Long tableId,
            Long matchId,
            List<ReservationStatus> statuses
    );

    Optional<Reservation> findByIdAndUserAndTicketCodeIsNotNull(Long id, User user);

    @Query("""
            SELECT r FROM Reservation r
            JOIN r.business b
            WHERE b.owner.id = :ownerId
            AND r.status IN (
                com.fanconnect.model.enums.ReservationStatus.CONFIRMED,
                com.fanconnect.model.enums.ReservationStatus.CHECKED_IN
            )
            ORDER BY r.createdAt DESC
            """)
    List<Reservation> findConfirmedByBusinessOwnerId(@Param("ownerId") Long ownerId);

    @Query("""
            SELECT r FROM Reservation r
            JOIN FETCH r.user u
            JOIN FETCH r.business b
            LEFT JOIN FETCH r.match m
            LEFT JOIN FETCH r.space s
            LEFT JOIN FETCH r.table t
            WHERE r.ticketCode = :ticketCode
            AND b.owner.id = :ownerId
            """)
    Optional<Reservation> findByTicketCodeAndBusinessOwnerId(
            @Param("ticketCode") String ticketCode,
            @Param("ownerId") Long ownerId
    );

    long countByMatchIdAndStatusIn(Long matchId, List<ReservationStatus> statuses);

    @Query("""
            SELECT COALESCE(SUM(r.partySize), 0) FROM Reservation r
            WHERE r.business.id = :businessId
            AND r.match.id = :matchId
            AND r.status IN :statuses
            """)
    int sumPartySizeByBusinessAndMatchAndStatusIn(
            @Param("businessId") Long businessId,
            @Param("matchId") Long matchId,
            @Param("statuses") List<ReservationStatus> statuses
    );

    @Query("""
            SELECT COALESCE(SUM(r.partySize), 0) FROM Reservation r
            WHERE r.business.id = :businessId
            AND r.match.id = :matchId
            AND r.status IN :activeStatuses
            """)
    int sumPartySizeForBusinessAndMatch(
            @Param("businessId") Long businessId,
            @Param("matchId") Long matchId,
            @Param("activeStatuses") List<ReservationStatus> activeStatuses
    );

    @Query("""
            SELECT COALESCE(SUM(r.partySize), 0) FROM Reservation r
            WHERE r.business.id = :businessId
            AND r.match.id = :matchId
            AND r.status = :status
            """)
    int sumPartySizeForBusinessAndMatchAndStatus(
            @Param("businessId") Long businessId,
            @Param("matchId") Long matchId,
            @Param("status") ReservationStatus status
    );

    @Query("""
            SELECT COUNT(r) FROM Reservation r
            WHERE r.business.id = :businessId
            AND r.match.id = :matchId
            AND r.createdAt >= :since
            """)
    int countByBusinessIdAndMatchIdAndCreatedAtAfter(
            @Param("businessId") Long businessId,
            @Param("matchId") Long matchId,
            @Param("since") Instant since
    );

    @Query("""
            SELECT b.city, COUNT(r)
            FROM Reservation r
            JOIN r.business b
            WHERE r.status IN :statuses
            AND b.status = com.fanconnect.model.enums.BusinessStatus.APPROVED
            GROUP BY b.city
            ORDER BY COUNT(r) DESC
            """)
    List<Object[]> countReservationsByCity(@Param("statuses") List<ReservationStatus> statuses);

    @Query("""
            SELECT m.id, m.homeTeam, m.awayTeam, m.competition, COUNT(r), COALESCE(SUM(r.partySize), 0L)
            FROM Reservation r
            JOIN r.match m
            WHERE r.status IN :statuses
            GROUP BY m.id, m.homeTeam, m.awayTeam, m.competition
            ORDER BY COUNT(r) DESC
            """)
    List<Object[]> findPopularMatchStats(
            @Param("statuses") List<ReservationStatus> statuses,
            Pageable pageable
    );

    @Query("""
            SELECT b.id, b.name, b.city, COUNT(r)
            FROM Reservation r
            JOIN r.business b
            WHERE r.status IN :statuses
            AND b.status = com.fanconnect.model.enums.BusinessStatus.APPROVED
            GROUP BY b.id, b.name, b.city
            ORDER BY COUNT(r) DESC
            """)
    List<Object[]> findTopVenueStats(
            @Param("statuses") List<ReservationStatus> statuses,
            Pageable pageable
    );
}