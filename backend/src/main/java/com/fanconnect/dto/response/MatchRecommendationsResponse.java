package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchRecommendationsResponse {

    private Long matchId;
    private String matchLabel;
    private String userCity;
    private Double searchRadiusKm;
    private boolean radiusExpanded;
    private boolean geoEnabled;
    private List<VenueRecommendationResponse> recommendations;
}