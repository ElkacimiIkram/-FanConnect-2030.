package com.fanconnect.service;

import com.fanconnect.dto.response.StandingsResponse;

import java.time.LocalDate;

/**
 * Seeds World Cup 2026 / 2030 demonstration matches around "now" so the Match Center,
 * booking wizard and occupancy screens stay usable when the live football API
 * has nothing to show (typical on a soutenance / demo day).
 */
public interface DemoMatchSeedService {

    /**
     * Upserts the demo fixture list. Safe to call on every startup.
     *
     * @return number of matches created or updated
     */
    int seedDemoMatches();

    /**
     * Re-seeds when today's demo window is empty, or when {@code force} is true
     * (Match Center "Actualiser" / jury reload).
     */
    int seedIfNeeded(LocalDate date, boolean force);

    StandingsResponse demoStandings(String competitionCode);

    boolean isEnabled();
}
