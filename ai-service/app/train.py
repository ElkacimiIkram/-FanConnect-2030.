"""Train Random Forest occupancy model on synthetic + optional DB snapshots."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from app.features import FEATURE_NAMES, build_feature_vector

MODEL_DIR = Path(os.getenv("MODEL_DIR", "models"))
MODEL_PATH = MODEL_DIR / "occupancy_rf_v1.pkl"
META_PATH = MODEL_DIR / "occupancy_rf_v1.meta.json"


def _synthetic_row(rng: np.random.Generator) -> tuple[np.ndarray, float]:
    capacity = int(rng.integers(40, 120))
    current = float(rng.uniform(15, 95))
    payload = {
        "capacity": capacity,
        "current_occupancy_pct": current,
        "checked_in_seats": int(rng.integers(0, capacity // 2)),
        "confirmed_not_checked_in": int(rng.integers(0, capacity // 3)),
        "pending_reservations": int(rng.integers(0, capacity // 4)),
        "owner_report_fresh": bool(rng.integers(0, 2)),
        "match_importance": float(rng.uniform(0.3, 1.0)),
        "minutes_to_kickoff": int(rng.integers(30, 360)),
        "hour_of_day": int(rng.integers(10, 23)),
        "day_of_week": int(rng.integers(1, 8)),
        "historical_peak_pct": float(rng.uniform(40, 98)),
        "reservations_last_hour": int(rng.integers(0, 15)),
        "match_day_reservations": int(rng.integers(0, capacity)),
    }
    horizon = float(rng.uniform(0, 3))
    features = build_feature_vector(payload, horizon)

    boost = (
        payload["match_importance"] * 12
        + (1 if payload["day_of_week"] >= 6 else 0) * 6
        + horizon * 8
        + payload["reservations_last_hour"] * 1.2
    )
    target = min(100.0, max(0.0, current + boost + rng.normal(0, 4)))
    return features, target


def generate_dataset(n_samples: int = 4000) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(42)
    rows = [_synthetic_row(rng) for _ in range(n_samples)]
    x = np.vstack([r[0] for r in rows])
    y = np.array([r[1] for r in rows], dtype=np.float32)
    return x, y


def train_and_save(n_samples: int = 4000) -> dict:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    x, y = generate_dataset(n_samples)
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(
        n_estimators=120,
        max_depth=12,
        min_samples_leaf=4,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(x_train, y_train)

    preds = model.predict(x_test)
    mae = float(mean_absolute_error(y_test, preds))
    r2 = float(r2_score(y_test, preds))

    joblib.dump({"model": model, "features": FEATURE_NAMES}, MODEL_PATH)

    meta = {
        "name": "occupancy_rf",
        "version": "1.0.0",
        "algorithm": "RandomForestRegressor",
        "mae": round(mae, 2),
        "r2_score": round(r2, 4),
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "sample_count": n_samples,
    }
    META_PATH.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return meta


if __name__ == "__main__":
    info = train_and_save()
    print(json.dumps(info, indent=2))