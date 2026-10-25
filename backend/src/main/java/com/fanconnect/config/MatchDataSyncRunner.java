package com.fanconnect.config;

import com.fanconnect.service.MatchDataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchDataSyncRunner implements ApplicationRunner {

    private final MatchDataSyncService matchDataSyncService;

    @Value("${fanconnect.football.sync-on-startup:true}")
    private boolean syncOnStartup;

    @Override
    public void run(ApplicationArguments args) {
        if (!syncOnStartup) {
            return;
        }
        if (!matchDataSyncService.isApiConfigured()) {
            log.warn(
                    "FOOTBALL_DATA_API_KEY non configurée — le Match Center n'affichera pas de données live. "
                            + "Obtenez une clé gratuite sur https://www.football-data.org/"
            );
            return;
        }
        log.info("Synchronisation des matchs depuis football-data.org au démarrage...");
        matchDataSyncService.syncAllActiveCompetitions();
    }
}