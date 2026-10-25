package com.fanconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CafeResponse {

    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private int capacity;
    private boolean active;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;
}