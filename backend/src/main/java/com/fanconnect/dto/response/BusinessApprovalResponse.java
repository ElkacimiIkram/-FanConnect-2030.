package com.fanconnect.dto.response;

import com.fanconnect.model.enums.BusinessStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessApprovalResponse {

    private Long id;
    private BusinessStatus status;
    private String rejectionReason;
    private String reviewedByName;
    private Instant submittedAt;
    private Instant reviewedAt;
}