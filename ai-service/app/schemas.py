from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class TimelinePoint(BaseModel):
    time: str
    predicted_pct: float = Field(alias="predictedPct")
    is_peak: bool = Field(alias="isPeak")

    class Config:
        populate_by_name = True


class ModelInfo(BaseModel):
    name: str
    version: str
    algorithm: str
    mae: float
    r2_score: float = Field(alias="r2Score")
    trained_at: str = Field(alias="trainedAt")
    sample_count: int = Field(alias="sampleCount")

    class Config:
        populate_by_name = True


class PredictRequest(BaseModel):
    business_id: int = Field(alias="businessId")
    match_id: Optional[int] = Field(default=None, alias="matchId")
    capacity: int = 80
    current_occupancy_pct: float = Field(alias="currentOccupancyPct")
    checked_in_seats: int = Field(default=0, alias="checkedInSeats")
    confirmed_not_checked_in: int = Field(default=0, alias="confirmedNotCheckedIn")
    pending_reservations: int = Field(default=0, alias="pendingReservations")
    owner_report_fresh: bool = Field(default=False, alias="ownerReportFresh")
    match_importance: float = Field(default=0.5, alias="matchImportance")
    minutes_to_kickoff: int = Field(default=240, alias="minutesToKickoff")
    hour_of_day: int = Field(default=12, alias="hourOfDay")
    day_of_week: int = Field(default=3, alias="dayOfWeek")
    historical_peak_pct: float = Field(default=50.0, alias="historicalPeakPct")
    reservations_last_hour: int = Field(default=0, alias="reservationsLastHour")
    match_day_reservations: int = Field(default=0, alias="matchDayReservations")

    class Config:
        populate_by_name = True


class PredictResponse(BaseModel):
    current_occupancy_pct: float = Field(alias="currentOccupancyPct")
    predicted_1h_pct: float = Field(alias="predicted1hPct")
    predicted_2h_pct: float = Field(alias="predicted2hPct")
    predicted_kickoff_pct: float = Field(alias="predictedKickoffPct")
    expected_full_at: Optional[str] = Field(default=None, alias="expectedFullAt")
    confidence_pct: float = Field(alias="confidencePct")
    risk_level: str = Field(alias="riskLevel")
    recommendation: str
    timeline: List[TimelinePoint]
    model: ModelInfo
    source: str = "ML"

    class Config:
        populate_by_name = True


class TrainResponse(BaseModel):
    status: str
    model: ModelInfo
    message: str