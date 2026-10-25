package com.fanconnect.dto.request;

import com.fanconnect.model.enums.MatchStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMatchRequest {

    @Size(max = 100)
    private String competition;

    @Size(max = 100)
    private String homeTeam;

    @Size(max = 100)
    private String awayTeam;

    private Instant matchDate;

    @Size(max = 150)
    private String venueName;

    @Size(max = 100)
    private String city;

    private MatchStatus status;

    @Size(max = 50)
    private String externalId;

    private Long competitionId;

    @Size(max = 50)
    private String groupName;

    @Size(max = 100)
    private String roundLabel;

    private Integer homeScore;

    private Integer awayScore;

    private Integer matchMinute;
}