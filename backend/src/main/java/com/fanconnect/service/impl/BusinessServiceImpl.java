package com.fanconnect.service.impl;

import com.fanconnect.dto.GeoCoordinates;
import com.fanconnect.dto.request.BusinessSpaceRequest;
import com.fanconnect.dto.request.CreateBusinessRequest;
import com.fanconnect.dto.request.RejectBusinessRequest;
import com.fanconnect.dto.response.BusinessDetailResponse;
import com.fanconnect.dto.response.BusinessSummaryResponse;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.exception.ForbiddenException;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.mapper.BusinessMapper;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.BusinessApproval;
import com.fanconnect.model.entity.BusinessImage;
import com.fanconnect.model.entity.BusinessSpace;
import com.fanconnect.model.entity.BusinessTable;
import com.fanconnect.model.entity.MenuImage;
import com.fanconnect.model.entity.User;
import com.fanconnect.model.enums.BusinessStatus;
import com.fanconnect.model.enums.NotificationType;
import com.fanconnect.repository.BusinessApprovalRepository;
import com.fanconnect.repository.BusinessRepository;
import com.fanconnect.repository.UserRepository;
import com.fanconnect.service.BusinessService;
import com.fanconnect.service.GeocodingService;
import com.fanconnect.service.NotificationService;
import com.fanconnect.service.VerificationService;
import com.fanconnect.util.GeoUtils;
import com.fanconnect.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;
    private final BusinessApprovalRepository businessApprovalRepository;
    private final UserRepository userRepository;
    private final BusinessMapper businessMapper;
    private final NotificationService notificationService;
    private final GeocodingService geocodingService;
    private final VerificationService verificationService;

    @Override
    @Transactional(readOnly = true)
    public List<BusinessSummaryResponse> findApprovedPublic(
            String query,
            String city,
            Double latitude,
            Double longitude,
            Double radiusKm
    ) {
        String normalizedQuery = StringUtils.hasText(query) ? query.trim() : "";
        String normalizedCity = StringUtils.hasText(city) ? city.trim() : "";

        List<Business> businesses;
        if (normalizedQuery.isEmpty() && normalizedCity.isEmpty()) {
            businesses = businessRepository.findByStatusOrderByNameAsc(BusinessStatus.APPROVED);
        } else {
            businesses = businessRepository.searchApproved(
                    BusinessStatus.APPROVED,
                    normalizedQuery,
                    normalizedCity
            );
        }

        boolean geoSort = latitude != null && longitude != null;

        return businesses.stream()
                .map(business -> {
                    BusinessSummaryResponse summary = businessMapper.toSummary(business);
                    if (geoSort) {
                        summary.setDistanceKm(
                                GeoUtils.distanceKm(latitude, longitude, business.getLatitude(), business.getLongitude())
                        );
                    }
                    return summary;
                })
                .filter(summary -> !geoSort || radiusKm == null || radiusKm <= 0
                        || summary.getDistanceKm() == null
                        || summary.getDistanceKm() <= radiusKm)
                .sorted(geoSort
                        ? Comparator.comparing(
                                BusinessSummaryResponse::getDistanceKm,
                                Comparator.nullsLast(Comparator.naturalOrder())
                        ).thenComparing(BusinessSummaryResponse::getName, String.CASE_INSENSITIVE_ORDER)
                        : Comparator.comparing(BusinessSummaryResponse::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessDetailResponse findApprovedPublicById(Long id) {
        Business business = businessRepository.findByIdAndStatus(id, BusinessStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Business", id));
        initializeCollections(business);
        return businessMapper.toDetail(business);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessSummaryResponse> findOwnerBusinesses() {
        User owner = getCurrentUser();
        return businessRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId()).stream()
                .map(businessMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessDetailResponse findOwnerBusinessById(Long id) {
        User owner = getCurrentUser();
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business", id));
        assertOwner(business, owner);
        initializeCollections(business);
        return businessMapper.toDetail(business);
    }

    @Override
    @Transactional
    public BusinessDetailResponse submitBusiness(CreateBusinessRequest request) {
        User owner = getCurrentUser();
        validateCapacityTotals(request);

        Business business = buildBusinessFromRequest(request, owner);
        business.setStatus(BusinessStatus.PENDING);
        business.setVerificationComplete(false);
        Business saved = businessRepository.save(business);

        initializeCollections(saved);
        return businessMapper.toDetail(saved);
    }

    @Override
    @Transactional
    public BusinessDetailResponse updateBusiness(Long id, CreateBusinessRequest request) {
        User owner = getCurrentUser();
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business", id));
        assertOwner(business, owner);

        if (business.getStatus() != BusinessStatus.PENDING && business.getStatus() != BusinessStatus.REJECTED) {
            throw new BusinessException("Only pending or rejected businesses can be edited");
        }

        validateCapacityTotals(request);
        applyRequestToBusiness(business, request, owner);
        business.setStatus(BusinessStatus.PENDING);
        business.setRejectionReason(null);
        business.setVerificationComplete(false);
        business.setVerificationSubmittedAt(null);

        Business saved = businessRepository.save(business);

        initializeCollections(saved);
        return businessMapper.toDetail(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessSummaryResponse> findAllForAdmin() {
        return businessRepository.findAll().stream()
                .map(businessMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessSummaryResponse> findPendingForAdmin() {
        return businessRepository.findByStatusOrderByNameAsc(BusinessStatus.PENDING).stream()
                .map(businessMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public BusinessDetailResponse approveBusiness(Long id) {
        User admin = getCurrentUser();
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business", id));

        if (business.getStatus() != BusinessStatus.PENDING) {
            throw new BusinessException("Only pending businesses can be approved");
        }

        verificationService.assertReadyForApproval(id);

        business.setStatus(BusinessStatus.APPROVED);
        business.setApprovedAt(Instant.now());
        business.setApprovedBy(admin);
        business.setRejectionReason(null);
        resolveAndApplyCoordinates(business);
        Business saved = businessRepository.save(business);

        recordApproval(saved, admin, BusinessStatus.APPROVED, null);

        notificationService.notifyUser(
                saved.getOwner().getId(),
                NotificationType.BUSINESS_APPROVED,
                "Business approved",
                "Your business \"" + saved.getName() + "\" is now visible to fans.",
                "BUSINESS",
                saved.getId()
        );

        initializeCollections(saved);
        return businessMapper.toDetail(saved);
    }

    @Override
    @Transactional
    public BusinessDetailResponse rejectBusiness(Long id, RejectBusinessRequest request) {
        User admin = getCurrentUser();
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business", id));

        if (business.getStatus() != BusinessStatus.PENDING) {
            throw new BusinessException("Only pending businesses can be rejected");
        }

        business.setStatus(BusinessStatus.REJECTED);
        business.setRejectionReason(request.getReason());
        business.setVerificationComplete(false);
        business.setVerificationSubmittedAt(null);
        Business saved = businessRepository.save(business);

        recordApproval(saved, admin, BusinessStatus.REJECTED, request.getReason());

        notificationService.notifyUser(
                saved.getOwner().getId(),
                NotificationType.BUSINESS_REJECTED,
                "Business rejected",
                "Your business \"" + saved.getName() + "\" was rejected: " + request.getReason(),
                "BUSINESS",
                saved.getId()
        );

        initializeCollections(saved);
        return businessMapper.toDetail(saved);
    }

    @Override
    @Transactional
    public BusinessDetailResponse disableBusiness(Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business", id));

        business.setStatus(BusinessStatus.DISABLED);
        Business saved = businessRepository.save(business);

        notificationService.notifyUser(
                saved.getOwner().getId(),
                NotificationType.BUSINESS_DISABLED,
                "Business disabled",
                "Your business \"" + saved.getName() + "\" has been disabled by admin.",
                "BUSINESS",
                saved.getId()
        );

        initializeCollections(saved);
        return businessMapper.toDetail(saved);
    }

    private void recordApproval(Business business, User admin, BusinessStatus status, String reason) {
        businessApprovalRepository.save(BusinessApproval.builder()
                .business(business)
                .reviewedBy(admin)
                .status(status)
                .rejectionReason(reason)
                .reviewedAt(Instant.now())
                .submittedAt(Instant.now())
                .build());
    }

    private Business buildBusinessFromRequest(CreateBusinessRequest request, User owner) {
        Business business = Business.builder()
                .owner(owner)
                .name(request.getName())
                .businessType(request.getBusinessType())
                .description(request.getDescription())
                .country(request.getCountry())
                .city(request.getCity())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .googleMapsUrl(request.getGoogleMapsUrl())
                .contactPhone(request.getContactPhone())
                .contactEmail(request.getContactEmail())
                .totalCapacity(request.getTotalCapacity())
                .totalTables(request.getTotalTables())
                .coverImageUrl(request.getCoverImageUrl())
                .build();

        resolveAndApplyCoordinates(business);
        applySpacesAndMedia(business, request);
        return business;
    }

    private void applyRequestToBusiness(Business business, CreateBusinessRequest request, User owner) {
        business.setOwner(owner);
        business.setName(request.getName());
        business.setBusinessType(request.getBusinessType());
        business.setDescription(request.getDescription());
        business.setCountry(request.getCountry());
        business.setCity(request.getCity());
        business.setAddress(request.getAddress());
        business.setLatitude(request.getLatitude());
        business.setLongitude(request.getLongitude());
        business.setGoogleMapsUrl(request.getGoogleMapsUrl());
        business.setContactPhone(request.getContactPhone());
        business.setContactEmail(request.getContactEmail());
        business.setTotalCapacity(request.getTotalCapacity());
        business.setTotalTables(request.getTotalTables());
        business.setCoverImageUrl(request.getCoverImageUrl());

        business.getSpaces().clear();
        business.getGalleryImages().clear();
        business.getMenuImages().clear();
        resolveAndApplyCoordinates(business);
        applySpacesAndMedia(business, request);
    }

    private void resolveAndApplyCoordinates(Business business) {
        GeoCoordinates coords;
        if (StringUtils.hasText(business.getGoogleMapsUrl())) {
            coords = geocodingService.resolve(
                    null,
                    null,
                    business.getGoogleMapsUrl(),
                    business.getAddress(),
                    business.getCity(),
                    business.getCountry()
            );
            if (coords.isPresent()) {
                business.setLatitude(coords.getLatitude());
                business.setLongitude(coords.getLongitude());
                return;
            }
        }

        coords = geocodingService.resolve(
                business.getLatitude(),
                business.getLongitude(),
                business.getGoogleMapsUrl(),
                business.getAddress(),
                business.getCity(),
                business.getCountry()
        );
        if (coords.isPresent()) {
            business.setLatitude(coords.getLatitude());
            business.setLongitude(coords.getLongitude());
        }
    }

    private void applySpacesAndMedia(Business business, CreateBusinessRequest request) {
        for (BusinessSpaceRequest spaceRequest : request.getSpaces()) {
            BusinessSpace space = BusinessSpace.builder()
                    .business(business)
                    .name(spaceRequest.getName())
                    .spaceType(spaceRequest.getSpaceType())
                    .description(spaceRequest.getDescription())
                    .capacity(spaceRequest.getCapacity())
                    .numberOfTables(spaceRequest.getNumberOfTables())
                    .matchDayPrice(spaceRequest.getMatchDayPrice())
                    .build();

            int seatsPerTable = Math.max(1, spaceRequest.getCapacity() / spaceRequest.getNumberOfTables());
            for (int i = 1; i <= spaceRequest.getNumberOfTables(); i++) {
                space.getTables().add(BusinessTable.builder()
                        .space(space)
                        .tableNumber("T" + i)
                        .capacity(seatsPerTable)
                        .active(true)
                        .build());
            }
            business.getSpaces().add(space);
        }

        addImages(business, request.getGalleryImageUrls(), true);
        addImages(business, request.getMenuImageUrls(), false);
    }

    private void addImages(Business business, List<String> urls, boolean gallery) {
        if (urls == null) {
            return;
        }
        int order = 0;
        for (String url : urls) {
            if (!StringUtils.hasText(url)) {
                continue;
            }
            if (gallery) {
                business.getGalleryImages().add(BusinessImage.builder()
                        .business(business)
                        .imageUrl(url.trim())
                        .sortOrder(order++)
                        .build());
            } else {
                business.getMenuImages().add(MenuImage.builder()
                        .business(business)
                        .imageUrl(url.trim())
                        .sortOrder(order++)
                        .build());
            }
        }
    }

    private void validateCapacityTotals(CreateBusinessRequest request) {
        int spaceCapacity = request.getSpaces().stream().mapToInt(BusinessSpaceRequest::getCapacity).sum();
        int spaceTables = request.getSpaces().stream().mapToInt(BusinessSpaceRequest::getNumberOfTables).sum();

        if (spaceCapacity != request.getTotalCapacity()) {
            throw new BusinessException("Total capacity must equal sum of space capacities (" + spaceCapacity + ")");
        }
        if (spaceTables != request.getTotalTables()) {
            throw new BusinessException("Total tables must equal sum of space tables (" + spaceTables + ")");
        }
    }

    private void initializeCollections(Business business) {
        business.getSpaces().forEach(space -> space.getTables().size());
        business.getGalleryImages().size();
        business.getMenuImages().size();
    }

    private void assertOwner(Business business, User owner) {
        if (!business.getOwner().getId().equals(owner.getId())) {
            throw new ForbiddenException("You do not own this business");
        }
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new ForbiddenException("Not authenticated");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ForbiddenException("User not found"));
    }
}