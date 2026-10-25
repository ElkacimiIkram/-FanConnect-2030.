package com.fanconnect.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "fanconnect.upload")
public class UploadProperties {

    private String baseDir = "uploads";
    private long maxFileSizeBytes = 5 * 1024 * 1024;
}