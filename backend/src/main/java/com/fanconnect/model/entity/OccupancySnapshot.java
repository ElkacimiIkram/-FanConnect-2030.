package com.fanconnect.model.entity;

import com.fanconnect.model.enums.OccupancyLevel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "occupancy_snapshots")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancySnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    private FootballMatch match;

    @Column(name = "snapshot_at", nullable = false)
    @Builder.Default
    private Instant snapshotAt = Instant.now();

    @Column(nullable = false)
    private int capacity;

    @Column(name = "owner_reported_count")
    private Integer ownerReportedCount;

    @Column(name = "checked_in_seats", nullable = false)
    private int checkedInSeats;

    @Column(name = "confirmed_not_arrived", nullable = false)
    private int confirmedNotArrived;

    @Column(name = "pending_reservations", nullable = false)
    private int pendingReservations;

    @Column(name = "effective_occupancy", nullable = false)
    private int effectiveOccupancy;

    @Column(name = "occupancy_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal occupancyPercent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private OccupancyLevel level;

    @Column(name = "day_of_week")
    private Short dayOfWeek;

    @Column(name = "hour_of_day")
    private Short hourOfDay;
}