package com.fanconnect.dto.response;

import com.fanconnect.model.enums.CompetitionCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompetitionMatchesResponse {

    private Long id;
    private String name;
    private String slug;
    private CompetitionCategory category;
    private String season;
    private String description;
    private List<GroupMatchesResponse> groups;
    private List<MatchSummaryResponse> matches;
}