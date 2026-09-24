#!/usr/bin/env bash
set -Eeuo pipefail

revision="${1:-}"
project_directory="/opt/eduprestamo"
data_directory="/opt/eduprestamo-data"
backup_root="/opt/eduprestamo-backups"
container_name="eduprestamo-app"
image_name="eduprestamo:production"

if [[ ! "${revision}" =~ ^[0-9a-f]{40}$ ]]; then
  echo "A full 40-character Git commit SHA is required." >&2
  exit 1
fi

for required_command in git docker curl; do
  command -v "${required_command}" >/dev/null 2>&1 || {
    echo "Missing required command: ${required_command}" >&2
    exit 1
  }
done

if [[ ! -d "${project_directory}/.git" || ! -d "${data_directory}" ]]; then
  echo "The EC2 project or persistent data directory is missing." >&2
  exit 1
fi

environment_file="$(mktemp)"
chmod 600 "${environment_file}"
cleanup() {
  rm -f "${environment_file}"
}
trap cleanup EXIT

previous_revision="$(git -C "${project_directory}" rev-parse HEAD)"
previous_image="$(docker inspect --format '{{.Image}}' "${container_name}")"
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' \
  "${container_name}" > "${environment_file}"

git -C "${project_directory}" fetch --prune origin main
git -C "${project_directory}" cat-file -e "${revision}^{commit}"
git -C "${project_directory}" merge-base --is-ancestor "${revision}" origin/main
git -C "${project_directory}" checkout --force "${revision}"

docker build \
  --target runtime \
  --tag "${image_name}" \
  "${project_directory}"

start_container() {
  local image_reference="$1"
  docker run --detach \
    --name "${container_name}" \
    --restart unless-stopped \
    --env-file "${environment_file}" \
    --publish 80:3000 \
    --mount "type=bind,source=${data_directory},target=/app/data" \
    "${image_reference}" >/dev/null
}

wait_for_health() {
  local attempt
  local state
  for attempt in {1..30}; do
    state="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${container_name}" 2>/dev/null || true)"
    if [[ "${state}" == "healthy" ]]; then
      curl --fail --silent --show-error http://127.0.0.1/health >/dev/null
      return 0
    fi
    if [[ "${state}" == "exited" || "${state}" == "dead" ]]; then
      return 1
    fi
    sleep 2
  done
  return 1
}

docker stop "${container_name}" >/dev/null
backup_directory="${backup_root}/$(date -u +%Y%m%dT%H%M%SZ)-${previous_revision:0:7}"
mkdir -p "${backup_directory}"
cp -a "${data_directory}"/eduprestamo.sqlite* "${backup_directory}/"
docker rm "${container_name}" >/dev/null
start_container "${image_name}"

if ! wait_for_health; then
  echo "The new release failed its health check. Restoring the previous image." >&2
  docker logs "${container_name}" 2>&1 || true
  docker rm --force "${container_name}" >/dev/null 2>&1 || true
  start_container "${previous_image}"
  git -C "${project_directory}" checkout --force "${previous_revision}"
  wait_for_health || {
    echo "Automatic rollback did not become healthy." >&2
    exit 1
  }
  exit 1
fi

git -C "${project_directory}" checkout -B main "${revision}"
git -C "${project_directory}" branch --set-upstream-to=origin/main main >/dev/null
echo "EduPrestamo ${revision} is healthy on EC2."
