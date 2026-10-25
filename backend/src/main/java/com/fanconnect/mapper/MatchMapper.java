package com.fanconnect.mapper;

import com.fanconnect.dto.response.MatchSummaryResponse;
import com.fanconnect.model.entity.Competition;
import com.fanconnect.model.entity.FootballMatch;
import com.fanconnect.model.enums.MatchStatus;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
public class MatchMapper {

    public MatchSummaryResponse toSummary(FootballMatch match) {
        Competition competitionRef = match.getCompetitionRef();
        MatchSummaryResponse.MatchSummaryResponseBuilder builder = MatchSummaryResponse.builder()
                .id(match.getId())
                .competition(match.getCompetition())
                .homeTeam(match.getHomeTeam())
                .awayTeam(match.getAwayTeam())
                .matchDate(match.getMatchDate())
                .venueName(match.getVenueName())
                .city(match.getCity())
                .status(match.getStatus())
                .groupName(match.getGroupName())
                .roundLabel(match.getRoundLabel())
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore())
                .matchMinute(match.getMatchMinute())
                .externalId(match.getExternalId());

        if (competitionRef != null) {
            builder.competitionId(competitionRef.getId())
                    .competitionName(competitionRef.getName())
                    .competitionCategory(competitionRef.getCategory());
        } else {
            builder.competitionName(match.getCompetition());
        }

        if (match.getStatus() == MatchStatus.SCHEDULED && match.getMatchDate() != null) {
            long seconds = Duration.between(Instant.now(), match.getMatchDate()).getSeconds();
            builder.secondsUntilKickoff(Math.max(0, seconds));
        }

        return builder.build();
    }
}