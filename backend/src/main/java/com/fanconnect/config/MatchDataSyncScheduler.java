package com.fanconnect.config;

import com.fanconnect.service.MatchDataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchDataSyncScheduler {

    private final MatchDataSyncService matchDataSyncService;

    @Value("${fanconnect.football.sync-enabled:true}")
    private boolean syncEnabled;

    @Scheduled(fixedDelayString = "${fanconnect.football.live-sync-interval-ms:60000}")
    public void syncLiveWindow() {
        if (!syncEnabled || !matchDataSyncService.isApiConfigured()) {
            return;
        }
        int synced = matchDataSyncService.refreshDynamicWindow(7);
        log.debug("Live window sync: {} match(es) updated", synced);
    }

    @Scheduled(fixedDelayString = "${fanconnect.football.sync-interval-ms:300000}")
    public void syncFullCompetitions() {
        if (!syncEnabled || !matchDataSyncService.isApiConfigured()) {
            return;
        }
        log.debug("Scheduled full football match sync started");
        matchDataSyncService.syncAllActiveCompetitions();
    }
}