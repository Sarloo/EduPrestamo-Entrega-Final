#!/usr/bin/env bash

set -Eeuo pipefail

SONAR_CONTAINER_NAME="${SONAR_CONTAINER_NAME:-eduprestamo-sonarqube}"
SONAR_DATA_VOLUME="${SONAR_DATA_VOLUME:-eduprestamo-sonarqube-data}"
SONAR_EXTENSIONS_VOLUME="${SONAR_EXTENSIONS_VOLUME:-eduprestamo-sonarqube-extensions}"
SONAR_LOGS_VOLUME="${SONAR_LOGS_VOLUME:-eduprestamo-sonarqube-logs}"
MANAGED_LABEL="com.eduprestamo.managed-by"
MANAGED_LABEL_VALUE="security-sonar"
PURGE_DATA=false

usage() {
  cat <<'EOF'
Uso:
  ./security/sonar/cleanup-sonar-local.sh
  ./security/sonar/cleanup-sonar-local.sh --purge-data

Sin opciones elimina solo el contenedor administrado. --purge-data tambien
elimina los tres volumenes administrados y reinicia por completo SonarQube.
EOF
}

case "${1:-}" in
  "") ;;
  --purge-data) PURGE_DATA=true ;;
  -h|--help) usage; exit 0 ;;
  *) usage >&2; exit 64 ;;
esac

command -v docker >/dev/null 2>&1 || {
  printf '[sonar-cleanup] ERROR: Docker no esta disponible.\n' >&2
  exit 1
}

if docker inspect "${SONAR_CONTAINER_NAME}" >/dev/null 2>&1; then
  OWNER="$(docker inspect --format "{{ index .Config.Labels \"${MANAGED_LABEL}\" }}" \
    "${SONAR_CONTAINER_NAME}" 2>/dev/null || true)"
  if [[ "${OWNER}" != "${MANAGED_LABEL_VALUE}" ]]; then
    printf "[sonar-cleanup] ERROR: '%s' no fue creado por este flujo; no se eliminara.\n" \
      "${SONAR_CONTAINER_NAME}" >&2
    exit 1
  fi

  docker rm --force "${SONAR_CONTAINER_NAME}" >/dev/null
  printf '[sonar-cleanup] Contenedor eliminado: %s\n' "${SONAR_CONTAINER_NAME}"
else
  printf '[sonar-cleanup] El contenedor no existe; no hay nada que eliminar.\n'
fi

if [[ "${PURGE_DATA}" == "true" ]]; then
  for volume in "${SONAR_DATA_VOLUME}" "${SONAR_EXTENSIONS_VOLUME}" "${SONAR_LOGS_VOLUME}"; do
    if ! docker volume inspect "${volume}" >/dev/null 2>&1; then
      continue
    fi

    OWNER="$(docker volume inspect --format "{{ index .Labels \"${MANAGED_LABEL}\" }}" \
      "${volume}" 2>/dev/null || true)"
    if [[ "${OWNER}" != "${MANAGED_LABEL_VALUE}" ]]; then
      printf "[sonar-cleanup] ERROR: el volumen '%s' no pertenece a este flujo; no se eliminara.\n" \
        "${volume}" >&2
      exit 1
    fi

    docker volume rm "${volume}" >/dev/null
    printf '[sonar-cleanup] Volumen eliminado: %s\n' "${volume}"
  done
fi

