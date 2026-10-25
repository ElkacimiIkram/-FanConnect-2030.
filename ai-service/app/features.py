import numpy as np

FEATURE_NAMES = [
    "current_occupancy_pct",
    "checked_in_ratio",
    "confirmed_ratio",
    "pending_ratio",
    "owner_report_fresh",
    "match_importance",
    "minutes_to_kickoff_norm",
    "hour_of_day",
    "day_of_week",
    "historical_peak_pct",
    "reservations_last_hour_norm",
    "match_day_reservations_norm",
    "horizon_hours",
]


def build_feature_vector(payload: dict, horizon_hours: float = 0.0) -> np.ndarray:
    capacity = max(payload.get("capacity", 1), 1)
    current = float(payload.get("current_occupancy_pct", 0))
    checked_in = float(payload.get("checked_in_seats", 0))
    confirmed = float(payload.get("confirmed_not_checked_in", 0))
    pending = float(payload.get("pending_reservations", 0))
    minutes_to_kickoff = float(payload.get("minutes_to_kickoff", 240))

    return np.array([
        current,
        checked_in / capacity,
        confirmed / capacity,
        pending / capacity,
        1.0 if payload.get("owner_report_fresh") else 0.0,
        float(payload.get("match_importance", 0.5)),
        min(1.0, minutes_to_kickoff / 360.0),
        float(payload.get("hour_of_day", 12)),
        float(payload.get("day_of_week", 3)),
        float(payload.get("historical_peak_pct", 50)),
        min(1.0, float(payload.get("reservations_last_hour", 0)) / 20.0),
        min(1.0, float(payload.get("match_day_reservations", 0)) / capacity),
        horizon_hours,
    ], dtype=np.float32)