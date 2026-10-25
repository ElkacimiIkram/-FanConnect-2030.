@echo off
cd /d "%~dp0..\ai-service"
if not exist "models\occupancy_rf_v1.pkl" (
  echo Training initial Random Forest model...
  python -c "from app.train import train_and_save; train_and_save()"
)
echo Starting FanConnect AI service on http://localhost:8000
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload