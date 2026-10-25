package com.fanconnect.service;

import com.fanconnect.dto.request.CreateCompetitionRequest;
import com.fanconnect.dto.request.UpdateCompetitionRequest;
import com.fanconnect.dto.response.CompetitionResponse;
import com.fanconnect.dto.response.MatchCenterResponse;

import java.util.List;

public interface CompetitionService {

    List<CompetitionResponse> findActivePublic();

    List<CompetitionResponse> findAllForAdmin();

    CompetitionResponse findById(Long id);

    CompetitionResponse create(CreateCompetitionRequest request);

    CompetitionResponse update(Long id, UpdateCompetitionRequest request);

    void delete(Long id);

    MatchCenterResponse getMatchCenter();

    int syncCompetitionMatches(Long competitionId);

    int syncAllCompetitionMatches();
}