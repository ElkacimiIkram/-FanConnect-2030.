package com.fanconnect.client;

import com.fanconnect.config.AssistantProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class XaiGrokClient {

    private final AssistantProperties properties;
    private final RestTemplateBuilder restTemplateBuilder;
    private final ObjectMapper objectMapper;

    public Optional<GrokPlan> complete(String systemPrompt, String userPrompt) {
        if (!properties.isLlmConfigured()) {
            return Optional.empty();
        }

        try {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(Duration.ofMillis(Math.min(properties.getTimeoutMs(), 4000)));
            requestFactory.setReadTimeout(Duration.ofMillis(properties.getTimeoutMs()));

            RestTemplate restTemplate = restTemplateBuilder
                    .requestFactory(() -> requestFactory)
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(properties.getXaiApiKey().trim());

            Map<String, Object> body = Map.of(
                    "model", properties.getModel(),
                    "temperature", 0.3,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    )
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    trimSlash(properties.getXaiBaseUrl()) + "/chat/completions",
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            String content = extractContent(response);
            if (content == null || content.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(parsePlan(content));
        } catch (Exception ex) {
            log.warn("Grok assistant unavailable: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    GrokPlan parsePlan(String content) {
        String json = extractJson(content);
        try {
            JsonNode root = objectMapper.readTree(json);
            String reply = text(root, "reply");
            if (reply == null || reply.isBlank()) {
                reply = content.strip();
            }
            return new GrokPlan(reply, longIds(root, "matchIds"), longIds(root, "venueIds"), stringList(root, "suggestions"));
        } catch (Exception ex) {
            return new GrokPlan(content.strip(), List.of(), List.of(), List.of());
        }
    }

    private String extractContent(Map<String, Object> response) {
        if (response == null) {
            return null;
        }
        Object outputText = response.get("output_text");
        if (outputText instanceof String text && !text.isBlank()) {
            return text;
        }
        Object choices = response.get("choices");
        if (choices instanceof List<?> list && !list.isEmpty() && list.getFirst() instanceof Map<?, ?> first) {
            Object message = first.get("message");
            if (message instanceof Map<?, ?> msg && msg.get("content") instanceof String content) {
                return content;
            }
        }
        return null;
    }

    private String extractJson(String content) {
        String trimmed = content.strip();
        if (trimmed.startsWith("```")) {
            int start = trimmed.indexOf('{');
            int end = trimmed.lastIndexOf('}');
            if (start >= 0 && end > start) {
                return trimmed.substring(start, end + 1);
            }
        }
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }

    private List<Long> longIds(JsonNode root, String field) {
        JsonNode node = root.get(field);
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<Long> ids = new java.util.ArrayList<>();
        node.forEach(item -> {
            if (item.isNumber()) {
                ids.add(item.longValue());
            }
        });
        return ids;
    }

    private List<String> stringList(JsonNode root, String field) {
        JsonNode node = root.get(field);
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<String> values = new java.util.ArrayList<>();
        node.forEach(item -> {
            if (item.isTextual() && !item.asText().isBlank()) {
                values.add(item.asText());
            }
        });
        return values;
    }

    private String text(JsonNode root, String field) {
        JsonNode node = root.get(field);
        return node == null || node.isNull() ? null : node.asText();
    }

    private String trimSlash(String url) {
        if (url.endsWith("/")) {
            return url.substring(0, url.length() - 1);
        }
        return url;
    }

    public record GrokPlan(
            String reply,
            List<Long> matchIds,
            List<Long> venueIds,
            List<String> suggestions
    ) {
    }
}
