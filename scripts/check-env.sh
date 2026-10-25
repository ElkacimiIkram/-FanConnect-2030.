#!/usr/bin/env bash
echo "=== Diagnostic FanConnect ==="
echo ""

echo "--- Java ---"
if command -v java &>/dev/null; then
  java -version 2>&1
else
  echo "ERREUR: Java non installé. Installez Java 21."
fi
echo ""

echo "--- Maven ---"
if command -v mvn &>/dev/null; then
  mvn -version 2>&1 | head -1
else
  echo "ERREUR: Maven non installé."
fi
echo ""

echo "--- Docker ---"
if command -v docker &>/dev/null; then
  docker --version
else
  echo "ERREUR: Docker non installé."
fi
echo ""

echo "--- PostgreSQL ---"
if docker exec fanconnect-postgres pg_isready -U fanconnect -d fanconnect &>/dev/null; then
  echo "OK: PostgreSQL accepte les connexions"
else
  echo "ERREUR: PostgreSQL pas démarré."
  echo "  → Lancez: docker compose up postgres -d"
fi
echo ""

echo "--- Port 9090 ---"
if command -v netstat &>/dev/null; then
  if netstat -ano 2>/dev/null | grep -q ":9090"; then
    echo "ATTENTION: port 9090 déjà utilisé:"
    netstat -ano 2>/dev/null | grep ":9090" || true
  else
    echo "OK: port 9090 libre"
  fi
else
  echo "(netstat non disponible — ignoré)"
fi
echo ""

echo "--- Node.js ---"
if command -v node &>/dev/null; then
  node --version
else
  echo "ERREUR: Node.js non installé."
fi
echo ""

echo "=== Fin diagnostic ==="