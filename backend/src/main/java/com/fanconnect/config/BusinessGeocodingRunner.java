package com.fanconnect.config;

import com.fanconnect.dto.GeoCoordinates;
import com.fanconnect.model.entity.Business;
import com.fanconnect.repository.BusinessRepository;
import com.fanconnect.service.GeocodingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BusinessGeocodingRunner implements ApplicationRunner {

    private final BusinessRepository businessRepository;
    private final GeocodingService geocodingService;

    @Value("${fanconnect.geocoding.backfill-on-startup:true}")
    private boolean backfillOnStartup;

    @Value("${fanconnect.geocoding.backfill-limit:30}")
    private int backfillLimit;

    @Override
    public void run(ApplicationArguments args) {
        if (!backfillOnStartup) {
            return;
        }

        List<Business> missingCoords = businessRepository.findByLatitudeIsNull();
        List<Business> withMapsUrl = businessRepository.findByGoogleMapsUrlIsNotNull();
        LinkedHashMap<Long, Business> candidates = new LinkedHashMap<>();
        for (Business business : missingCoords) {
            candidates.put(business.getId(), business);
        }
        for (Business business : withMapsUrl) {
            candidates.putIfAbsent(business.getId(), business);
        }

        if (candidates.isEmpty()) {
            return;
        }

        int processed = 0;
        for (Business business : candidates.values()) {
            if (processed >= backfillLimit) {
                break;
            }

            GeoCoordinates coords = geocodingService.resolve(
                    business.getLatitude(),
                    business.getLongitude(),
                    business.getGoogleMapsUrl(),
                    business.getAddress(),
                    business.getCity(),
                    business.getCountry()
            );

            if (!coords.isPresent()) {
                continue;
            }

            business.setLatitude(coords.getLatitude());
            business.setLongitude(coords.getLongitude());
            businessRepository.save(business);
            processed++;

            try {
                Thread.sleep(1100);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        if (processed > 0) {
            log.info("Geocoded {} business(es) missing coordinates on startup", processed);
        }
    }
}