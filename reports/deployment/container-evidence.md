# Evidencia del entorno de prueba

## Resultado

- Fecha: 18 de septiembre de 2026
- Imagen validada: `eduprestamo:final`
- Tecnología: Node.js 22 Alpine
- Usuario del contenedor: `node`, sin privilegios
- Endpoint probado: `GET /health`
- Respuesta: `{"status":"ok","service":"eduprestamo-api","version":"1.0.0"}`
- Resultado de autenticación: HTTP 200 con usuario `ADMIN`

La imagen utiliza una base SQLite persistida en `/app/data`, un healthcheck y un
secreto JWT suministrado mediante variable de entorno. Docker Compose añade un
sistema de archivos de solo lectura, elimina capacidades de Linux y activa
`no-new-privileges`.

La versión actual de la interfaz también se validó en ejecución local en
`http://localhost:3100`: el registro crea únicamente cuentas USER, y el filtro
personal del administrador devuelve solo préstamos asociados a su propio ID.
