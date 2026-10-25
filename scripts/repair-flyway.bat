@echo off
cd /d "%~dp0\.."

if exist ".env" (
    for /f "usebackq eol=# tokens=1,* delims==" %%a in (".env") do (
        if not "%%a"=="" set "%%a=%%b"
    )
)

if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=5433
if not defined DB_NAME set DB_NAME=fanconnect
if not defined DB_USER set DB_USER=fanconnect
if not defined DB_PASSWORD set DB_PASSWORD=fanconnect_secret
set DB_JDBC_URL=jdbc:postgresql://%DB_HOST%:%DB_PORT%/%DB_NAME%

echo Flyway repair sur %DB_JDBC_URL% ...
cd backend
call mvn -q flyway:repair
echo OK — Relancez: scripts\start-backend.bat
pause