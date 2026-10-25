package com.fanconnect.repository;

import com.fanconnect.model.entity.Business;
import com.fanconnect.model.enums.BusinessStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {

    List<Business> findByStatusOrderByNameAsc(BusinessStatus status);

    List<Business> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<Business> findByIdAndStatus(Long id, BusinessStatus status);

    @Query("""
            SELECT b FROM Business b
            WHERE b.status = :status
            AND (:city = '' OR LOWER(b.city) LIKE LOWER(CONCAT('%', :city, '%')))
            AND (:query = '' OR LOWER(b.name) LIKE LOWER(CONCAT('%', :query, '%'))
                 OR LOWER(b.city) LIKE LOWER(CONCAT('%', :query, '%'))
                 OR LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%')))
            ORDER BY b.name ASC
            """)
    List<Business> searchApproved(
            @Param("status") BusinessStatus status,
            @Param("query") String query,
            @Param("city") String city
    );

    long countByStatus(BusinessStatus status);

    List<Business> findByLatitudeIsNull();

    List<Business> findByGoogleMapsUrlIsNotNull();

    @Query("""
            SELECT b.city, COUNT(b)
            FROM Business b
            WHERE b.status = com.fanconnect.model.enums.BusinessStatus.APPROVED
            GROUP BY b.city
            """)
    List<Object[]> countApprovedVenuesByCity();
}