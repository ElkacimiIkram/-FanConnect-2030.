package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchTeamDetailResponse {

    private String name;
    private String shortName;
    private String crest;
    private String coachName;
    private String formation;
    private List<MatchLineupPlayerResponse> lineup;
    private List<MatchLineupPlayerResponse> bench;
    private Map<String, Integer> statistics;
}