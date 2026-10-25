package com.fanconnect.service;

import com.fanconnect.dto.response.AdminVerificationDetailResponse;
import com.fanconnect.dto.response.BusinessSummaryResponse;
import com.fanconnect.dto.response.VerificationDocumentFile;
import com.fanconnect.dto.response.VerificationDocumentResponse;
import com.fanconnect.dto.response.VerificationStatusResponse;
import com.fanconnect.model.enums.DocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VerificationService {

    VerificationDocumentResponse uploadDocument(Long businessId, DocumentType type, MultipartFile file);

    List<VerificationDocumentResponse> listDocuments(Long businessId);

    void deleteDocument(Long businessId, Long documentId);

    VerificationStatusResponse getVerificationStatus(Long businessId);

    VerificationStatusResponse submitForVerification(Long businessId);

    void assertReadyForApproval(Long businessId);

    List<BusinessSummaryResponse> listPendingVerifications();

    AdminVerificationDetailResponse getAdminVerificationDetail(Long businessId);

    VerificationDocumentFile loadDocumentForOwner(Long businessId, Long documentId);

    VerificationDocumentFile loadDocumentForAdmin(Long businessId, Long documentId);
}