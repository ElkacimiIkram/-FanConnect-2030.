package com.fanconnect.service.impl;

import com.fanconnect.dto.request.CafeRequest;
import com.fanconnect.dto.request.UpdateCafeRequest;
import com.fanconnect.dto.response.CafeResponse;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.mapper.CafeMapper;
import com.fanconnect.model.entity.Cafe;
import com.fanconnect.repository.CafeRepository;
import com.fanconnect.service.CafeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CafeServiceImpl implements CafeService {

    private final CafeRepository cafeRepository;
    private final CafeMapper cafeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CafeResponse> findAllActive() {
        return cafeRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(cafeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CafeResponse> search(String query, String city) {
        String normalizedQuery = StringUtils.hasText(query) ? query.trim() : null;
        String normalizedCity = StringUtils.hasText(city) ? city.trim() : null;

        if (normalizedQuery == null && normalizedCity == null) {
            return findAllActive();
        }

        return cafeRepository.searchActiveCafes(normalizedQuery, normalizedCity).stream()
                .map(cafeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CafeResponse findById(Long id) {
        Cafe cafe = cafeRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Café", id));
        return cafeMapper.toResponse(cafe);
    }

    @Override
    @Transactional
    public CafeResponse create(CafeRequest request) {
        Cafe cafe = cafeMapper.toEntity(request);
        Cafe savedCafe = cafeRepository.save(cafe);
        return cafeMapper.toResponse(savedCafe);
    }

    @Override
    @Transactional
    public CafeResponse update(Long id, UpdateCafeRequest request) {
        Cafe cafe = cafeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Café", id));

        cafeMapper.updateEntity(cafe, request);
        Cafe updatedCafe = cafeRepository.save(cafe);
        return cafeMapper.toResponse(updatedCafe);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Cafe cafe = cafeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Café", id));

        cafe.setActive(false);
        cafeRepository.save(cafe);
    }
}