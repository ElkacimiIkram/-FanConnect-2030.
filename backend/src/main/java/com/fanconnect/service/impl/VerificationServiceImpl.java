package com.fanconnect.service.impl;

import com.fanconnect.dto.response.AdminVerificationDetailResponse;
import com.fanconnect.dto.response.BusinessApprovalResponse;
import com.fanconnect.dto.response.BusinessDetailResponse;
import com.fanconnect.dto.response.BusinessSummaryResponse;
import com.fanconnect.dto.response.VerificationDocumentFile;
import com.fanconnect.dto.response.VerificationDocumentResponse;
import com.fanconnect.dto.response.VerificationStatusResponse;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.exception.ForbiddenException;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.mapper.BusinessMapper;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.BusinessApproval;
import com.fanconnect.model.entity.User;
import com.fanconnect.model.entity.VerificationDocument;
import com.fanconnect.model.enums.BusinessStatus;
import com.fanconnect.model.enums.DocumentStatus;
import com.fanconnect.model.enums.DocumentType;
import com.fanconnect.model.enums.NotificationType;
import com.fanconnect.model.enums.Role;
import com.fanconnect.repository.BusinessApprovalRepository;
import com.fanconnect.repository.BusinessRepository;
import com.fanconnect.repository.UserRepository;
import com.fanconnect.repository.VerificationDocumentRepository;
import com.fanconnect.service.DocumentStorageService;
import com.fanconnect.service.NotificationService;
import com.fanconnect.service.VerificationService;
import com.fanconnect.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class VerificationServiceImpl implements VerificationService {

    private static final Set<DocumentType> REQUIRED_TYPES = EnumSet.of(
            DocumentType.NATIONAL_ID,
            DocumentType.BUSINESS_REGISTRATION,
            DocumentType.EXTERIOR_PHOTO
    );

    private final VerificationDocumentRepository verificationDocumentRepository;
    private final BusinessRepository businessRepository;
    private final BusinessApprovalRepository businessApprovalRepository;
    private final UserRepository userRepository;
    private final DocumentStorageService documentStorageService;
    private final NotificationService notificationService;
    private final BusinessMapper businessMapper;

    @Override
    @Transactional
    public VerificationDocumentResponse uploadDocument(Long businessId, DocumentType type, MultipartFile file) {
        Business business = loadOwnedEditableBusiness(businessId);
        User owner = getCurrentUser();

        verificationDocumentRepository
                .findFirstByBusinessIdAndDocumentTypeAndStatusNotOrderByUploadedAtDesc(
                        businessId, type, DocumentStatus.REPLACED
                )
                .ifPresent(existing -> {
                    existing.setStatus(DocumentStatus.REPLACED);
                    verificationDocumentRepository.save(existing);
                });

        String storageKey = documentStorageService.storeVerificationDocument(businessId, file);

        VerificationDocument saved = verificationDocumentRepository.save(VerificationDocument.builder()
                .business(business)
                .owner(owner)
                .documentType(type)
                .storageKey(storageKey)
                .originalName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .fileSizeBytes(file.getSize())
                .status(DocumentStatus.UPLOADED)
                .uploadedAt(Instant.now())
                .build());

        business.setVerificationComplete(false);
        businessRepository.save(business);

        return toDocumentResponse(saved, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VerificationDocumentResponse> listDocuments(Long businessId) {
        assertOwnerAccess(businessId);
        return verificationDocumentRepository
                .findByBusinessIdAndStatusNotOrderByUploadedAtDesc(businessId, DocumentStatus.REPLACED)
                .stream()
                .map(doc -> toDocumentResponse(doc, true))
                .toList();
    }

    @Override
    @Transactional
    public void deleteDocument(Long businessId, Long documentId) {
        loadOwnedEditableBusiness(businessId);
        VerificationDocument document = verificationDocumentRepository
                .findByIdAndBusinessId(documentId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));

        if (document.getStatus() == DocumentStatus.REPLACED) {
            throw new BusinessException("Document déjà remplacé");
        }

        document.setStatus(DocumentStatus.REPLACED);
        verificationDocumentRepository.save(document);
        documentStorageService.delete(document.getStorageKey());
    }

    @Override
    @Transactional(readOnly = true)
    public VerificationStatusResponse getVerificationStatus(Long businessId) {
        assertOwnerOrAdminAccess(businessId);
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));
        return buildStatusResponse(business, true);
    }

    @Override
    @Transactional
    public VerificationStatusResponse submitForVerification(Long businessId) {
        Business business = loadOwnedEditableBusiness(businessId);
        User owner = getCurrentUser();

        if (!isDocumentSetComplete(businessId)) {
            throw new BusinessException(
                    "Documents requis manquants : CIN, Registre de Commerce et photo extérieure"
            );
        }

        business.setVerificationSubmittedAt(Instant.now());
        business.setVerificationComplete(true);
        business.setStatus(BusinessStatus.PENDING);
        business.setRejectionReason(null);
        Business saved = businessRepository.save(business);

        businessApprovalRepository.save(BusinessApproval.builder()
                .business(saved)
                .status(BusinessStatus.PENDING)
                .submittedAt(Instant.now())
                .build());

        notificationService.notifyAdmins(
                NotificationType.BUSINESS_PENDING,
                "Nouvelle demande de vérification",
                owner.getFirstName() + " a soumis \"" + saved.getName() + "\" avec documents.",
                "BUSINESS",
                saved.getId()
        );

        return buildStatusResponse(saved, true);
    }

    @Override
    @Transactional(readOnly = true)
    public void assertReadyForApproval(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));

        if (!business.isVerificationComplete()) {
            throw new BusinessException("Le dossier de vérification n'a pas été soumis");
        }
        if (!isDocumentSetComplete(businessId)) {
            throw new BusinessException("Documents de vérification incomplets");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessSummaryResponse> listPendingVerifications() {
        return businessRepository.findByStatusOrderByNameAsc(BusinessStatus.PENDING).stream()
                .filter(Business::isVerificationComplete)
                .map(businessMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminVerificationDetailResponse getAdminVerificationDetail(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));

        initializeCollections(business);
        BusinessDetailResponse detail = businessMapper.toDetail(business);

        List<BusinessApprovalResponse> history = businessApprovalRepository
                .findByBusinessIdOrderBySubmittedAtDesc(businessId)
                .stream()
                .map(this::toApprovalResponse)
                .toList();

        return AdminVerificationDetailResponse.builder()
                .business(detail)
                .verification(buildStatusResponse(business, false))
                .approvalHistory(history)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public VerificationDocumentFile loadDocumentForOwner(Long businessId, Long documentId) {
        assertOwnerAccess(businessId);
        return loadDocument(businessId, documentId);
    }

    @Override
    @Transactional(readOnly = true)
    public VerificationDocumentFile loadDocumentForAdmin(Long businessId, Long documentId) {
        return loadDocument(businessId, documentId);
    }

    private VerificationDocumentFile loadDocument(Long businessId, Long documentId) {
        VerificationDocument document = verificationDocumentRepository
                .findByIdAndBusinessId(documentId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        return new VerificationDocumentFile(
                documentStorageService.loadAsResource(document.getStorageKey()),
                document.getMimeType(),
                document.getOriginalName()
        );
    }

    private VerificationStatusResponse buildStatusResponse(Business business, boolean ownerView) {
        Long businessId = business.getId();
        Map<DocumentType, Boolean> present = new EnumMap<>(DocumentType.class);
        for (DocumentType type : DocumentType.values()) {
            present.put(type, verificationDocumentRepository.countByBusinessIdAndDocumentTypeAndStatusNot(
                    businessId, type, DocumentStatus.REPLACED) > 0);
        }

        List<VerificationDocumentResponse> documents = verificationDocumentRepository
                .findByBusinessIdAndStatusNotOrderByUploadedAtDesc(businessId, DocumentStatus.REPLACED)
                .stream()
                .map(doc -> toDocumentResponse(doc, ownerView))
                .toList();

        return VerificationStatusResponse.builder()
                .businessId(businessId)
                .status(business.getStatus())
                .verificationComplete(business.isVerificationComplete())
                .verificationSubmittedAt(business.getVerificationSubmittedAt())
                .rejectionReason(business.getRejectionReason())
                .requiredDocumentsPresent(present)
                .documents(documents)
                .readyToSubmit(isDocumentSetComplete(businessId)
                        && !business.isVerificationComplete()
                        && (business.getStatus() == BusinessStatus.PENDING
                        || business.getStatus() == BusinessStatus.REJECTED))
                .build();
    }

    private boolean isDocumentSetComplete(Long businessId) {
        for (DocumentType type : REQUIRED_TYPES) {
            if (verificationDocumentRepository.countByBusinessIdAndDocumentTypeAndStatusNot(
                    businessId, type, DocumentStatus.REPLACED) == 0) {
                return false;
            }
        }
        return true;
    }

    private VerificationDocumentResponse toDocumentResponse(VerificationDocument doc, boolean ownerView) {
        String base = ownerView
                ? "/owner/businesses/" + doc.getBusiness().getId() + "/verification/documents/" + doc.getId() + "/file"
                : "/admin/verifications/" + doc.getBusiness().getId() + "/documents/" + doc.getId() + "/file";

        return VerificationDocumentResponse.builder()
                .id(doc.getId())
                .documentType(doc.getDocumentType())
                .status(doc.getStatus())
                .originalName(doc.getOriginalName())
                .mimeType(doc.getMimeType())
                .fileSizeBytes(doc.getFileSizeBytes())
                .uploadedAt(doc.getUploadedAt())
                .downloadUrl(base)
                .build();
    }

    private BusinessApprovalResponse toApprovalResponse(BusinessApproval approval) {
        String reviewer = approval.getReviewedBy() != null
                ? approval.getReviewedBy().getFirstName() + " " + approval.getReviewedBy().getLastName()
                : null;

        return BusinessApprovalResponse.builder()
                .id(approval.getId())
                .status(approval.getStatus())
                .rejectionReason(approval.getRejectionReason())
                .reviewedByName(reviewer)
                .submittedAt(approval.getSubmittedAt())
                .reviewedAt(approval.getReviewedAt())
                .build();
    }

    private Business loadOwnedEditableBusiness(Long businessId) {
        User owner = getCurrentUser();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));

        if (!business.getOwner().getId().equals(owner.getId())) {
            throw new ForbiddenException("Not your business");
        }
        if (business.getStatus() != BusinessStatus.PENDING && business.getStatus() != BusinessStatus.REJECTED) {
            throw new BusinessException("Seuls les établissements en attente ou rejetés peuvent être modifiés");
        }
        return business;
    }

    private void assertOwnerAccess(Long businessId) {
        User user = getCurrentUser();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId));
        if (!business.getOwner().getId().equals(user.getId())) {
            throw new ForbiddenException("Not your business");
        }
    }

    private void assertOwnerOrAdminAccess(Long businessId) {
        User user = getCurrentUser();
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        assertOwnerAccess(businessId);
    }

    private void initializeCollections(Business business) {
        business.getSpaces().forEach(space -> space.getTables().size());
        business.getGalleryImages().size();
        business.getMenuImages().size();
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (!StringUtils.hasText(email)) {
            throw new ForbiddenException("Not authenticated");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ForbiddenException("User not found"));
    }
}