package com.fanconnect.service;

import com.fanconnect.dto.request.CreateMatchRequest;
import com.fanconnect.dto.request.UpdateMatchRequest;
import com.fanconnect.dto.response.MatchSummaryResponse;

import java.util.List;

public interface MatchService {

    List<MatchSummaryResponse> findUpcoming();

    MatchSummaryResponse findById(Long id);

    List<MatchSummaryResponse> findAllForAdmin();

    MatchSummaryResponse createMatch(CreateMatchRequest request);

    MatchSummaryResponse updateMatch(Long id, UpdateMatchRequest request);

    void deleteMatch(Long id);
}