package com.fanconnect.repository;

import com.fanconnect.model.entity.BusinessApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessApprovalRepository extends JpaRepository<BusinessApproval, Long> {

    List<BusinessApproval> findByBusinessIdOrderBySubmittedAtDesc(Long businessId);
}