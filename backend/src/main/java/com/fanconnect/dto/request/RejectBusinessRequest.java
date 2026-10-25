package com.fanconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RejectBusinessRequest {

    @NotBlank
    @Size(max = 500)
    private String reason;
}