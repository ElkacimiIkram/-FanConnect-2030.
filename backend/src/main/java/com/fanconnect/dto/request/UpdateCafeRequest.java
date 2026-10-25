package com.fanconnect.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateCafeRequest {

    @Size(max = 150)
    private String name;

    @Size(max = 500)
    private String description;

    @Size(max = 255)
    private String address;

    @Size(max = 100)
    private String city;

    @Min(1)
    private Integer capacity;

    private Boolean active;

    @Size(max = 500)
    private String imageUrl;
}