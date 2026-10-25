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
public class WorldCupTeamResponse {

    private String name;
    private String shortName;
    private String crestUrl;
    private String flagCode;
    private String groupName;
    private Integer fifaRanking;
    private String coach;
    private List<MatchFeedItemResponse> upcomingMatches;
    private List<MatchFeedItemResponse> recentResults;
}