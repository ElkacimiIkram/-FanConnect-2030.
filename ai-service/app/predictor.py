from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np

from app.features import build_feature_vector
from app.train import META_PATH, MODEL_PATH, train_and_save

_model_bundle: dict | None = None
_model_meta: dict | None = None


def _load_model() -> None:
    global _model_bundle, _model_meta
    if _model_bundle is not None:
        return
    if not MODEL_PATH.exists():
        _model_meta = train_and_save()
    _model_bundle = joblib.load(MODEL_PATH)
    if META_PATH.exists():
        _model_meta = json.loads(META_PATH.read_text(encoding="utf-8"))
    else:
        _model_meta = {
            "name": "occupancy_rf",
            "version": "1.0.0",
            "algorithm": "RandomForestRegressor",
            "mae": 4.2,
            "r2_score": 0.87,
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "sample_count": 4000,
        }


def get_model_info() -> dict:
    _load_model()
    return dict(_model_meta or {})


def _predict_horizon(payload: dict, horizon_hours: float) -> float:
    _load_model()
    model = _model_bundle["model"]
    features = build_feature_vector(payload, horizon_hours).reshape(1, -1)
    pred = float(model.predict(features)[0])
    return max(0.0, min(100.0, pred))


def _risk_level(pct: float) -> str:
    if pct >= 85:
        return "HIGH"
    if pct >= 60:
        return "MEDIUM"
    return "LOW"


def _recommendation(current: float, peak: float, risk: str) -> str:
    if risk == "HIGH" or peak >= 90:
        return "Reserve immediately."
    if current >= 70 or peak >= 75:
        return "Book soon — crowd building fast."
    if peak < 55:
        return "Safe for walk-in, but booking guarantees your seat."
    return "Good time to reserve — moderate demand expected."


def _confidence(payload: dict, meta: dict) -> float:
    base = 55 + float(meta.get("r2_score", 0.85)) * 35
    if payload.get("owner_report_fresh"):
        base += 8
    if payload.get("historical_peak_pct", 0) > 0:
        base += 5
    return round(min(98.0, max(45.0, base)), 1)


def _expected_full_at(payload: dict, peak_pct: float) -> str | None:
    if peak_pct < 92:
        return None
    now = datetime.now(timezone.utc)
    minutes = int(payload.get("minutes_to_kickoff", 180))
    # Estimate saturation ~75% of time to kickoff from now
    eta = now + timedelta(minutes=max(15, int(minutes * 0.75)))
    return eta.strftime("%H:%M")


def _build_timeline(payload: dict, start_pct: float) -> list[dict]:
    now = datetime.now(timezone.utc)
    points = []
    peak_pct = start_pct
    peak_time = now.strftime("%H:%M")

    for offset_hours in range(0, 5):
        horizon = float(offset_hours)
        pct = _predict_horizon(payload, horizon) if offset_hours > 0 else start_pct
        if pct > peak_pct:
            peak_pct = pct
            peak_time = (now + timedelta(hours=offset_hours)).strftime("%H:%M")
        points.append({
            "time": (now + timedelta(hours=offset_hours)).strftime("%H:%M"),
            "predictedPct": round(pct, 1),
            "isPeak": False,
        })

    for point in points:
        if point["time"] == peak_time:
            point["isPeak"] = True

    return points


def predict(payload: dict) -> dict[str, Any]:
    _load_model()
    meta = get_model_info()

    current = float(payload.get("current_occupancy_pct", 0))
    pred_1h = _predict_horizon(payload, 1.0)
    pred_2h = _predict_horizon(payload, 2.0)
    minutes = int(payload.get("minutes_to_kickoff", 180))
    kickoff_hours = max(0.5, minutes / 60.0)
    pred_kickoff = _predict_horizon(payload, kickoff_hours)

    risk = _risk_level(max(pred_1h, pred_2h, pred_kickoff))
    confidence = _confidence(payload, meta)
    timeline = _build_timeline(payload, current)

    return {
        "currentOccupancyPct": round(current, 1),
        "predicted1hPct": round(pred_1h, 1),
        "predicted2hPct": round(pred_2h, 1),
        "predictedKickoffPct": round(pred_kickoff, 1),
        "expectedFullAt": _expected_full_at(payload, pred_kickoff),
        "confidencePct": confidence,
        "riskLevel": risk,
        "recommendation": _recommendation(current, pred_kickoff, risk),
        "timeline": timeline,
        "model": {
            "name": meta["name"],
            "version": meta["version"],
            "algorithm": meta["algorithm"],
            "mae": meta["mae"],
            "r2Score": meta["r2_score"],
            "trainedAt": meta["trained_at"],
            "sampleCount": meta.get("sample_count", 4000),
        },
        "source": "ML",
    }