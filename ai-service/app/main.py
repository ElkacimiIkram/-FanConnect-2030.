from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.predictor import get_model_info, predict
from app.schemas import PredictRequest, PredictResponse, TrainResponse
from app.train import train_and_save

app = FastAPI(
    title="FanConnect AI Occupancy Service",
    description="Random Forest occupancy prediction for World Cup venues",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "fanconnect-ai-occupancy"}


@app.get("/model/info")
def model_info():
    return get_model_info()


@app.post("/predict", response_model=PredictResponse)
def predict_occupancy(request: PredictRequest):
    payload = request.model_dump(by_alias=False)
    result = predict(payload)
    return result


@app.post("/train", response_model=TrainResponse)
def train_model():
    meta = train_and_save()
    return {
        "status": "trained",
        "model": meta,
        "message": "Random Forest model trained and saved.",
    }