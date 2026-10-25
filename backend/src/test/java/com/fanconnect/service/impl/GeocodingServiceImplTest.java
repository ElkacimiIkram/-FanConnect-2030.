package com.fanconnect.service.impl;

import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeocodingServiceImplTest {

    @Test
    void parseGoogleMapsUrl_extractsAtCoordinates() {
        Optional<com.fanconnect.dto.GeoCoordinates> coords = GeocodingServiceImpl.parseGoogleMapsUrl(
                "https://www.google.com/maps/place/Cafe/@33.5731,-7.5898,17z"
        );

        assertTrue(coords.isPresent());
        assertEquals(33.5731, coords.get().getLatitude().doubleValue(), 0.0001);
        assertEquals(-7.5898, coords.get().getLongitude().doubleValue(), 0.0001);
    }

    @Test
    void parseGoogleMapsUrl_extractsPlaceDataCoordinates() {
        Optional<com.fanconnect.dto.GeoCoordinates> coords = GeocodingServiceImpl.parseGoogleMapsUrl(
                "https://maps.google.com/?q=place&data=!3d31.6295!4d-7.9811"
        );

        assertTrue(coords.isPresent());
        assertEquals(31.6295, coords.get().getLatitude().doubleValue(), 0.0001);
        assertEquals(-7.9811, coords.get().getLongitude().doubleValue(), 0.0001);
    }

    @Test
    void parseGoogleMapsUrl_extractsLlParameter() {
        Optional<com.fanconnect.dto.GeoCoordinates> coords = GeocodingServiceImpl.parseGoogleMapsUrl(
                "https://www.google.com/maps?ll=34.0209,-6.8416&z=14"
        );

        assertTrue(coords.isPresent());
        assertEquals(34.0209, coords.get().getLatitude().doubleValue(), 0.0001);
        assertEquals(-6.8416, coords.get().getLongitude().doubleValue(), 0.0001);
    }
}