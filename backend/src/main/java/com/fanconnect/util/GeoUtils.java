package com.fanconnect.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class GeoUtils {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private GeoUtils() {
    }

    public static Double distanceKm(double lat1, double lng1, BigDecimal lat2, BigDecimal lng2) {
        if (lat2 == null || lng2 == null) {
            return null;
        }
        return distanceKm(lat1, lng1, lat2.doubleValue(), lng2.doubleValue());
    }

    public static double distanceKm(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return BigDecimal.valueOf(EARTH_RADIUS_KM * c)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}