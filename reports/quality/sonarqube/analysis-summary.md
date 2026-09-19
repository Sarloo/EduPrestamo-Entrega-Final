# Resumen del análisis SonarQube

## Ejecución

- Fecha: 18 de septiembre de 2026
- SonarQube: `sonarqube:10.6.0-community`
- Analizador: `sonarsource/sonar-scanner-cli:5.0.1`
- Commit analizado: `e19835e9a506b14579cbc3feb13f3a75607fac6b`
- Proyecto: `eduprestamo`

## Métricas finales

| Métrica | Resultado |
|---|---:|
| Quality Gate | Aprobado |
| Bugs | 0 |
| Vulnerabilidades | 0 |
| Code smells | 0 |
| Deuda técnica | 0 minutos |
| Cobertura general Sonar | 91.6 % |
| Cobertura de líneas | 95.0 % |
| Cobertura de ramas | 85.7 % |
| Líneas duplicadas | 0.0 % |
| Hotspots de seguridad | 4 |
| Líneas de código | 3148 |

El primer análisis encontró siete code smells y 63 minutos de deuda técnica. Se
refactorizaron las funciones indicadas y el segundo análisis redujo ambas métricas
a cero. Las calificaciones de fiabilidad, seguridad y mantenibilidad quedaron en
A. Los cuatro hotspots no se contaron como vulnerabilidades y se revisan por
separado en `hotspot-review.md`.

Las respuestas originales de la API de SonarQube se conservan en `measures.json`,
`quality-gate.json`, `issues.json` y `security-hotspots.json`.
