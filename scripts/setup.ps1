# FanConnect 2030 - Windows Setup Script
# Run from project root: .\scripts\setup.ps1

Write-Host "=== FanConnect 2030 Setup ===" -ForegroundColor Green

# Check prerequisites
$tools = @("java", "mvn", "node", "npm", "docker")
foreach ($tool in $tools) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Warning "$tool is not installed or not in PATH"
    } else {
        Write-Host "[OK] $tool found" -ForegroundColor Cyan
    }
}

# Copy environment files
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example" -ForegroundColor Cyan
}

if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "Created frontend\.env" -ForegroundColor Cyan
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Build backend
Write-Host "Building backend..." -ForegroundColor Yellow
Set-Location backend
mvn clean package -DskipTests
Set-Location ..

# Start PostgreSQL
Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
docker compose up postgres -d

Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1. Open FanConnect-2030.code-workspace in VS Code"
Write-Host "  2. Install recommended extensions"
Write-Host "  3. Run 'Backend: Run Spring Boot' task"
Write-Host "  4. Run 'Frontend: Dev Server' task"
Write-Host "  5. Open http://localhost:5173"