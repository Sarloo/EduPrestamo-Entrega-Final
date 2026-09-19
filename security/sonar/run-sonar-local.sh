#!/usr/bin/env bash

set -Eeuo pipefail

# Los archivos temporales pueden contener un token efimero. Restringirlos al
# usuario actual desde antes de crearlos.
umask 077

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
SCAN_DIR="${SONAR_SCAN_DIR:-${PROJECT_DIR}}"
[[ -d "${SCAN_DIR}" ]] || {
  printf '[sonar-local] ERROR: no existe SONAR_SCAN_DIR=%s.\n' "${SCAN_DIR}" >&2
  exit 1
}
SCAN_DIR="$(cd -- "${SCAN_DIR}" && pwd)"
REPORT_DIR="${PROJECT_DIR}/reports/quality/sonarqube"
PROPERTIES_FILE="${SCAN_DIR}/sonar-project.properties"
COVERAGE_FILE="${SCAN_DIR}/reports/coverage/lcov.info"
REPORT_TASK_FILE="${SCAN_DIR}/.scannerwork/report-task.txt"

SONAR_CONTAINER_NAME="${SONAR_CONTAINER_NAME:-eduprestamo-sonarqube}"
SONAR_IMAGE="${SONAR_IMAGE:-sonarqube:10.6.0-community}"
SONAR_SCANNER_IMAGE="${SONAR_SCANNER_IMAGE:-sonarsource/sonar-scanner-cli:5.0.1}"
SONAR_PORT_WAS_SET="${SONAR_PORT+x}"
SONAR_PORT="${SONAR_PORT:-9001}"
SONAR_START_TIMEOUT="${SONAR_START_TIMEOUT:-360}"
SONAR_ANALYSIS_TIMEOUT="${SONAR_ANALYSIS_TIMEOUT:-300}"
SONAR_PLATFORM="${SONAR_PLATFORM:-}"

SONAR_DATA_VOLUME="${SONAR_DATA_VOLUME:-eduprestamo-sonarqube-data}"
SONAR_EXTENSIONS_VOLUME="${SONAR_EXTENSIONS_VOLUME:-eduprestamo-sonarqube-extensions}"
SONAR_LOGS_VOLUME="${SONAR_LOGS_VOLUME:-eduprestamo-sonarqube-logs}"

MANAGED_LABEL="com.eduprestamo.managed-by"
MANAGED_LABEL_VALUE="security-sonar"
TOKEN_NAME=""
TOKEN=""
TEMP_DIR=""
ADMIN_NETRC=""
TOKEN_NETRC=""

log() {
  printf '[sonar-local] %s\n' "$*"
}

fail() {
  printf '[sonar-local] ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "No se encontro '$1' en PATH."
}

json_path() {
  local path="$1"
  node -e '
    const path = process.argv[1].split(".");
    let raw = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => { raw += chunk; });
    process.stdin.on("end", () => {
      let value = JSON.parse(raw);
      for (const key of path) value = value == null ? undefined : value[key];
      if (value !== undefined && value !== null) process.stdout.write(String(value));
    });
  ' "$path"
}

