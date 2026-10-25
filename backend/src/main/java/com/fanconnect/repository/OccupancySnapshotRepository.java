package com.fanconnect.repository;

import com.fanconnect.model.entity.OccupancySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface OccupancySnapshotRepository extends JpaRepository<OccupancySnapshot, Long> {

    @Query("""
            SELECT s FROM OccupancySnapshot s
            WHERE s.business.id = :businessId
            AND s.snapshotAt >= :since
            ORDER BY s.snapshotAt ASC
            """)
    List<OccupancySnapshot> findSince(
            @Param("businessId") Long businessId,
            @Param("since") Instant since
    );

    @Query("""
            SELECT AVG(s.occupancyPercent) FROM OccupancySnapshot s
            WHERE s.business.id = :businessId
            AND s.snapshotAt >= :since
            """)
    Double averageOccupancySince(
            @Param("businessId") Long businessId,
            @Param("since") Instant since
    );

    Optional<OccupancySnapshot> findFirstByBusinessIdAndMatchIdOrderBySnapshotAtDesc(
            Long businessId,
            Long matchId
    );

    Optional<OccupancySnapshot> findFirstByBusinessIdAndMatchIsNullOrderBySnapshotAtDesc(Long businessId);

    @Query("""
            SELECT b.city, AVG(s.occupancyPercent)
            FROM OccupancySnapshot s
            JOIN s.business b
            WHERE b.status = com.fanconnect.model.enums.BusinessStatus.APPROVED
            AND s.snapshotAt >= :since
            GROUP BY b.city
            """)
    List<Object[]> averageOccupancyByCitySince(@Param("since") Instant since);

    @Query("""
            SELECT AVG(s.occupancyPercent) FROM OccupancySnapshot s
            WHERE s.business.id = :businessId
            AND s.snapshotAt >= :since
            """)
    Double averageOccupancyForBusinessSince(
            @Param("businessId") Long businessId,
            @Param("since") Instant since
    );
}