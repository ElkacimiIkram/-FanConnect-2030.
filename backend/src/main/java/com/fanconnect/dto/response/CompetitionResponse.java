package com.fanconnect.dto.response;

import com.fanconnect.model.enums.CompetitionCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompetitionResponse {

    private Long id;
    private String name;
    private String slug;
    private CompetitionCategory category;
    private String season;
    private String description;
    private String logoUrl;
    private String externalCode;
    private String externalSource;
    private boolean active;
    private Instant startDate;
    private Instant endDate;
    private int matchCount;
}