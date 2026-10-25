package com.fanconnect.model.entity;

import com.fanconnect.model.enums.CompetitionCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "competitions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Competition extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100, unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CompetitionCategory category;

    @Column(length = 20)
    private String season;

    @Column(length = 500)
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "external_code", length = 20)
    private String externalCode;

    @Column(name = "external_source", length = 30)
    private String externalSource;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;
}