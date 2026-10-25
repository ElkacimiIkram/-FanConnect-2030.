package com.fanconnect.service.impl;

import com.fanconnect.dto.response.AssistantChatResponse;
import com.fanconnect.dto.response.AssistantMatchCardResponse;
import com.fanconnect.dto.response.AssistantVenueCardResponse;
import com.fanconnect.model.enums.MatchStatus;
import com.fanconnect.model.enums.OccupancyLevel;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * Deterministic FanBot used when Grok is unavailable — always works on soutenance day.
 */
@Component
public class FanAssistantFallback {

    static final List<String> DEFAULT_SUGGESTIONS = FanAssistantTrainingSet.FREQUENT_QUESTIONS;

    public AssistantChatResponse answer(
            String message,
            String requestedCity,
            List<AssistantMatchCardResponse> catalogMatches,
            List<AssistantVenueCardResponse> catalogVenues,
            boolean llmEnabled
    ) {
        return answer(message, requestedCity, catalogMatches, catalogVenues, llmEnabled, null, null);
    }

    public AssistantChatResponse answer(
            String message,
            String requestedCity,
            List<AssistantMatchCardResponse> catalogMatches,
            List<AssistantVenueCardResponse> catalogVenues,
            boolean llmEnabled,
            Double latitude,
            Double longitude
    ) {
        String text = normalize(message);
        FanAssistantIntentClassifier.ScoredIntent scored = FanAssistantIntentClassifier.classify(message);
        FanAssistantIntent intent = scored.intent();

        if (scored.isFaq()) {
            return faqResponse(intent, llmEnabled);
        }

        AssistantGeoCatalog.City mentionedCity = firstCity(
                AssistantGeoCatalog.findInText(text),
                AssistantGeoCatalog.byName(requestedCity)
        );
        String city = mentionedCity != null ? AssistantGeoCatalog.normalize(mentionedCity.displayName()) : null;
        String team = detectTeam(text);
        boolean wantsLive = intent == FanAssistantIntent.LIVE_MATCHES
                || containsAny(text, "direct", "live", "en cours");
        boolean wantsQuiet = intent == FanAssistantIntent.QUIET_CAFE
                || containsAny(text, "calme", "pas trop", "pas plein", "disponible", "places", "tranquille");
        boolean wantsNearest = intent == FanAssistantIntent.NEAREST_CAFE
                || containsAny(text, "proche", "pres de", "plus proche", "a cote", "nearest", "near me");
        boolean hasOrigin = latitude != null && longitude != null;

        List<AssistantMatchCardResponse> matches = selectMatches(catalogMatches, team, wantsLive);
        List<AssistantVenueCardResponse> venues = selectVenues(
                catalogVenues,
                city,
                wantsQuiet,
                wantsNearest || hasOrigin
        );

        Long selectedMatchId = matches.isEmpty() ? null : matches.getFirst().getId();
        if (selectedMatchId != null) {
            for (AssistantVenueCardResponse venue : venues) {
                venue.setMatchId(selectedMatchId);
            }
        }

        boolean cityHasPartner = StringUtils.hasText(city) && catalogVenues.stream().anyMatch(venue ->
                venue.getCity() != null && AssistantGeoCatalog.normalize(venue.getCity()).contains(city));

        String reply = buildReply(
                matches,
                venues,
                team,
                mentionedCity,
                cityHasPartner,
                wantsLive,
                wantsQuiet,
                wantsNearest,
                hasOrigin
        );
        return AssistantChatResponse.builder()
                .reply(reply)
                .source("FALLBACK")
                .intent(intent.name())
                .llmEnabled(llmEnabled)
                .matches(wantsNearest && team == null ? List.of() : matches)
                .venues(venues)
                .suggestions(nextSuggestions(city, team, wantsLive))
                .build();
    }

    private AssistantChatResponse faqResponse(
            FanAssistantIntent intent,
            boolean llmEnabled
    ) {
        String reply = FanAssistantKnowledge.answer(intent);
        return AssistantChatResponse.builder()
                .reply(reply)
                .source("TRAINED")
                .intent(intent.name())
                .llmEnabled(llmEnabled)
                .matches(List.of())
                .venues(List.of())
                .suggestions(FanAssistantTrainingSet.FREQUENT_QUESTIONS)
                .build();
    }

