package com.fanconnect.service;

import com.fanconnect.dto.response.OccupancyBreakdownResponse;
import com.fanconnect.dto.response.OccupancyPredictionResponse;
import com.fanconnect.model.entity.Business;
import com.fanconnect.model.entity.FootballMatch;

public interface OccupancyPredictionService {

    OccupancyPredictionResponse predict(Business business, FootballMatch match, OccupancyBreakdownResponse breakdown);
}