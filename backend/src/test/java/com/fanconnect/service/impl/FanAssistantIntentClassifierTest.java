package com.fanconnect.service.impl;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FanAssistantIntentClassifierTest {

    @Test
    void classifiesFrequentAndTypoQuestions() {
        assertEquals(FanAssistantIntent.NEAREST_CAFE,
                FanAssistantIntentClassifier.classify("quelle est cafe plus proche pour mois").intent());
        assertEquals(FanAssistantIntent.BOOKING,
                FanAssistantIntentClassifier.classify("comment reserver une table").intent());
        assertEquals(FanAssistantIntent.LIVE_MATCHES,
                FanAssistantIntentClassifier.classify("quels matchs sont en direct").intent());
        assertEquals(FanAssistantIntent.TEAM_MATCH,
                FanAssistantIntentClassifier.classify("où regarder le match du Maroc").intent());
        assertEquals(FanAssistantIntent.PAYMENT,
                FanAssistantIntentClassifier.classify("comment payer").intent());
        assertEquals(FanAssistantIntent.ABOUT,
                FanAssistantIntentClassifier.classify("c'est quoi fanconnect").intent());
        assertEquals(FanAssistantIntent.GREETING,
                FanAssistantIntentClassifier.classify("salut").intent());
        assertTrue(FanAssistantTrainingSet.size() >= 80);
    }
}
