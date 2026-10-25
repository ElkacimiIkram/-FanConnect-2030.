package com.fanconnect.dto.response;

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
public class AssistantMatchCardResponse {

    private Long id;
    private String homeTeam;
    private String awayTeam;
    private String label;
    private MatchStatus status;
    private Instant matchDate;
    private String city;
    private String venueName;
    private String roundLabel;
    private Integer homeScore;
    private Integer awayScore;
    private Integer matchMinute;
}
