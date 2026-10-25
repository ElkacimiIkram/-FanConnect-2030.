package com.fanconnect.service;

import com.fanconnect.dto.response.LiveMatchFeedResponse;
import com.fanconnect.dto.response.MatchCalendarResponse;
import com.fanconnect.dto.response.MatchDetailResponse;
import com.fanconnect.dto.response.MatchNavigationSectionResponse;
import com.fanconnect.dto.response.StandingsResponse;
import com.fanconnect.dto.response.WorldCupTeamResponse;

import java.time.LocalDate;
import java.util.List;

public interface LiveMatchFeedService {

    LiveMatchFeedResponse getFeed(LocalDate date, String navId, String statusFilter, String sort, boolean refresh);

    MatchCalendarResponse getCalendar(LocalDate month, String navId, LocalDate selectedDate);

    MatchDetailResponse getMatchDetail(String externalId);

    MatchDetailResponse getLocalMatchDetail(Long localId);

    List<MatchNavigationSectionResponse> getNavigation();

    StandingsResponse getStandings(String competitionCode);

    List<WorldCupTeamResponse> getTeams(String navId);
}