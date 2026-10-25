# FanConnect 2030 - Create Project Structure (Reference Script)
# This script documents the folder structure. The workspace is already scaffolded.

$dirs = @(
    "backend/src/main/java/com/fanconnect/config",
    "backend/src/main/java/com/fanconnect/controller",
    "backend/src/main/java/com/fanconnect/service",
    "backend/src/main/java/com/fanconnect/repository",
    "backend/src/main/java/com/fanconnect/model/entity",
    "backend/src/main/java/com/fanconnect/model/enums",
    "backend/src/main/java/com/fanconnect/dto/request",
    "backend/src/main/java/com/fanconnect/dto/response",
    "backend/src/main/java/com/fanconnect/security",
    "backend/src/main/java/com/fanconnect/exception",
    "backend/src/main/java/com/fanconnect/mapper",
    "backend/src/main/java/com/fanconnect/util",
    "backend/src/main/resources",
    "backend/src/test/java/com/fanconnect",
    "backend/src/test/resources",
    "frontend/src/api",
    "frontend/src/components/layout",
    "frontend/src/components/auth",
    "frontend/src/components/ui",
    "frontend/src/context",
    "frontend/src/hooks",
    "frontend/src/pages",
    "frontend/src/utils",
    "frontend/public",
    "database/init",
    "database/migrations",
    "docker/backend",
    "docker/frontend",
    "docs/architecture",
    "docs/api",
    ".vscode",
    "scripts"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Write-Host "Folder structure created successfully." -ForegroundColor Green