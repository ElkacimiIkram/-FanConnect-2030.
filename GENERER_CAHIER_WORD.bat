@echo off
chcp 65001 >nul
cd /d "%~dp0docs\rapport"
echo Generation du cahier des charges Word...
node generate-cdc.js
if errorlevel 1 (
  echo Echec. Verifie que Node.js est installe.
  pause
  exit /b 1
)
echo.
echo Fichier cree :
echo   docs\Cahier_des_charges_FanConnect_2030.docx
echo   Cahier_des_charges_FanConnect_2030.docx  (racine du projet)
pause
