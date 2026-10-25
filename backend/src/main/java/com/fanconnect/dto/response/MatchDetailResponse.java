package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchDetailResponse {

    private String externalId;
    private Long localId;
    private String status;
    private Integer matchMinute;
    private Integer injuryTime;
    private Instant matchDate;
    private String venueName;
    private String city;
    private String country;
    private String matchImportance;
    private String homeTeamFlagCode;
    private String awayTeamFlagCode;
    private Integer attendance;
    private Integer matchday;
    private String stage;
    private String groupName;
    private String competitionCode;
    private String competitionName;
    private String competitionEmblem;
    private String areaName;
    private Integer homeScore;
    private Integer awayScore;
    private Integer halfTimeHomeScore;
    private Integer halfTimeAwayScore;
    private MatchTeamDetailResponse homeTeam;
    private MatchTeamDetailResponse awayTeam;
    private List<MatchGoalResponse> goals;
    private List<MatchBookingResponse> bookings;
    private List<MatchSubstitutionResponse> substitutions;
    private String refereeName;
    private boolean bookable;
}