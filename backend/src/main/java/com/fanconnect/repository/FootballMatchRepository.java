package com.fanconnect.repository;

import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface FootballMatchRepository extends JpaRepository<FootballMatch, Long> {

    List<FootballMatch> findByStatusInAndMatchDateAfterOrderByMatchDateAsc(
            List<MatchStatus> statuses,
            Instant after
    );

    List<FootballMatch> findByStatusInOrderByMatchDateAsc(List<MatchStatus> statuses);

    List<FootballMatch> findAllByOrderByMatchDateDesc();

    Optional<FootballMatch> findByExternalId(String externalId);

    @Query("""
            SELECT m FROM FootballMatch m
            LEFT JOIN FETCH m.competitionRef c
            WHERE m.status IN :statuses
            AND (m.status <> com.fanconnect.model.enums.MatchStatus.FINISHED OR m.matchDate >= :finishedSince)
            AND (
                :realOnly = false
                OR m.lastSyncedAt IS NOT NULL
                OR c.slug = 'world-cup-2030'
            )
            ORDER BY m.matchDate ASC
            """)
    List<FootballMatch> findForMatchCenter(
            @Param("statuses") List<MatchStatus> statuses,
            @Param("finishedSince") Instant finishedSince,
            @Param("realOnly") boolean realOnly
    );

    @Query("SELECT MAX(m.lastSyncedAt) FROM FootballMatch m WHERE m.lastSyncedAt IS NOT NULL")
    Optional<Instant> findLatestSyncTime();

    List<FootballMatch> findByCompetitionRefIdOrderByMatchDateAsc(Long competitionId);

    @Query("""
            SELECT m FROM FootballMatch m
            LEFT JOIN FETCH m.competitionRef c
            WHERE c.slug = :slug
            AND m.matchDate >= :start
            AND m.matchDate < :end
            ORDER BY m.matchDate ASC
            """)
    List<FootballMatch> findByCompetitionSlugAndDateRange(
            @Param("slug") String slug,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("""
            SELECT m FROM FootballMatch m
            LEFT JOIN FETCH m.competitionRef c
            WHERE c.slug IN :slugs
            AND m.matchDate >= :start
            AND m.matchDate < :end
            ORDER BY m.matchDate ASC
            """)
    List<FootballMatch> findByCompetitionSlugsAndDateRange(
            @Param("slugs") List<String> slugs,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    long countByExternalIdStartingWithAndMatchDateGreaterThanEqualAndMatchDateLessThan(
            String prefix,
            Instant start,
            Instant end
    );
}