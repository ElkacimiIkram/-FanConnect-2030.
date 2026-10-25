package com.fanconnect.service.impl;

import com.fanconnect.dto.request.CreateMatchRequest;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.mapper.MatchMapper;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.MatchStatus;
import com.fanconnect.repository.FootballMatchRepository;
import com.fanconnect.repository.ReservationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchServiceImplTest {

    @Mock
    private FootballMatchRepository footballMatchRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private MatchMapper matchMapper;

    @Mock
    private FootballDataClient footballDataClient;

    @Mock
    private com.fanconnect.service.MatchDataSyncService matchDataSyncService;

    @InjectMocks
    private MatchServiceImpl matchService;

    @Test
    void deleteMatch_blocksWhenActiveReservationsExist() {
        FootballMatch match = FootballMatch.builder()
                .competition("Test")
                .homeTeam("A")
                .awayTeam("B")
                .matchDate(Instant.now().plusSeconds(3600))
                .status(MatchStatus.SCHEDULED)
                .build();
        match.setId(1L);

        when(footballMatchRepository.findById(1L)).thenReturn(Optional.of(match));
        when(reservationRepository.countByMatchIdAndStatusIn(eq(1L), any())).thenReturn(2L);

        assertThrows(BusinessException.class, () -> matchService.deleteMatch(1L));
        verify(footballMatchRepository, never()).delete(match);
    }

    @Test
    void createMatch_defaultsStatusToScheduled() {
        CreateMatchRequest request = CreateMatchRequest.builder()
                .competition("CAF")
                .homeTeam("Morocco")
                .awayTeam("Senegal")
                .matchDate(Instant.parse("2026-07-05T19:00:00Z"))
                .city("Casablanca")
                .build();

        FootballMatch saved = FootballMatch.builder()
                .competition("CAF")
                .homeTeam("Morocco")
                .awayTeam("Senegal")
                .matchDate(request.getMatchDate())
                .status(MatchStatus.SCHEDULED)
                .build();
        saved.setId(10L);

        when(footballMatchRepository.save(any(FootballMatch.class))).thenReturn(saved);
        when(matchMapper.toSummary(saved)).thenReturn(
                com.fanconnect.dto.response.MatchSummaryResponse.builder()
                        .id(10L)
                        .status(MatchStatus.SCHEDULED)
                        .build()
        );

        matchService.createMatch(request);

        verify(footballMatchRepository).save(any(FootballMatch.class));
    }
}