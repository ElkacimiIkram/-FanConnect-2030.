package com.fanconnect.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "fanconnect.assistant")
public class AssistantProperties {

    private boolean enabled = true;
    private String xaiApiKey = "";
    private String xaiBaseUrl = "https://api.x.ai/v1";
    private String model = "grok-4.5";
    private int timeoutMs = 12000;

    public boolean isLlmConfigured() {
        return enabled && StringUtils.hasText(xaiApiKey);
    }
}
