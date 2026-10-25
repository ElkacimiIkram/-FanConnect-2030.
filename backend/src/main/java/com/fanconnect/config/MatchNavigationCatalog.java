package com.fanconnect.config;

import com.fanconnect.dto.response.MatchNavigationItemResponse;
import com.fanconnect.dto.response.MatchNavigationSectionResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MatchNavigationCatalog {

    private final WorldCupCompetitionScope worldCupScope;

    public MatchNavigationCatalog(WorldCupCompetitionScope worldCupScope) {
        this.worldCupScope = worldCupScope;
    }

    public List<MatchNavigationSectionResponse> getSections() {
        return List.of(
                section("world-cup", "COUPE DU MONDE FIFA", List.of(
                        item(
                                WorldCupCompetitionScope.NAV_ALL,
                                "Toutes les Coupes du Monde",
                                List.of(WorldCupCompetitionScope.API_CODE_WC),
                                null,
                                "International",
                                false
                        ),
                        item(
                                WorldCupCompetitionScope.NAV_WC_2026,
                                "Coupe du Monde 2026",
                                List.of(WorldCupCompetitionScope.API_CODE_WC),
                                null,
                                "USA · Canada · Mexique",
                                true
                        ),
                        item(
                                WorldCupCompetitionScope.NAV_WC_2030,
                                "Coupe du Monde 2030",
                                List.of(),
                                null,
                                "Maroc · Espagne · Portugal",
                                false
                        )
                ))
        );
    }

    public MatchNavigationItemResponse findItem(String navId) {
        String normalized = worldCupScope.normalizeNav(navId);
        if (WorldCupCompetitionScope.NAV_ALL.equals(normalized)) {
            return null;
        }
        return getSections().stream()
                .flatMap(section -> section.getItems().stream())
                .filter(item -> item.getId().equals(normalized))
                .findFirst()
                .orElse(null);
    }

    private MatchNavigationSectionResponse section(String id, String title, List<MatchNavigationItemResponse> items) {
        return MatchNavigationSectionResponse.builder()
                .id(id)
                .title(title)
                .items(items)
                .build();
    }

    private MatchNavigationItemResponse item(
            String id,
            String label,
            List<String> codes,
            String areaCode,
            String areaName,
            boolean standings
    ) {
        return MatchNavigationItemResponse.builder()
                .id(id)
                .label(label)
                .competitionCodes(codes)
                .areaCode(areaCode)
                .areaName(areaName)
                .standingsAvailable(standings)
                .build();
    }
}