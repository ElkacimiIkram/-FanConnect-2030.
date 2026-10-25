package com.fanconnect.mapper;

import com.fanconnect.dto.response.BusinessDetailResponse;
import com.fanconnect.dto.response.BusinessSpaceResponse;
import com.fanconnect.dto.response.BusinessSummaryResponse;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.BusinessImage;
import com.fanconnect.model.entity.BusinessSpace;
import com.fanconnect.model.entity.MenuImage;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Component
public class BusinessMapper {

    public BusinessSummaryResponse toSummary(Business business) {
        return BusinessSummaryResponse.builder()
                .id(business.getId())
                .name(business.getName())
                .businessType(business.getBusinessType())
                .city(business.getCity())
                .address(business.getAddress())
                .totalCapacity(business.getTotalCapacity())
                .totalTables(business.getTotalTables())
                .status(business.getStatus())
                .coverImageUrl(business.getCoverImageUrl())
                .minMatchDayPrice(minPrice(business.getSpaces()))
                .latitude(business.getLatitude())
                .longitude(business.getLongitude())
                .googleMapsUrl(business.getGoogleMapsUrl())
                .build();
    }

    public BusinessDetailResponse toDetail(Business business) {
        return BusinessDetailResponse.builder()
                .id(business.getId())
                .ownerId(business.getOwner().getId())
                .ownerName(business.getOwner().getFirstName() + " " + business.getOwner().getLastName())
                .name(business.getName())
                .businessType(business.getBusinessType())
                .description(business.getDescription())
                .country(business.getCountry())
                .city(business.getCity())
                .address(business.getAddress())
                .latitude(business.getLatitude())
                .longitude(business.getLongitude())
                .googleMapsUrl(business.getGoogleMapsUrl())
                .contactPhone(business.getContactPhone())
                .contactEmail(business.getContactEmail())
                .totalCapacity(business.getTotalCapacity())
                .totalTables(business.getTotalTables())
                .status(business.getStatus())
                .rejectionReason(business.getRejectionReason())
                .coverImageUrl(business.getCoverImageUrl())
                .spaces(business.getSpaces().stream().map(this::toSpaceResponse).toList())
                .galleryImageUrls(business.getGalleryImages().stream()
                        .sorted(Comparator.comparingInt(BusinessImage::getSortOrder))
                        .map(BusinessImage::getImageUrl)
                        .toList())
                .menuImageUrls(business.getMenuImages().stream()
                        .sorted(Comparator.comparingInt(MenuImage::getSortOrder))
                        .map(MenuImage::getImageUrl)
                        .toList())
                .createdAt(business.getCreatedAt())
                .approvedAt(business.getApprovedAt())
                .verificationComplete(business.isVerificationComplete())
                .verificationSubmittedAt(business.getVerificationSubmittedAt())
                .build();
    }

    public BusinessSpaceResponse toSpaceResponse(BusinessSpace space) {
        return BusinessSpaceResponse.builder()
                .id(space.getId())
                .name(space.getName())
                .spaceType(space.getSpaceType())
                .description(space.getDescription())
                .capacity(space.getCapacity())
                .numberOfTables(space.getNumberOfTables())
                .matchDayPrice(space.getMatchDayPrice())
                .build();
    }

    private BigDecimal minPrice(List<BusinessSpace> spaces) {
        if (spaces == null || spaces.isEmpty()) {
            return null;
        }
        return spaces.stream()
                .map(BusinessSpace::getMatchDayPrice)
                .min(BigDecimal::compareTo)
                .orElse(null);
    }
}