package com.fanconnect.service;

import com.fanconnect.dto.request.UpdateLiveOccupancyRequest;
import com.fanconnect.dto.response.LiveOccupancyResponse;
import com.fanconnect.dto.response.OccupancyAnalyticsResponse;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.BusinessLiveOccupancy;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.entity.User;

public interface LiveOccupancyService {

    LiveOccupancyResponse updateLiveOccupancy(Long businessId, UpdateLiveOccupancyRequest request);

    LiveOccupancyResponse getLatestLiveOccupancy(Long businessId, Long matchId);

    BusinessLiveOccupancy findLatestReport(Business business, FootballMatch match);

    OccupancyAnalyticsResponse getAnalytics(Long businessId);

    void recordSnapshot(Business business, FootballMatch match, int capacity,
                        int checkedIn, int confirmed, int pending,
                        BusinessLiveOccupancy liveReport);

    void recordCheckIn(Business business, FootballMatch match, int partySize, User reportedBy);
}