    List<AssistantMatchCardResponse> selectMatches(
            List<AssistantMatchCardResponse> catalog,
            String team,
            boolean wantsLive
    ) {
        if (catalog == null || catalog.isEmpty()) {
            return List.of();
        }
        List<AssistantMatchCardResponse> filtered = new ArrayList<>(catalog);
        if (StringUtils.hasText(team)) {
            List<AssistantMatchCardResponse> teamMatches = filtered.stream()
                    .filter(match -> involvesTeam(match, team))
                    .toList();
            if (!teamMatches.isEmpty()) {
                filtered = new ArrayList<>(teamMatches);
            }
        }
        if (wantsLive) {
            List<AssistantMatchCardResponse> live = filtered.stream()
                    .filter(match -> match.getStatus() == MatchStatus.LIVE)
                    .toList();
            if (!live.isEmpty()) {
                filtered = new ArrayList<>(live);
            }
        }
        filtered.sort(Comparator
                .comparingInt((AssistantMatchCardResponse match) -> statusRank(match.getStatus()))
                .thenComparing(match -> match.getMatchDate() == null ? Long.MAX_VALUE : match.getMatchDate().toEpochMilli()));
        return filtered.stream().limit(3).toList();
    }

    List<AssistantVenueCardResponse> selectVenues(
            List<AssistantVenueCardResponse> catalog,
            String city,
            boolean wantsQuiet,
            boolean preferNearest
    ) {
        if (catalog == null || catalog.isEmpty()) {
            return List.of();
        }
        List<AssistantVenueCardResponse> filtered = new ArrayList<>(catalog);
        if (StringUtils.hasText(city) && !preferNearest) {
            List<AssistantVenueCardResponse> inCity = filtered.stream()
                    .filter(venue -> venue.getCity() != null
                            && AssistantGeoCatalog.normalize(venue.getCity()).contains(city))
                    .toList();
            if (!inCity.isEmpty()) {
                filtered = new ArrayList<>(inCity);
            }
        }
        if (preferNearest && filtered.stream().anyMatch(venue -> venue.getDistanceKm() != null)) {
            filtered.sort(Comparator
                    .comparing((AssistantVenueCardResponse venue) ->
                            venue.getDistanceKm() == null ? Double.MAX_VALUE : venue.getDistanceKm())
                    .thenComparingDouble(AssistantVenueCardResponse::getOccupancyPct));
        } else {
            filtered.sort(Comparator
                    .comparingDouble(AssistantVenueCardResponse::getOccupancyPct)
                    .thenComparing(AssistantVenueCardResponse::getName, String.CASE_INSENSITIVE_ORDER));
        }
        if (wantsQuiet) {
            List<AssistantVenueCardResponse> quiet = filtered.stream()
                    .filter(venue -> venue.getOccupancyLevel() != OccupancyLevel.RED)
                    .toList();
            if (!quiet.isEmpty()) {
                filtered = new ArrayList<>(quiet);
            }
        }
        return filtered.stream().limit(3).toList();
    }

    String buildReply(
            List<AssistantMatchCardResponse> matches,
            List<AssistantVenueCardResponse> venues,
            String team,
            AssistantGeoCatalog.City mentionedCity,
            boolean cityHasPartner,
            boolean wantsLive,
            boolean wantsQuiet,
            boolean wantsNearest,
            boolean hasOrigin
    ) {
        if (matches.isEmpty() && venues.isEmpty()) {
            return "Je n'ai pas encore assez de matchs ou de cafés pour te répondre. "
                    + "Ouvre le Match Center ou la liste des cafés, puis reviens me voir.";
        }

        if (wantsNearest && !hasOrigin && mentionedCity == null) {
            return "Pour te donner le café le plus proche, dis-moi ta ville "
                    + "(ex. Oualidia, El Jadida, Casablanca) ou autorise la géolocalisation.";
        }

        StringBuilder reply = new StringBuilder();
        if (mentionedCity != null && !cityHasPartner) {
            reply.append("Il n'y a pas encore de café partenaire FanConnect à **")
                    .append(mentionedCity.displayName()).append("**. ");
        }

        if (!venues.isEmpty() && (wantsNearest || (mentionedCity != null && !cityHasPartner))) {
            AssistantVenueCardResponse venue = venues.getFirst();
            reply.append("Le plus proche est **").append(venue.getName()).append("** à ")
                    .append(venue.getCity());
            if (venue.getDistanceKm() != null) {
                reply.append(" (").append(formatDistance(venue.getDistanceKm())).append(")");
            }
            reply.append(" — ").append(Math.round(venue.getOccupancyPct())).append(" % occupé, ")
                    .append(venue.getAvailableSeats()).append(" places. ");
            reply.append("Tu peux réserver depuis les cartes ci-dessous.");
            return reply.toString().trim();
        }

        if (!matches.isEmpty()) {
            AssistantMatchCardResponse match = matches.getFirst();
            if (match.getStatus() == MatchStatus.LIVE) {
                reply.append("**").append(match.getLabel()).append("** est en direct");
                if (match.getMatchMinute() != null) {
                    reply.append(" (").append(match.getMatchMinute()).append("')");
                }
                if (match.getHomeScore() != null && match.getAwayScore() != null) {
                    reply.append(" — ").append(match.getHomeScore()).append("-").append(match.getAwayScore());
                }
                reply.append(". ");
            } else if (wantsLive && match.getStatus() != MatchStatus.LIVE) {
                reply.append("Aucun match en direct pour ce filtre. Le prochain à suivre : **")
                        .append(match.getLabel()).append("**. ");
            } else if (StringUtils.hasText(team)) {
                reply.append("Pour **").append(capitalize(team)).append("**, je te propose **")
                        .append(match.getLabel()).append("**. ");
            } else {
                reply.append("Le match à ne pas manquer : **").append(match.getLabel()).append("**. ");
            }
        }

        if (!venues.isEmpty()) {
            AssistantVenueCardResponse venue = venues.getFirst();
            if (wantsQuiet || venue.getOccupancyLevel() == OccupancyLevel.GREEN) {
                reply.append("Côté affluence, **").append(venue.getName()).append("** à ")
                        .append(venue.getCity()).append(" est le plus confortable (")
                        .append(Math.round(venue.getOccupancyPct())).append(" % occupé, ")
                        .append(venue.getAvailableSeats()).append(" places). ");
            } else if (venue.getOccupancyLevel() == OccupancyLevel.RED) {
                reply.append("Attention : **").append(venue.getName()).append("** se remplit vite. ");
            } else {
                reply.append("Je te recommande **").append(venue.getName()).append("** à ")
                        .append(venue.getCity()).append(" (").append(Math.round(venue.getOccupancyPct()))
                        .append(" % d'occupation). ");
            }
            reply.append("Tu peux réserver directement depuis les cartes ci-dessous.");
        }

        return reply.toString().trim();
    }

