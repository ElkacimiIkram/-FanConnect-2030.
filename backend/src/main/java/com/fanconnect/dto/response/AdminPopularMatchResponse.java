package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPopularMatchResponse {

    private Long matchId;
    private String homeTeam;
    private String awayTeam;
    private String competition;
    private int reservationCount;
    private int totalPartySize;
}