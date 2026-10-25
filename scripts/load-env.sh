#!/usr/bin/env bash
# Charge .env en supprimant les CRLF Windows (cause fréquente d'échec d'auth PostgreSQL)

load_env_file() {
  local env_file="${1:-.env}"
  [[ -f "$env_file" ]] || return 0

  set -a
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line//$'\r'/}"
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      export "${BASH_REMATCH[1]}=${BASH_REMATCH[2]}"
    fi
  done < "$env_file"
  set +a
}