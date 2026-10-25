@echo off
chcp 65001 >nul
set "PAGE=%~dp0docs\architecture\uml\DIAGRAMMES_SOUTENANCE.html"
if not exist "%PAGE%" (
  echo Fichier introuvable :
  echo %PAGE%
  pause
  exit /b 1
)
echo Ouverture des diagrammes dans le navigateur...
start "" "%PAGE%"
exit /b 0
