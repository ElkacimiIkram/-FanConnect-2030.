package com.fanconnect.util;

import com.fanconnect.model.enums.OccupancyLevel;

public final class OccupancyCalculator {

    public static final double GREEN_MAX = 50.0;
    public static final double ORANGE_MAX = 80.0;

    private OccupancyCalculator() {
    }

    public static double calculatePercentage(int bookedSeats, int capacity) {
        if (capacity <= 0) {
            return 100.0;
        }
        double percentage = (bookedSeats * 100.0) / capacity;
        return Math.round(Math.min(percentage, 100.0) * 10.0) / 10.0;
    }

    public static OccupancyLevel resolveLevel(double occupancyPercentage) {
        if (occupancyPercentage <= GREEN_MAX) {
            return OccupancyLevel.GREEN;
        }
        if (occupancyPercentage <= ORANGE_MAX) {
            return OccupancyLevel.ORANGE;
        }
        return OccupancyLevel.RED;
    }
}