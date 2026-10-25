package com.fanconnect.repository;

import com.fanconnect.model.entity.Competition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompetitionRepository extends JpaRepository<Competition, Long> {

    List<Competition> findByActiveTrueOrderByCategoryAscStartDateDesc();

    List<Competition> findAllByOrderByCategoryAscNameAsc();

    Optional<Competition> findBySlug(String slug);

    Optional<Competition> findByExternalCode(String externalCode);

    List<Competition> findByActiveTrueAndExternalCodeIsNotNullOrderByCategoryAscNameAsc();
}