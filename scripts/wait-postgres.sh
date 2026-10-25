#!/usr/bin/env bash
# Attend que PostgreSQL soit prêt (premier démarrage = init SQL, peut prendre ~60s)

MAX_ATTEMPTS="${1:-30}"
SLEEP_SECONDS="${2:-2}"
CONTAINER="${POSTGRES_CONTAINER:-fanconnect-postgres}"
DB_USER="${DB_USER:-fanconnect}"
DB_NAME="${DB_NAME:-fanconnect}"
DB_PASSWORD="${DB_PASSWORD:-fanconnect_secret}"
DB_PORT="${DB_PORT:-5433}"

echo "Attente PostgreSQL (max ${MAX_ATTEMPTS}x${SLEEP_SECONDS}s = $((MAX_ATTEMPTS * SLEEP_SECONDS))s)..."

for ((i = 1; i <= MAX_ATTEMPTS; i++)); do
  if docker exec "$CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" &>/dev/null; then
    echo "OK: PostgreSQL prêt dans le conteneur (tentative $i/$MAX_ATTEMPTS)"

    # Vérifier la connexion depuis l'hôte (même chemin que Spring Boot)
    if PGPASSWORD="$DB_PASSWORD" docker run --rm \
        -e PGPASSWORD="$DB_PASSWORD" \
        postgres:16-alpine \
        psql -h host.docker.internal -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" &>/dev/null; then
      echo "OK: Connexion hôte -> localhost:${DB_PORT} réussie"
      return 0 2>/dev/null || exit 0
    fi

    echo "ATTENTION: le conteneur répond mais localhost:${DB_PORT} est inaccessible."
    echo "  → Un autre PostgreSQL occupe peut-être le port ${DB_PORT}"
    echo "  → Changez DB_PORT dans .env (ex: 5434) puis relancez fix-postgres.sh"
    return 1 2>/dev/null || exit 1
  fi

  status=$(docker inspect -f '{{.State.Status}}' "$CONTAINER" 2>/dev/null || echo "missing")
  if [[ "$status" == "exited" || "$status" == "missing" ]]; then
    echo ""
    echo "ERREUR: le conteneur $CONTAINER n'est pas en cours d'exécution (status: $status)"
    echo "--- docker compose ps ---"
    docker compose ps postgres 2>/dev/null || true
    echo "--- derniers logs PostgreSQL ---"
    docker logs "$CONTAINER" --tail 40 2>/dev/null || true
    return 1 2>/dev/null || exit 1
  fi

  printf "  tentative %d/%d...\r" "$i" "$MAX_ATTEMPTS"
  sleep "$SLEEP_SECONDS"
done

echo ""
echo "ERREUR: PostgreSQL pas prêt après $((MAX_ATTEMPTS * SLEEP_SECONDS)) secondes."
echo "--- docker compose ps ---"
docker compose ps postgres 2>/dev/null || true
echo "--- derniers logs PostgreSQL ---"
docker logs "$CONTAINER" --tail 40 2>/dev/null || true
return 1 2>/dev/null || exit 1