netrc_escape() {
  # curl admite tokens entre comillas en .netrc. Escapamos los dos caracteres
  # con significado dentro de esas comillas.
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cleanup_secrets() {
  local exit_code="${1:-0}"
  trap - EXIT

  if [[ -n "${TOKEN_NAME}" && -n "${ADMIN_NETRC}" && -f "${ADMIN_NETRC}" ]]; then
    curl --silent --show-error --fail --noproxy '*' \
      --netrc --netrc-file "${ADMIN_NETRC}" \
      --request POST \
      --data-urlencode "name=${TOKEN_NAME}" \
      "${SONAR_API_URL}/api/user_tokens/revoke" >/dev/null 2>&1 || true
  fi

  TOKEN=""
  unset SONAR_TOKEN 2>/dev/null || true

  if [[ -n "${TEMP_DIR}" && -d "${TEMP_DIR}" ]]; then
    rm -rf -- "${TEMP_DIR}" || true
  fi

  exit "${exit_code}"
}

trap 'cleanup_secrets "$?"' EXIT

curl_admin() {
  curl --silent --show-error --fail --noproxy '*' \
    --netrc --netrc-file "${ADMIN_NETRC}" "$@"
}

curl_token() {
  curl --silent --show-error --fail --noproxy '*' \
    --netrc --netrc-file "${TOKEN_NETRC}" "$@"
}

pretty_json_file() {
  local file="$1"
  node -e '
    const fs = require("fs");
    const file = process.argv[1];
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    fs.writeFileSync(file, `${JSON.stringify(parsed, null, 2)}\n`, { mode: 0o600 });
  ' "$file"
}

fetch_json() {
  local endpoint="$1"
  local output="$2"
  shift 2

  local temporary="${output}.tmp"
  curl_token --get "$@" "${SONAR_API_URL}${endpoint}" --output "${temporary}"
  pretty_json_file "${temporary}"
  mv -f -- "${temporary}" "${output}"
}

ensure_managed_volume() {
  local volume="$1"
  local owner=""

  if docker volume inspect "${volume}" >/dev/null 2>&1; then
    owner="$(docker volume inspect --format "{{ index .Labels \"${MANAGED_LABEL}\" }}" "${volume}" 2>/dev/null || true)"
    [[ "${owner}" == "${MANAGED_LABEL_VALUE}" ]] || \
      fail "El volumen '${volume}' ya existe y no pertenece a este flujo. Usa otro nombre mediante variables SONAR_*_VOLUME."
    return
  fi

  docker volume create \
    --label "${MANAGED_LABEL}=${MANAGED_LABEL_VALUE}" \
    "${volume}" >/dev/null
}

wait_for_sonarqube() {
  local started_at now elapsed status_json status container_state
  started_at="$(date +%s)"

  log "Esperando a que SonarQube quede listo (maximo ${SONAR_START_TIMEOUT}s)..."
  while true; do
    status_json="$(curl --silent --show-error --fail --noproxy '*' \
      "${SONAR_API_URL}/api/system/status" 2>/dev/null || true)"
    status=""
    if [[ -n "${status_json}" ]]; then
      status="$(printf '%s' "${status_json}" | json_path status 2>/dev/null || true)"
    fi

    if [[ "${status}" == "UP" ]]; then
      log "SonarQube esta listo en ${SONAR_API_URL}."
      return
    fi

    container_state="$(docker inspect --format '{{.State.Status}}' "${SONAR_CONTAINER_NAME}" 2>/dev/null || true)"
    if [[ "${container_state}" == "exited" || "${container_state}" == "dead" ]]; then
      docker logs --tail 80 "${SONAR_CONTAINER_NAME}" >&2 || true
      fail "El contenedor de SonarQube termino antes de quedar listo."
    fi

    now="$(date +%s)"
    elapsed=$((now - started_at))
    if (( elapsed >= SONAR_START_TIMEOUT )); then
      docker logs --tail 80 "${SONAR_CONTAINER_NAME}" >&2 || true
      fail "SonarQube no quedo listo dentro del tiempo configurado."
    fi

    sleep 5
  done
}

wait_for_analysis() {
  local task_id="$1"
  local started_at now elapsed response status
  started_at="$(date +%s)"

  log "Esperando el procesamiento del analisis (tarea ${task_id})..."
  while true; do
    response="$(curl_token --get --data-urlencode "id=${task_id}" \
      "${SONAR_API_URL}/api/ce/task")"
    status="$(printf '%s' "${response}" | json_path task.status)"

    case "${status}" in
      SUCCESS)
        printf '%s' "${response}" > "${REPORT_DIR}/compute-engine-task.json"
        pretty_json_file "${REPORT_DIR}/compute-engine-task.json"
        return
        ;;
      FAILED|CANCELED)
        printf '%s' "${response}" > "${REPORT_DIR}/compute-engine-task.json"
        pretty_json_file "${REPORT_DIR}/compute-engine-task.json"
        fail "La tarea de analisis termino con estado ${status}. Consulta compute-engine-task.json y los logs."
        ;;
    esac

    now="$(date +%s)"
    elapsed=$((now - started_at))
    (( elapsed < SONAR_ANALYSIS_TIMEOUT )) || \
      fail "El procesamiento del analisis excedio ${SONAR_ANALYSIS_TIMEOUT}s."
    sleep 3
  done
}

require_command docker
require_command curl
require_command node
require_command sed
require_command awk
require_command git

[[ -f "${PROPERTIES_FILE}" ]] || fail "Falta sonar-project.properties en la raiz del proyecto."
[[ -f "${COVERAGE_FILE}" ]] || \
  fail "Falta ${COVERAGE_FILE}. Ejecuta primero: npm run test:coverage"

PROJECT_KEY="${SONAR_PROJECT_KEY:-$(awk -F= '
  $1 == "sonar.projectKey" {
    value = substr($0, index($0, "=") + 1);
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", value);
    print value;
    exit;
  }
' "${PROPERTIES_FILE}")}"
[[ -n "${PROJECT_KEY}" ]] || fail "No se pudo determinar sonar.projectKey."

docker info >/dev/null 2>&1 || fail "Docker Desktop no esta disponible o el motor no esta iniciado."

