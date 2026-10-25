# Phase 5 — run backend tests and frontend lint/build
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "=== Backend: mvn test ===" -ForegroundColor Cyan
Push-Location (Join-Path $root "backend")
try {
    mvn test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "=== Frontend: npm run lint ===" -ForegroundColor Cyan
Push-Location (Join-Path $root "frontend")
try {
    npm run lint
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "=== Frontend: npm run build ===" -ForegroundColor Cyan
Push-Location (Join-Path $root "frontend")
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Phase 5 checks passed." -ForegroundColor Green