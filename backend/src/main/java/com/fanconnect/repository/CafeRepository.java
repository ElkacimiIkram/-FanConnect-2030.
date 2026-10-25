package com.fanconnect.repository;

import com.fanconnect.model.entity.Cafe;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CafeRepository extends JpaRepository<Cafe, Long> {

    List<Cafe> findByActiveTrueOrderByNameAsc();

    List<Cafe> findAllByOrderByNameAsc();

    long countByActiveTrue();

    Optional<Cafe> findByIdAndActiveTrue(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Cafe c WHERE c.id = :id AND c.active = true")
    Optional<Cafe> findActiveByIdForUpdate(@Param("id") Long id);

    @Query("""
            SELECT c FROM Cafe c
            WHERE c.active = true
            AND (:query IS NULL OR :query = '' OR
                 LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR
                 LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')) OR
                 LOWER(c.city) LIKE LOWER(CONCAT('%', :query, '%')) OR
                 LOWER(c.address) LIKE LOWER(CONCAT('%', :query, '%')))
            AND (:city IS NULL OR :city = '' OR LOWER(c.city) = LOWER(:city))
            ORDER BY c.name ASC
            """)
    List<Cafe> searchActiveCafes(@Param("query") String query, @Param("city") String city);
}