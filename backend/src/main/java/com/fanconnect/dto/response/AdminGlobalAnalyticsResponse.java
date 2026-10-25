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
public class AdminGlobalAnalyticsResponse {

    private List<AdminCityHeatmapItemResponse> cityHeatmap;
    private List<AdminPopularMatchResponse> popularMatches;
    private List<AdminTopVenueResponse> topVenues;
}