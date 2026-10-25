package com.fanconnect.service.impl;

import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Known host / fan cities so FanBot can resolve "Oualidia", "El Jadida", etc.
 * even when no café is listed there yet.
 */
final class AssistantGeoCatalog {

    record City(String displayName, double latitude, double longitude) {
    }

    private static final Map<String, City> CITIES = new LinkedHashMap<>();

    static {
        put("casablanca", "Casablanca", 33.5731, -7.5898, "casa");
        put("rabat", "Rabat", 34.0209, -6.8416);
        put("sale", "Salé", 34.0531, -6.7985, "salé");
        put("tanger", "Tanger", 35.7595, -5.8340, "tangier");
        put("marrakech", "Marrakech", 31.6295, -7.9811, "marrakesh");
        put("agadir", "Agadir", 30.4278, -9.5981);
        put("fes", "Fès", 34.0181, -5.0078, "fez", "fès");
        put("meknes", "Meknès", 33.8935, -5.5473);
        put("oujda", "Oujda", 34.6814, -1.9086);
        put("nador", "Nador", 35.1688, -2.9286);
        put("el jadida", "El Jadida", 33.2549, -8.5060, "jadida");
        put("safi", "Safi", 32.2994, -9.2372);
        put("oualidia", "Oualidia", 32.7333, -9.0333, "walidia", "el oualidia");
        put("essaouira", "Essaouira", 31.5085, -9.7595, "mogador");
        put("kenitra", "Kénitra", 34.2610, -6.5802);
        put("mohammedia", "Mohammedia", 33.6861, -7.3830);
        put("settat", "Settat", 33.0010, -7.6166);
        put("madrid", "Madrid", 40.4168, -3.7038);
        put("lisbonne", "Lisbonne", 38.7223, -9.1393, "lisbon", "lisboa");
        put("seville", "Séville", 37.3891, -5.9845, "sevilla", "séville");
    }

    private AssistantGeoCatalog() {
    }

    static City findInText(String rawText) {
        String text = normalize(rawText);
        if (text.isBlank()) {
            return null;
        }
        City best = null;
        int bestLength = 0;
        for (Map.Entry<String, City> entry : CITIES.entrySet()) {
            String key = entry.getKey();
            if (text.contains(key) && key.length() > bestLength) {
                best = entry.getValue();
                bestLength = key.length();
            }
        }
        return best;
    }

    static City byName(String name) {
        if (!StringUtils.hasText(name)) {
            return null;
        }
        return CITIES.get(normalize(name));
    }

    static String normalize(String value) {
        if (value == null) {
            return "";
        }
        String stripped = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        return stripped.toLowerCase(Locale.ROOT).trim();
    }

    private static void put(String canonical, String display, double lat, double lng, String... aliases) {
        City city = new City(display, lat, lng);
        CITIES.put(canonical, city);
        for (String alias : aliases) {
            CITIES.putIfAbsent(normalize(alias), city);
        }
    }
}
