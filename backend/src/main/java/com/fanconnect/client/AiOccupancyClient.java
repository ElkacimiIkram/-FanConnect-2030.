package com.fanconnect.client;

import com.fanconnect.config.AiServiceProperties;
import com.fanconnect.dto.response.OccupancyIntelligenceResponse;
import com.fanconnect.dto.response.OccupancyModelInfoResponse;
import com.fanconnect.dto.response.OccupancyPredictionResponse;
import com.fanconnect.dto.response.OccupancyTimelinePointResponse;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.OccupancyLevel;
import com.fanconnect.model.enums.OccupancyRisk;
import com.fanconnect.dto.response.OccupancyBreakdownResponse;
import com.fanconnect.util.OccupancyCalculator;
import com.fanconnect.util.OccupancyEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiOccupancyClient {

    private final AiServiceProperties properties;
    private final RestTemplateBuilder restTemplateBuilder;

    public boolean isEnabled() {
        return properties.isEnabled();
    }

    public OccupancyIntelligenceResponse predictIntelligence(
            Business business,
            FootballMatch match,
            OccupancyBreakdownResponse breakdown,
            double historicalPeakPct,
            int reservationsLastHour,
            int matchDayReservations
    ) {
        if (!properties.isEnabled()) {
            throw new RestClientException("AI service disabled");
        }

        int capacity = Math.max(business.getTotalCapacity(), 1);
        double currentPct = OccupancyEngine.percentage(breakdown.getEffectiveOccupancy(), capacity);

        Map<String, Object> body = new HashMap<>();
        body.put("businessId", business.getId());
        body.put("matchId", match.getId());
        body.put("capacity", capacity);
        body.put("currentOccupancyPct", currentPct);
        body.put("checkedInSeats", breakdown.getCheckedInSeats());
        body.put("confirmedNotCheckedIn", breakdown.getConfirmedNotCheckedIn());
        body.put("pendingReservations", breakdown.getPendingReservations());
        body.put("ownerReportFresh", breakdown.isOwnerReportFresh());
        body.put("matchImportance", resolveMatchImportance(match));
        body.put("minutesToKickoff", minutesToKickoff(match));
        body.put("hourOfDay", Instant.now().atZone(ZoneOffset.UTC).getHour());
        body.put("dayOfWeek", Instant.now().atZone(ZoneOffset.UTC).getDayOfWeek().getValue());
        body.put("historicalPeakPct", historicalPeakPct);
        body.put("reservationsLastHour", reservationsLastHour);
        body.put("matchDayReservations", matchDayReservations);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.getConnectTimeoutMs());
        requestFactory.setReadTimeout(properties.getReadTimeoutMs());

        RestTemplate restTemplate = restTemplateBuilder
                .requestFactory(() -> requestFactory)
                .build();

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(
                properties.getBaseUrl() + "/predict",
                entity,
                Map.class
        );

        if (response == null) {
            throw new RestClientException("Empty AI response");
        }

        return mapIntelligence(business, match, breakdown, response);
    }

    @SuppressWarnings("unchecked")
    private OccupancyIntelligenceResponse mapIntelligence(
            Business business,
            FootballMatch match,
            OccupancyBreakdownResponse breakdown,
            Map<String, Object> response
    ) {
        int capacity = Math.max(business.getTotalCapacity(), 1);
        double currentPct = toDouble(response.get("currentOccupancyPct"));
        double kickoffPct = toDouble(response.get("predictedKickoffPct"));

        List<Map<String, Object>> timelineRaw = (List<Map<String, Object>>) response.get("timeline");
        List<OccupancyTimelinePointResponse> timeline = timelineRaw == null ? List.of() : timelineRaw.stream()
                .map(point -> OccupancyTimelinePointResponse.builder()
                        .time(String.valueOf(point.get("time")))
                        .predictedPct(toDouble(point.get("predictedPct")))
                        .peak(Boolean.TRUE.equals(point.get("isPeak")))
                        .build())
                .toList();

        Map<String, Object> modelRaw = (Map<String, Object>) response.get("model");
        OccupancyModelInfoResponse model = modelRaw == null ? null : OccupancyModelInfoResponse.builder()
                .name(String.valueOf(modelRaw.get("name")))
                .version(String.valueOf(modelRaw.get("version")))
                .algorithm(String.valueOf(modelRaw.get("algorithm")))
                .mae(toDouble(modelRaw.get("mae")))
                .r2Score(toDouble(modelRaw.get("r2Score")))
                .trainedAt(String.valueOf(modelRaw.get("trainedAt")))
                .sampleCount(toInt(modelRaw.get("sampleCount")))
                .build();

        OccupancyRisk risk = parseRisk(String.valueOf(response.get("riskLevel")));

        return OccupancyIntelligenceResponse.builder()
                .businessId(business.getId())
                .businessName(business.getName())
                .matchId(match.getId())
                .matchLabel(match.getHomeTeam() + " vs " + match.getAwayTeam())
                .capacity(capacity)
                .availableSeats(Math.max(0, capacity - breakdown.getEffectiveOccupancy()))
                .currentOccupancyPct(currentPct)
                .currentLevel(OccupancyEngine.level(currentPct))
                .predicted1hPct(toDouble(response.get("predicted1hPct")))
                .predicted2hPct(toDouble(response.get("predicted2hPct")))
                .predictedKickoffPct(kickoffPct)
                .expectedFullAt(response.get("expectedFullAt") != null
                        ? String.valueOf(response.get("expectedFullAt")) : null)
                .confidencePct(toDouble(response.get("confidencePct")))
                .riskLevel(risk)
                .predictedLevelAtKickoff(OccupancyCalculator.resolveLevel(kickoffPct))
                .recommendation(String.valueOf(response.get("recommendation")))
                .source(String.valueOf(response.getOrDefault("source", "ML")))
                .timeline(timeline)
                .model(model)
                .breakdown(breakdown)
                .build();
    }

    public OccupancyPredictionResponse toPredictionResponse(OccupancyIntelligenceResponse intelligence) {
        return OccupancyPredictionResponse.builder()
                .projectedPeakPercent(intelligence.getPredictedKickoffPct())
                .fullRisk(intelligence.getRiskLevel())
                .predictedLevelAtKickoff(intelligence.getPredictedLevelAtKickoff())
                .predicted1hPercent(intelligence.getPredicted1hPct())
                .predicted2hPercent(intelligence.getPredicted2hPct())
                .expectedFullAt(intelligence.getExpectedFullAt())
                .confidencePercent(intelligence.getConfidencePct())
                .recommendation(intelligence.getRecommendation())
                .source(intelligence.getSource())
                .timeline(intelligence.getTimeline())
                .model(intelligence.getModel())
                .build();
    }

    private double resolveMatchImportance(FootballMatch match) {
        String competition = match.getCompetition() != null ? match.getCompetition().toLowerCase() : "";
        if (competition.contains("world cup") || competition.contains("coupe du monde")) {
            return 1.0;
        }
        return 0.6;
    }

    private long minutesToKickoff(FootballMatch match) {
        if (match.getMatchDate() == null) {
            return 240;
        }
        return Math.max(0, Duration.between(Instant.now(), match.getMatchDate()).toMinutes());
    }

    private OccupancyRisk parseRisk(String value) {
        try {
            return OccupancyRisk.valueOf(value);
        } catch (Exception ex) {
            return OccupancyRisk.MEDIUM;
        }
    }

    private double toDouble(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return Double.parseDouble(String.valueOf(value));
    }

    private int toInt(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(String.valueOf(value));
    }
}