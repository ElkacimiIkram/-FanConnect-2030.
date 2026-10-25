package com.fanconnect.service.impl;

import com.fanconnect.dto.response.BusinessOccupancyResponse;
import com.fanconnect.dto.response.MatchRecommendationsResponse;
import com.fanconnect.dto.response.OccupancyPredictionResponse;
import com.fanconnect.dto.response.VenueRecommendationResponse;
import com.fanconnect.mapper.BusinessMapper;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.BusinessStatus;
import com.fanconnect.model.enums.BusinessType;
import com.fanconnect.model.enums.OccupancyLevel;
import com.fanconnect.model.enums.OccupancyRisk;
import com.fanconnect.model.enums.RecommendationReasonCode;
import com.fanconnect.repository.BusinessRepository;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.service.BusinessOccupancyService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceImplTest {

    @Mock
    private FootballMatchRepository footballMatchRepository;
    @Mock
    private BusinessRepository businessRepository;
    @Mock
    private BusinessOccupancyService businessOccupancyService;
    @Mock
    private BusinessMapper businessMapper;

    @InjectMocks
    private RecommendationServiceImpl recommendationService;

    @Test
    void recommendForMatch_prioritizesNearbyVenueWithinFiveKm() {
        FootballMatch match = FootballMatch.builder()
                .homeTeam("Morocco")
                .awayTeam("Portugal")
                .competition("FIFA World Cup 2030")
                .build();
        match.setId(1L);

        Business nearby = business("Atlas Café", "Beni Mellal", 32.3373, -6.3498);
        Business distant = business("Marina Café", "Casablanca", 33.5731, -7.5898);

        when(footballMatchRepository.findById(1L)).thenReturn(Optional.of(match));
        when(businessRepository.findByStatusOrderByNameAsc(BusinessStatus.APPROVED))
                .thenReturn(List.of(nearby, distant));
        when(businessMapper.toSummary(nearby)).thenReturn(summary(nearby));
        when(businessMapper.toSummary(distant)).thenReturn(summary(distant));
        when(businessOccupancyService.getBusinessOccupancyReadOnly(anyLong(), anyLong()))
                .thenAnswer(invocation -> occupancy(invocation.getArgument(0)));

        MatchRecommendationsResponse response = recommendationService.recommendForMatch(
                1L,
                32.3400,
                -6.3500,
                5
        );

        assertThat(response.isGeoEnabled()).isTrue();
        assertThat(response.getSearchRadiusKm()).isEqualTo(5.0);
        assertThat(response.getRecommendations()).hasSize(1);
        VenueRecommendationResponse top = response.getRecommendations().get(0);
        assertThat(top.getName()).isEqualTo("Atlas Café");
        assertThat(top.getDistanceKm()).isLessThan(1.0);
        assertThat(top.getAiScore()).isGreaterThan(0);
        assertThat(top.getReasonCode()).isEqualTo(RecommendationReasonCode.CLOSEST_LOW_CROWD);
    }

    private Business business(String name, String city, double lat, double lng) {
        Business business = Business.builder()
                .name(name)
                .city(city)
                .businessType(BusinessType.CAFE)
                .status(BusinessStatus.APPROVED)
                .totalCapacity(80)
                .totalTables(20)
                .latitude(BigDecimal.valueOf(lat))
                .longitude(BigDecimal.valueOf(lng))
                .build();
        business.setId((long) (name.hashCode() & 0xffff));
        return business;
    }

    private com.fanconnect.dto.response.BusinessSummaryResponse summary(Business business) {
        return com.fanconnect.dto.response.BusinessSummaryResponse.builder()
                .id(business.getId())
                .name(business.getName())
                .city(business.getCity())
                .businessType(business.getBusinessType())
                .status(business.getStatus())
                .totalCapacity(business.getTotalCapacity())
                .totalTables(business.getTotalTables())
                .latitude(business.getLatitude())
                .longitude(business.getLongitude())
                .build();
    }

    private BusinessOccupancyResponse occupancy(Long businessId) {
        boolean nearby = businessId != null && businessId > 0;
        return BusinessOccupancyResponse.builder()
                .businessId(businessId)
                .capacity(80)
                .bookedSeats(nearby ? 30 : 70)
                .availableSeats(nearby ? 50 : 10)
                .occupancyPercentage(nearby ? 37.5 : 87.5)
                .level(nearby ? OccupancyLevel.GREEN : OccupancyLevel.RED)
                .prediction(OccupancyPredictionResponse.builder()
                        .projectedPeakPercent(nearby ? 55 : 95)
                        .fullRisk(nearby ? OccupancyRisk.LOW : OccupancyRisk.HIGH)
                        .predictedLevelAtKickoff(nearby ? OccupancyLevel.GREEN : OccupancyLevel.RED)
                        .build())
                .build();
    }
}