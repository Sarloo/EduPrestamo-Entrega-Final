# OWASP ZAP automation

This directory contains the reproducible dynamic-security scan used by CI. It
runs the official ZAP container against an isolated test deployment and treats
XSS and SQL injection alerts as release-blocking failures.

## Run locally

1. Start EduPrestamo and confirm that `GET /health` succeeds.
2. Run `bash security/zap/run-zap.sh`.
3. Review the generated HTML, JSON, and Markdown files under
   `reports/security/zap/`.

The default target is `http://host.docker.internal:3000`. Override it with
`ZAP_TARGET_URL`. To scan protected routes, provide a short-lived test JWT in
`ZAP_AUTH_TOKEN`; never store that token in the repository. Only scan systems
that you own or are explicitly authorized to test.

The report is evidence, not the end of the process. Triage each alert, record
the remediation, rerun the scan against the same commit, and retain the final
report that confirms the correction.

