package com.fanconnect.util;

import org.springframework.util.StringUtils;

import java.util.Locale;
import java.util.Map;

public final class TeamFlagResolver {

    private static final Map<String, String> TEAM_TO_CREST = Map.ofEntries(
            Map.entry("morocco", "https://crests.football-data.org/811.png"),
            Map.entry("maroc", "https://crests.football-data.org/811.png"),
            Map.entry("portugal", "https://crests.football-data.org/827.png"),
            Map.entry("spain", "https://crests.football-data.org/760.png"),
            Map.entry("espagne", "https://crests.football-data.org/760.png"),
            Map.entry("france", "https://crests.football-data.org/773.png"),
            Map.entry("brazil", "https://crests.football-data.org/764.png"),
            Map.entry("brésil", "https://crests.football-data.org/764.png"),
            Map.entry("bresil", "https://crests.football-data.org/764.png"),
            Map.entry("argentina", "https://crests.football-data.org/762.png"),
            Map.entry("argentine", "https://crests.football-data.org/762.png"),
            Map.entry("germany", "https://crests.football-data.org/759.png"),
            Map.entry("allemagne", "https://crests.football-data.org/759.png"),
            Map.entry("england", "https://crests.football-data.org/770.png"),
            Map.entry("angleterre", "https://crests.football-data.org/770.png"),
            Map.entry("netherlands", "https://crests.football-data.org/8601.png"),
            Map.entry("pays-bas", "https://crests.football-data.org/8601.png"),
            Map.entry("belgium", "https://crests.football-data.org/805.png"),
            Map.entry("belgique", "https://crests.football-data.org/805.png"),
            Map.entry("croatia", "https://crests.football-data.org/799.png"),
            Map.entry("croatie", "https://crests.football-data.org/799.png"),
            Map.entry("senegal", "https://crests.football-data.org/858.png"),
            Map.entry("sénégal", "https://crests.football-data.org/858.png"),
            Map.entry("mexico", "https://crests.football-data.org/785.png"),
            Map.entry("mexique", "https://crests.football-data.org/785.png"),
            Map.entry("usa", "https://crests.football-data.org/2384.png"),
            Map.entry("united states", "https://crests.football-data.org/2384.png"),
            Map.entry("états-unis", "https://crests.football-data.org/2384.png"),
            Map.entry("etats-unis", "https://crests.football-data.org/2384.png"),
            Map.entry("canada", "https://crests.football-data.org/5529.png"),
            Map.entry("japan", "https://crests.football-data.org/769.png"),
            Map.entry("japon", "https://crests.football-data.org/769.png")
    );

    private static final Map<String, String> TEAM_TO_FLAG = Map.ofEntries(
            Map.entry("morocco", "ma"),
            Map.entry("maroc", "ma"),
            Map.entry("portugal", "pt"),
            Map.entry("spain", "es"),
            Map.entry("espagne", "es"),
            Map.entry("france", "fr"),
            Map.entry("brazil", "br"),
            Map.entry("brésil", "br"),
            Map.entry("bresil", "br"),
            Map.entry("argentina", "ar"),
            Map.entry("argentine", "ar"),
            Map.entry("germany", "de"),
            Map.entry("allemagne", "de"),
            Map.entry("england", "gb-eng"),
            Map.entry("angleterre", "gb-eng"),
            Map.entry("netherlands", "nl"),
            Map.entry("pays-bas", "nl"),
            Map.entry("belgium", "be"),
            Map.entry("belgique", "be"),
            Map.entry("croatia", "hr"),
            Map.entry("croatie", "hr"),
            Map.entry("senegal", "sn"),
            Map.entry("sénégal", "sn"),
            Map.entry("egypt", "eg"),
            Map.entry("égypte", "eg"),
            Map.entry("nigeria", "ng"),
            Map.entry("mexico", "mx"),
            Map.entry("mexique", "mx"),
            Map.entry("usa", "us"),
            Map.entry("united states", "us"),
            Map.entry("états-unis", "us"),
            Map.entry("etats-unis", "us"),
            Map.entry("canada", "ca"),
            Map.entry("japan", "jp"),
            Map.entry("japon", "jp"),
            Map.entry("south korea", "kr"),
            Map.entry("corée du sud", "kr")
    );

    private TeamFlagResolver() {
    }

    public static String resolveFlagCode(String teamName) {
        if (!StringUtils.hasText(teamName)) {
            return null;
        }
        String key = teamName.trim().toLowerCase(Locale.ROOT);
        return TEAM_TO_FLAG.get(key);
    }

    public static String resolveCrestUrl(String teamName) {
        if (!StringUtils.hasText(teamName)) {
            return null;
        }
        String key = teamName.trim().toLowerCase(Locale.ROOT);
        return TEAM_TO_CREST.get(key);
    }

    public static String resolveHostCountry(String city, boolean worldCup2030) {
        if (!StringUtils.hasText(city)) {
            return worldCup2030 ? "Maroc · Espagne · Portugal" : "USA · Canada · Mexique";
        }
        String normalized = city.trim().toLowerCase(Locale.ROOT);
        if (worldCup2030) {
            if (normalized.contains("madrid") || normalized.contains("barcelona") || normalized.contains("seville")
                    || normalized.contains("bilbao") || normalized.contains("valencia")) {
                return "Espagne";
            }
            if (normalized.contains("lisbon") || normalized.contains("lisbonne") || normalized.contains("porto")) {
                return "Portugal";
            }
            return "Maroc";
        }
        if (normalized.contains("toronto") || normalized.contains("vancouver") || normalized.contains("montréal")
                || normalized.contains("montreal") || normalized.contains("edmonton")) {
            return "Canada";
        }
        if (normalized.contains("mexico") || normalized.contains("guadalajara") || normalized.contains("monterrey")) {
            return "Mexique";
        }
        return "États-Unis";
    }

    public static String resolveMatchImportance(String roundLabel, String groupName) {
        if (!StringUtils.hasText(roundLabel)) {
            return StringUtils.hasText(groupName) ? "GROUP_STAGE" : "GROUP_STAGE";
        }
        String round = roundLabel.toLowerCase(Locale.ROOT);
        if (round.contains("final") && !round.contains("semi") && !round.contains("quarter")) {
            return "FINAL";
        }
        if (round.contains("semi")) {
            return "SEMI_FINAL";
        }
        if (round.contains("quarter")) {
            return "QUARTER_FINAL";
        }
        if (round.contains("round of 16") || round.contains("8e") || round.contains("huitième")) {
            return "ROUND_OF_16";
        }
        return "GROUP_STAGE";
    }
}