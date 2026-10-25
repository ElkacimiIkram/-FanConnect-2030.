package com.fanconnect.service;

import com.fanconnect.dto.request.CafeRequest;
import com.fanconnect.dto.request.UpdateCafeRequest;
import com.fanconnect.dto.response.CafeResponse;

import java.util.List;

public interface CafeService {

    List<CafeResponse> findAllActive();

    List<CafeResponse> search(String query, String city);

    CafeResponse findById(Long id);

    CafeResponse create(CafeRequest request);

    CafeResponse update(Long id, UpdateCafeRequest request);

    void delete(Long id);
}