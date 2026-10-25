package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminVerificationDetailResponse {

    private BusinessDetailResponse business;
    private VerificationStatusResponse verification;
    private List<BusinessApprovalResponse> approvalHistory;
}