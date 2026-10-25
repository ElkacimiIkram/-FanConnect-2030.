package com.fanconnect.dto.response;

import com.fanconnect.model.enums.BusinessStatus;
import com.fanconnect.model.enums.BusinessType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessDetailResponse {

    private Long id;
    private Long ownerId;
    private String ownerName;
    private String name;
    private BusinessType businessType;
    private String description;
    private String country;
    private String city;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String googleMapsUrl;
    private String contactPhone;
    private String contactEmail;
    private int totalCapacity;
    private int totalTables;
    private BusinessStatus status;
    private String rejectionReason;
    private String coverImageUrl;
    private List<BusinessSpaceResponse> spaces;
    private List<String> galleryImageUrls;
    private List<String> menuImageUrls;
    private Instant createdAt;
    private Instant approvedAt;
    private boolean verificationComplete;
    private Instant verificationSubmittedAt;
}