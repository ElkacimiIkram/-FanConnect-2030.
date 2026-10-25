package com.fanconnect.service.impl;

import com.fanconnect.dto.GeoCoordinates;
import com.fanconnect.service.GeocodingService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeocodingServiceImpl implements GeocodingService {

    private static final String USER_AGENT = "FanConnect2030/1.0 (business-geocoding)";
    private static final Pattern AT_COORDS = Pattern.compile("@(-?\\d+(?:\\.\\d+)?),(-?\\d+(?:\\.\\d+)?)");
    private static final Pattern PLACE_COORDS = Pattern.compile("!3d(-?\\d+(?:\\.\\d+)?)!4d(-?\\d+(?:\\.\\d+)?)");
    private static final Pattern LL_PARAM = Pattern.compile("[?&]ll=(-?\\d+(?:\\.\\d+)?),(-?\\d+(?:\\.\\d+)?)");
    private static final Pattern Q_COORDS = Pattern.compile("[?&]q=(-?\\d+(?:\\.\\d+)?),(-?\\d+(?:\\.\\d+)?)");

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    @Override
    public GeoCoordinates resolve(
            BigDecimal latitude,
            BigDecimal longitude,
            String googleMapsUrl,
            String address,
            String city,
            String country
    ) {
        if (isValidCoordinate(latitude, longitude)) {
            return GeoCoordinates.builder()
                    .latitude(scale(latitude))
                    .longitude(scale(longitude))
                    .build();
        }

        Optional<GeoCoordinates> fromUrl = parseGoogleMapsUrl(googleMapsUrl);
        if (fromUrl.isPresent()) {
            return fromUrl.get();
        }

        return geocodeAddress(address, city, country);
    }

    static Optional<GeoCoordinates> parseGoogleMapsUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return Optional.empty();
        }

        String decoded = url.trim();
        for (Pattern pattern : new Pattern[]{PLACE_COORDS, AT_COORDS, LL_PARAM, Q_COORDS}) {
            Matcher matcher = pattern.matcher(decoded);
            if (matcher.find()) {
                return toCoordinates(matcher.group(1), matcher.group(2));
            }
        }
        return Optional.empty();
    }

    private GeoCoordinates geocodeAddress(String address, String city, String country) {
        StringBuilder query = new StringBuilder();
        if (StringUtils.hasText(address)) {
            query.append(address.trim());
        }
        if (StringUtils.hasText(city)) {
            if (!query.isEmpty()) {
                query.append(", ");
            }
            query.append(city.trim());
        }
        if (StringUtils.hasText(country)) {
            if (!query.isEmpty()) {
                query.append(", ");
            }
            query.append(country.trim());
        }

        if (query.isEmpty()) {
            return GeoCoordinates.builder().build();
        }

        try {
            String encoded = URLEncoder.encode(query.toString(), StandardCharsets.UTF_8);
            URI uri = URI.create(
                    "https://nominatim.openstreetmap.org/search?q=" + encoded + "&format=json&limit=1"
            );

            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(10))
                    .header("User-Agent", USER_AGENT)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200 || !StringUtils.hasText(response.body())) {
                log.warn("Nominatim geocoding failed with status {}", response.statusCode());
                return GeoCoordinates.builder().build();
            }

            JsonNode root = objectMapper.readTree(response.body());
            if (!root.isArray() || root.isEmpty()) {
                return GeoCoordinates.builder().build();
            }

            JsonNode first = root.get(0);
            return GeoCoordinates.builder()
                    .latitude(scale(new BigDecimal(first.get("lat").asText())))
                    .longitude(scale(new BigDecimal(first.get("lon").asText())))
                    .build();
        } catch (Exception ex) {
            log.warn("Geocoding failed for '{}': {}", query, ex.getMessage());
            return GeoCoordinates.builder().build();
        }
    }

    private static Optional<GeoCoordinates> toCoordinates(String latText, String lngText) {
        try {
            BigDecimal lat = scale(new BigDecimal(latText));
            BigDecimal lng = scale(new BigDecimal(lngText));
            if (!isValidCoordinate(lat, lng)) {
                return Optional.empty();
            }
            return Optional.of(GeoCoordinates.builder().latitude(lat).longitude(lng).build());
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }
    }

    private static boolean isValidCoordinate(BigDecimal latitude, BigDecimal longitude) {
        if (latitude == null || longitude == null) {
            return false;
        }
        double lat = latitude.doubleValue();
        double lng = longitude.doubleValue();
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat == 0 && lng == 0);
    }

    private static BigDecimal scale(BigDecimal value) {
        return value.setScale(7, RoundingMode.HALF_UP);
    }
}