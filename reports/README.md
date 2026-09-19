# Índice de evidencias

Esta carpeta reúne los resultados verificables del proyecto EduPréstamo. Los
archivos originales generados por Jest, OWASP ZAP y SonarQube se conservan junto
con resúmenes en español que explican su alcance y las decisiones tomadas.

| Requisito | Evidencia principal | Resultado |
|---|---|---|
| Pruebas automatizadas | `unit/test-summary.md` y `coverage/` | 27 pruebas aprobadas y cobertura mayor al 80 % |
| Seguridad dinámica | `security/zap/scan-summary.md` y `security/zap/zap-report.*` | Sin alertas de XSS, SQLi ni severidad alta |
| Calidad de código | `quality/sonarqube/analysis-summary.md` y respuestas JSON | Quality Gate aprobado, 0 bugs, 0 vulnerabilidades y 0 code smells |
| Revisión de hotspots | `quality/sonarqube/hotspot-review.md` | Cuatro hotspots documentados y evaluados |
| CI/CD | `cicd/local-validation.md` y `.github/workflows/ci-cd.yml` | Pipeline implementado y etapas principales validadas localmente |
| Despliegue de prueba | `deployment/container-evidence.md` | Aplicación iniciada y endpoint de salud aprobado |

La ejecución remota de GitHub Actions requiere crear o conectar el repositorio
en GitHub. No se presenta una ejecución remota ficticia como evidencia.
