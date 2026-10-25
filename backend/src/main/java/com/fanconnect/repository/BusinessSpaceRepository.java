package com.fanconnect.repository;

import com.fanconnect.model.entity.BusinessSpace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessSpaceRepository extends JpaRepository<BusinessSpace, Long> {

    List<BusinessSpace> findByBusinessIdOrderByNameAsc(Long businessId);

    Optional<BusinessSpace> findByIdAndBusinessId(Long id, Long businessId);
}