package com.fanconnect.config;

import com.fanconnect.service.DemoMatchSeedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
@RequiredArgsConstructor
@Slf4j
public class DemoMatchDataInitializer implements ApplicationRunner {

    private final DemoMatchSeedService demoMatchSeedService;

    @Override
    public void run(ApplicationArguments args) {
        try {
            demoMatchSeedService.seedDemoMatches();
        } catch (Exception ex) {
            log.warn("Impossible de semer les matchs de démo: {}", ex.getMessage());
        }
    }
}
