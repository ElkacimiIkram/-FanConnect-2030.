#!/usr/bin/env bash
# Applique les migrations Phase 0 si Flyway n'a pas encore tourné
set -e
cd "$(dirname "$0")/.."

# shellcheck disable=SC1091
source "$(dirname "$0")/load-env.sh"
load_env_file ".env"

DB_USER="${DB_USER:-fanconnect}"
DB_NAME="${DB_NAME:-fanconnect}"

echo "Application des migrations SQL Phase 0..."
docker exec -i fanconnect-postgres psql -U "$DB_USER" -d "$DB_NAME" <<'SQL'
-- V2: rename roles
UPDATE users SET role = 'FAN_USER' WHERE role IN ('SUPPORTER', 'CUSTOMER');
UPDATE users SET role = 'BUSINESS_OWNER' WHERE role = 'CAFE_OWNER';
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'FAN_USER';

-- V3: city column
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
SQL

echo "OK — migrations appliquées."
echo "Relancez le backend: bash scripts/start-backend.sh"