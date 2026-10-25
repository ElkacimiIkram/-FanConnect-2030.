package com.fanconnect.service.impl;

import com.fanconnect.config.UploadProperties;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.service.DocumentStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentStorageServiceImpl implements DocumentStorageService {

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
    );

    private final UploadProperties uploadProperties;

    @Override
    public String storeVerificationDocument(Long businessId, MultipartFile file) {
        validateFile(file);

        String extension = resolveExtension(file);
        String storageKey = "verification/" + businessId + "/" + UUID.randomUUID() + extension;
        Path target = resolveBasePath().resolve(storageKey);

        try {
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return storageKey;
        } catch (IOException e) {
            throw new BusinessException("Impossible d'enregistrer le document: " + e.getMessage());
        }
    }

    @Override
    public Resource loadAsResource(String storageKey) {
        try {
            Path file = resolveBasePath().resolve(storageKey).normalize();
            if (!file.startsWith(resolveBasePath())) {
                throw new BusinessException("Chemin de fichier invalide");
            }
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new BusinessException("Fichier introuvable");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new BusinessException("Fichier introuvable");
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            Path file = resolveBasePath().resolve(storageKey).normalize();
            if (file.startsWith(resolveBasePath())) {
                Files.deleteIfExists(file);
            }
        } catch (IOException e) {
            throw new BusinessException("Impossible de supprimer le document");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Fichier vide");
        }
        if (file.getSize() > uploadProperties.getMaxFileSizeBytes()) {
            throw new BusinessException("Fichier trop volumineux (max 5 Mo)");
        }
        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new BusinessException("Type de fichier non autorisé (PDF, JPEG, PNG, WebP)");
        }
    }

    private String resolveExtension(MultipartFile file) {
        String original = file.getOriginalFilename();
        if (StringUtils.hasText(original) && original.contains(".")) {
            return original.substring(original.lastIndexOf('.'));
        }
        String contentType = file.getContentType();
        if ("application/pdf".equals(contentType)) {
            return ".pdf";
        }
        if ("image/png".equals(contentType)) {
            return ".png";
        }
        if ("image/webp".equals(contentType)) {
            return ".webp";
        }
        return ".jpg";
    }

    private Path resolveBasePath() {
        return Paths.get(uploadProperties.getBaseDir()).toAbsolutePath().normalize();
    }
}