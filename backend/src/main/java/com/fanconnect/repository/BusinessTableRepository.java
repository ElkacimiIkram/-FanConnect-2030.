package com.fanconnect.repository;

import com.fanconnect.model.entity.BusinessTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessTableRepository extends JpaRepository<BusinessTable, Long> {

    List<BusinessTable> findBySpaceIdAndActiveTrueOrderByTableNumberAsc(Long spaceId);

    Optional<BusinessTable> findByIdAndSpaceId(Long id, Long spaceId);
}