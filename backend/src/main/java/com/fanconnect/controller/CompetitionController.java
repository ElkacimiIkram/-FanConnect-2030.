package com.fanconnect.controller;

import com.fanconnect.dto.response.ApiResponse;
import com.fanconnect.dto.response.CompetitionResponse;
import com.fanconnect.dto.response.LiveMatchFeedResponse;
import com.fanconnect.dto.response.MatchCalendarResponse;
import com.fanconnect.dto.response.MatchCenterResponse;
import com.fanconnect.dto.response.MatchNavigationSectionResponse;
import com.fanconnect.dto.response.StandingsResponse;
import com.fanconnect.dto.response.WorldCupTeamResponse;
import com.fanconnect.service.CompetitionService;
import com.fanconnect.service.DemoMatchSeedService;
import com.fanconnect.service.LiveMatchFeedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.format.annotation.DateTimeFormat.ISO;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/competitions")
@RequiredArgsConstructor
@Tag(name = "Competitions", description = "FIFA World Cup 2026 & 2030 match center")
public class CompetitionController {

    private final CompetitionService competitionService;
    private final LiveMatchFeedService liveMatchFeedService;
    private final DemoMatchSeedService demoMatchSeedService;

    @GetMapping
    @Operation(summary = "List active competitions")
    public ResponseEntity<ApiResponse<List<CompetitionResponse>>> listActive() {
        return ResponseEntity.ok(ApiResponse.success(competitionService.findActivePublic()));
    }

    @GetMapping("/match-center")
    @Operation(summary = "Match center grouped by competition and group")
    public ResponseEntity<ApiResponse<MatchCenterResponse>> matchCenter() {
        return ResponseEntity.ok(ApiResponse.success(competitionService.getMatchCenter()));
    }

    @GetMapping("/live-feed")
    @Operation(summary = "World Cup match feed grouped by competition")
    public ResponseEntity<ApiResponse<LiveMatchFeedResponse>> liveFeed(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false, defaultValue = "all") String nav,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "TIME") String sort,
            @RequestParam(required = false, defaultValue = "false") boolean refresh
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                liveMatchFeedService.getFeed(date, nav, status, sort, refresh)
        ));
    }

    @GetMapping("/calendar")
    @Operation(summary = "Monthly match calendar")
    public ResponseEntity<ApiResponse<MatchCalendarResponse>> calendar(
            @RequestParam(required = false) String month,
            @RequestParam(required = false, defaultValue = "all") String nav,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate selectedDate
    ) {
        LocalDate monthDate = parseMonth(month);
        return ResponseEntity.ok(ApiResponse.success(
                liveMatchFeedService.getCalendar(monthDate, nav, selectedDate)
        ));
    }

    @GetMapping("/navigation")
    @Operation(summary = "Match center navigation catalog")
    public ResponseEntity<ApiResponse<List<MatchNavigationSectionResponse>>> navigation() {
        return ResponseEntity.ok(ApiResponse.success(liveMatchFeedService.getNavigation()));
    }

    @RequestMapping(value = "/demo/seed", method = {RequestMethod.GET, RequestMethod.POST})
    @Operation(summary = "Reload World Cup 2026/2030 demo matches around now (jury / soutenance)")
    public ResponseEntity<ApiResponse<Integer>> seedDemoMatches() {
        int seeded = demoMatchSeedService.seedDemoMatches();
        return ResponseEntity.ok(ApiResponse.success(
                seeded + " match(s) de démonstration CDM 2026/2030 prêts pour aujourd'hui",
                seeded
        ));
    }

    @GetMapping("/{code}/standings")
    @Operation(summary = "World Cup group standings")
    public ResponseEntity<ApiResponse<StandingsResponse>> standings(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(liveMatchFeedService.getStandings(code)));
    }

    @GetMapping("/teams")
    @Operation(summary = "World Cup national teams catalog")
    public ResponseEntity<ApiResponse<List<WorldCupTeamResponse>>> teams(
            @RequestParam(required = false, defaultValue = "all") String nav
    ) {
        return ResponseEntity.ok(ApiResponse.success(liveMatchFeedService.getTeams(nav)));
    }

    private LocalDate parseMonth(String month) {
        if (month == null || month.isBlank()) {
            return LocalDate.now().withDayOfMonth(1);
        }
        try {
            return YearMonth.parse(month).atDay(1);
        } catch (Exception ex) {
            return LocalDate.now().withDayOfMonth(1);
        }
    }
}