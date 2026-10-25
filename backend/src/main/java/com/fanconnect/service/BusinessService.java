package com.fanconnect.service;

import com.fanconnect.dto.request.CreateBusinessRequest;
import com.fanconnect.dto.request.RejectBusinessRequest;
import com.fanconnect.dto.response.BusinessDetailResponse;
import com.fanconnect.dto.response.BusinessSummaryResponse;

import java.util.List;

public interface BusinessService {

    List<BusinessSummaryResponse> findApprovedPublic(
            String query,
            String city,
            Double latitude,
            Double longitude,
            Double radiusKm
    );

    BusinessDetailResponse findApprovedPublicById(Long id);

    List<BusinessSummaryResponse> findOwnerBusinesses();

    BusinessDetailResponse findOwnerBusinessById(Long id);

    BusinessDetailResponse submitBusiness(CreateBusinessRequest request);

    BusinessDetailResponse updateBusiness(Long id, CreateBusinessRequest request);

    List<BusinessSummaryResponse> findAllForAdmin();

    List<BusinessSummaryResponse> findPendingForAdmin();

    BusinessDetailResponse approveBusiness(Long id);

    BusinessDetailResponse rejectBusiness(Long id, RejectBusinessRequest request);

    BusinessDetailResponse disableBusiness(Long id);
}