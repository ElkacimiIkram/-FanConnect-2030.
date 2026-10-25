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
public class CompetitionMatchGroupResponse {

    private String competitionCode;
    private String competitionName;
    private String competitionEmblem;
    private String areaName;
    private String areaCode;
    private String groupLabel;
    private List<MatchFeedItemResponse> matches;
}