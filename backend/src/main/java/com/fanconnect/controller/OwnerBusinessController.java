package com.fanconnect.controller;

import com.fanconnect.dto.request.CreateBusinessRequest;
import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.BusinessDetailResponse;
import com.fanconnect.dto.response.BusinessSummaryResponse;
import com.fanconnect.service.BusinessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/owner/businesses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BUSINESS_OWNER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Owner Businesses", description = "Business owner submission & management")
public class OwnerBusinessController {

    private final BusinessService businessService;

    @GetMapping
    @Operation(summary = "List my businesses")
    public ResponseEntity<ApiResponse<List<BusinessSummaryResponse>>> mine() {
        return ResponseEntity.ok(ApiResponse.success(businessService.findOwnerBusinesses()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get my business details")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(businessService.findOwnerBusinessById(id)));
    }

    @PostMapping
    @Operation(summary = "Submit a new business for approval")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> submit(
            @Valid @RequestBody CreateBusinessRequest request
    ) {
        BusinessDetailResponse created = businessService.submitBusiness(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business submitted for approval", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update and resubmit a pending/rejected business")
    public ResponseEntity<ApiResponse<BusinessDetailResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateBusinessRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Business updated and resubmitted",
                businessService.updateBusiness(id, request)
        ));
    }
}