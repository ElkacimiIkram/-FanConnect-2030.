@echo off
echo === Diagnostic FanConnect ===
echo.

echo --- Java ---
java -version 2>&1
if errorlevel 1 echo ERREUR: Java non installe. Installez Java 21.
echo.

echo --- Maven ---
mvn -version 2>&1 | findstr /i "Apache Maven"
if errorlevel 1 echo ERREUR: Maven non installe.
echo.

echo --- Docker ---
docker --version 2>&1
if errorlevel 1 echo ERREUR: Docker non installe.
echo.

echo --- PostgreSQL ---
docker exec fanconnect-postgres pg_isready -U fanconnect -d fanconnect 2>&1
if errorlevel 1 echo ERREUR: PostgreSQL pas demarre. Lancez: docker compose up postgres -d
echo.

echo --- Port 9090 ---
netstat -ano | findstr :9090
if errorlevel 1 echo OK: port 9090 libre
echo.

echo === Fin diagnostic ===
pause