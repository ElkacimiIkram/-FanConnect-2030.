package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchFeedItemResponse {

    private String externalId;
    private Long localId;
    private String homeTeam;
    private String awayTeam;
    private String homeTeamCrest;
    private String awayTeamCrest;
    private Instant matchDate;
    private String status;
    private Integer homeScore;
    private Integer awayScore;
    private Integer matchMinute;
    private String groupName;
    private String roundLabel;
    private String venueName;
    private String city;
    private String country;
    private String matchImportance;
    private String homeTeamFlagCode;
    private String awayTeamFlagCode;
    private String competitionCode;
    private String competitionName;
    private String competitionEmblem;
    private String areaName;
    private String areaCode;
    private String kickoffLabel;
    private boolean bookable;
}