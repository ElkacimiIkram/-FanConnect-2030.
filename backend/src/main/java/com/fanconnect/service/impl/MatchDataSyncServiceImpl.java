package com.fanconnect.service.impl;

import com.fanconnect.config.WorldCupCompetitionScope;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.model.entity.Competition;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.MatchStatus;
import com.fanconnect.repository.CompetitionRepository;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.service.MatchDataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchDataSyncServiceImpl implements MatchDataSyncService {

    private static final ZoneId PARIS = ZoneId.of("Europe/Paris");

    private final CompetitionRepository competitionRepository;
    private final FootballMatchRepository footballMatchRepository;
    private final FootballDataClient footballDataClient;
    private final WorldCupCompetitionScope worldCupScope;

    @Value("${fanconnect.football.sync-delay-ms:7000}")
    private long syncDelayMs;

    @Override
    public boolean isApiConfigured() {
        return footballDataClient.isConfigured();
    }

    @Override
    @Transactional
    public int upsertRemoteMatches(List<FootballDataClient.RemoteMatch> remoteMatches) {
        if (remoteMatches == null || remoteMatches.isEmpty()) {
            return 0;
        }

        Instant now = Instant.now();
        int synced = 0;

        for (FootballDataClient.RemoteMatch remote : remoteMatches) {
            if (!worldCupScope.isAllowedApiCompetition(remote.competitionCode())) {
                continue;
            }
            Competition competition = resolveCompetition(remote);
            String competitionName = competition != null
                    ? competition.getName()
                    : StringUtils.hasText(remote.competitionName()) ? remote.competitionName() : "Compétition";

            FootballMatch match = footballMatchRepository.findByExternalId(remote.externalId())
                    .orElseGet(() -> FootballMatch.builder()
                            .competition(competitionName)
                            .competitionRef(competition)
                            .externalId(remote.externalId())
                            .build());

            applyRemoteData(match, remote, competition, competitionName, now);
            footballMatchRepository.save(match);
            synced++;
        }

        return synced;
    }

    @Override
    @Transactional
    public int refreshDynamicWindow(int daysAhead) {
        if (!footballDataClient.isConfigured()) {
            return 0;
        }

        LocalDate today = LocalDate.now(PARIS);
        LocalDate end = today.plusDays(Math.max(daysAhead, 0));
        List<FootballDataClient.RemoteMatch> collected = new ArrayList<>();

        for (LocalDate day = today; !day.isAfter(end); day = day.plusDays(1)) {
            boolean forceRefresh = day.equals(today);
            collected.addAll(footballDataClient.fetchMatchesByDate(day, forceRefresh));
        }

        collected = mergeByExternalId(collected, footballDataClient.fetchAllLiveMatches(true));
        int synced = upsertRemoteMatches(collected);
        log.debug("Dynamic window refresh: {} match(es) upserted ({} days)", synced, daysAhead + 1);
        return synced;
    }

    @Override
    @Transactional
    public int syncCompetition(Long competitionId) {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Competition", competitionId));

        if (!StringUtils.hasText(competition.getExternalCode())) {
            throw new BusinessException("Cette compétition n'a pas de code externe (ex: WC, CL, PL)");
        }
        if (!footballDataClient.isConfigured()) {
            throw new BusinessException(
                    "Clé API football-data.org non configurée. Définissez FOOTBALL_DATA_API_KEY."
            );
        }

        return upsertRemoteMatches(
                footballDataClient.fetchCompetitionMatches(competition.getExternalCode())
        );
    }

    @Override
    public int syncAllActiveCompetitions() {
        if (!footballDataClient.isConfigured()) {
            log.info("Football-data.org API key not set — skipping match sync");
            return 0;
        }

        List<Competition> competitions = competitionRepository
                .findByActiveTrueAndExternalCodeIsNotNullOrderByCategoryAscNameAsc();

        if (competitions.isEmpty()) {
            log.info("No active competitions with external code — nothing to sync");
            return 0;
        }

        int totalSynced = 0;
        for (int i = 0; i < competitions.size(); i++) {
            Competition competition = competitions.get(i);
            try {
                int synced = syncCompetition(competition.getId());
                totalSynced += synced;
                log.info("Synced {} match(es) for {}", synced, competition.getName());
            } catch (Exception ex) {
                log.warn("Failed to sync {}: {}", competition.getName(), ex.getMessage());
            }

            if (i < competitions.size() - 1 && syncDelayMs > 0) {
                sleep(syncDelayMs);
            }
        }

        log.info("Match sync complete — {} match(es) updated across {} competition(s)",
                totalSynced, competitions.size());
        return totalSynced;
    }

    static List<FootballDataClient.RemoteMatch> mergeByExternalId(
            List<FootballDataClient.RemoteMatch> primary,
            List<FootballDataClient.RemoteMatch> updates
    ) {
        Map<String, FootballDataClient.RemoteMatch> merged = new LinkedHashMap<>();
        for (FootballDataClient.RemoteMatch match : primary) {
            merged.put(match.externalId(), match);
        }
        for (FootballDataClient.RemoteMatch match : updates) {
            merged.put(match.externalId(), match);
        }
        return new ArrayList<>(merged.values());
    }

    private Competition resolveCompetition(FootballDataClient.RemoteMatch remote) {
        if (!StringUtils.hasText(remote.competitionCode())) {
            return null;
        }
        return competitionRepository.findByExternalCode(remote.competitionCode()).orElse(null);
    }

    private void applyRemoteData(
            FootballMatch match,
            FootballDataClient.RemoteMatch remote,
            Competition competition,
            String competitionName,
            Instant now
    ) {
        match.setCompetition(competitionName);
        match.setCompetitionRef(competition);
        match.setHomeTeam(remote.homeTeam());
        match.setAwayTeam(remote.awayTeam());
        match.setMatchDate(remote.matchDate());
        match.setStatus(MatchStatus.valueOf(remote.status()));
        match.setHomeScore(remote.homeScore());
        match.setAwayScore(remote.awayScore());
        match.setMatchMinute(remote.minute());
        match.setGroupName(StringUtils.hasText(remote.groupName()) ? remote.groupName() : null);
        match.setRoundLabel(StringUtils.hasText(remote.roundLabel()) ? remote.roundLabel() : null);
        match.setVenueName(remote.venueName());
        match.setLastSyncedAt(now);
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }
}