package com.fanconnect.client;

import com.fanconnect.config.AssistantProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class XaiGrokClientTest {

    private final XaiGrokClient client = new XaiGrokClient(
            new AssistantProperties(),
            new RestTemplateBuilder(),
            new ObjectMapper()
    );

    @Test
    void parsePlanReadsJsonEvenInsideMarkdownFence() {
        XaiGrokClient.GrokPlan plan = client.parsePlan("""
                ```json
                {"reply":"Va au Green Leaf","matchIds":[2,9],"venueIds":[12],"suggestions":["Matchs en direct"]}
                ```
                """);

        assertEquals("Va au Green Leaf", plan.reply());
        assertEquals(2L, plan.matchIds().getFirst());
        assertEquals(12L, plan.venueIds().getFirst());
        assertTrue(plan.suggestions().contains("Matchs en direct"));
    }

    @Test
    void parsePlanFallsBackToPlainText() {
        XaiGrokClient.GrokPlan plan = client.parsePlan("Je te conseille Casablanca.");
        assertEquals("Je te conseille Casablanca.", plan.reply());
        assertTrue(plan.matchIds().isEmpty());
    }
}
