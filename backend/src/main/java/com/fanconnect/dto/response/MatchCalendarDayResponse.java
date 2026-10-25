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
public class MatchCalendarDayResponse {

    private LocalDate date;
    private int matchCount;
    private int liveCount;
    private int finishedCount;
    private int scheduledCount;
    private List<MatchFeedItemResponse> matches;
}