#!/usr/bin/env bash
# Répare les checksums Flyway après modification d'une migration déjà appliquée (dev uniquement)
set -e
cd "$(dirname "$0")/.."

source "$(dirname "$0")/load-env.sh" 2>/dev/null || true
load_env_file ".env" 2>/dev/null || true

export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5433}"
export DB_NAME="${DB_NAME:-fanconnect}"
export DB_USER="${DB_USER:-fanconnect}"
export DB_PASSWORD="${DB_PASSWORD:-fanconnect_secret}"
export DB_JDBC_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "Flyway repair sur ${DB_JDBC_URL} ..."
cd backend
mvn -q flyway:repair
echo "OK — checksums Flyway mis à jour. Relancez: bash scripts/start-backend.sh"