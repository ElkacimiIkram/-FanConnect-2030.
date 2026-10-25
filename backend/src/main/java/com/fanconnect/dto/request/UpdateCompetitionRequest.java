package com.fanconnect.dto.request;

import com.fanconnect.model.enums.CompetitionCategory;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCompetitionRequest {

    @Size(max = 150)
    private String name;

    @Size(max = 100)
    private String slug;

    private CompetitionCategory category;

    @Size(max = 20)
    private String season;

    @Size(max = 500)
    private String description;

    @Size(max = 500)
    private String logoUrl;

    @Size(max = 20)
    private String externalCode;

    private Boolean active;

    private Instant startDate;

    private Instant endDate;
}