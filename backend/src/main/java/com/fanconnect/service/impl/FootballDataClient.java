package com.fanconnect.service.impl;

import com.fanconnect.dto.response.MatchBookingResponse;
import com.fanconnect.dto.response.MatchDetailResponse;
import com.fanconnect.dto.response.MatchGoalResponse;
import com.fanconnect.dto.response.MatchLineupPlayerResponse;
import com.fanconnect.dto.response.MatchSubstitutionResponse;
import com.fanconnect.dto.response.GroupStandingResponse;
import com.fanconnect.dto.response.MatchTeamDetailResponse;
import com.fanconnect.dto.response.StandingRowResponse;
import com.fanconnect.dto.response.StandingsResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class FootballDataClient {

    private final ObjectMapper objectMapper;

    @Value("${fanconnect.football.api-key:}")
    private String apiKey;

    @Value("${fanconnect.football.api-base-url:https://api.football-data.org/v4}")
    private String apiBaseUrl;

    @Value("${fanconnect.football.date-from-days:3}")
    private int dateFromDays;

    @Value("${fanconnect.football.date-to-days:90}")
    private int dateToDays;

    @Value("${fanconnect.football.feed-cache-seconds:30}")
    private int feedCacheSeconds;

    @Value("${fanconnect.football.live-cache-seconds:10}")
    private int liveCacheSeconds;

    @Value("${fanconnect.football.today-cache-seconds:15}")
    private int todayCacheSeconds;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final Map<String, CachedFeed> feedCache = new ConcurrentHashMap<>();

    public boolean isConfigured() {
        return StringUtils.hasText(apiKey);
    }

    public List<RemoteMatch> fetchMatchesByDate(LocalDate date) {
        return fetchMatchesByDate(date, false);
    }

    public List<RemoteMatch> fetchMatchesByDate(LocalDate date, boolean forceRefresh) {
        if (!isConfigured() || date == null) {
            return List.of();
        }

        String cacheKey = "date:" + date;
        if (forceRefresh) {
            feedCache.remove(cacheKey);
        }

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        int ttl = date.equals(today) ? todayCacheSeconds : feedCacheSeconds;

        CachedFeed cached = feedCache.get(cacheKey);
        if (cached != null && cached.isValid(ttl)) {
            return cached.matches();
        }

        String path = "/matches?dateFrom=" + date + "&dateTo=" + date;
        List<RemoteMatch> matches = fetchMatches(path, cacheKey);
        feedCache.put(cacheKey, new CachedFeed(Instant.now(), matches));
        return matches;
    }

    public List<RemoteMatch> fetchAllLiveMatches(boolean forceRefresh) {
        if (!isConfigured()) {
            return List.of();
        }

        String cacheKey = "live:all";
        if (forceRefresh) {
            feedCache.remove(cacheKey);
        }

        CachedFeed cached = feedCache.get(cacheKey);
        if (cached != null && cached.isValid(liveCacheSeconds)) {
            return cached.matches();
        }

        String path = "/matches?status=LIVE,IN_PLAY,PAUSED";
        List<RemoteMatch> matches = fetchMatches(path, cacheKey);
        feedCache.put(cacheKey, new CachedFeed(Instant.now(), matches));
        return matches;
    }

    public List<RemoteMatch> fetchMatchesByDateRange(LocalDate from, LocalDate to) {
        if (!isConfigured() || from == null || to == null) {
            return List.of();
        }

        String cacheKey = "range:" + from + ":" + to;
        CachedFeed cached = feedCache.get(cacheKey);
        if (cached != null && cached.isValid(feedCacheSeconds)) {
            return cached.matches();
        }

        String path = "/matches?dateFrom=" + from + "&dateTo=" + to;
        List<RemoteMatch> matches = fetchMatches(path, cacheKey);
        feedCache.put(cacheKey, new CachedFeed(Instant.now(), matches));
        return matches;
    }

    public Optional<RemoteMatch> fetchMatchById(String externalId) {
        return fetchMatchNode(externalId).flatMap(this::parseMatch);
    }

    public Optional<MatchDetailResponse> fetchMatchDetail(String externalId) {
        return fetchMatchNode(externalId).map(this::parseMatchDetail);
    }

    private Optional<JsonNode> fetchMatchNode(String externalId) {
        if (!isConfigured() || !StringUtils.hasText(externalId)) {
            return Optional.empty();
        }

        try {
            URI uri = URI.create(apiBaseUrl + "/matches/" + externalId.trim());
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(20))
                    .header("X-Auth-Token", apiKey)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("Football-Data.org match detail status {} for {}", response.statusCode(), externalId);
                return Optional.empty();
            }

            return Optional.of(objectMapper.readTree(response.body()));
        } catch (Exception ex) {
            log.warn("Failed to fetch match detail for {}: {}", externalId, ex.getMessage());
            return Optional.empty();
        }
    }

    public List<RemoteMatch> fetchCompetitionMatches(String externalCode) {
        if (!isConfigured() || !StringUtils.hasText(externalCode)) {
            return List.of();
        }

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        String dateFrom = today.minusDays(dateFromDays).toString();
        String dateTo = today.plusDays(dateToDays).toString();

        String path = "/competitions/" + externalCode + "/matches"
                + "?status=SCHEDULED,TIMED,LIVE,IN_PLAY,PAUSED,FINISHED"
                + "&dateFrom=" + dateFrom
                + "&dateTo=" + dateTo;

        return fetchMatches(path, externalCode);
    }

    public Optional<StandingsResponse> fetchStandings(String competitionCode) {
        if (!isConfigured() || !StringUtils.hasText(competitionCode)) {
            return Optional.empty();
        }

        try {
            URI uri = URI.create(apiBaseUrl + "/competitions/" + competitionCode + "/standings");
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(20))
                    .header("X-Auth-Token", apiKey)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("Football-Data.org standings status {} for {}", response.statusCode(), competitionCode);
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode standings = root.get("standings");
            if (standings == null || !standings.isArray() || standings.isEmpty()) {
                return Optional.empty();
            }

            List<GroupStandingResponse> groups = new ArrayList<>();
            List<StandingRowResponse> flatTable = new ArrayList<>();

            for (JsonNode standingGroup : standings) {
                JsonNode tableNode = standingGroup.get("table");
                if (tableNode == null || !tableNode.isArray()) {
                    continue;
                }

                String groupName = standingGroup.hasNonNull("group")
                        ? standingGroup.get("group").asText()
                        : null;
                if (!StringUtils.hasText(groupName) && standingGroup.hasNonNull("type")) {
                    String type = standingGroup.get("type").asText();
                    if ("TOTAL".equals(type)) {
                        groupName = "Classement général";
                    }
                }

                List<StandingRowResponse> groupRows = new ArrayList<>();
                for (JsonNode row : tableNode) {
                    JsonNode team = row.get("team");
                    String teamName = team != null && team.hasNonNull("name") ? team.get("name").asText() : "—";
                    StandingRowResponse standingRow = StandingRowResponse.builder()
                            .position(row.get("position").asInt())
                            .teamName(teamName)
                            .teamCrest(team != null && team.hasNonNull("crest") ? team.get("crest").asText() : null)
                            .teamFlagCode(com.fanconnect.util.TeamFlagResolver.resolveFlagCode(teamName))
                            .groupName(groupName)
                            .played(row.get("playedGames").asInt())
                            .won(row.get("won").asInt())
                            .draw(row.get("draw").asInt())
                            .lost(row.get("lost").asInt())
                            .goalsFor(row.get("goalsFor").asInt())
                            .goalsAgainst(row.get("goalsAgainst").asInt())
                            .goalDifference(row.get("goalDifference").asInt())
                            .points(row.get("points").asInt())
                            .build();
                    groupRows.add(standingRow);
                    flatTable.add(standingRow);
                }

                if (!groupRows.isEmpty()) {
                    groups.add(GroupStandingResponse.builder()
                            .groupName(groupName != null ? groupName : "Groupe")
                            .table(groupRows)
                            .build());
                }
            }

            if (flatTable.isEmpty()) {
                return Optional.empty();
            }

            JsonNode competition = root.get("competition");
            return Optional.of(StandingsResponse.builder()
                    .competitionCode(competitionCode)
                    .competitionName(competition != null && competition.hasNonNull("name")
                            ? competition.get("name").asText() : competitionCode)
                    .season(competition != null && competition.hasNonNull("season")
                            && competition.get("season").hasNonNull("startDate")
                            ? competition.get("season").get("startDate").asText().substring(0, 4)
                            : null)
                    .table(flatTable)
                    .groups(groups)
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to fetch standings for {}: {}", competitionCode, ex.getMessage());
            return Optional.empty();
        }
    }

    private List<RemoteMatch> fetchMatches(String path, String context) {
        try {
            URI uri = URI.create(apiBaseUrl + path);
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(20))
                    .header("X-Auth-Token", apiKey)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("Football-Data.org returned status {} for {}", response.statusCode(), context);
                return List.of();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode matches = root.get("matches");
            if (matches == null || !matches.isArray()) {
                return List.of();
            }

            List<RemoteMatch> result = new ArrayList<>();
            for (JsonNode node : matches) {
                parseMatch(node).ifPresent(result::add);
            }
            return result;
        } catch (Exception ex) {
            log.warn("Failed to fetch matches for {}: {}", context, ex.getMessage());
            return List.of();
        }
    }

    private Optional<RemoteMatch> parseMatch(JsonNode node) {
        try {
            JsonNode home = node.get("homeTeam");
            JsonNode away = node.get("awayTeam");
            if (home == null || away == null) {
                return Optional.empty();
            }

            String remoteStatus = node.get("status").asText();
            String status = mapStatus(remoteStatus);
            JsonNode score = node.get("score");

            Integer homeScore = extractScore(score, "fullTime", "home");
            Integer awayScore = extractScore(score, "fullTime", "away");

            if (homeScore == null && awayScore == null && isLiveLike(remoteStatus)) {
                homeScore = extractScore(score, "regularTime", "home");
                awayScore = extractScore(score, "regularTime", "away");
            }
            if (homeScore == null && awayScore == null) {
                homeScore = extractScore(score, "halfTime", "home");
                awayScore = extractScore(score, "halfTime", "away");
            }

            Integer minute = null;
            if (isLiveLike(remoteStatus) && node.hasNonNull("minute")) {
                minute = node.get("minute").asInt();
            }

            String groupName = textOrNull(node, "group");
            if (!StringUtils.hasText(groupName) && node.hasNonNull("stage")) {
                String stage = node.get("stage").asText();
                if (stage.startsWith("GROUP_")) {
                    groupName = "Groupe " + stage.substring("GROUP_".length());
                }
            }

            JsonNode competition = node.get("competition");
            JsonNode area = node.get("area");

            return Optional.of(new RemoteMatch(
                    String.valueOf(node.get("id").asLong()),
                    teamName(home),
                    teamName(away),
                    crestUrl(home),
                    crestUrl(away),
                    Instant.parse(node.get("utcDate").asText()),
                    status,
                    homeScore,
                    awayScore,
                    minute,
                    groupName,
                    textOrNull(node, "stage"),
                    textOrNull(node, "venue"),
                    competition != null ? textOrNull(competition, "code") : null,
                    competition != null ? textOrNull(competition, "name") : null,
                    competition != null ? textOrNull(competition, "emblem") : null,
                    area != null ? textOrNull(area, "name") : null,
                    area != null ? textOrNull(area, "code") : null
            ));
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    private Integer extractScore(JsonNode score, String period, String side) {
        if (score == null) {
            return null;
        }
        JsonNode periodNode = score.get(period);
        if (periodNode == null || periodNode.get(side) == null || periodNode.get(side).isNull()) {
            return null;
        }
        return periodNode.get(side).asInt();
    }

    private boolean isLiveLike(String remoteStatus) {
        return "IN_PLAY".equals(remoteStatus) || "PAUSED".equals(remoteStatus) || "LIVE".equals(remoteStatus);
    }

    private String teamName(JsonNode team) {
        if (team.hasNonNull("name")) {
            return team.get("name").asText();
        }
        if (team.hasNonNull("shortName")) {
            return team.get("shortName").asText();
        }
        return "Équipe";
    }

    private String crestUrl(JsonNode team) {
        return team.hasNonNull("crest") ? team.get("crest").asText() : null;
    }

    private String textOrNull(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText() : null;
    }

    private String mapStatus(String remoteStatus) {
        return switch (remoteStatus) {
            case "IN_PLAY", "PAUSED", "LIVE" -> "LIVE";
            case "FINISHED" -> "FINISHED";
            case "CANCELLED", "POSTPONED", "SUSPENDED", "AWARDED" -> "CANCELLED";
            default -> "SCHEDULED";
        };
    }

    private MatchDetailResponse parseMatchDetail(JsonNode node) {
        JsonNode home = node.get("homeTeam");
        JsonNode away = node.get("awayTeam");
        JsonNode score = node.get("score");
        JsonNode competition = node.get("competition");
        JsonNode area = node.get("area");

        String remoteStatus = node.get("status").asText();
        String status = mapStatus(remoteStatus);

        Integer homeScore = extractScore(score, "fullTime", "home");
        Integer awayScore = extractScore(score, "fullTime", "away");
        Integer halfHome = extractScore(score, "halfTime", "home");
        Integer halfAway = extractScore(score, "halfTime", "away");

        Integer minute = isLiveLike(remoteStatus) && node.hasNonNull("minute")
                ? node.get("minute").asInt() : null;
        Integer injuryTime = node.hasNonNull("injuryTime") ? node.get("injuryTime").asInt() : null;

        String groupName = textOrNull(node, "group");
        if (!StringUtils.hasText(groupName) && node.hasNonNull("stage")) {
            String stage = node.get("stage").asText();
            if (stage.startsWith("GROUP_")) {
                groupName = "Groupe " + stage.substring("GROUP_".length());
            }
        }

        String refereeName = null;
        JsonNode referees = node.get("referees");
        if (referees != null && referees.isArray()) {
            for (JsonNode ref : referees) {
                if ("REFEREE".equals(textOrNull(ref, "type"))) {
                    refereeName = textOrNull(ref, "name");
                    break;
                }
            }
        }

        return MatchDetailResponse.builder()
                .externalId(String.valueOf(node.get("id").asLong()))
                .status(status)
                .matchMinute(minute)
                .injuryTime(injuryTime)
                .matchDate(Instant.parse(node.get("utcDate").asText()))
                .venueName(textOrNull(node, "venue"))
                .attendance(node.hasNonNull("attendance") ? node.get("attendance").asInt() : null)
                .matchday(node.hasNonNull("matchday") ? node.get("matchday").asInt() : null)
                .stage(textOrNull(node, "stage"))
                .groupName(groupName)
                .competitionCode(competition != null ? textOrNull(competition, "code") : null)
                .competitionName(competition != null ? textOrNull(competition, "name") : null)
                .competitionEmblem(competition != null ? textOrNull(competition, "emblem") : null)
                .areaName(area != null ? textOrNull(area, "name") : null)
                .homeScore(homeScore)
                .awayScore(awayScore)
                .halfTimeHomeScore(halfHome)
                .halfTimeAwayScore(halfAway)
                .homeTeam(parseTeamDetail(home))
                .awayTeam(parseTeamDetail(away))
                .goals(parseGoals(node.get("goals")))
                .bookings(parseBookings(node.get("bookings")))
                .substitutions(parseSubstitutions(node.get("substitutions")))
                .refereeName(refereeName)
                .build();
    }

    private MatchTeamDetailResponse parseTeamDetail(JsonNode team) {
        if (team == null) {
            return null;
        }
        JsonNode coach = team.get("coach");
        return MatchTeamDetailResponse.builder()
                .name(teamName(team))
                .shortName(team.hasNonNull("shortName") ? team.get("shortName").asText() : teamName(team))
                .crest(crestUrl(team))
                .coachName(coach != null ? textOrNull(coach, "name") : null)
                .formation(textOrNull(team, "formation"))
                .lineup(parseLineup(team.get("lineup")))
                .bench(parseLineup(team.get("bench")))
                .statistics(parseStatistics(team.get("statistics")))
                .build();
    }

    private List<MatchLineupPlayerResponse> parseLineup(JsonNode players) {
        if (players == null || !players.isArray()) {
            return List.of();
        }
        List<MatchLineupPlayerResponse> result = new ArrayList<>();
        for (JsonNode player : players) {
            result.add(MatchLineupPlayerResponse.builder()
                    .name(textOrNull(player, "name"))
                    .position(textOrNull(player, "position"))
                    .shirtNumber(player.hasNonNull("shirtNumber") ? player.get("shirtNumber").asInt() : null)
                    .build());
        }
        return result;
    }

    private Map<String, Integer> parseStatistics(JsonNode stats) {
        if (stats == null || !stats.isObject()) {
            return Map.of();
        }
        Map<String, Integer> result = new LinkedHashMap<>();
        stats.fields().forEachRemaining(entry -> {
            if (!entry.getValue().isNull()) {
                result.put(entry.getKey(), entry.getValue().asInt());
            }
        });
        return result;
    }

    private List<MatchGoalResponse> parseGoals(JsonNode goals) {
        if (goals == null || !goals.isArray()) {
            return List.of();
        }
        List<MatchGoalResponse> result = new ArrayList<>();
        for (JsonNode goal : goals) {
            JsonNode team = goal.get("team");
            JsonNode scorer = goal.get("scorer");
            JsonNode assist = goal.get("assist");
            JsonNode score = goal.get("score");
            result.add(MatchGoalResponse.builder()
                    .minute(goal.hasNonNull("minute") ? goal.get("minute").asInt() : null)
                    .type(textOrNull(goal, "type"))
                    .teamName(team != null ? textOrNull(team, "name") : null)
                    .scorerName(scorer != null ? textOrNull(scorer, "name") : null)
                    .assistName(assist != null ? textOrNull(assist, "name") : null)
                    .homeScore(score != null ? extractScore(score, "home") : null)
                    .awayScore(score != null ? extractScore(score, "away") : null)
                    .build());
        }
        return result;
    }

    private Integer extractScore(JsonNode score, String side) {
        if (score == null || score.get(side) == null || score.get(side).isNull()) {
            return null;
        }
        return score.get(side).asInt();
    }

    private List<MatchBookingResponse> parseBookings(JsonNode bookings) {
        if (bookings == null || !bookings.isArray()) {
            return List.of();
        }
        List<MatchBookingResponse> result = new ArrayList<>();
        for (JsonNode booking : bookings) {
            JsonNode team = booking.get("team");
            JsonNode player = booking.get("player");
            result.add(MatchBookingResponse.builder()
                    .minute(booking.hasNonNull("minute") ? booking.get("minute").asInt() : null)
                    .teamName(team != null ? textOrNull(team, "name") : null)
                    .playerName(player != null ? textOrNull(player, "name") : null)
                    .card(textOrNull(booking, "card"))
                    .build());
        }
        return result;
    }

    private List<MatchSubstitutionResponse> parseSubstitutions(JsonNode substitutions) {
        if (substitutions == null || !substitutions.isArray()) {
            return List.of();
        }
        List<MatchSubstitutionResponse> result = new ArrayList<>();
        for (JsonNode sub : substitutions) {
            JsonNode team = sub.get("team");
            JsonNode playerOut = sub.get("playerOut");
            JsonNode playerIn = sub.get("playerIn");
            result.add(MatchSubstitutionResponse.builder()
                    .minute(sub.hasNonNull("minute") ? sub.get("minute").asInt() : null)
                    .teamName(team != null ? textOrNull(team, "name") : null)
                    .playerOut(playerOut != null ? textOrNull(playerOut, "name") : null)
                    .playerIn(playerIn != null ? textOrNull(playerIn, "name") : null)
                    .build());
        }
        return result;
    }

    public record RemoteMatch(
            String externalId,
            String homeTeam,
            String awayTeam,
            String homeTeamCrest,
            String awayTeamCrest,
            Instant matchDate,
            String status,
            Integer homeScore,
            Integer awayScore,
            Integer minute,
            String groupName,
            String roundLabel,
            String venueName,
            String competitionCode,
            String competitionName,
            String competitionEmblem,
            String areaName,
            String areaCode
    ) {
    }

    private record CachedFeed(Instant fetchedAt, List<RemoteMatch> matches) {
        boolean isValid(int ttlSeconds) {
            return Duration.between(fetchedAt, Instant.now()).getSeconds() < ttlSeconds;
        }
    }
}