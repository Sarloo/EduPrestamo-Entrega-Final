#!/usr/bin/env bash
set -Eeuo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
target_url="${ZAP_TARGET_URL:-http://host.docker.internal:3000}"
zap_image="${ZAP_IMAGE:-ghcr.io/zaproxy/zaproxy:stable}"
zap_network="${ZAP_DOCKER_NETWORK:-}"
spider_minutes="${ZAP_SPIDER_MINUTES:-2}"
output_directory="${project_root}/reports/security/zap"

mkdir -p "${output_directory}"
# The official image runs as its own unprivileged user and must write reports
# through the bind mount. This only changes the generated-report directory.
chmod -R a+rwX "${output_directory}"

docker_options=(
  --rm
  --add-host host.docker.internal:host-gateway
  --volume "${project_root}:/zap/wrk:rw"
)

if [[ -n "${zap_network}" ]]; then
  docker_options+=(--network "${zap_network}")
fi

zap_options=(
  -t "${target_url}"
  -m "${spider_minutes}"
  -I
  -c security/zap/rules.tsv
  -r reports/security/zap/zap-report.html
  -J reports/security/zap/zap-report.json
  -w reports/security/zap/zap-report.md
)

# An optional short-lived test token lets ZAP reach protected endpoints without
# committing credentials. The unauthenticated scan remains the safe default.
if [[ -n "${ZAP_AUTH_TOKEN:-}" ]]; then
  replacer_config="-config replacer.full_list(0).description=EduPrestamoAuth -config replacer.full_list(0).enabled=true -config replacer.full_list(0).matchtype=REQ_HEADER -config replacer.full_list(0).matchstr=Authorization -config replacer.full_list(0).replacement=Bearer\\ ${ZAP_AUTH_TOKEN}"
  zap_options+=(-z "${replacer_config}")
fi

docker run "${docker_options[@]}" "${zap_image}" \
  zap-full-scan.py "${zap_options[@]}"