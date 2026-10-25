package com.fanconnect.dto.request;

import com.fanconnect.model.enums.BusinessType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class CreateBusinessRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @NotNull
    private BusinessType businessType;

    @NotBlank
    @Size(max = 1000)
    private String description;

    @NotBlank
    @Size(max = 100)
    private String country;

    @NotBlank
    @Size(max = 100)
    private String city;

    @NotBlank
    @Size(max = 255)
    private String address;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @Size(max = 2048)
    private String googleMapsUrl;

    @Size(max = 20)
    private String contactPhone;

    @Email
    @Size(max = 100)
    private String contactEmail;

    @Min(1)
    private int totalCapacity;

    @Min(1)
    private int totalTables;

    @Size(max = 2048)
    private String coverImageUrl;

    @NotEmpty
    @Valid
    private List<BusinessSpaceRequest> spaces = new ArrayList<>();

    private List<String> galleryImageUrls = new ArrayList<>();
    private List<String> menuImageUrls = new ArrayList<>();
}