PLATFORM_ARGS=()
if [[ -n "${SONAR_PLATFORM}" ]]; then
  PLATFORM_ARGS=(--platform "${SONAR_PLATFORM}")
fi

if docker inspect "${SONAR_CONTAINER_NAME}" >/dev/null 2>&1; then
  EXISTING_IMAGE="$(docker inspect --format '{{.Config.Image}}' "${SONAR_CONTAINER_NAME}")"
  case "${EXISTING_IMAGE}" in
    sonarqube:*|*/sonarqube:*) ;;
    *) fail "El nombre '${SONAR_CONTAINER_NAME}' ya pertenece a una imagen que no es SonarQube (${EXISTING_IMAGE})." ;;
  esac

  MAPPED_PORT="$(docker port "${SONAR_CONTAINER_NAME}" 9000/tcp 2>/dev/null | sed -n '1s/.*://p')"
  [[ -n "${MAPPED_PORT}" ]] || fail "El contenedor existente no publica el puerto 9000/tcp."

  if [[ -n "${SONAR_PORT_WAS_SET}" && "${MAPPED_PORT}" != "${SONAR_PORT}" ]]; then
    fail "El contenedor existente usa el puerto ${MAPPED_PORT}, no SONAR_PORT=${SONAR_PORT}."
  fi
  SONAR_PORT="${MAPPED_PORT}"

  if [[ "$(docker inspect --format '{{.State.Running}}' "${SONAR_CONTAINER_NAME}")" != "true" ]]; then
    log "Iniciando el contenedor existente ${SONAR_CONTAINER_NAME}..."
    docker start "${SONAR_CONTAINER_NAME}" >/dev/null
  else
    log "Reutilizando el contenedor ${SONAR_CONTAINER_NAME}."
  fi
else
  ensure_managed_volume "${SONAR_DATA_VOLUME}"
  ensure_managed_volume "${SONAR_EXTENSIONS_VOLUME}"
  ensure_managed_volume "${SONAR_LOGS_VOLUME}"

  log "Creando ${SONAR_CONTAINER_NAME} con ${SONAR_IMAGE}..."
  docker run --detach \
    --name "${SONAR_CONTAINER_NAME}" \
    --label "${MANAGED_LABEL}=${MANAGED_LABEL_VALUE}" \
    --restart unless-stopped \
    ${PLATFORM_ARGS[@]+"${PLATFORM_ARGS[@]}"} \
    --publish "127.0.0.1:${SONAR_PORT}:9000" \
    --env SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
    --volume "${SONAR_DATA_VOLUME}:/opt/sonarqube/data" \
    --volume "${SONAR_EXTENSIONS_VOLUME}:/opt/sonarqube/extensions" \
    --volume "${SONAR_LOGS_VOLUME}:/opt/sonarqube/logs" \
    "${SONAR_IMAGE}" >/dev/null
fi

SONAR_API_URL="${SONAR_API_URL:-http://127.0.0.1:${SONAR_PORT}}"
SONAR_SCANNER_HOST_URL="${SONAR_SCANNER_HOST_URL:-http://host.docker.internal:${SONAR_PORT}}"

wait_for_sonarqube

TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/eduprestamo-sonar.XXXXXX")"
ADMIN_NETRC="${TEMP_DIR}/admin.netrc"
TOKEN_NETRC="${TEMP_DIR}/token.netrc"

API_HOST="$(node -e 'process.stdout.write(new URL(process.argv[1]).hostname)' "${SONAR_API_URL}")"
ADMIN_USER="${SONAR_ADMIN_USER:-admin}"

if [[ -n "${SONAR_ADMIN_PASSWORD_FILE:-}" ]]; then
  [[ -r "${SONAR_ADMIN_PASSWORD_FILE}" ]] || fail "No se puede leer SONAR_ADMIN_PASSWORD_FILE."
  IFS= read -r ADMIN_PASSWORD < "${SONAR_ADMIN_PASSWORD_FILE}"
else
  ADMIN_PASSWORD="${SONAR_ADMIN_PASSWORD:-admin}"
fi
unset SONAR_ADMIN_PASSWORD 2>/dev/null || true

printf 'machine %s login "%s" password "%s"\n' \
  "$(netrc_escape "${API_HOST}")" \
  "$(netrc_escape "${ADMIN_USER}")" \
  "$(netrc_escape "${ADMIN_PASSWORD}")" > "${ADMIN_NETRC}"
ADMIN_PASSWORD=""

TOKEN_NAME="eduprestamo-local-$(date +%s)-$$"
TOKEN_RESPONSE=""
if ! TOKEN_RESPONSE="$(curl_admin --request POST \
  --data-urlencode "name=${TOKEN_NAME}" \
  "${SONAR_API_URL}/api/user_tokens/generate")"; then
  fail "No fue posible crear el token. Si cambiaste la clave local de admin, usa SONAR_ADMIN_PASSWORD_FILE."
