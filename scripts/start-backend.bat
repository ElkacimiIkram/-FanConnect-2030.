@echo off
title FanConnect Backend - Port 9090
cd /d "%~dp0\.."

echo ==========================================
echo   FanConnect Backend - Port 9090
echo   NE FERMEZ PAS CETTE FENETRE !
echo ==========================================
echo.

echo [1/3] Demarrage PostgreSQL...
docker compose up postgres -d
if errorlevel 1 (
    echo ERREUR: Docker/PostgreSQL. Demarrez Docker Desktop.
    pause
    exit /b 1
)

echo [2/3] Attente PostgreSQL...
timeout /t 5 /nobreak >nul
docker exec fanconnect-postgres pg_isready -U fanconnect -d fanconnect
if errorlevel 1 (
    echo ERREUR: PostgreSQL pas pret.
    pause
    exit /b 1
)
echo.

cd backend

if exist "..\.env" (
    for /f "usebackq eol=# tokens=1,* delims==" %%a in ("..\.env") do (
        if not "%%a"=="" set "%%a=%%b"
    )
)

if defined STRIPE_SECRET_KEY if defined STRIPE_PUBLISHABLE_KEY (
    echo Stripe: cles standard chargees ^(mode %PAYMENT_MODE%^)
) else (
    echo ATTENTION: STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY manquantes — paiement carte desactive
)
echo.

echo Nettoyage migrations Flyway echouees (V6, V10 si presentes)...
docker exec -i fanconnect-postgres psql -U "%DB_USER%" -d "%DB_NAME%" -v ON_ERROR_STOP=0 -c "DELETE FROM flyway_schema_history WHERE success = false AND version IN ('6','10');" 2>nul
if "%DB_USER%"=="" docker exec -i fanconnect-postgres psql -U fanconnect -d fanconnect -v ON_ERROR_STOP=0 -c "DELETE FROM flyway_schema_history WHERE success = false AND version IN ('6','10');" 2>nul

if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=5433
if not defined DB_NAME set DB_NAME=fanconnect
if not defined DB_USER set DB_USER=fanconnect
if not defined DB_PASSWORD set DB_PASSWORD=fanconnect_secret
set DB_JDBC_URL=jdbc:postgresql://%DB_HOST%:%DB_PORT%/%DB_NAME%

echo Compilation (clean + Lombok)...
call mvn -q clean compile -DskipTests
if errorlevel 1 (
    echo ERREUR: Compilation Maven echouee. Verifiez les erreurs ci-dessus.
    pause
    exit /b 1
)

echo Reparation checksums Flyway...
set DB_JDBC_URL=jdbc:postgresql://%DB_HOST%:%DB_PORT%/%DB_NAME%
call mvn -q flyway:repair

echo Connexion DB: %DB_JDBC_URL% (user: %DB_USER%)
echo.
echo [3/3] Demarrage Spring Boot...
echo Attendez: Started FanConnectApplication
echo.

mvn spring-boot:run -Dspring-boot.run.profiles=dev -e

echo.
echo ==========================================
echo Le backend s'est ARRETE. Erreur ci-dessus.
echo ==========================================
pause