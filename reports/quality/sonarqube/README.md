# SonarQube / SonarCloud evidence

CI performs analysis only when `SONAR_TOKEN` is available. Configure either:

- SonarCloud: repository variable `SONAR_ORGANIZATION` and optional
  `SONAR_PROJECT_KEY`.
- Self-hosted SonarQube: repository variable `SONAR_HOST_URL` and optional
  `SONAR_PROJECT_KEY`.

Export the final Quality Gate and measures for bugs, vulnerabilities, security
hotspots, code smells, technical debt, coverage, duplicated lines, reliability,
security, and maintainability. Save the raw API response or dashboard export
here with a short interpretation and the analyzed commit SHA. Never recreate a
dashboard result manually.

