package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchCenterResponse {

    private List<CompetitionMatchesResponse> competitions;
    private boolean liveDataEnabled;
    private boolean apiConfigured;
    private Instant lastSyncedAt;
    private int liveMatchCount;
}