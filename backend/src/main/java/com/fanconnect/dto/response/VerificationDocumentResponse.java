package com.fanconnect.dto.response;

import com.fanconnect.model.enums.DocumentStatus;
import com.fanconnect.model.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationDocumentResponse {

    private Long id;
    private DocumentType documentType;
    private DocumentStatus status;
    private String originalName;
    private String mimeType;
    private Long fileSizeBytes;
    private Instant uploadedAt;
    private String downloadUrl;
}