fi

TOKEN="$(printf '%s' "${TOKEN_RESPONSE}" | json_path token)"
TOKEN_RESPONSE=""
[[ -n "${TOKEN}" ]] || fail "SonarQube no devolvio un token utilizable."

printf 'machine %s login "%s" password ""\n' \
  "$(netrc_escape "${API_HOST}")" \
  "$(netrc_escape "${TOKEN}")" > "${TOKEN_NETRC}"

mkdir -p -- "${REPORT_DIR}"
rm -f -- "${REPORT_TASK_FILE}"

log "Ejecutando sonar-scanner para ${PROJECT_KEY}..."
export SONAR_TOKEN="${TOKEN}"
docker run --rm \
  --name "eduprestamo-sonar-scanner-$$" \
  ${PLATFORM_ARGS[@]+"${PLATFORM_ARGS[@]}"} \
  --add-host host.docker.internal:host-gateway \
  --user "$(id -u):$(id -g)" \
  --env SONAR_TOKEN \
  --env "SONAR_HOST_URL=${SONAR_SCANNER_HOST_URL}" \
  --env SONAR_USER_HOME=/tmp/.sonar \
  --volume "${SCAN_DIR}:/usr/src" \
  --workdir /usr/src \
  "${SONAR_SCANNER_IMAGE}" \
  -Dsonar.qualitygate.wait=false
unset SONAR_TOKEN

[[ -f "${REPORT_TASK_FILE}" ]] || fail "sonar-scanner no genero .scannerwork/report-task.txt."
TASK_ID="$(awk -F= '$1 == "ceTaskId" { print substr($0, index($0, "=") + 1); exit }' "${REPORT_TASK_FILE}")"
[[ -n "${TASK_ID}" ]] || fail "No se encontro ceTaskId en report-task.txt."

wait_for_analysis "${TASK_ID}"

log "Exportando evidencias JSON a ${REPORT_DIR}..."
fetch_json "/api/measures/component" "${REPORT_DIR}/measures.json" \
  --data-urlencode "component=${PROJECT_KEY}" \
  --data-urlencode "metricKeys=ncloc,coverage,line_coverage,branch_coverage,duplicated_lines_density,bugs,vulnerabilities,security_hotspots,code_smells,sqale_index,reliability_rating,security_rating,sqale_rating"

fetch_json "/api/qualitygates/project_status" "${REPORT_DIR}/quality-gate.json" \
  --data-urlencode "projectKey=${PROJECT_KEY}"

fetch_json "/api/issues/search" "${REPORT_DIR}/issues.json" \
  --data-urlencode "componentKeys=${PROJECT_KEY}" \
  --data-urlencode "resolved=false" \
  --data-urlencode "ps=500"

fetch_json "/api/hotspots/search" "${REPORT_DIR}/security-hotspots.json" \
  --data-urlencode "projectKey=${PROJECT_KEY}" \
  --data-urlencode "ps=500"

cp -f -- "${REPORT_TASK_FILE}" "${REPORT_DIR}/report-task.txt"
chmod 600 "${REPORT_DIR}/report-task.txt"

GIT_COMMIT="$(git -C "${PROJECT_DIR}" rev-parse HEAD 2>/dev/null || printf 'sin-commit')"
GENERATED_AT="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
node -e '
  const fs = require("fs");
  const [file, generatedAt, projectKey, commit, serverImage, scannerImage, serverUrl] = process.argv.slice(1);
  const data = {
    generatedAt,
    projectKey,
    gitCommit: commit,
    serverImage,
    scannerImage,
    serverUrl,
    note: "El token efimero fue revocado al terminar y no se guarda en estos reportes."
  };
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
' "${REPORT_DIR}/metadata.json" "${GENERATED_AT}" "${PROJECT_KEY}" "${GIT_COMMIT}" \
  "${SONAR_IMAGE}" "${SONAR_SCANNER_IMAGE}" "${SONAR_API_URL}"

QUALITY_GATE_STATUS="$(node -e '
  const fs = require("fs");
  const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  process.stdout.write(data.projectStatus?.status || "UNKNOWN");
' "${REPORT_DIR}/quality-gate.json")"

log "Quality Gate: ${QUALITY_GATE_STATUS}"
log "Dashboard: ${SONAR_API_URL}/dashboard?id=${PROJECT_KEY}"
log "Reportes: ${REPORT_DIR}"

if [[ "${QUALITY_GATE_STATUS}" != "OK" ]]; then
  printf '[sonar-local] El analisis termino, pero el Quality Gate no esta aprobado.\n' >&2
  exit 2
fi
