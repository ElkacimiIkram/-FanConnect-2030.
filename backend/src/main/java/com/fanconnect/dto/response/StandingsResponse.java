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
public class StandingsResponse {

    private String competitionCode;
    private String competitionName;
    private String season;
    private List<StandingRowResponse> table;
    private List<GroupStandingResponse> groups;
}