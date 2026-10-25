package com.fanconnect.repository;

import com.fanconnect.model.entity.VerificationDocument;
import com.fanconnect.model.enums.DocumentStatus;
import com.fanconnect.model.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationDocumentRepository extends JpaRepository<VerificationDocument, Long> {

    List<VerificationDocument> findByBusinessIdAndStatusNotOrderByUploadedAtDesc(
            Long businessId,
            DocumentStatus replaced
    );

    Optional<VerificationDocument> findByIdAndBusinessId(Long id, Long businessId);

    Optional<VerificationDocument> findFirstByBusinessIdAndDocumentTypeAndStatusNotOrderByUploadedAtDesc(
            Long businessId,
            DocumentType documentType,
            DocumentStatus replaced
    );

    long countByBusinessIdAndDocumentTypeAndStatusNot(
            Long businessId,
            DocumentType documentType,
            DocumentStatus replaced
    );
}