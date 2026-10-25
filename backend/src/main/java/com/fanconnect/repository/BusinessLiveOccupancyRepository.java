package com.fanconnect.repository;

import com.fanconnect.model.entity.BusinessLiveOccupancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessLiveOccupancyRepository extends JpaRepository<BusinessLiveOccupancy, Long> {

    Optional<BusinessLiveOccupancy> findFirstByBusinessIdAndMatchIdOrderByReportedAtDesc(
            Long businessId,
            Long matchId
    );

    Optional<BusinessLiveOccupancy> findFirstByBusinessIdOrderByReportedAtDesc(Long businessId);
}