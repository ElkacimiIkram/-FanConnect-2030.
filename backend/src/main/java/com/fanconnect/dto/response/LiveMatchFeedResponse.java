package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveMatchFeedResponse {

    private LocalDate date;
    private String dateLabel;
    private boolean apiConfigured;
    private Instant fetchedAt;
    private int totalMatches;
    private int liveMatchCount;
    private int finishedMatchCount;
    private int scheduledMatchCount;
    private String activeFilter;
    private String activeSort;
    private String activeNavId;
    private List<CompetitionMatchGroupResponse> groups;
    private List<CompetitionMatchGroupResponse> liveNowGroups;
    private List<CompetitionMatchGroupResponse> upcomingGroups;
    private int refreshIntervalSeconds;
    private boolean dynamicData;
    private boolean demoMode;
    private Instant lastSyncedAt;
}