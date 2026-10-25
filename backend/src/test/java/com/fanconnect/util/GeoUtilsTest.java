package com.fanconnect.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeoUtilsTest {

    @Test
    void distanceKm_computesApproximateDistance() {
        double km = GeoUtils.distanceKm(33.5731, -7.5898, 34.0209, -6.8416);
        assertTrue(km > 80 && km < 100);
    }

    @Test
    void distanceKm_returnsNullWhenCoordsMissing() {
        assertNull(GeoUtils.distanceKm(33.5, -7.5, null, BigDecimal.ONE));
    }

    @Test
    void distanceKm_withBigDecimalCoords() {
        Double km = GeoUtils.distanceKm(
                33.5731,
                -7.5898,
                new BigDecimal("33.5731"),
                new BigDecimal("-7.5898")
        );
        assertNotNull(km);
        assertTrue(km < 0.01);
    }
}