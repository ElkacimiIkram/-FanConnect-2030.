package com.fanconnect.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "fanconnect.ai")
public class AiServiceProperties {

    private boolean enabled = true;
    private String baseUrl = "http://localhost:8000";
    private int connectTimeoutMs = 3000;
    private int readTimeoutMs = 5000;
}