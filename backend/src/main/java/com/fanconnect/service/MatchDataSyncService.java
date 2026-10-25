package com.fanconnect.service;

import com.fanconnect.service.impl.FootballDataClient.RemoteMatch;

import java.util.List;

public interface MatchDataSyncService {

    int syncCompetition(Long competitionId);

    int syncAllActiveCompetitions();

    int upsertRemoteMatches(List<RemoteMatch> remoteMatches);

    int refreshDynamicWindow(int daysAhead);

    boolean isApiConfigured();
}