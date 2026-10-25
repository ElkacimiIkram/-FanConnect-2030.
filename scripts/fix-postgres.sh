#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

# shellcheck disable=SC1091
source "$(dirname "$0")/load-env.sh"
load_env_file ".env"

echo "=========================================="
echo "  Réparation PostgreSQL FanConnect"
echo "=========================================="
echo ""

echo "[1/4] Arrêt du conteneur PostgreSQL..."
docker compose stop postgres 2>/dev/null || true

echo "[2/4] Suppression du volume (réinitialise user/mot de passe)..."
docker compose down -v --remove-orphans 2>/dev/null || true

echo "[3/4] Démarrage PostgreSQL avec les identifiants du fichier .env..."
if ! docker compose up postgres -d; then
  echo ""
  echo "ERREUR: Impossible de démarrer PostgreSQL."
  echo "- Vérifiez que Docker Desktop est lancé"
  echo "- Si le port 5432 est déjà utilisé par un PostgreSQL local, arrêtez-le"
  echo "  ou changez DB_PORT dans .env (ex: 5433) puis relancez ce script"
  exit 1
fi

echo "[4/4] Vérification..."
# shellcheck disable=SC1091
source "$(dirname "$0")/wait-postgres.sh"

echo ""
echo "OK - PostgreSQL prêt sur localhost:${DB_PORT:-5433}"
echo "  Utilisateur : ${DB_USER:-fanconnect}"
echo "  Mot de passe: ${DB_PASSWORD:-fanconnect_secret}"
echo "  Base        : ${DB_NAME:-fanconnect}"
echo ""
echo "Application des migrations Phase 0..."
bash "$(dirname "$0")/apply-db-migrations.sh" || true

echo ""
echo "Lancez maintenant le backend :"
echo "  bash scripts/start-backend.sh"
echo "  ou : cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev"
echo ""
echo "NE PAS utiliser mvn package — cela compile et quitte (BUILD SUCCESS)."