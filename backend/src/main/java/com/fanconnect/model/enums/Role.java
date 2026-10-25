package com.fanconnect.model.enums;

public enum Role {
    FAN_USER,
    BUSINESS_OWNER,
    ADMIN;

    /**
     * Maps legacy role strings from pre-Phase-0 tokens or data.
     */
    public static Role fromLegacy(String value) {
        if (value == null || value.isBlank()) {
            return FAN_USER;
        }
        return switch (value) {
            case "SUPPORTER", "CUSTOMER" -> FAN_USER;
            case "CAFE_OWNER" -> BUSINESS_OWNER;
            default -> Role.valueOf(value);
        };
    }

    public boolean isFan() {
        return this == FAN_USER;
    }

    public boolean isBusinessOwner() {
        return this == BUSINESS_OWNER;
    }

    public boolean isAdmin() {
        return this == ADMIN;
    }
}