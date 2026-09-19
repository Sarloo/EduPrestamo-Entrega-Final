# Resumen de pruebas automatizadas

## Resultado

- Fecha de verificación: 18 de septiembre de 2026
- Herramienta: Jest 30 con Supertest
- Suites aprobadas: 4 de 4
- Pruebas aprobadas: 27 de 27
- Pruebas fallidas: 0
- Comando: `npm run test:coverage -- --ci`
- Entorno: instalación limpia con `npm ci` en un directorio temporal

## Cobertura

| Métrica | Resultado | Umbral requerido | Estado |
|---|---:|---:|---|
| Statements | 94.86 % | 80 % | Aprobado |
| Branches | 85.71 % | 80 % | Aprobado |
| Functions | 98.64 % | 80 % | Aprobado |
| Lines | 96.02 % | 80 % | Aprobado |

La cobertura corresponde al backend de Node.js. La configuración excluye
`src/public/`, `src/server.js` y `src/seed.js`. Las pruebas incluyen autenticación
JWT, registro con rol USER, autorización por roles, privacidad entre usuarios,
inventario y el ciclo de aprobación, entrega y devolución de préstamos.

Los archivos HTML, LCOV y JSON generados por Jest están en `reports/coverage/`.
