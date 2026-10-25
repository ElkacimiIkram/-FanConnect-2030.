package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyModelInfoResponse {

    private String name;
    private String version;
    private String algorithm;
    private double mae;
    private double r2Score;
    private String trainedAt;
    private int sampleCount;
}