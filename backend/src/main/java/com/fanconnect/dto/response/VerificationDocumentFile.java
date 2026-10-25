package com.fanconnect.dto.response;

import org.springframework.core.io.Resource;

public record VerificationDocumentFile(
        Resource resource,
        String mimeType,
        String originalName
) {
}