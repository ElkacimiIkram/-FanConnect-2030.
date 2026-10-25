@echo off
chcp 65001 >nul
set "PAGE=%~dp0docs\Cahier_des_charges_FanConnect_2030.html"
if not exist "%PAGE%" (
  echo Fichier introuvable : %PAGE%
  pause
  exit /b 1
)
start "" "%PAGE%"
exit /b 0
