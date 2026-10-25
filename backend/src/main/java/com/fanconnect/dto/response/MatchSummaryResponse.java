package com.fanconnect.dto.response;

import com.fanconnect.model.enums.CompetitionCategory;
import com.fanconnect.model.enums.MatchStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchSummaryResponse {

    private Long id;
    private String competition;
    private Long competitionId;
    private String competitionName;
    private CompetitionCategory competitionCategory;
    private String groupName;
    private String roundLabel;
    private String homeTeam;
    private String awayTeam;
    private Instant matchDate;
    private String venueName;
    private String city;
    private MatchStatus status;
    private Integer homeScore;
    private Integer awayScore;
    private Integer matchMinute;
    private String externalId;
    private Long secondsUntilKickoff;
}