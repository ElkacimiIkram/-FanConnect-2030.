package com.fanconnect.service.impl;

import com.fanconnect.config.WorldCupCompetitionScope;
import com.fanconnect.model.entity.Competition;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.CompetitionCategory;
import com.fanconnect.model.enums.MatchStatus;
import com.fanconnect.repository.CompetitionRepository;
import com.fanconnect.repository.FootballMatchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemoMatchSeedServiceImplTest {

    @Mock
    private CompetitionRepository competitionRepository;

    @Mock
    private FootballMatchRepository footballMatchRepository;

    @InjectMocks
    private DemoMatchSeedServiceImpl seedService;

    @BeforeEach
    void enableDemoSeed() {
        ReflectionTestUtils.setField(seedService, "enabled", true);
    }

    @Test
    void seedDemoMatches_doesNothingWhenDisabled() {
        ReflectionTestUtils.setField(seedService, "enabled", false);

        int seeded = seedService.seedDemoMatches();

        assertEquals(0, seeded);
        verify(competitionRepository, never()).findBySlug(any());
        verify(footballMatchRepository, never()).save(any());
    }

    @Test
    void seedDemoMatches_createsMissingCompetitions() {
        when(competitionRepository.findBySlug(any())).thenReturn(Optional.empty());
        when(competitionRepository.save(any(Competition.class))).thenAnswer(invocation -> {
            Competition competition = invocation.getArgument(0);
            competition.setId(WorldCupCompetitionScope.SLUG_WC_2026.equals(competition.getSlug()) ? 26L : 30L);
            return competition;
        });
        when(footballMatchRepository.findByExternalId(any())).thenReturn(Optional.empty());
        when(footballMatchRepository.save(any(FootballMatch.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        int seeded = seedService.seedDemoMatches();

        int expected = DemoWorldCupCatalog.wc2026Fixtures().size()
                + DemoWorldCupCatalog.wc2030Fixtures().size();
        assertEquals(expected, seeded);
        verify(competitionRepository, times(2)).save(any(Competition.class));
    }

    @Test
    void seedDemoMatches_upsertsLiveScheduledAndFinishedFixtures() {
        Competition worldCup2026 = Competition.builder()
                .name("Coupe du Monde FIFA 2026")
                .slug(WorldCupCompetitionScope.SLUG_WC_2026)
                .category(CompetitionCategory.WORLD_CUP)
                .active(true)
                .build();
        worldCup2026.setId(26L);
        Competition worldCup = Competition.builder()
                .name("Coupe du Monde FIFA 2030")
                .slug(WorldCupCompetitionScope.SLUG_WC_2030)
                .category(CompetitionCategory.WORLD_CUP)
                .active(true)
                .build();
        worldCup.setId(30L);

        when(competitionRepository.findBySlug(WorldCupCompetitionScope.SLUG_WC_2026))
                .thenReturn(Optional.of(worldCup2026));
        when(competitionRepository.findBySlug(WorldCupCompetitionScope.SLUG_WC_2030))
                .thenReturn(Optional.of(worldCup));
        when(footballMatchRepository.findByExternalId(any())).thenReturn(Optional.empty());
        when(footballMatchRepository.save(any(FootballMatch.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        int seeded = seedService.seedDemoMatches();

        assertEquals(
                DemoWorldCupCatalog.wc2026Fixtures().size() + DemoMatchSeedServiceImpl.fixtures().size(),
                seeded
        );

        ArgumentCaptor<FootballMatch> captor = ArgumentCaptor.forClass(FootballMatch.class);
        verify(footballMatchRepository, times(seeded)).save(captor.capture());

        var saved = captor.getAllValues();
        var saved2030 = saved.stream()
                .filter(m -> m.getExternalId().startsWith(DemoMatchSeedServiceImpl.DEMO_ID_PREFIX))
                .toList();
        Instant now = Instant.now();

        assertTrue(saved2030.stream().anyMatch(m -> m.getStatus() == MatchStatus.LIVE));
        assertTrue(saved2030.stream().anyMatch(m -> m.getStatus() == MatchStatus.SCHEDULED));
        assertTrue(saved2030.stream().anyMatch(m -> m.getStatus() == MatchStatus.FINISHED));
        assertTrue(saved2030.stream().anyMatch(m ->
                m.getStatus() == MatchStatus.LIVE && m.getMatchDate().isBefore(now)));
        assertTrue(saved2030.stream().anyMatch(m ->
                m.getStatus() == MatchStatus.SCHEDULED && m.getMatchDate().isAfter(now)));
        assertTrue(saved.stream().allMatch(m -> m.getLastSyncedAt() != null));
        assertTrue(saved2030.stream().allMatch(m -> worldCup.equals(m.getCompetitionRef())));
        assertTrue(saved.stream().anyMatch(m ->
                m.getExternalId().startsWith(DemoWorldCupCatalog.PREFIX_2026)));
    }

    @Test
    void seedDemoMatches_seedsBothWorldCupsWhenCompetitionsExist() {
        Competition wc2026 = Competition.builder()
                .name("Coupe du Monde FIFA 2026")
                .slug(WorldCupCompetitionScope.SLUG_WC_2026)
                .category(CompetitionCategory.WORLD_CUP)
                .active(true)
                .build();
        wc2026.setId(26L);
        Competition wc2030 = Competition.builder()
                .name("Coupe du Monde FIFA 2030")
                .slug(WorldCupCompetitionScope.SLUG_WC_2030)
                .category(CompetitionCategory.WORLD_CUP)
                .active(true)
                .build();
        wc2030.setId(30L);

        when(competitionRepository.findBySlug(WorldCupCompetitionScope.SLUG_WC_2026))
                .thenReturn(Optional.of(wc2026));
        when(competitionRepository.findBySlug(WorldCupCompetitionScope.SLUG_WC_2030))
                .thenReturn(Optional.of(wc2030));
        when(footballMatchRepository.findByExternalId(any())).thenReturn(Optional.empty());
        when(footballMatchRepository.save(any(FootballMatch.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        int seeded = seedService.seedDemoMatches();

        int expected = DemoWorldCupCatalog.wc2026Fixtures().size()
                + DemoWorldCupCatalog.wc2030Fixtures().size();
        assertEquals(expected, seeded);
        verify(footballMatchRepository, times(expected)).save(any(FootballMatch.class));
    }

    @Test
    void seedDemoMatches_updatesExistingDemoMatchInsteadOfDuplicating() {
        Competition worldCup2026 = Competition.builder()
                .name("Coupe du Monde FIFA 2026")
                .slug(WorldCupCompetitionScope.SLUG_WC_2026)
                .category(CompetitionCategory.WORLD_CUP)
                .active(true)
                .build();
        worldCup2026.setId(26L);
        Competition worldCup = Competition.builder()
                .name("Coupe du Monde FIFA 2030")
                .slug(WorldCupCompetitionScope.SLUG_WC_2030)
                .category(CompetitionCategory.WORLD_CUP)
                .active(true)
                .build();
        worldCup.setId(30L);

        FootballMatch existing = FootballMatch.builder()
                .externalId(DemoMatchSeedServiceImpl.DEMO_ID_PREFIX + "live-1")
                .competition(worldCup.getName())
                .homeTeam("Old")
                .awayTeam("Team")
                .matchDate(Instant.parse("2030-06-15T20:00:00Z"))
                .status(MatchStatus.SCHEDULED)
                .build();
        existing.setId(99L);

        when(competitionRepository.findBySlug(WorldCupCompetitionScope.SLUG_WC_2026))
                .thenReturn(Optional.of(worldCup2026));
        when(competitionRepository.findBySlug(WorldCupCompetitionScope.SLUG_WC_2030))
                .thenReturn(Optional.of(worldCup));
        when(footballMatchRepository.findByExternalId(any())).thenReturn(Optional.empty());
        when(footballMatchRepository.findByExternalId(existing.getExternalId()))
                .thenReturn(Optional.of(existing));
        when(footballMatchRepository.save(any(FootballMatch.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        seedService.seedDemoMatches();

        ArgumentCaptor<FootballMatch> captor = ArgumentCaptor.forClass(FootballMatch.class);
        int expectedSaves = DemoWorldCupCatalog.wc2026Fixtures().size()
                + DemoMatchSeedServiceImpl.fixtures().size();
        verify(footballMatchRepository, times(expectedSaves))
                .save(captor.capture());

        FootballMatch updatedLive = captor.getAllValues().stream()
                .filter(m -> existing.getExternalId().equals(m.getExternalId()))
                .findFirst()
                .orElseThrow();
        assertEquals(99L, updatedLive.getId());
        assertEquals("Maroc", updatedLive.getHomeTeam());
        assertEquals(MatchStatus.LIVE, updatedLive.getStatus());
    }
}
