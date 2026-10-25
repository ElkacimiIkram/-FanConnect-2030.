package com.fanconnect.model.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RoleTest {

    @Test
    void fromLegacy_mapsOldRoleNames() {
        assertEquals(Role.FAN_USER, Role.fromLegacy("SUPPORTER"));
        assertEquals(Role.FAN_USER, Role.fromLegacy("CUSTOMER"));
        assertEquals(Role.BUSINESS_OWNER, Role.fromLegacy("CAFE_OWNER"));
        assertEquals(Role.ADMIN, Role.fromLegacy("ADMIN"));
    }

    @Test
    void fromLegacy_defaultsToFanUserWhenBlank() {
        assertEquals(Role.FAN_USER, Role.fromLegacy(null));
        assertEquals(Role.FAN_USER, Role.fromLegacy(""));
    }
}