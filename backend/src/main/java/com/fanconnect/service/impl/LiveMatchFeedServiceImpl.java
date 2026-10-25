package com.fanconnect.service.impl;

import com.fanconnect.config.MatchNavigationCatalog;
import com.fanconnect.config.WorldCupCompetitionScope;
import com.fanconnect.dto.response.GroupStandingResponse;
import com.fanconnect.dto.response.MatchTeamDetailResponse;
import com.fanconnect.dto.response.StandingRowResponse;
import com.fanconnect.dto.response.WorldCupTeamResponse;
import com.fanconnect.model.entity.Competition;
import com.fanconnect.dto.response.CompetitionMatchGroupResponse;
import com.fanconnect.util.TeamFlagResolver;
import com.fanconnect.dto.response.LiveMatchFeedResponse;
import com.fanconnect.dto.response.MatchCalendarDayResponse;
import com.fanconnect.dto.response.MatchCalendarResponse;
import com.fanconnect.dto.response.MatchDetailResponse;
import com.fanconnect.dto.response.MatchFeedItemResponse;
import com.fanconnect.dto.response.MatchNavigationSectionResponse;
import com.fanconnect.dto.response.StandingsResponse;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.service.DemoMatchSeedService;
import com.fanconnect.service.LiveMatchFeedService;
import com.fanconnect.service.MatchDataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiveMatchFeedServiceImpl implements LiveMatchFeedService {

    private static final ZoneId PARIS = ZoneId.of("Europe/Paris");
    private static final DateTimeFormatter DATE_LABEL =
            DateTimeFormatter.ofPattern("EEEE d MMMM yyyy", Locale.FRENCH);
    private static final DateTimeFormatter MONTH_LABEL =
            DateTimeFormatter.ofPattern("MMMM yyyy", Locale.FRENCH);

    private final FootballDataClient footballDataClient;
    private final FootballMatchRepository footballMatchRepository;
    private final MatchNavigationCatalog navigationCatalog;
    private final MatchDataSyncService matchDataSyncService;
    private final WorldCupCompetitionScope worldCupScope;
    private final DemoMatchSeedService demoMatchSeedService;

    @Value("${fanconnect.football.feed-response-cache-seconds:20}")
    private int feedResponseCacheSeconds;

    private final Map<String, CachedFeedResponse> feedResponseCache = new ConcurrentHashMap<>();
    private final Map<String, CachedStandings> standingsCache = new ConcurrentHashMap<>();

    @Override
    @Transactional(readOnly = true)
    public LiveMatchFeedResponse getFeed(
            LocalDate date,
            String navId,
            String statusFilter,
            String sort,
            boolean refresh
    ) {
        LocalDate targetDate = date != null ? date : LocalDate.now(PARIS);
        String filter = normalizeFilter(statusFilter);
        String sortKey = normalizeSort(sort);
        String activeNav = worldCupScope.normalizeNav(navId);
        boolean isToday = targetDate.equals(LocalDate.now(PARIS));
        boolean apiConfigured = footballDataClient.isConfigured();

        try {
            int seeded = demoMatchSeedService.seedIfNeeded(targetDate, refresh);
            if (seeded > 0) {
                feedResponseCache.clear();
            }
        } catch (Exception ex) {
            log.warn("Impossible de semer les matchs de démo: {}", ex.getMessage());
        }

        String cacheKey = targetDate + "|" + activeNav + "|" + filter + "|" + sortKey;
        if (!refresh) {
            CachedFeedResponse cached = feedResponseCache.get(cacheKey);
            if (cached != null && cached.isFresh(feedResponseCacheSeconds)) {
                return cached.response();
            }
        } else if (apiConfigured && worldCupScope.includesApiFeed(activeNav)) {
            try {
                matchDataSyncService.refreshDynamicWindow(7);
            } catch (Exception ex) {
                log.warn("Refresh football-data.org ignoré: {}", ex.getMessage());
            }
            feedResponseCache.clear();
        }

        List<FootballMatch> dayMatches;
        List<FootballMatch> upcomingMatches;
        try {
            dayMatches = loadMatchesForDateRange(targetDate, targetDate, activeNav);
            upcomingMatches = isToday
                    ? loadMatchesForDateRange(targetDate.plusDays(1), targetDate.plusDays(7), activeNav)
                    : List.of();
        } catch (Exception ex) {
            log.error("Impossible de charger le Match Center: {}", ex.getMessage(), ex);
            return LiveMatchFeedResponse.builder()
                    .date(targetDate)
                    .dateLabel(capitalize(DATE_LABEL.format(targetDate)))
                    .apiConfigured(apiConfigured)
                    .fetchedAt(Instant.now())
                    .totalMatches(0)
                    .liveMatchCount(0)
                    .finishedMatchCount(0)
                    .scheduledMatchCount(0)
                    .activeFilter(filter)
                    .activeSort(sortKey)
                    .activeNavId(activeNav)
                    .groups(List.of())
                    .liveNowGroups(List.of())
                    .upcomingGroups(List.of())
                    .refreshIntervalSeconds(60)
                    .dynamicData(apiConfigured)
                    .demoMode(false)
                    .build();
        }

        List<MatchFeedItemResponse> dayItems = dayMatches.stream()
                .filter(match -> matchesLocalStatus(match, filter))
                .map(this::toFeedItemFromLocal)
                .collect(Collectors.collectingAndThen(Collectors.toList(), items -> sortFeedItems(items, sortKey)));

        List<MatchFeedItemResponse> liveItems = dayItems.stream()
                .filter(item -> "LIVE".equals(item.getStatus()))
                .toList();

        List<MatchFeedItemResponse> upcomingItems = List.of();
        if (isToday && "ALL".equals(filter)) {
            upcomingItems = upcomingMatches.stream()
                    .filter(match -> match.getStatus() == null
                            || match.getStatus() == com.fanconnect.model.enums.MatchStatus.SCHEDULED)
                    .map(this::toFeedItemFromLocal)
                    .collect(Collectors.collectingAndThen(Collectors.toList(), items -> sortFeedItems(items, sortKey)));
        }

        List<MatchFeedItemResponse> mainItems = "ALL".equals(filter)
                ? dayItems.stream().filter(item -> !"LIVE".equals(item.getStatus())).toList()
                : dayItems;

        List<CompetitionMatchGroupResponse> groups = groupFeedItems(mainItems);
        List<CompetitionMatchGroupResponse> liveNowGroups = groupFeedItems(liveItems);
        List<CompetitionMatchGroupResponse> upcomingGroups = groupFeedItems(upcomingItems);

        int liveCount = liveItems.size();
        int finishedCount = (int) dayItems.stream().filter(item -> "FINISHED".equals(item.getStatus())).count();
        int scheduledCount = (int) dayItems.stream().filter(item -> "SCHEDULED".equals(item.getStatus())).count();
        Instant lastSyncedAt = footballMatchRepository.findLatestSyncTime().orElse(null);

        LiveMatchFeedResponse response = LiveMatchFeedResponse.builder()
                .date(targetDate)
                .dateLabel(capitalize(DATE_LABEL.format(targetDate)))
                .apiConfigured(apiConfigured)
                .fetchedAt(Instant.now())
                .lastSyncedAt(lastSyncedAt)
                .totalMatches(dayItems.size())
                .liveMatchCount(liveCount)
                .finishedMatchCount(finishedCount)
                .scheduledMatchCount(scheduledCount)
                .activeFilter(filter)
                .activeSort(sortKey)
                .activeNavId(activeNav)
                .groups(groups)
                .liveNowGroups(liveNowGroups)
                .upcomingGroups(upcomingGroups)
                .refreshIntervalSeconds(liveCount > 0 ? 30 : 60)
                .dynamicData(!dayMatches.isEmpty() || !upcomingMatches.isEmpty() || apiConfigured)
                .demoMode(demoMatchSeedService.isEnabled() && dayItems.stream()
                        .anyMatch(item -> item.getExternalId() != null && item.getExternalId().startsWith("demo-wc")))
                .build();

        feedResponseCache.put(cacheKey, new CachedFeedResponse(response, Instant.now()));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public MatchCalendarResponse getCalendar(LocalDate month, String navId, LocalDate selectedDate) {
        demoMatchSeedService.seedIfNeeded(LocalDate.now(PARIS), false);

        LocalDate targetMonth = month != null ? month.withDayOfMonth(1) : LocalDate.now(PARIS).withDayOfMonth(1);
        LocalDate firstDay = targetMonth.withDayOfMonth(1);
        LocalDate lastDay = targetMonth.withDayOfMonth(targetMonth.lengthOfMonth());
        String activeNav = worldCupScope.normalizeNav(navId);
        boolean apiConfigured = footballDataClient.isConfigured();

        List<FootballMatch> monthMatches = loadMatchesForDateRange(firstDay, lastDay, activeNav);
        Map<LocalDate, List<FootballMatch>> byDate = monthMatches.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getMatchDate().atZone(PARIS).toLocalDate(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<MatchCalendarDayResponse> days = new ArrayList<>();
        int totalMatches = monthMatches.size();

        for (LocalDate day = firstDay; !day.isAfter(lastDay); day = day.plusDays(1)) {
            List<FootballMatch> dayMatches = byDate.getOrDefault(day, List.of());
            int dayCount = dayMatches.size();

            int live = (int) dayMatches.stream()
                    .filter(m -> m.getStatus() == com.fanconnect.model.enums.MatchStatus.LIVE).count();
            int finished = (int) dayMatches.stream()
                    .filter(m -> m.getStatus() == com.fanconnect.model.enums.MatchStatus.FINISHED).count();
            int scheduled = (int) dayMatches.stream()
                    .filter(m -> m.getStatus() == com.fanconnect.model.enums.MatchStatus.SCHEDULED).count();

            List<MatchFeedItemResponse> matchItems = List.of();
            if (selectedDate != null && selectedDate.equals(day)) {
                matchItems = sortFeedItems(
                        dayMatches.stream().map(this::toFeedItemFromLocal).toList(),
                        "TIME"
                );
            }

            days.add(MatchCalendarDayResponse.builder()
                    .date(day)
                    .matchCount(dayCount)
                    .liveCount(live)
                    .finishedCount(finished)
                    .scheduledCount(scheduled)
                    .matches(matchItems)
                    .build());
        }

        return MatchCalendarResponse.builder()
                .month(firstDay)
                .monthLabel(capitalize(MONTH_LABEL.format(firstDay)))
                .apiConfigured(apiConfigured)
                .activeNavId(activeNav)
                .totalMatches(totalMatches)
                .days(days)
                .build();
    }

    @Override
    @Transactional
    public MatchDetailResponse getMatchDetail(String externalId) {
        MatchDetailResponse detail = footballDataClient.fetchMatchDetail(externalId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", externalId));

        if (!worldCupScope.isAllowedApiCompetition(detail.getCompetitionCode())) {
            throw new ResourceNotFoundException("Match", externalId);
        }

        footballDataClient.fetchMatchById(externalId)
                .ifPresent(remote -> matchDataSyncService.upsertRemoteMatches(List.of(remote)));

        footballMatchRepository.findByExternalId(externalId).ifPresent(local -> {
            detail.setLocalId(local.getId());
            detail.setBookable(true);
            detail.setHomeScore(local.getHomeScore());
            detail.setAwayScore(local.getAwayScore());
            detail.setStatus(local.getStatus().name());
            detail.setMatchMinute(local.getMatchMinute());
        });

        return detail;
    }

    @Override
    @Transactional(readOnly = true)
    public MatchDetailResponse getLocalMatchDetail(Long localId) {
        FootballMatch match = footballMatchRepository.findById(localId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", localId));

        Competition competition = match.getCompetitionRef();
        if (competition == null
                || (!WorldCupCompetitionScope.SLUG_WC_2026.equals(competition.getSlug())
                && !WorldCupCompetitionScope.SLUG_WC_2030.equals(competition.getSlug()))) {
            throw new ResourceNotFoundException("Match", localId);
        }

        return buildLocalDetail(match, competition);
    }

    @Override
    public List<MatchNavigationSectionResponse> getNavigation() {
        return navigationCatalog.getSections();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorldCupTeamResponse> getTeams(String navId) {
        String activeNav = worldCupScope.normalizeNav(navId);
        LocalDate today = LocalDate.now(PARIS);
        demoMatchSeedService.seedIfNeeded(today, false);
        List<FootballMatch> matches = loadMatchesForDateRange(
                today.minusMonths(2),
                today.plusMonths(8),
                activeNav
        );

        Map<String, String> teamGroups = buildTeamGroupMap(getStandings(WorldCupCompetitionScope.API_CODE_WC));
        Map<String, TeamAccumulator> teams = new LinkedHashMap<>();
        Instant now = Instant.now();

        for (FootballMatch match : matches) {
            accumulateTeam(teams, match.getHomeTeam(), match, teamGroups, now);
            accumulateTeam(teams, match.getAwayTeam(), match, teamGroups, now);
        }

        return teams.values().stream()
                .map(TeamAccumulator::toResponse)
                .sorted(Comparator.comparing(WorldCupTeamResponse::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Override
    public StandingsResponse getStandings(String competitionCode) {
        if (!StringUtils.hasText(competitionCode)) {
            return StandingsResponse.builder().table(List.of()).build();
        }
        String code = competitionCode.trim().toUpperCase(Locale.ROOT);
        CachedStandings cached = standingsCache.get(code);
        if (cached != null && cached.isFresh(300)) {
            return cached.response();
        }

        StandingsResponse response = null;
        if (!DemoWorldCupCatalog.is2030Code(code) && footballDataClient.isConfigured()) {
            response = footballDataClient.fetchStandings(WorldCupCompetitionScope.API_CODE_WC)
                    .filter(s -> s.getTable() != null && !s.getTable().isEmpty())
                    .orElse(null);
        }
        if (response == null) {
            response = demoMatchSeedService.demoStandings(code);
        }
        standingsCache.put(code, new CachedStandings(response, Instant.now()));
        return response;
    }

    private List<String> slugsForNav(String navId) {
        return switch (worldCupScope.normalizeNav(navId)) {
            case WorldCupCompetitionScope.NAV_WC_2026 -> List.of(WorldCupCompetitionScope.SLUG_WC_2026);
            case WorldCupCompetitionScope.NAV_WC_2030 -> List.of(WorldCupCompetitionScope.SLUG_WC_2030);
            default -> List.of(WorldCupCompetitionScope.SLUG_WC_2026, WorldCupCompetitionScope.SLUG_WC_2030);
        };
    }

    private List<FootballMatch> loadMatchesForDateRange(LocalDate start, LocalDate end, String navId) {
        List<String> slugs = slugsForNav(navId);
        if (slugs.isEmpty()) {
            return List.of();
        }
        Instant rangeStart = start.atStartOfDay(PARIS).toInstant();
        Instant rangeEnd = end.plusDays(1).atStartOfDay(PARIS).toInstant();
        try {
            return footballMatchRepository.findByCompetitionSlugsAndDateRange(slugs, rangeStart, rangeEnd);
        } catch (Exception ex) {
            log.error("Requête Match Center en échec, fallback en mémoire: {}", ex.getMessage());
            return footballMatchRepository.findAll().stream()
                    .filter(match -> match.getMatchDate() != null
                            && !match.getMatchDate().isBefore(rangeStart)
                            && match.getMatchDate().isBefore(rangeEnd))
                    .filter(match -> {
                        Competition competition = match.getCompetitionRef();
                        return competition != null && slugs.contains(competition.getSlug());
                    })
                    .sorted(Comparator.comparing(FootballMatch::getMatchDate))
                    .toList();
        }
    }

    private List<CompetitionMatchGroupResponse> groupFeedItems(List<MatchFeedItemResponse> items) {
        Map<String, List<MatchFeedItemResponse>> grouped = items.stream()
                .collect(Collectors.groupingBy(
                        this::feedGroupKey,
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<CompetitionMatchGroupResponse> groups = new ArrayList<>();
        for (Map.Entry<String, List<MatchFeedItemResponse>> entry : grouped.entrySet()) {
            MatchFeedItemResponse first = entry.getValue().getFirst();
            groups.add(CompetitionMatchGroupResponse.builder()
                    .competitionCode(first.getCompetitionCode())
                    .competitionName(first.getCompetitionName())
                    .competitionEmblem(first.getCompetitionEmblem())
                    .areaName(first.getAreaName())
                    .areaCode(first.getAreaCode())
                    .groupLabel(buildFeedGroupLabel(first))
                    .matches(entry.getValue())
                    .build());
        }
        return groups;
    }

    private String feedGroupKey(MatchFeedItemResponse item) {
        return Objects.toString(item.getCompetitionCode(), "WC")
                + "|" + Objects.toString(item.getCompetitionName(), "")
                + "|" + Objects.toString(item.getGroupName(), "");
    }

    private String buildFeedGroupLabel(MatchFeedItemResponse item) {
        StringBuilder label = new StringBuilder();
        if (StringUtils.hasText(item.getCompetitionName())) {
            label.append(item.getCompetitionName());
        }
        if (StringUtils.hasText(item.getGroupName())) {
            if (!label.isEmpty()) {
                label.append(" · ");
            }
            label.append(item.getGroupName());
        }
        return label.isEmpty() ? "Coupe du Monde FIFA" : label.toString();
    }

    private MatchFeedItemResponse toFeedItemFromLocal(FootballMatch local) {
        Competition competition = local.getCompetitionRef();
        boolean is2030 = competition != null && WorldCupCompetitionScope.SLUG_WC_2030.equals(competition.getSlug());
        String competitionName = competition != null ? competition.getName() : local.getCompetition();
        String competitionCode = is2030 ? "WC2030" : WorldCupCompetitionScope.API_CODE_WC;
        String country = TeamFlagResolver.resolveHostCountry(local.getCity(), is2030);

        return MatchFeedItemResponse.builder()
                .externalId(local.getExternalId())
                .localId(local.getId())
                .homeTeam(local.getHomeTeam())
                .awayTeam(local.getAwayTeam())
                .homeTeamCrest(TeamFlagResolver.resolveCrestUrl(local.getHomeTeam()))
                .awayTeamCrest(TeamFlagResolver.resolveCrestUrl(local.getAwayTeam()))
                .homeTeamFlagCode(TeamFlagResolver.resolveFlagCode(local.getHomeTeam()))
                .awayTeamFlagCode(TeamFlagResolver.resolveFlagCode(local.getAwayTeam()))
                .matchDate(local.getMatchDate())
                .status(local.getStatus() != null ? local.getStatus().name() : "SCHEDULED")
                .homeScore(local.getHomeScore())
                .awayScore(local.getAwayScore())
                .matchMinute(local.getMatchMinute())
                .groupName(local.getGroupName())
                .roundLabel(local.getRoundLabel())
                .venueName(local.getVenueName())
                .city(local.getCity())
                .country(country)
                .matchImportance(TeamFlagResolver.resolveMatchImportance(local.getRoundLabel(), local.getGroupName()))
                .competitionCode(competitionCode)
                .competitionName(competitionName)
                .competitionEmblem(competition != null ? competition.getLogoUrl() : null)
                .areaName(is2030 ? "Maroc · Espagne · Portugal" : "USA · Canada · Mexique")
                .kickoffLabel(formatLocalKickoffLabel(local))
                .bookable(local.getStatus() != com.fanconnect.model.enums.MatchStatus.CANCELLED)
                .build();
    }

    private String formatLocalKickoffLabel(FootballMatch match) {
        if (match.getStatus() == com.fanconnect.model.enums.MatchStatus.LIVE && match.getMatchMinute() != null) {
            return match.getMatchMinute() + "'";
        }
        if (match.getStatus() == com.fanconnect.model.enums.MatchStatus.FINISHED) {
            return "TER";
        }
        if (match.getMatchDate() == null) {
            return "--:--";
        }
        return match.getMatchDate().atZone(PARIS).toLocalTime()
                .format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private boolean matchesLocalStatus(FootballMatch match, String filter) {
        String status = match.getStatus() != null ? match.getStatus().name() : "SCHEDULED";
        return switch (filter) {
            case "LIVE" -> "LIVE".equals(status);
            case "FINISHED" -> "FINISHED".equals(status);
            case "SCHEDULED" -> "SCHEDULED".equals(status);
            default -> true;
        };
    }

    private List<MatchFeedItemResponse> sortFeedItems(List<MatchFeedItemResponse> items, String sortKey) {
        Comparator<MatchFeedItemResponse> comparator = "COMPETITION".equals(sortKey)
                ? Comparator.comparing((MatchFeedItemResponse item) ->
                        Objects.toString(item.getCompetitionName(), ""), String.CASE_INSENSITIVE_ORDER)
                .thenComparing(item -> item.getMatchDate() != null ? item.getMatchDate() : Instant.EPOCH)
                : Comparator
                        .comparing((MatchFeedItemResponse item) -> statusOrder(item.getStatus()))
                        .thenComparing(item -> item.getMatchDate() != null ? item.getMatchDate() : Instant.EPOCH);
        return items.stream().sorted(comparator).toList();
    }

    private MatchDetailResponse buildLocalDetail(FootballMatch match, Competition competition) {
        boolean is2030 = WorldCupCompetitionScope.SLUG_WC_2030.equals(competition.getSlug());
        String country = TeamFlagResolver.resolveHostCountry(match.getCity(), is2030);

        return MatchDetailResponse.builder()
                .externalId(match.getExternalId())
                .localId(match.getId())
                .status(match.getStatus().name())
                .matchMinute(match.getMatchMinute())
                .matchDate(match.getMatchDate())
                .venueName(match.getVenueName())
                .city(match.getCity())
                .country(country)
                .matchImportance(TeamFlagResolver.resolveMatchImportance(match.getRoundLabel(), match.getGroupName()))
                .homeTeamFlagCode(TeamFlagResolver.resolveFlagCode(match.getHomeTeam()))
                .awayTeamFlagCode(TeamFlagResolver.resolveFlagCode(match.getAwayTeam()))
                .groupName(match.getGroupName())
                .stage(match.getRoundLabel())
                .competitionCode(is2030 ? "WC2030" : WorldCupCompetitionScope.API_CODE_WC)
                .competitionName(competition.getName())
                .areaName(is2030 ? "Maroc · Espagne · Portugal" : "USA · Canada · Mexique")
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore())
                .homeTeam(MatchTeamDetailResponse.builder()
                        .name(match.getHomeTeam())
                        .crest(TeamFlagResolver.resolveCrestUrl(match.getHomeTeam()))
                        .build())
                .awayTeam(MatchTeamDetailResponse.builder()
                        .name(match.getAwayTeam())
                        .crest(TeamFlagResolver.resolveCrestUrl(match.getAwayTeam()))
                        .build())
                .bookable(match.getStatus() == com.fanconnect.model.enums.MatchStatus.SCHEDULED
                        || match.getStatus() == com.fanconnect.model.enums.MatchStatus.LIVE)
                .goals(List.of())
                .bookings(List.of())
                .substitutions(List.of())
                .build();
    }

    private Map<String, String> buildTeamGroupMap(StandingsResponse standings) {
        Map<String, String> teamGroups = new LinkedHashMap<>();
        if (standings == null || standings.getGroups() == null) {
            return teamGroups;
        }
        for (GroupStandingResponse group : standings.getGroups()) {
            if (group.getTable() == null) {
                continue;
            }
            for (StandingRowResponse row : group.getTable()) {
                if (StringUtils.hasText(row.getTeamName()) && StringUtils.hasText(group.getGroupName())) {
                    teamGroups.putIfAbsent(row.getTeamName().toLowerCase(Locale.ROOT), group.getGroupName());
                }
            }
        }
        return teamGroups;
    }

    private void accumulateTeam(
            Map<String, TeamAccumulator> teams,
            String teamName,
            FootballMatch match,
            Map<String, String> teamGroups,
            Instant now
    ) {
        if (!StringUtils.hasText(teamName)) {
            return;
        }
        String key = teamName.trim().toLowerCase(Locale.ROOT);
        TeamAccumulator acc = teams.computeIfAbsent(key, ignored -> new TeamAccumulator(teamName));
        acc.groupName = acc.groupName != null ? acc.groupName
                : teamGroups.getOrDefault(key, match.getGroupName());
        acc.crestUrl = acc.crestUrl != null ? acc.crestUrl : TeamFlagResolver.resolveCrestUrl(teamName);
        acc.flagCode = acc.flagCode != null ? acc.flagCode : TeamFlagResolver.resolveFlagCode(teamName);

        MatchFeedItemResponse item = toFeedItemFromLocal(match);
        boolean involvesTeam = teamName.equalsIgnoreCase(match.getHomeTeam())
                || teamName.equalsIgnoreCase(match.getAwayTeam());

        if (!involvesTeam) {
            return;
        }

        if (match.getStatus() == com.fanconnect.model.enums.MatchStatus.SCHEDULED
                && match.getMatchDate() != null
                && match.getMatchDate().isAfter(now)
                && acc.upcoming.size() < 3) {
            acc.upcoming.add(item);
        } else if (match.getStatus() == com.fanconnect.model.enums.MatchStatus.FINISHED
                && acc.results.size() < 3) {
            acc.results.add(item);
        }
    }

    private static final class TeamAccumulator {
        private final String name;
        private String crestUrl;
        private String flagCode;
        private String groupName;
        private final List<MatchFeedItemResponse> upcoming = new ArrayList<>();
        private final List<MatchFeedItemResponse> results = new ArrayList<>();

        private TeamAccumulator(String name) {
            this.name = name;
        }

        private WorldCupTeamResponse toResponse() {
            return WorldCupTeamResponse.builder()
                    .name(name)
                    .shortName(name)
                    .crestUrl(crestUrl)
                    .flagCode(flagCode)
                    .groupName(groupName)
                    .upcomingMatches(upcoming)
                    .recentResults(results)
                    .build();
        }
    }

    private int statusOrder(String status) {
        return switch (status) {
            case "LIVE" -> 0;
            case "SCHEDULED" -> 1;
            case "FINISHED" -> 2;
            default -> 3;
        };
    }

    private String normalizeFilter(String filter) {
        if (!StringUtils.hasText(filter)) {
            return "ALL";
        }
        return filter.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeSort(String sort) {
        if (!StringUtils.hasText(sort)) {
            return "TIME";
        }
        return sort.trim().toUpperCase(Locale.ROOT);
    }

    private String capitalize(String value) {
        if (!StringUtils.hasText(value)) {
            return value;
        }
        return value.substring(0, 1).toUpperCase(Locale.FRENCH) + value.substring(1);
    }

    private record CachedFeedResponse(LiveMatchFeedResponse response, Instant cachedAt) {
        boolean isFresh(int ttlSeconds) {
            return Duration.between(cachedAt, Instant.now()).getSeconds() < ttlSeconds;
        }
    }

    private record CachedStandings(StandingsResponse response, Instant cachedAt) {
        boolean isFresh(int ttlSeconds) {
            return Duration.between(cachedAt, Instant.now()).getSeconds() < ttlSeconds;
        }
    }
}