package com.fanconnect.controller;

import com.fanconnect.dto.request.RejectBusinessRequest;
import com.fanconnect.dto.response.AdminVerificationDetailResponse;
import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.BusinessDetailResponse;
import com.fanconnect.dto.response.BusinessSummaryResponse;
import com.fanconnect.dto.response.VerificationDocumentFile;
import com.fanconnect.service.BusinessService;
import com.fanconnect.service.VerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/verifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Verification", description = "Business verification center")
public class AdminVerificationController {

    private final VerificationService verificationService;
    private final BusinessService businessService;

    @GetMapping("/pending")
    @Operation(summary = "List businesses pending verification review")
    public ResponseEntity<ApiResponse<List<BusinessSummaryResponse>>> pending() {
        return ResponseEntity.ok(ApiResponse.success(verificationService.listPendingVerifications()));
    }

    @GetMapping("/{businessId}")
    @Operation(summary = "Get full verification dossier")
    public ResponseEntity<ApiResponse<AdminVerificationDetailResponse>> detail(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success(verificationService.getAdminVerificationDetail(businessId)));
    }

    @GetMapping("/{businessId}/documents/{documentId}/file")
    @Operation(summary = "Download verification document (admin)")
    public ResponseEntity<org.springframework.core.io.Resource> download(
            @PathVariable Long businessId,
            @PathVariable Long documentId
    ) {
        VerificationDocumentFile file = verificationService.loadDocumentForAdmin(businessId, documentId);
        MediaType mediaType = resolveMediaType(file.mimeType());
        String disposition = "inline; filename=\"" + sanitizeFilename(file.originalName()) + "\"";

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(file.resource());
    }

    private MediaType resolveMediaType(String mimeType) {
        if (StringUtils.hasText(mimeType)) {
            return MediaType.parseMediaType(mimeType);
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private String sanitizeFilename(String filename) {
        if (!StringUtils.hasText(filename)) {
            return "document";
        }
        return filename.replace("\"", "'");
    }

    @PutMapping("/{businessId}/approve")
    @Operation(summary = "Approve verified business")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> approve(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Établissement approuvé",
                businessService.approveBusiness(businessId)
        ));
    }

    @PutMapping("/{businessId}/reject")
    @Operation(summary = "Reject business verification")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> reject(
            @PathVariable Long businessId,
            @Valid @RequestBody RejectBusinessRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Établissement rejeté",
                businessService.rejectBusiness(businessId, request)
        ));
    }
}