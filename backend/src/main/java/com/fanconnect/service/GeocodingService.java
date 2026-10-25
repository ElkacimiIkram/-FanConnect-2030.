package com.fanconnect.service;

import com.fanconnect.dto.GeoCoordinates;

import java.math.BigDecimal;

public interface GeocodingService {

    /**
     * Resolves GPS coordinates from explicit values, Google Maps URL, or address geocoding.
     */
    GeoCoordinates resolve(
            BigDecimal latitude,
            BigDecimal longitude,
            String googleMapsUrl,
            String address,
            String city,
            String country
    );
}