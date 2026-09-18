# Deployment evidence

The CI pipeline creates an isolated Docker network, starts the production image
with an ephemeral SQLite database, waits for the Docker healthcheck, and calls
`GET /health`. It stores the actual health response and container inspection as
workflow artifacts.

For the final handoff, retain the final run artifact and record the commit SHA,
image identifier, deployment target, healthcheck result, date, and smoke-test
result. Do not add a successful status unless it came from an executed run.

