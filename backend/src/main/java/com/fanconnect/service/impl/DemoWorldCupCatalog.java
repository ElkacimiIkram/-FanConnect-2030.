package com.fanconnect.service.impl;

import com.fanconnect.config.WorldCupCompetitionScope;
import com.fanconnect.dto.response.GroupStandingResponse;
import com.fanconnect.dto.response.StandingRowResponse;
import com.fanconnect.dto.response.StandingsResponse;
import com.fanconnect.model.enums.MatchStatus;
import com.fanconnect.util.TeamFlagResolver;

import java.time.Duration;
import java.util.List;

/**
 * Clock-relative World Cup 2026 / 2030 fixtures and group tables used when
 * football-data.org has nothing to show (typical on a soutenance day).
 */
final class DemoWorldCupCatalog {

    static final String PREFIX_2026 = "demo-wc2026-";
    static final String PREFIX_2030 = "demo-wc2030-";

    private DemoWorldCupCatalog() {
    }

    static List<DemoFixture> wc2026Fixtures() {
        return List.of(
                fixture(PREFIX_2026 + "finished-1",
                        "Mexique", "USA",
                        "Groupe A", "Phase de groupes — Journée 1",
                        "Estadio Azteca", "Mexico City",
                        MatchStatus.FINISHED, 1, 0, null,
                        Duration.ofHours(-5)),
                fixture(PREFIX_2026 + "live-1",
                        "Canada", "Brésil",
                        "Groupe B", "Phase de groupes — Journée 1",
                        "BC Place", "Vancouver",
                        MatchStatus.LIVE, 2, 1, 54,
                        Duration.ofMinutes(-54)),
                fixture(PREFIX_2026 + "live-2",
                        "France", "Argentine",
                        "Groupe C", "Phase de groupes — Journée 1",
                        "MetLife Stadium", "New York",
                        MatchStatus.LIVE, 0, 0, 18,
                        Duration.ofMinutes(-18)),
                fixture(PREFIX_2026 + "today-1",
                        "Maroc", "Croatie",
                        "Groupe A", "Phase de groupes — Journée 1",
                        "SoFi Stadium", "Los Angeles",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(2)),
                fixture(PREFIX_2026 + "today-2",
                        "Allemagne", "Angleterre",
                        "Groupe D", "Phase de groupes — Journée 1",
                        "AT&T Stadium", "Dallas",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(5)),
                fixture(PREFIX_2026 + "tomorrow-1",
                        "Japon", "Sénégal",
                        "Groupe E", "Phase de groupes — Journée 2",
                        "Hard Rock Stadium", "Miami",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(26)),
                fixture(PREFIX_2026 + "tomorrow-2",
                        "Espagne", "Portugal",
                        "Groupe F", "Phase de groupes — Journée 2",
                        "Estadio Azteca", "Mexico City",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(30)),
                fixture(PREFIX_2026 + "upcoming-1",
                        "Brésil", "France",
                        "Demi-finale", "Phase à élimination directe",
                        "MetLife Stadium", "New York",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(50)),
                fixture(PREFIX_2026 + "upcoming-2",
                        "USA", "Maroc",
                        "Finale", "Finale",
                        "SoFi Stadium", "Los Angeles",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(74))
        );
    }

