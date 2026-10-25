package com.fanconnect.repository;

import com.fanconnect.model.entity.Payment;
import com.fanconnect.model.enums.PaymentStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByReservationId(Long reservationId);

    @Query("""
            SELECT COALESCE(SUM(p.ownerPayout), 0) FROM Payment p
            JOIN p.reservation r
            WHERE r.business.owner.id = :ownerId AND p.status = :status
            """)
    BigDecimal sumOwnerPayoutByOwner(@Param("ownerId") Long ownerId, @Param("status") PaymentStatus status);

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0) FROM Payment p
            JOIN p.reservation r
            WHERE r.business.owner.id = :ownerId AND p.status = :status
            """)
    BigDecimal sumGrossByOwner(@Param("ownerId") Long ownerId, @Param("status") PaymentStatus status);

    @Query("""
            SELECT COALESCE(SUM(p.platformFee), 0) FROM Payment p
            JOIN p.reservation r
            WHERE r.business.owner.id = :ownerId AND p.status = :status
            """)
    BigDecimal sumPlatformFeeByOwner(@Param("ownerId") Long ownerId, @Param("status") PaymentStatus status);

    @Query("""
            SELECT COUNT(p) FROM Payment p
            JOIN p.reservation r
            WHERE r.business.owner.id = :ownerId AND p.status = :status
            """)
    long countPaidByOwner(@Param("ownerId") Long ownerId, @Param("status") PaymentStatus status);

    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.reservation r
            JOIN FETCH r.business b
            JOIN FETCH r.user u
            WHERE p.status = :status
            ORDER BY p.paidAt DESC
            """)
    List<Payment> findRecentPaidPayments(@Param("status") PaymentStatus status, Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(p.platformFee), 0) FROM Payment p WHERE p.status = :status
            """)
    BigDecimal sumPlatformFees(@Param("status") PaymentStatus status);

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status
            """)
    BigDecimal sumGrossRevenue(@Param("status") PaymentStatus status);

    long countByStatus(PaymentStatus status);
}