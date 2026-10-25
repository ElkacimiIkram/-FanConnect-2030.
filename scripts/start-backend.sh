#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

echo "=========================================="
echo "  FanConnect Backend - Port 9090"
echo "  NE FERMEZ PAS CE TERMINAL !"
echo "=========================================="
echo ""

# shellcheck disable=SC1091
source "$(dirname "$0")/load-env.sh"
load_env_file ".env"

if [[ -n "${STRIPE_SECRET_KEY:-}" && -n "${STRIPE_PUBLISHABLE_KEY:-}" ]]; then
  echo "Stripe: clés standard chargées (mode ${PAYMENT_MODE:-stripe})"
else
  echo "ATTENTION: STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY manquantes — paiement carte désactivé"
fi
echo ""

echo "[1/3] Démarrage PostgreSQL..."
docker compose up postgres -d

echo "[2/3] Vérification PostgreSQL..."
# shellcheck disable=SC1091
source "$(dirname "$0")/wait-postgres.sh"
echo ""

echo "[3/3] Démarrage Spring Boot sur port 9090..."
echo "Attendez: Started FanConnectApplication"
echo ""
echo "IMPORTANT: Ce terminal doit RESTER ouvert."
echo "Si vous voyez BUILD SUCCESS puis le prompt \$, vous avez lancé"
echo "mvn package au lieu de spring-boot:run."
echo ""

cd backend

echo "Nettoyage migrations Flyway échouées (V6, V10 si présentes)..."
docker exec -i fanconnect-postgres psql -U "${DB_USER:-fanconnect}" -d "${DB_NAME:-fanconnect}" -v ON_ERROR_STOP=0 -c \
  "DELETE FROM flyway_schema_history WHERE success = false AND version IN ('6','10');" 2>/dev/null || true

export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5433}"
export DB_NAME="${DB_NAME:-fanconnect}"
export DB_USER="${DB_USER:-fanconnect}"
export DB_PASSWORD="${DB_PASSWORD:-fanconnect_secret}"
export DB_JDBC_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "Compilation (clean + Lombok)..."
mvn -q clean compile -DskipTests

echo "Réparation checksums Flyway (si migration modifiée après application)..."
mvn -q flyway:repair || true

echo "Connexion DB: ${DB_JDBC_URL} (user: ${DB_USER})"
echo ""

mvn spring-boot:run -Dspring-boot.run.profiles=dev -e