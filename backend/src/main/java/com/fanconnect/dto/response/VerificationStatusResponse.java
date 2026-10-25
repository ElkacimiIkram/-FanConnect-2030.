package com.fanconnect.dto.response;

import com.fanconnect.model.enums.BusinessStatus;
import com.fanconnect.model.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationStatusResponse {

    private Long businessId;
    private BusinessStatus status;
    private boolean verificationComplete;
    private Instant verificationSubmittedAt;
    private String rejectionReason;
    private Map<DocumentType, Boolean> requiredDocumentsPresent;
    private List<VerificationDocumentResponse> documents;
    private boolean readyToSubmit;
}