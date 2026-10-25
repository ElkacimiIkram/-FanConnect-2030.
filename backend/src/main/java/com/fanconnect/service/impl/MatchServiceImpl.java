package com.fanconnect.service.impl;

import com.fanconnect.dto.request.CreateMatchRequest;
import com.fanconnect.dto.request.UpdateMatchRequest;
import com.fanconnect.dto.response.MatchSummaryResponse;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.exception.ResourceNotFoundException;
import com.fanconnect.mapper.MatchMapper;
import com.fanconnect.model.entity.Competition;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.MatchStatus;
import com.fanconnect.model.enums.ReservationStatus;
import com.fanconnect.repository.CompetitionRepository;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.repository.ReservationRepository;
import com.fanconnect.config.WorldCupCompetitionScope;
import com.fanconnect.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private static final List<MatchStatus> UPCOMING_STATUSES = List.of(
            MatchStatus.SCHEDULED,
            MatchStatus.LIVE
    );

    private static final List<MatchStatus> MATCH_CENTER_STATUSES = List.of(
            MatchStatus.SCHEDULED,
            MatchStatus.LIVE,
            MatchStatus.FINISHED
    );

    private static final List<ReservationStatus> ACTIVE_RESERVATION_STATUSES = List.of(
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED
    );

    private final FootballMatchRepository footballMatchRepository;
    private final CompetitionRepository competitionRepository;
    private final ReservationRepository reservationRepository;
    private final MatchMapper matchMapper;
    private final FootballDataClient footballDataClient;

    @Override
    @Transactional(readOnly = true)
    public List<MatchSummaryResponse> findUpcoming() {
        Instant now = Instant.now();
        Instant finishedSince = now.minus(3, ChronoUnit.DAYS);
        return footballMatchRepository.findForMatchCenter(
                UPCOMING_STATUSES,
                finishedSince,
                footballDataClient.isConfigured()
        ).stream()
                .filter(this::isWorldCupMatch)
                .filter(match -> match.getStatus() == MatchStatus.LIVE
                        || (match.getStatus() == MatchStatus.SCHEDULED && match.getMatchDate().isAfter(now)))
                .map(matchMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MatchSummaryResponse findById(Long id) {
        FootballMatch match = footballMatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match", id));
        return matchMapper.toSummary(match);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchSummaryResponse> findAllForAdmin() {
        return footballMatchRepository.findAllByOrderByMatchDateDesc().stream()
                .map(matchMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public MatchSummaryResponse createMatch(CreateMatchRequest request) {
        Competition competitionRef = resolveCompetition(request.getCompetitionId(), request.getCompetition());
        String competitionName = competitionRef != null ? competitionRef.getName() : request.getCompetition().trim();

        FootballMatch match = FootballMatch.builder()
                .competition(competitionName)
                .competitionRef(competitionRef)
                .homeTeam(request.getHomeTeam().trim())
                .awayTeam(request.getAwayTeam().trim())
                .matchDate(request.getMatchDate())
                .venueName(trimOrNull(request.getVenueName()))
                .city(trimOrNull(request.getCity()))
                .status(request.getStatus() != null ? request.getStatus() : MatchStatus.SCHEDULED)
                .externalId(trimOrNull(request.getExternalId()))
                .groupName(trimOrNull(request.getGroupName()))
                .roundLabel(trimOrNull(request.getRoundLabel()))
                .homeScore(request.getHomeScore())
                .awayScore(request.getAwayScore())
                .matchMinute(request.getMatchMinute())
                .build();

        return matchMapper.toSummary(footballMatchRepository.save(match));
    }

    @Override
    @Transactional
    public MatchSummaryResponse updateMatch(Long id, UpdateMatchRequest request) {
        FootballMatch match = footballMatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match", id));

        if (request.getCompetitionId() != null || StringUtils.hasText(request.getCompetition())) {
            Competition competitionRef = resolveCompetition(
                    request.getCompetitionId(),
                    request.getCompetition() != null ? request.getCompetition() : match.getCompetition()
            );
            if (competitionRef != null) {
                match.setCompetitionRef(competitionRef);
                match.setCompetition(competitionRef.getName());
            } else if (StringUtils.hasText(request.getCompetition())) {
                match.setCompetition(request.getCompetition().trim());
            }
        }
        if (StringUtils.hasText(request.getHomeTeam())) {
            match.setHomeTeam(request.getHomeTeam().trim());
        }
        if (StringUtils.hasText(request.getAwayTeam())) {
            match.setAwayTeam(request.getAwayTeam().trim());
        }
        if (request.getMatchDate() != null) {
            match.setMatchDate(request.getMatchDate());
        }
        if (request.getVenueName() != null) {
            match.setVenueName(trimOrNull(request.getVenueName()));
        }
        if (request.getCity() != null) {
            match.setCity(trimOrNull(request.getCity()));
        }
        if (request.getStatus() != null) {
            match.setStatus(request.getStatus());
        }
        if (request.getExternalId() != null) {
            match.setExternalId(trimOrNull(request.getExternalId()));
        }
        if (request.getGroupName() != null) {
            match.setGroupName(trimOrNull(request.getGroupName()));
        }
        if (request.getRoundLabel() != null) {
            match.setRoundLabel(trimOrNull(request.getRoundLabel()));
        }
        if (request.getHomeScore() != null) {
            match.setHomeScore(request.getHomeScore());
        }
        if (request.getAwayScore() != null) {
            match.setAwayScore(request.getAwayScore());
        }
        if (request.getMatchMinute() != null) {
            match.setMatchMinute(request.getMatchMinute());
        }

        return matchMapper.toSummary(footballMatchRepository.save(match));
    }

    @Override
    @Transactional
    public void deleteMatch(Long id) {
        FootballMatch match = footballMatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match", id));

        long activeReservations = reservationRepository.countByMatchIdAndStatusIn(
                id,
                ACTIVE_RESERVATION_STATUSES
        );
        if (activeReservations > 0) {
            throw new BusinessException(
                    "Cannot delete match with " + activeReservations + " active reservation(s). "
                            + "Cancel bookings first or set status to CANCELLED."
            );
        }

        footballMatchRepository.delete(match);
    }

    private Competition resolveCompetition(Long competitionId, String competitionName) {
        if (competitionId != null) {
            return competitionRepository.findById(competitionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Competition", competitionId));
        }
        return null;
    }

    private String trimOrNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private boolean isWorldCupMatch(FootballMatch match) {
        if (match.getCompetitionRef() != null) {
            String slug = match.getCompetitionRef().getSlug();
            return WorldCupCompetitionScope.SLUG_WC_2026.equals(slug)
                    || WorldCupCompetitionScope.SLUG_WC_2030.equals(slug);
        }
        String name = match.getCompetition() != null ? match.getCompetition().toLowerCase(Locale.ROOT) : "";
        return name.contains("world cup") || name.contains("coupe du monde");
    }
}