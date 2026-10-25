package com.fanconnect.controller;

import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.VerificationDocumentFile;
import com.fanconnect.dto.response.VerificationDocumentResponse;
import com.fanconnect.dto.response.VerificationStatusResponse;
import com.fanconnect.model.enums.DocumentType;
import com.fanconnect.service.VerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/owner/businesses/{businessId}/verification")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BUSINESS_OWNER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Owner Verification", description = "Business verification documents")
public class OwnerVerificationController {

    private final VerificationService verificationService;

    @GetMapping
    @Operation(summary = "Get verification status and documents")
    public ResponseEntity<ApiResponse<VerificationStatusResponse>> status(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success(verificationService.getVerificationStatus(businessId)));
    }

    @GetMapping("/documents")
    @Operation(summary = "List verification documents")
    public ResponseEntity<ApiResponse<List<VerificationDocumentResponse>>> list(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success(verificationService.listDocuments(businessId)));
    }

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a verification document")
    public ResponseEntity<ApiResponse<VerificationDocumentResponse>> upload(
            @PathVariable Long businessId,
            @RequestParam DocumentType type,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Document téléchargé",
                verificationService.uploadDocument(businessId, type, file)
        ));
    }

    @DeleteMapping("/documents/{documentId}")
    @Operation(summary = "Delete a verification document")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long businessId,
            @PathVariable Long documentId
    ) {
        verificationService.deleteDocument(businessId, documentId);
        return ResponseEntity.ok(ApiResponse.success("Document supprimé", null));
    }

    @GetMapping("/documents/{documentId}/file")
    @Operation(summary = "Download verification document")
    public ResponseEntity<org.springframework.core.io.Resource> download(
            @PathVariable Long businessId,
            @PathVariable Long documentId
    ) {
        VerificationDocumentFile file = verificationService.loadDocumentForOwner(businessId, documentId);
        MediaType mediaType = StringUtils.hasText(file.mimeType())
                ? MediaType.parseMediaType(file.mimeType())
                : MediaType.APPLICATION_OCTET_STREAM;
        String disposition = "inline; filename=\"" + sanitizeFilename(file.originalName()) + "\"";

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(file.resource());
    }

    private String sanitizeFilename(String filename) {
        if (!StringUtils.hasText(filename)) {
            return "document";
        }
        return filename.replace("\"", "'");
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit business for admin verification")
    public ResponseEntity<ApiResponse<VerificationStatusResponse>> submit(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Dossier soumis pour validation",
                verificationService.submitForVerification(businessId)
        ));
    }
}