package com.fanconnect.util;

import com.fanconnect.dto.response.OccupancyBreakdownResponse;
import com.fanconnect.model.entity.BusinessLiveOccupancy;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OccupancyEngineTest {

    @Test
    void freshOwnerReportOverridesReservationOnlyEstimate() {
        BusinessLiveOccupancy live = BusinessLiveOccupancy.builder()
                .currentCustomers(80)
                .reportedAt(Instant.now())
                .build();

        OccupancyBreakdownResponse breakdown = OccupancyEngine.computeBreakdown(
                200, 25, 5, 0, live);

        assertEquals(80, breakdown.getEffectiveOccupancy());
        assertEquals(55, breakdown.getWalkInEstimate());
        assertTrue(breakdown.isOwnerReportFresh());
    }

    @Test
    void withoutOwnerReportUsesReservationSignals() {
        OccupancyBreakdownResponse breakdown = OccupancyEngine.computeBreakdown(
                200, 20, 10, 5, null);

        assertEquals(32, breakdown.getReservationOnlyEstimate());
        assertEquals(32, breakdown.getEffectiveOccupancy());
    }

    @Test
    void staleOwnerReportActsAsFloor() {
        BusinessLiveOccupancy live = BusinessLiveOccupancy.builder()
                .currentCustomers(80)
                .reportedAt(Instant.now().minusSeconds(3600))
                .build();

        OccupancyBreakdownResponse breakdown = OccupancyEngine.computeBreakdown(
                200, 10, 0, 0, live);

        assertEquals(80, breakdown.getEffectiveOccupancy());
        assertEquals(70, breakdown.getWalkInEstimate());
    }

    @Test
    void effectiveOccupancyIsCappedAtCapacity() {
        BusinessLiveOccupancy live = BusinessLiveOccupancy.builder()
                .currentCustomers(250)
                .reportedAt(Instant.now())
                .build();

        OccupancyBreakdownResponse breakdown = OccupancyEngine.computeBreakdown(
                200, 50, 0, 0, live);

        assertEquals(200, breakdown.getEffectiveOccupancy());
    }
}