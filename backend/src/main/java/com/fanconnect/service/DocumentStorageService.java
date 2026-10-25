package com.fanconnect.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentStorageService {

    String storeVerificationDocument(Long businessId, MultipartFile file);

    Resource loadAsResource(String storageKey);

    void delete(String storageKey);
}