    static String detectCity(String text) {
        AssistantGeoCatalog.City city = AssistantGeoCatalog.findInText(text);
        return city == null ? null : AssistantGeoCatalog.normalize(city.displayName());
    }

    static String detectTeam(String text) {
        if (containsAny(text, "maroc", "morocco", "atlas")) {
            return "maroc";
        }
        if (containsAny(text, "espagne", "spain", "espana")) {
            return "espagne";
        }
        if (containsAny(text, "portugal")) {
            return "portugal";
        }
        if (containsAny(text, "bresil", "brazil", "brasil")) {
            return "bresil";
        }
        if (containsAny(text, "argentine", "argentina")) {
            return "argentine";
        }
        if (containsAny(text, "france")) {
            return "france";
        }
        if (containsAny(text, "allemagne", "germany")) {
            return "allemagne";
        }
        if (containsAny(text, "angleterre", "england")) {
            return "angleterre";
        }
        if (containsAny(text, "senegal")) {
            return "senegal";
        }
        return null;
    }

    static List<String> nextSuggestions(String city, String team, boolean wantsLive) {
        List<String> suggestions = new ArrayList<>();
        suggestions.add("Café le plus proche");
        if (!wantsLive) {
            suggestions.add("Quels matchs sont en direct ?");
        }
        if (!"maroc".equals(team)) {
            suggestions.add("Où regarder le match du Maroc ?");
        }
        if (!"casablanca".equals(city)) {
            suggestions.add("Cafés calmes à Casablanca");
        } else {
            suggestions.add("Cafés calmes à Rabat");
        }
        suggestions.add("Comment réserver une table ?");
        return suggestions.stream().distinct().limit(6).toList();
    }

    private static boolean involvesTeam(AssistantMatchCardResponse match, String team) {
        String needle = normalize(team);
        return normalize(match.getHomeTeam()).contains(needle)
                || normalize(match.getAwayTeam()).contains(needle);
    }

    private static int statusRank(MatchStatus status) {
        if (status == MatchStatus.LIVE) {
            return 0;
        }
        if (status == MatchStatus.SCHEDULED) {
            return 1;
        }
        return 2;
    }

    static String normalize(String value) {
        if (value == null) {
            return "";
        }
        String stripped = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        return stripped.toLowerCase(Locale.ROOT).trim();
    }

    static String normalizeCity(String city) {
        String value = normalize(city);
        return value.isBlank() ? null : value;
    }

    private static boolean containsAny(String text, String... needles) {
        for (String needle : needles) {
            if (text.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private static AssistantGeoCatalog.City firstCity(
            AssistantGeoCatalog.City first,
            AssistantGeoCatalog.City second
    ) {
        return first != null ? first : second;
    }

    private static String formatDistance(double km) {
        if (km < 1) {
            return Math.round(km * 1000) + " m";
        }
        if (km < 10) {
            return String.format(Locale.FRENCH, "%.1f km", km);
        }
        return Math.round(km) + " km";
    }

    private static String capitalize(String value) {
        if (!StringUtils.hasText(value)) {
            return value;
        }
        return value.substring(0, 1).toUpperCase(Locale.FRENCH) + value.substring(1);
    }
}
