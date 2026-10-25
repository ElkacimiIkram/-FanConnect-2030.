package com.fanconnect.service.impl;

import com.fanconnect.dto.response.AssistantChatResponse;
import com.fanconnect.dto.response.AssistantMatchCardResponse;
import com.fanconnect.dto.response.AssistantVenueCardResponse;
import com.fanconnect.model.enums.MatchStatus;
import com.fanconnect.model.enums.OccupancyLevel;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FanAssistantFallbackTest {

    private final FanAssistantFallback fallback = new FanAssistantFallback();

    @Test
    void prefersLiveMoroccoMatchAndQuietCasablancaVenue() {
        AssistantChatResponse response = fallback.answer(
                "Où regarder le Maroc à Casablanca sans trop de monde ?",
                null,
                List.of(
                        match(1L, "France", "Allemagne", MatchStatus.SCHEDULED),
                        match(2L, "Maroc", "Espagne", MatchStatus.LIVE),
                        match(3L, "Portugal", "France", MatchStatus.SCHEDULED)
                ),
                List.of(
                        venue(10L, "Rooftop Rabat", "Rabat", 40, OccupancyLevel.GREEN),
                        venue(11L, "Casa Packed", "Casablanca", 92, OccupancyLevel.RED),
                        venue(12L, "Green Leaf Café", "Casablanca", 28, OccupancyLevel.GREEN)
                ),
                false
        );

        assertEquals("FALLBACK", response.getSource());
        assertEquals(2L, response.getMatches().getFirst().getId());
        assertEquals(12L, response.getVenues().getFirst().getId());
        assertTrue(response.getReply().contains("Maroc"));
        assertTrue(response.getReply().contains("Green Leaf"));
        assertEquals(2L, response.getVenues().getFirst().getMatchId());
    }

    @Test
    void liveFilterReturnsOnlyLiveMatchesWhenAsked() {
        List<AssistantMatchCardResponse> selected = fallback.selectMatches(
                List.of(
                        match(1L, "Maroc", "Espagne", MatchStatus.SCHEDULED),
                        match(2L, "Portugal", "France", MatchStatus.LIVE)
                ),
                null,
                true
        );

        assertEquals(1, selected.size());
        assertEquals(2L, selected.getFirst().getId());
    }

    @Test
    void oualidiaHasNoPartnerAndPicksNearestByDistance() {
        AssistantChatResponse response = fallback.answer(
                "quel est le café le plus proche à Oualidia ?",
                null,
                List.of(match(2L, "Maroc", "Espagne", MatchStatus.LIVE)),
                List.of(
                        venue(10L, "Rooftop Rabat", "Rabat", 10, OccupancyLevel.GREEN, 250.0),
                        venue(12L, "Green Leaf Café", "Casablanca", 28, OccupancyLevel.GREEN, 165.0)
                ),
                false,
                32.7333,
                -9.0333
        );

        assertTrue(response.getReply().toLowerCase().contains("oualidia"));
        assertTrue(response.getReply().contains("Green Leaf"));
        assertEquals(12L, response.getVenues().getFirst().getId());
        assertTrue(response.getMatches().isEmpty());
    }

    @Test
    void nearestWithoutCityOrGpsAsksForLocation() {
        AssistantChatResponse response = fallback.answer(
                "quelle est cafe plus proche pour moi",
                null,
                List.of(match(2L, "Maroc", "Espagne", MatchStatus.LIVE)),
                List.of(venue(12L, "Green Leaf Café", "Casablanca", 28, OccupancyLevel.GREEN)),
                false
        );

        assertTrue(response.getReply().toLowerCase().contains("ville"));
        assertTrue(response.getReply().toLowerCase().contains("oualidia"));
    }

    @Test
    void trainedBookingQuestionDoesNotDumpARandomCafe() {
        AssistantChatResponse response = fallback.answer(
                "comment réserver une table ?",
                null,
                List.of(match(2L, "Maroc", "Espagne", MatchStatus.LIVE)),
                List.of(venue(12L, "Green Leaf Café", "Casablanca", 28, OccupancyLevel.GREEN)),
                false
        );

        assertEquals("TRAINED", response.getSource());
        assertEquals("BOOKING", response.getIntent());
        assertTrue(response.getVenues().isEmpty());
        assertTrue(response.getReply().toLowerCase().contains("réserver")
                || response.getReply().toLowerCase().contains("reserver"));
    }

    @Test
    void emptyCatalogExplainsThereIsNothingToShow() {
        AssistantChatResponse response = fallback.answer(
                "matchs en direct",
                null,
                List.of(),
                List.of(),
                false
        );

        assertTrue(response.getMatches().isEmpty());
        assertTrue(response.getVenues().isEmpty());
        assertFalse(response.getReply().isBlank());
    }

    private AssistantMatchCardResponse match(Long id, String home, String away, MatchStatus status) {
        return AssistantMatchCardResponse.builder()
                .id(id)
                .homeTeam(home)
                .awayTeam(away)
                .label(home + " vs " + away)
                .status(status)
                .matchDate(Instant.now())
                .city("Rabat")
                .build();
    }

    private AssistantVenueCardResponse venue(
            Long id,
            String name,
            String city,
            double occupancyPct,
            OccupancyLevel level
    ) {
        return venue(id, name, city, occupancyPct, level, null);
    }

    private AssistantVenueCardResponse venue(
            Long id,
            String name,
            String city,
            double occupancyPct,
            OccupancyLevel level,
            Double distanceKm
    ) {
        return AssistantVenueCardResponse.builder()
                .id(id)
                .name(name)
                .city(city)
                .occupancyPct(occupancyPct)
                .occupancyLevel(level)
                .availableSeats(40)
                .capacity(80)
                .distanceKm(distanceKm)
                .build();
    }
}
