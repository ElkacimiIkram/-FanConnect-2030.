package com.fanconnect.util;

import org.springframework.util.StringUtils;

public final class TicketCodeParser {

    private static final String QR_PREFIX = "FANCONNECT|TICKET|";

    private TicketCodeParser() {
    }

    public static String normalize(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        String trimmed = raw.trim();
        if (trimmed.toUpperCase().startsWith(QR_PREFIX)) {
            return trimmed.substring(QR_PREFIX.length()).trim();
        }
        if (trimmed.contains("|")) {
            String[] parts = trimmed.split("\\|");
            return parts[parts.length - 1].trim();
        }
        return trimmed;
    }
}