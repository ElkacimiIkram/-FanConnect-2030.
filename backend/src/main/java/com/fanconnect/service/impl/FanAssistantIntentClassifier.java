package com.fanconnect.service.impl;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Lightweight intent model trained on {@link FanAssistantTrainingSet}:
 * token overlap + Jaccard vote across annotated questions.
 */
final class FanAssistantIntentClassifier {

    private static final Set<String> STOPWORDS = Set.of(
            "le", "la", "les", "un", "une", "des", "du", "de", "d",
            "je", "tu", "il", "on", "nous", "vous", "me", "moi", "mon", "ma",
            "est", "es", "a", "à", "au", "aux", "en", "et", "ou", "où",
            "pour", "par", "avec", "dans", "sur", "ce", "cet", "cette",
            "que", "qui", "quoi", "comment", "quel", "quelle", "quels", "quelles",
            "y", "ya", "s", "l", "n", "t", "c", "ca", "ça"
    );

    private static final double MIN_SCORE = 0.22;

    private FanAssistantIntentClassifier() {
    }

    static ScoredIntent classify(String rawMessage) {
        String normalized = AssistantGeoCatalog.normalize(rawMessage);
        if (normalized.isBlank()) {
            return new ScoredIntent(FanAssistantIntent.HELP, 1.0);
        }

        Set<String> queryTokens = tokens(normalized);
        if (queryTokens.isEmpty()) {
            return new ScoredIntent(FanAssistantIntent.UNKNOWN, 0);
        }

        Map<FanAssistantIntent, Double> votes = new EnumMap<>(FanAssistantIntent.class);
        double bestExact = 0;

        for (FanAssistantTrainingSet.Example example : FanAssistantTrainingSet.examples()) {
            String exampleNorm = AssistantGeoCatalog.normalize(example.question());
            if (normalized.equals(exampleNorm) || normalized.contains(exampleNorm) && exampleNorm.length() >= 8) {
                votes.merge(example.intent(), 1.15, Double::sum);
                bestExact = Math.max(bestExact, 1.15);
                continue;
            }
            Set<String> exampleTokens = tokens(exampleNorm);
            if (exampleTokens.isEmpty()) {
                continue;
            }
            long overlap = queryTokens.stream().filter(exampleTokens::contains).count();
            if (overlap == 0) {
                continue;
            }
            Set<String> union = new LinkedHashSet<>(queryTokens);
            union.addAll(exampleTokens);
            double jaccard = overlap / (double) union.size();
            double coverage = overlap / (double) queryTokens.size();
            double score = 0.5 * jaccard + 0.5 * coverage;
            votes.merge(example.intent(), score, Double::sum);
        }

        FanAssistantIntent best = FanAssistantIntent.UNKNOWN;
        double bestVote = 0;
        for (Map.Entry<FanAssistantIntent, Double> entry : votes.entrySet()) {
            if (entry.getValue() > bestVote) {
                bestVote = entry.getValue();
                best = entry.getKey();
            }
        }

        double confidence = Math.min(1.0, bestExact > 0 ? 0.95 : bestVote / 3.0);
        if (best == FanAssistantIntent.UNKNOWN || (bestExact == 0 && confidence < MIN_SCORE)) {
            return new ScoredIntent(FanAssistantIntent.UNKNOWN, confidence);
        }
        return new ScoredIntent(best, confidence);
    }

    static Set<String> tokens(String normalized) {
        return Arrays.stream(normalized.split("[^a-z0-9]+"))
                .filter(token -> token.length() >= 2)
                .filter(token -> !STOPWORDS.contains(token))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    record ScoredIntent(FanAssistantIntent intent, double confidence) {
        boolean isKnown() {
            return intent != FanAssistantIntent.UNKNOWN;
        }

        boolean isFaq() {
            return switch (intent) {
                case GREETING, HELP, ABOUT, BOOKING, PAYMENT, TICKET, OCCUPANCY, ACCOUNT, OWNER, WORLD_CUP, CANCEL -> true;
                default -> false;
            };
        }
    }
}
