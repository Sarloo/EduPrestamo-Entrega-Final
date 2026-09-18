# CI/CD evidence

For the final successful GitHub Actions run, record its URL, run ID, branch,
commit SHA, start/end time, and the result of each stage: lint, Jest coverage,
container build, ephemeral deployment, healthcheck, ZAP, and Sonar when
configured. Download the run artifacts rather than copying values by hand.

The workflow file is configuration, not proof that the pipeline executed.

