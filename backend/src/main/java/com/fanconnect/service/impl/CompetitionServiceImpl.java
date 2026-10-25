package com.fanconnect.service.impl;

import com.fanconnect.dto.request.CreateCompetitionRequest;
import com.fanconnect.dto.request.UpdateCompetitionRequest;
import com.fanconnect.dto.response.CompetitionMatchesResponse;
import com.fanconnect.dto.response.CompetitionResponse;
import com.fanconnect.dto.response.GroupMatchesResponse;
import com.fanconnect.dto.response.MatchCenterResponse;
import com.fanconnect.dto.response.MatchSummaryResponse;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.mapper.MatchMapper;
import com.fanconnect.model.entity.Competition;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.MatchStatus;
import com.fanconnect.repository.CompetitionRepository;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.service.CompetitionService;
import com.fanconnect.service.MatchDataSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompetitionServiceImpl implements CompetitionService {

    private static final List<MatchStatus> MATCH_CENTER_STATUSES = List.of(
            MatchStatus.SCHEDULED,
            MatchStatus.LIVE,
            MatchStatus.FINISHED
    );

    private final CompetitionRepository competitionRepository;
    private final FootballMatchRepository footballMatchRepository;
    private final FootballDataClient footballDataClient;
    private final MatchMapper matchMapper;
    private final MatchDataSyncService matchDataSyncService;

    @Override
    @Transactional(readOnly = true)
    public List<CompetitionResponse> findActivePublic() {
        return competitionRepository.findByActiveTrueOrderByCategoryAscStartDateDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompetitionResponse> findAllForAdmin() {
        return competitionRepository.findAllByOrderByCategoryAscNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CompetitionResponse findById(Long id) {
        return toResponse(getCompetition(id));
    }

    @Override
    @Transactional
    public CompetitionResponse create(CreateCompetitionRequest request) {
        if (competitionRepository.findBySlug(request.getSlug().trim()).isPresent()) {
            throw new BusinessException("Competition slug already exists");
        }

        Competition saved = competitionRepository.save(Competition.builder()
                .name(request.getName().trim())
                .slug(request.getSlug().trim().toLowerCase())
                .category(request.getCategory())
                .season(trimOrNull(request.getSeason()))
                .description(trimOrNull(request.getDescription()))
                .logoUrl(trimOrNull(request.getLogoUrl()))
                .externalCode(trimOrNull(request.getExternalCode()))
                .externalSource("FOOTBALL_DATA_ORG")
                .active(request.getActive() == null || request.getActive())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build());

        return toResponse(saved);
    }

    @Override
    @Transactional
    public CompetitionResponse update(Long id, UpdateCompetitionRequest request) {
        Competition competition = getCompetition(id);

        if (StringUtils.hasText(request.getName())) {
            competition.setName(request.getName().trim());
        }
        if (StringUtils.hasText(request.getSlug())) {
            String slug = request.getSlug().trim().toLowerCase();
            competitionRepository.findBySlug(slug).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new BusinessException("Competition slug already exists");
                }
            });
            competition.setSlug(slug);
        }
        if (request.getCategory() != null) {
            competition.setCategory(request.getCategory());
        }
        if (request.getSeason() != null) {
            competition.setSeason(trimOrNull(request.getSeason()));
        }
        if (request.getDescription() != null) {
            competition.setDescription(trimOrNull(request.getDescription()));
        }
        if (request.getLogoUrl() != null) {
            competition.setLogoUrl(trimOrNull(request.getLogoUrl()));
        }
        if (request.getExternalCode() != null) {
            competition.setExternalCode(trimOrNull(request.getExternalCode()));
        }
        if (request.getActive() != null) {
            competition.setActive(request.getActive());
        }
        if (request.getStartDate() != null) {
            competition.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            competition.setEndDate(request.getEndDate());
        }

        return toResponse(competitionRepository.save(competition));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Competition competition = getCompetition(id);
        long matchCount = footballMatchRepository.findByCompetitionRefIdOrderByMatchDateAsc(id).size();
        if (matchCount > 0) {
            throw new BusinessException("Cannot delete competition with " + matchCount + " match(es)");
        }
        competitionRepository.delete(competition);
    }

    @Override
    @Transactional(readOnly = true)
    public MatchCenterResponse getMatchCenter() {
        boolean apiConfigured = footballDataClient.isConfigured();
        boolean realOnly = apiConfigured;

        Instant finishedSince = Instant.now().minus(3, ChronoUnit.DAYS);
        List<FootballMatch> matches = footballMatchRepository.findForMatchCenter(
                MATCH_CENTER_STATUSES,
                finishedSince,
                realOnly
        );

        Map<Long, List<MatchSummaryResponse>> byCompetition = matches.stream()
                .map(matchMapper::toSummary)
                .collect(Collectors.groupingBy(
                        m -> m.getCompetitionId() != null ? m.getCompetitionId() : -1L,
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<CompetitionMatchesResponse> competitionBlocks = new ArrayList<>();

        for (Competition competition : competitionRepository.findByActiveTrueOrderByCategoryAscStartDateDesc()) {
            List<MatchSummaryResponse> compMatches = byCompetition.getOrDefault(competition.getId(), List.of());
            if (compMatches.isEmpty()) {
                continue;
            }
            competitionBlocks.add(buildCompetitionBlock(competition, compMatches));
        }

        List<MatchSummaryResponse> orphanMatches = byCompetition.getOrDefault(-1L, List.of());
        if (!orphanMatches.isEmpty()) {
            competitionBlocks.add(CompetitionMatchesResponse.builder()
                    .name("Autres matchs")
                    .slug("other")
                    .matches(orphanMatches)
                    .groups(List.of())
                    .build());
        }

        long liveCount = matches.stream()
                .filter(m -> m.getStatus() == MatchStatus.LIVE)
                .count();

        return MatchCenterResponse.builder()
                .competitions(competitionBlocks)
                .liveDataEnabled(apiConfigured && !matches.isEmpty())
                .apiConfigured(apiConfigured)
                .lastSyncedAt(footballMatchRepository.findLatestSyncTime().orElse(null))
                .liveMatchCount((int) liveCount)
                .build();
    }

    @Override
    public int syncAllCompetitionMatches() {
        return matchDataSyncService.syncAllActiveCompetitions();
    }

    @Override
    public int syncCompetitionMatches(Long competitionId) {
        return matchDataSyncService.syncCompetition(competitionId);
    }

    private CompetitionMatchesResponse buildCompetitionBlock(
            Competition competition,
            List<MatchSummaryResponse> matches
    ) {
        Map<String, List<MatchSummaryResponse>> grouped = matches.stream()
                .filter(m -> StringUtils.hasText(m.getGroupName()))
                .collect(Collectors.groupingBy(
                        MatchSummaryResponse::getGroupName,
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<GroupMatchesResponse> groups = grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> GroupMatchesResponse.builder()
                        .groupName(entry.getKey())
                        .matches(entry.getValue())
                        .build())
                .toList();

        List<MatchSummaryResponse> ungrouped = matches.stream()
                .filter(m -> !StringUtils.hasText(m.getGroupName()))
                .sorted(Comparator.comparing(MatchSummaryResponse::getMatchDate))
                .toList();

        return CompetitionMatchesResponse.builder()
                .id(competition.getId())
                .name(competition.getName())
                .slug(competition.getSlug())
                .category(competition.getCategory())
                .season(competition.getSeason())
                .description(competition.getDescription())
                .groups(groups)
                .matches(ungrouped)
                .build();
    }

    private CompetitionResponse toResponse(Competition competition) {
        int matchCount = footballMatchRepository.findByCompetitionRefIdOrderByMatchDateAsc(competition.getId()).size();
        return CompetitionResponse.builder()
                .id(competition.getId())
                .name(competition.getName())
                .slug(competition.getSlug())
                .category(competition.getCategory())
                .season(competition.getSeason())
                .description(competition.getDescription())
                .logoUrl(competition.getLogoUrl())
                .externalCode(competition.getExternalCode())
                .externalSource(competition.getExternalSource())
                .active(competition.isActive())
                .startDate(competition.getStartDate())
                .endDate(competition.getEndDate())
                .matchCount(matchCount)
                .build();
    }

    private Competition getCompetition(Long id) {
        return competitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Competition", id));
    }

    private String trimOrNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}