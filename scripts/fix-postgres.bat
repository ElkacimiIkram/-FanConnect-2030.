@echo off
title FanConnect - Reparation PostgreSQL
cd /d "%~dp0\.."

echo ==========================================
echo   Reparation PostgreSQL FanConnect
echo ==========================================
echo.

echo [1/4] Arret du conteneur PostgreSQL...
docker compose stop postgres 2>nul

echo [2/4] Suppression du volume (reinitialise user/mot de passe)...
docker compose down -v --remove-orphans 2>nul

echo [3/4] Demarrage PostgreSQL avec les identifiants du fichier .env...
docker compose up postgres -d
if errorlevel 1 (
    echo.
    echo ERREUR: Impossible de demarrer PostgreSQL.
    echo - Verifiez que Docker Desktop est lance
    echo - Si le port 5432 est deja utilise par un PostgreSQL local, arretez-le
    echo   ou changez DB_PORT dans .env (ex: 5433)
    pause
    exit /b 1
)

echo [4/4] Verification (jusqu'a 60 secondes, premier demarrage = init SQL)...
set /a attempt=0
:wait_pg
set /a attempt+=1
docker exec fanconnect-postgres pg_isready -U fanconnect -d fanconnect >nul 2>&1
if not errorlevel 1 goto pg_ready
if %attempt% geq 30 (
    echo ERREUR: PostgreSQL pas pret apres 60 secondes.
    echo --- logs PostgreSQL ---
    docker logs fanconnect-postgres --tail 40
    pause
    exit /b 1
)
timeout /t 2 /nobreak >nul
goto wait_pg
:pg_ready
echo OK: PostgreSQL pret

echo.
echo OK - PostgreSQL pret sur localhost:5432
echo   Utilisateur : fanconnect
echo   Mot de passe: fanconnect_secret
echo   Base        : fanconnect
echo.
echo Lancez maintenant le backend :
echo   CMD/PowerShell : scripts\start-backend.bat
echo   Git Bash       : ./scripts/start-backend.sh
echo   ou : cd backend ^&^& mvn spring-boot:run -Dspring-boot.run.profiles=dev
echo.
pause