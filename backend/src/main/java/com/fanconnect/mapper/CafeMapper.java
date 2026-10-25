package com.fanconnect.mapper;

import com.fanconnect.dto.request.CafeRequest;
import com.fanconnect.dto.request.UpdateCafeRequest;
import com.fanconnect.dto.response.CafeResponse;
import com.fanconnect.model.entity.Cafe;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class CafeMapper {

    public CafeResponse toResponse(Cafe cafe) {
        return CafeResponse.builder()
                .id(cafe.getId())
                .name(cafe.getName())
                .description(cafe.getDescription())
                .address(cafe.getAddress())
                .city(cafe.getCity())
                .capacity(cafe.getCapacity())
                .active(cafe.isActive())
                .imageUrl(cafe.getImageUrl())
                .createdAt(cafe.getCreatedAt())
                .updatedAt(cafe.getUpdatedAt())
                .build();
    }

    public Cafe toEntity(CafeRequest request) {
        return Cafe.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .capacity(request.getCapacity())
                .imageUrl(request.getImageUrl())
                .active(true)
                .build();
    }

    public void updateEntity(Cafe cafe, UpdateCafeRequest request) {
        if (StringUtils.hasText(request.getName())) {
            cafe.setName(request.getName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            cafe.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getAddress())) {
            cafe.setAddress(request.getAddress());
        }
        if (StringUtils.hasText(request.getCity())) {
            cafe.setCity(request.getCity());
        }
        if (request.getCapacity() != null) {
            cafe.setCapacity(request.getCapacity());
        }
        if (request.getActive() != null) {
            cafe.setActive(request.getActive());
        }
        if (request.getImageUrl() != null) {
            cafe.setImageUrl(request.getImageUrl());
        }
    }
}