    static List<DemoFixture> wc2030Fixtures() {
        return List.of(
                fixture(PREFIX_2030 + "finished-1",
                        "Sénégal", "Croatie",
                        "Groupe A", "Phase de groupes — Journée 1",
                        "Stade Mohammed V", "Casablanca",
                        MatchStatus.FINISHED, 2, 1, null,
                        Duration.ofHours(-5)),
                fixture(PREFIX_2030 + "live-1",
                        "Maroc", "Espagne",
                        "Groupe A", "Phase de groupes — Journée 1",
                        "Grand Stade de Rabat", "Rabat",
                        MatchStatus.LIVE, 1, 0, 67,
                        Duration.ofMinutes(-67)),
                fixture(PREFIX_2030 + "live-2",
                        "Portugal", "France",
                        "Groupe B", "Phase de groupes — Journée 1",
                        "Estádio da Luz", "Lisbonne",
                        MatchStatus.LIVE, 1, 1, 23,
                        Duration.ofMinutes(-23)),
                fixture(PREFIX_2030 + "today-1",
                        "Brésil", "Argentine",
                        "Groupe C", "Phase de groupes — Journée 1",
                        "Stade Ibn Batouta", "Tanger",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(2)),
                fixture(PREFIX_2030 + "today-2",
                        "Allemagne", "Angleterre",
                        "Groupe D", "Phase de groupes — Journée 1",
                        "Santiago Bernabéu", "Madrid",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(5)),
                fixture(PREFIX_2030 + "tomorrow-1",
                        "Maroc", "Portugal",
                        "Groupe A", "Phase de groupes — Journée 2",
                        "Stade Mohammed V", "Casablanca",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(26)),
                fixture(PREFIX_2030 + "tomorrow-2",
                        "Espagne", "Brésil",
                        "Groupe B", "Phase de groupes — Journée 2",
                        "Stade de la Cartuja", "Séville",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(30)),
                fixture(PREFIX_2030 + "upcoming-1",
                        "France", "Argentine",
                        "Demi-finale", "Phase à élimination directe",
                        "Grand Stade de Rabat", "Rabat",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(50)),
                fixture(PREFIX_2030 + "upcoming-2",
                        "Maroc", "Brésil",
                        "Finale", "Finale",
                        "Stade Mohammed V", "Casablanca",
                        MatchStatus.SCHEDULED, null, null, null,
                        Duration.ofHours(74))
        );
    }

    static StandingsResponse standings(String competitionCode) {
        boolean is2030 = is2030Code(competitionCode);
        return StandingsResponse.builder()
                .competitionCode(is2030 ? "WC2030" : WorldCupCompetitionScope.API_CODE_WC)
                .competitionName(is2030 ? "Coupe du Monde FIFA 2030" : "Coupe du Monde FIFA 2026")
                .season(is2030 ? "2030" : "2026")
                .groups(is2030 ? wc2030Groups() : wc2026Groups())
                .table(is2030
                        ? wc2030Groups().stream().flatMap(g -> g.getTable().stream()).toList()
                        : wc2026Groups().stream().flatMap(g -> g.getTable().stream()).toList())
                .build();
    }

    static boolean is2030Code(String code) {
        if (code == null) {
            return false;
        }
        String normalized = code.trim().toUpperCase();
        return "WC2030".equals(normalized) || "WC-2030".equals(normalized) || "2030".equals(normalized);
    }

    private static List<GroupStandingResponse> wc2026Groups() {
        return List.of(
                group("Groupe A",
                        row(1, "Mexique", "Groupe A", 1, 1, 0, 0, 1, 0, 3),
                        row(2, "Maroc", "Groupe A", 0, 0, 0, 0, 0, 0, 0),
                        row(3, "Croatie", "Groupe A", 0, 0, 0, 0, 0, 0, 0),
                        row(4, "USA", "Groupe A", 1, 0, 0, 1, 0, 1, 0)),
                group("Groupe B",
                        row(1, "Canada", "Groupe B", 1, 1, 0, 0, 2, 1, 3),
                        row(2, "Brésil", "Groupe B", 1, 0, 0, 1, 1, 2, 0),
                        row(3, "Japon", "Groupe B", 0, 0, 0, 0, 0, 0, 0),
                        row(4, "Sénégal", "Groupe B", 0, 0, 0, 0, 0, 0, 0)),
                group("Groupe C",
                        row(1, "France", "Groupe C", 1, 0, 1, 0, 0, 0, 1),
                        row(2, "Argentine", "Groupe C", 1, 0, 1, 0, 0, 0, 1),
                        row(3, "Pays-Bas", "Groupe C", 0, 0, 0, 0, 0, 0, 0),
                        row(4, "Belgique", "Groupe C", 0, 0, 0, 0, 0, 0, 0)),
                group("Groupe D",
                        row(1, "Allemagne", "Groupe D", 0, 0, 0, 0, 0, 0, 0),
                        row(2, "Angleterre", "Groupe D", 0, 0, 0, 0, 0, 0, 0),
                        row(3, "Espagne", "Groupe D", 0, 0, 0, 0, 0, 0, 0),
                        row(4, "Portugal", "Groupe D", 0, 0, 0, 0, 0, 0, 0))
        );
    }

