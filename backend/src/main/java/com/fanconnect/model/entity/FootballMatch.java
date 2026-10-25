package com.fanconnect.model.entity;

import com.fanconnect.model.enums.MatchStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "football_matches")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FootballMatch extends BaseEntity {

    @Column(name = "external_id", length = 50)
    private String externalId;

    @Column(nullable = false, length = 100)
    private String competition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id")
    private Competition competitionRef;

    @Column(name = "group_name", length = 50)
    private String groupName;

    @Column(name = "round_label", length = 100)
    private String roundLabel;

    @Column(name = "home_score")
    private Integer homeScore;

    @Column(name = "away_score")
    private Integer awayScore;

    @Column(name = "match_minute")
    private Integer matchMinute;

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;

    @Column(name = "home_team", nullable = false, length = 100)
    private String homeTeam;

    @Column(name = "away_team", nullable = false, length = 100)
    private String awayTeam;

    @Column(name = "match_date", nullable = false)
    private Instant matchDate;

    @Column(name = "venue_name", length = 150)
    private String venueName;

    @Column(length = 100)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MatchStatus status;
}