package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchCalendarResponse {

    private LocalDate month;
    private String monthLabel;
    private boolean apiConfigured;
    private String activeNavId;
    private int totalMatches;
    private List<MatchCalendarDayResponse> days;
}