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
public class MatchNavigationItemResponse {

    private String id;
    private String label;
    private List<String> competitionCodes;
    private String areaCode;
    private String areaName;
    private boolean standingsAvailable;
}