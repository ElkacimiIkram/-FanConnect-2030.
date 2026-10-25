package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchSubstitutionResponse {

    private Integer minute;
    private String teamName;
    private String playerOut;
    private String playerIn;
}