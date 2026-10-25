package com.fanconnect.config;

import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class WorldCupCompetitionScope {

    public static final String NAV_ALL = "all";
    public static final String NAV_WC_2026 = "wc2026";
    public static final String NAV_WC_2030 = "wc2030";

    public static final String SLUG_WC_2026 = "world-cup-2026";
    public static final String SLUG_WC_2030 = "world-cup-2030";
    public static final String API_CODE_WC = "WC";

    private static final Set<String> ALLOWED_API_CODES = Set.of(API_CODE_WC);

    public boolean isAllowedApiCompetition(String competitionCode) {
        return competitionCode != null
                && ALLOWED_API_CODES.contains(competitionCode.trim().toUpperCase());
    }

    public boolean includesApiFeed(String navId) {
        String nav = normalizeNav(navId);
        return NAV_ALL.equals(nav) || NAV_WC_2026.equals(nav);
    }

    public boolean includesLocalFeed(String navId) {
        String nav = normalizeNav(navId);
        return NAV_ALL.equals(nav) || NAV_WC_2030.equals(nav);
    }

    public String slugForNav(String navId) {
        return switch (normalizeNav(navId)) {
            case NAV_WC_2026 -> SLUG_WC_2026;
            case NAV_WC_2030 -> SLUG_WC_2030;
            default -> null;
        };
    }

    public String normalizeNav(String navId) {
        if (navId == null || navId.isBlank()) {
            return NAV_ALL;
        }
        return navId.trim().toLowerCase();
    }
}