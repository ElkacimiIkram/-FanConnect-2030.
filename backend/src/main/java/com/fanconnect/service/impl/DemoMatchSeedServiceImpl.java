package com.fanconnect.service.impl;

import com.fanconnect.config.WorldCupCompetitionScope;
import com.fanconnect.dto.response.StandingsResponse;
import com.fanconnect.model.entity.Competition;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.CompetitionCategory;
import com.fanconnect.repository.CompetitionRepository;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.service.DemoMatchSeedService;
import com.fanconnect.service.impl.DemoWorldCupCatalog.DemoFixture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemoMatchSeedServiceImpl implements DemoMatchSeedService {

    static final String DEMO_ID_PREFIX = DemoWorldCupCatalog.PREFIX_2030;
    static final String DEMO_PREFIX = "demo-wc";

    private static final ZoneId PARIS = ZoneId.of("Europe/Paris");

    private final CompetitionRepository competitionRepository;
    private final FootballMatchRepository footballMatchRepository;

    @Value("${fanconnect.football.demo-matches:true}")
    private boolean enabled;

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int seedDemoMatches() {
        if (!enabled) {
            return 0;
        }

        Instant now = Instant.now();
        int upserted = 0;
        upserted += seedCompetition(WorldCupCompetitionScope.SLUG_WC_2026, DemoWorldCupCatalog.wc2026Fixtures(), now);
        upserted += seedCompetition(WorldCupCompetitionScope.SLUG_WC_2030, DemoWorldCupCatalog.wc2030Fixtures(), now);

        log.info(
                "Matchs de démo Coupe du Monde 2026/2030 prêts ({} rencontre(s)) — Match Center, réservations et tests soutenance",
                upserted
        );
        return upserted;
    }

    @Override
    public int seedIfNeeded(LocalDate date, boolean force) {
        if (!enabled) {
            return 0;
        }
        LocalDate today = LocalDate.now(PARIS);
        LocalDate target = date != null ? date : today;
        if (!force && !target.equals(today)) {
            return 0;
        }
        if (!force && !isStale(today)) {
            return 0;
        }
        return seedDemoMatches();
    }

    @Override
    public StandingsResponse demoStandings(String competitionCode) {
        return DemoWorldCupCatalog.standings(competitionCode);
    }

    private boolean isStale(LocalDate today) {
        Instant start = today.atStartOfDay(PARIS).toInstant();
        Instant end = today.plusDays(1).atStartOfDay(PARIS).toInstant();
        long count = footballMatchRepository
                .countByExternalIdStartingWithAndMatchDateGreaterThanEqualAndMatchDateLessThan(
                        DEMO_PREFIX, start, end
                );
        return count == 0;
    }

    private int seedCompetition(String slug, List<DemoFixture> fixtures, Instant now) {
        Competition competition = requireCompetition(slug);

        int upserted = 0;
        for (DemoFixture fixture : fixtures) {
            upsert(competition, fixture, now);
            upserted++;
        }
        return upserted;
    }

    private void upsert(Competition competition, DemoFixture fixture, Instant now) {
        FootballMatch match = footballMatchRepository.findByExternalId(fixture.externalId())
                .orElseGet(() -> FootballMatch.builder()
                        .externalId(fixture.externalId())
                        .build());

        match.setCompetition(competition.getName());
        match.setCompetitionRef(competition);
        match.setHomeTeam(fixture.homeTeam());
        match.setAwayTeam(fixture.awayTeam());
        match.setMatchDate(now.plus(fixture.offsetFromNow()));
        match.setVenueName(fixture.venueName());
        match.setCity(fixture.city());
        match.setStatus(fixture.status());
        match.setGroupName(fixture.groupName());
        match.setRoundLabel(fixture.roundLabel());
        match.setHomeScore(fixture.homeScore());
        match.setAwayScore(fixture.awayScore());
        match.setMatchMinute(fixture.minute());
        match.setLastSyncedAt(now);

        footballMatchRepository.save(match);
    }

    private Competition requireCompetition(String slug) {
        return competitionRepository.findBySlug(slug).orElseGet(() -> {
            boolean is2030 = WorldCupCompetitionScope.SLUG_WC_2030.equals(slug);
            Competition created = Competition.builder()
                    .name(is2030 ? "Coupe du Monde FIFA 2030" : "Coupe du Monde FIFA 2026")
                    .slug(slug)
                    .category(CompetitionCategory.WORLD_CUP)
                    .season(is2030 ? "2030" : "2026")
                    .description(is2030
                            ? "Coupe du Monde 2030 — Maroc, Espagne et Portugal."
                            : "Coupe du Monde 2026 — États-Unis, Canada et Mexique.")
                    .externalCode(is2030 ? null : WorldCupCompetitionScope.API_CODE_WC)
                    .active(true)
                    .build();
            log.info("Compétition {} créée automatiquement pour les matchs de démonstration", slug);
            return competitionRepository.save(created);
        });
    }

    /**
     * Clock-relative WC 2030 fixtures — kept for existing unit tests.
     */
    static List<DemoFixture> fixtures() {
        return DemoWorldCupCatalog.wc2030Fixtures();
    }
}
