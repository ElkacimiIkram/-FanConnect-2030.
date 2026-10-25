package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchGoalResponse {

    private Integer minute;
    private String type;
    private String teamName;
    private String scorerName;
    private String assistName;
    private Integer homeScore;
    private Integer awayScore;
}