    private static List<GroupStandingResponse> wc2030Groups() {
        return List.of(
                group("Groupe A",
                        row(1, "Maroc", "Groupe A", 1, 1, 0, 0, 1, 0, 3),
                        row(2, "Sénégal", "Groupe A", 1, 1, 0, 0, 2, 1, 3),
                        row(3, "Croatie", "Groupe A", 1, 0, 0, 1, 1, 2, 0),
                        row(4, "Espagne", "Groupe A", 1, 0, 0, 1, 0, 1, 0)),
                group("Groupe B",
                        row(1, "Portugal", "Groupe B", 1, 0, 1, 0, 1, 1, 1),
                        row(2, "France", "Groupe B", 1, 0, 1, 0, 1, 1, 1),
                        row(3, "USA", "Groupe B", 0, 0, 0, 0, 0, 0, 0),
                        row(4, "Japon", "Groupe B", 0, 0, 0, 0, 0, 0, 0)),
                group("Groupe C",
                        row(1, "Brésil", "Groupe C", 0, 0, 0, 0, 0, 0, 0),
                        row(2, "Argentine", "Groupe C", 0, 0, 0, 0, 0, 0, 0),
                        row(3, "Pays-Bas", "Groupe C", 0, 0, 0, 0, 0, 0, 0),
                        row(4, "Belgique", "Groupe C", 0, 0, 0, 0, 0, 0, 0)),
                group("Groupe D",
                        row(1, "Allemagne", "Groupe D", 0, 0, 0, 0, 0, 0, 0),
                        row(2, "Angleterre", "Groupe D", 0, 0, 0, 0, 0, 0, 0),
                        row(3, "Mexique", "Groupe D", 0, 0, 0, 0, 0, 0, 0),
                        row(4, "Canada", "Groupe D", 0, 0, 0, 0, 0, 0, 0))
        );
    }

    private static GroupStandingResponse group(String name, StandingRowResponse... rows) {
        return GroupStandingResponse.builder()
                .groupName(name)
                .table(List.of(rows))
                .build();
    }

    private static StandingRowResponse row(
            int position,
            String team,
            String groupName,
            int played,
            int won,
            int draw,
            int lost,
            int goalsFor,
            int goalsAgainst,
            int points
    ) {
        return StandingRowResponse.builder()
                .position(position)
                .teamName(team)
                .teamCrest(TeamFlagResolver.resolveCrestUrl(team))
                .teamFlagCode(TeamFlagResolver.resolveFlagCode(team))
                .groupName(groupName)
                .played(played)
                .won(won)
                .draw(draw)
                .lost(lost)
                .goalsFor(goalsFor)
                .goalsAgainst(goalsAgainst)
                .goalDifference(goalsFor - goalsAgainst)
                .points(points)
                .build();
    }

    private static DemoFixture fixture(
            String externalId,
            String homeTeam,
            String awayTeam,
            String groupName,
            String roundLabel,
            String venueName,
            String city,
            MatchStatus status,
            Integer homeScore,
            Integer awayScore,
            Integer minute,
            Duration offsetFromNow
    ) {
        return new DemoFixture(
                externalId, homeTeam, awayTeam, groupName, roundLabel,
                venueName, city, status, homeScore, awayScore, minute, offsetFromNow
        );
    }

    record DemoFixture(
            String externalId,
            String homeTeam,
            String awayTeam,
            String groupName,
            String roundLabel,
            String venueName,
            String city,
            MatchStatus status,
            Integer homeScore,
            Integer awayScore,
            Integer minute,
            Duration offsetFromNow
    ) {
    }
}
