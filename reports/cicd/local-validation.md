# Evidencia de CI CD

## Pipeline implementado

El workflow `.github/workflows/ci-cd.yml` se activa en pushes a `main` y
`codex/**`, pull requests y ejecuciones manuales. Contiene tres etapas:

1. `quality`: instala con `npm ci`, ejecuta ESLint y Jest con cobertura.
2. `container_security`: construye la imagen, inicia un entorno efímero, valida
   `/health` y ejecuta OWASP ZAP.
3. `sonar`: envía el análisis cuando existe `SONAR_TOKEN`.

## Validación local

El 18 de septiembre de 2026 se ejecutaron en una instalación limpia las etapas
de lint y pruebas. ESLint terminó sin errores y Jest aprobó 27 de 27 pruebas. La
cobertura global fue 94.86 % en statements, 85.71 % en branches, 98.64 % en
functions y 96.02 % en lines.

También se construyó previamente la etapa Docker `quality`, se inició la imagen
de producción y el endpoint `/health` devolvió `status: ok`, servicio
`eduprestamo-api` y versión `1.0.0`. Los reportes ZAP y SonarQube de esa validación
se conservan en sus carpetas correspondientes.

## Estado de GitHub Actions

La automatización está lista para ejecutarse, pero el proyecto todavía no está
conectado a un repositorio remoto de GitHub. Por lo tanto, no existe una URL ni
un identificador de ejecución remota. Esta limitación se documenta para no
presentar una ejecución simulada como evidencia real.
