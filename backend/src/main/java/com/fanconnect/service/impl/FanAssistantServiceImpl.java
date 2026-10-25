package com.fanconnect.service.impl;

import com.fanconnect.client.XaiGrokClient;
import com.fanconnect.config.AssistantProperties;
import com.fanconnect.dto.request.AssistantChatRequest;
import com.fanconnect.dto.response.AssistantChatResponse;
import com.fanconnect.dto.response.AssistantMatchCardResponse;
import com.fanconnect.dto.response.AssistantVenueCardResponse;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.BusinessStatus;
import com.fanconnect.model.enums.MatchStatus;
import com.fanconnect.model.enums.OccupancyLevel;
import com.fanconnect.model.enums.ReservationStatus;
import com.fanconnect.repository.BusinessRepository;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.service.FanAssistantService;
import com.fanconnect.service.MatchService;
import com.fanconnect.util.GeoUtils;
import com.fanconnect.util.OccupancyEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FanAssistantServiceImpl implements FanAssistantService {

    private static final ZoneId PARIS = ZoneId.of("Europe/Paris");
    private static final DateTimeFormatter KICKOFF =
            DateTimeFormatter.ofPattern("EEE d MMM HH:mm", Locale.FRENCH);
    private static final List<ReservationStatus> OCCUPIED_STATUSES = List.of(
            ReservationStatus.CHECKED_IN,
            ReservationStatus.CONFIRMED,
            ReservationStatus.PENDING
    );

    private final AssistantProperties assistantProperties;
    private final MatchService matchService;
    private final FootballMatchRepository footballMatchRepository;
    private final BusinessRepository businessRepository;
    private final ReservationRepository reservationRepository;
    private final FanAssistantFallback fallback;
    private final XaiGrokClient grokClient;

    @Override
    public List<String> suggestions() {
        return FanAssistantFallback.DEFAULT_SUGGESTIONS;
    }

    @Override
    @Transactional(readOnly = true)
    public AssistantChatResponse chat(AssistantChatRequest request) {
        String message = request.getMessage() == null ? "" : request.getMessage().trim();
        List<AssistantMatchCardResponse> matches = loadMatchCards();
        FootballMatch occupancyMatch = resolveOccupancyMatch(request.getMatchId(), matches);
        List<AssistantVenueCardResponse> venues = loadVenueCards(occupancyMatch);
        Origin origin = resolveOrigin(message, request);
        applyDistances(venues, origin);

        AssistantChatResponse local = fallback.answer(
                message,
                request.getCity(),
                matches,
                venues,
                assistantProperties.isLlmConfigured(),
                origin == null ? null : origin.latitude(),
                origin == null ? null : origin.longitude()
        );

        if (!assistantProperties.isLlmConfigured() || "TRAINED".equals(local.getSource())) {
            return local;
        }

        return grokClient.complete(systemPrompt(), userPrompt(message, request, matches, venues))
                .map(plan -> mergeGrok(plan, local, matches, venues))
                .orElse(local);
    }

    private AssistantChatResponse mergeGrok(
            XaiGrokClient.GrokPlan plan,
            AssistantChatResponse local,
            List<AssistantMatchCardResponse> catalogMatches,
            List<AssistantVenueCardResponse> catalogVenues
    ) {
        Map<Long, AssistantMatchCardResponse> matchById = catalogMatches.stream()
                .collect(Collectors.toMap(AssistantMatchCardResponse::getId, Function.identity()));
        Map<Long, AssistantVenueCardResponse> venueById = catalogVenues.stream()
                .collect(Collectors.toMap(AssistantVenueCardResponse::getId, Function.identity()));

        List<AssistantMatchCardResponse> grokMatches = plan.matchIds().stream()
                .map(matchById::get)
                .filter(Objects::nonNull)
                .limit(3)
                .toList();
        List<AssistantVenueCardResponse> grokVenues = plan.venueIds().stream()
                .map(venueById::get)
                .filter(Objects::nonNull)
                .limit(3)
                .toList();

        Long matchId = grokMatches.isEmpty()
                ? (local.getMatches().isEmpty() ? null : local.getMatches().getFirst().getId())
                : grokMatches.getFirst().getId();
        if (matchId != null) {
            for (AssistantVenueCardResponse venue : grokVenues) {
                venue.setMatchId(matchId);
            }
        }

        List<String> suggestions = plan.suggestions() == null || plan.suggestions().isEmpty()
                ? local.getSuggestions()
                : plan.suggestions().stream().limit(4).toList();

        return AssistantChatResponse.builder()
                .reply(StringUtils.hasText(plan.reply()) ? plan.reply() : local.getReply())
                .source("GROK")
                .intent(local.getIntent())
                .llmEnabled(true)
                .matches(grokMatches.isEmpty() ? local.getMatches() : grokMatches)
                .venues(grokVenues.isEmpty() ? local.getVenues() : grokVenues)
                .suggestions(suggestions)
                .build();
    }

    private List<AssistantMatchCardResponse> loadMatchCards() {
        List<AssistantMatchCardResponse> upcoming = matchService.findUpcoming().stream()
                .map(summary -> AssistantMatchCardResponse.builder()
                        .id(summary.getId())
                        .homeTeam(summary.getHomeTeam())
                        .awayTeam(summary.getAwayTeam())
                        .label(summary.getHomeTeam() + " vs " + summary.getAwayTeam())
                        .status(summary.getStatus())
                        .matchDate(summary.getMatchDate())
                        .city(summary.getCity())
                        .venueName(summary.getVenueName())
                        .roundLabel(summary.getRoundLabel())
                        .homeScore(summary.getHomeScore())
                        .awayScore(summary.getAwayScore())
                        .matchMinute(summary.getMatchMinute())
                        .build())
                .toList();
        if (!upcoming.isEmpty()) {
            return upcoming;
        }
        return footballMatchRepository.findByStatusInOrderByMatchDateAsc(
                        List.of(MatchStatus.LIVE, MatchStatus.SCHEDULED)
                ).stream()
                .limit(8)
                .map(this::toMatchCard)
                .toList();
    }

    private FootballMatch resolveOccupancyMatch(Long requestedMatchId, List<AssistantMatchCardResponse> matches) {
        if (requestedMatchId != null) {
            return footballMatchRepository.findById(requestedMatchId).orElse(null);
        }
        if (matches.isEmpty()) {
            return null;
        }
        return footballMatchRepository.findById(matches.getFirst().getId()).orElse(null);
    }

    private List<AssistantVenueCardResponse> loadVenueCards(FootballMatch match) {
        List<Business> businesses = businessRepository.findByStatusOrderByNameAsc(BusinessStatus.APPROVED);
        List<AssistantVenueCardResponse> cards = new ArrayList<>();
        for (Business business : businesses) {
            int capacity = Math.max(business.getTotalCapacity(), 1);
            int occupied = 0;
            if (match != null) {
                occupied = reservationRepository.sumPartySizeByBusinessAndMatchAndStatusIn(
                        business.getId(), match.getId(), OCCUPIED_STATUSES);
            }
            occupied = Math.min(occupied, capacity);
            double pct = OccupancyEngine.percentage(occupied, capacity);
            OccupancyLevel level = OccupancyEngine.level(pct);
            cards.add(AssistantVenueCardResponse.builder()
                    .id(business.getId())
                    .name(business.getName())
                    .city(business.getCity())
                    .address(business.getAddress())
                    .capacity(capacity)
                    .availableSeats(Math.max(0, capacity - occupied))
                    .occupancyPct(pct)
                    .occupancyLevel(level)
                    .reason(level == OccupancyLevel.GREEN
                            ? "Encore de la place"
                            : level == OccupancyLevel.ORANGE
                            ? "Affluence modérée"
                            : "Presque complet")
                    .matchId(match != null ? match.getId() : null)
                    .latitude(business.getLatitude() != null ? business.getLatitude().doubleValue() : null)
                    .longitude(business.getLongitude() != null ? business.getLongitude().doubleValue() : null)
                    .build());
        }
        return cards;
    }

    private AssistantMatchCardResponse toMatchCard(FootballMatch match) {
        return AssistantMatchCardResponse.builder()
                .id(match.getId())
                .homeTeam(match.getHomeTeam())
                .awayTeam(match.getAwayTeam())
                .label(match.getHomeTeam() + " vs " + match.getAwayTeam())
                .status(match.getStatus())
                .matchDate(match.getMatchDate())
                .city(match.getCity())
                .venueName(match.getVenueName())
                .roundLabel(match.getRoundLabel())
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore())
                .matchMinute(match.getMatchMinute())
                .build();
    }

    private String systemPrompt() {
        return """
                Tu es FanBot, l'assistant officiel de FanConnect 2030 (Maroc, Espagne, Portugal).
                Tu aides les fans à trouver un match de Coupe du Monde et un café / restaurant partenaire
                pour le regarder, en tenant compte de l'affluence.
                Réponds TOUJOURS en français, 3 à 6 phrases max, ton chaleureux et concret.
                Tu ne inventes JAMAIS un café ou un match : utilise uniquement le catalogue JSON fourni.
                Réponds UNIQUEMENT en JSON UTF-8, sans markdown :
                {"reply":"...","matchIds":[...],"venueIds":[...],"suggestions":["...","..."]}
                - matchIds / venueIds : identifiants numériques du catalogue, 0 à 3 chacun.
                - Prefère un match LIVE, sinon le prochain match de l'équipe demandée.
                - Prefère un café GREEN (calme), puis ORANGE. Évite RED sauf si le fan insiste.
                - Si le fan demande le plus proche, trie par distanceKm croissant.
                - Si une ville n'a aucun café dans le catalogue (ex. Oualidia), dis-le clairement
                  et propose le café le plus proche avec sa distance. N'invente jamais un café.
                """;
    }

    private String userPrompt(
            String message,
            AssistantChatRequest request,
            List<AssistantMatchCardResponse> matches,
            List<AssistantVenueCardResponse> venues
    ) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Question du fan: ").append(message).append("\n");
        if (StringUtils.hasText(request.getCity())) {
            prompt.append("Ville indiquée: ").append(request.getCity()).append("\n");
        }
        if (request.getLatitude() != null && request.getLongitude() != null) {
            prompt.append("GPS fan: ").append(request.getLatitude()).append(",")
                    .append(request.getLongitude()).append("\n");
        }
        prompt.append("Catalogue matchs:\n");
        for (AssistantMatchCardResponse match : matches.stream().limit(8).toList()) {
            prompt.append("- id=").append(match.getId())
                    .append(" ").append(match.getLabel())
                    .append(" status=").append(match.getStatus())
                    .append(" ville=").append(nullToDash(match.getCity()))
                    .append(" kickoff=").append(formatKickoff(match.getMatchDate()))
                    .append("\n");
        }
        prompt.append("Catalogue cafés:\n");
        for (AssistantVenueCardResponse venue : venues.stream().limit(12).toList()) {
            prompt.append("- id=").append(venue.getId())
                    .append(" ").append(venue.getName())
                    .append(" ville=").append(venue.getCity())
                    .append(" occupation=").append(Math.round(venue.getOccupancyPct())).append("%")
                    .append(" niveau=").append(venue.getOccupancyLevel())
                    .append(" places=").append(venue.getAvailableSeats())
                    .append(" distanceKm=").append(venue.getDistanceKm() == null ? "?" : venue.getDistanceKm())
                    .append("\n");
        }
        return prompt.toString();
    }

    private String formatKickoff(Instant instant) {
        if (instant == null) {
            return "?";
        }
        return KICKOFF.format(instant.atZone(PARIS));
    }

    private String nullToDash(String value) {
        return StringUtils.hasText(value) ? value : "-";
    }

    private Origin resolveOrigin(String message, AssistantChatRequest request) {
        if (request.getLatitude() != null && request.getLongitude() != null) {
            return new Origin(request.getLatitude(), request.getLongitude());
        }
        AssistantGeoCatalog.City city = AssistantGeoCatalog.findInText(message);
        if (city == null) {
            city = AssistantGeoCatalog.byName(request.getCity());
        }
        if (city == null) {
            return null;
        }
        return new Origin(city.latitude(), city.longitude());
    }

    private void applyDistances(List<AssistantVenueCardResponse> venues, Origin origin) {
        if (origin == null || venues == null) {
            return;
        }
        for (AssistantVenueCardResponse venue : venues) {
            if (venue.getLatitude() == null || venue.getLongitude() == null) {
                continue;
            }
            venue.setDistanceKm(GeoUtils.distanceKm(
                    origin.latitude(),
                    origin.longitude(),
                    venue.getLatitude(),
                    venue.getLongitude()
            ));
        }
    }

    private record Origin(double latitude, double longitude) {
    }
}
