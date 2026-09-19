# EduPréstamo

Sistema web para administrar recursos educativos y su ciclo de préstamo. La solución permite registrar usuarios, consultar inventario, solicitar recursos y controlar la aprobación, entrega y devolución mediante permisos diferenciados para `ADMIN` y `USER`.

## Funcionalidad implementada

- Autenticación con JWT, contraseñas protegidas con bcrypt y tokens con emisor, audiencia y caducidad verificables.
- Registro público de cuentas con asignación obligatoria del rol `USER`.
- Autorización por roles: los usuarios consultan el catálogo y gestionan sus solicitudes; los administradores controlan recursos, préstamos, usuarios y reportes.
- Bloqueo temporal después de tres intentos fallidos de inicio de sesión.
- Inventario con búsqueda, categorías, condición física, existencias y baja lógica.
- Flujo de préstamo con estados `PENDING`, `APPROVED`, `REJECTED`, `DELIVERED`, `RETURNED` y `CANCELLED`.
- Actualización transaccional de existencias para evitar sobreasignaciones.
- Panel web adaptable a dispositivos móviles y API REST con respuestas JSON consistentes.
- Pruebas automatizadas con Jest y Supertest, umbral global de cobertura de 80 %.
- Pipeline de GitHub Actions con lint, pruebas, compilación, despliegue efímero en Docker, comprobación de salud, OWASP ZAP y análisis Sonar configurable.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Interfaz | HTML, CSS y JavaScript sin framework |
| API | Node.js 22 y Express 5 |
| Persistencia | SQLite mediante `node:sqlite` |
| Seguridad | JWT, bcrypt, Helmet, CSP, CORS y validación de entradas |
| Pruebas | Jest y Supertest |
| Calidad | ESLint y SonarQube/SonarCloud |
| Entrega | Docker, Docker Compose y GitHub Actions |
| Seguridad dinámica | OWASP ZAP |

## Arquitectura

```text
Navegador / SPA
       |
       | HTTP local o HTTPS mediante proxy + JWT Bearer
       v
Express 5
  |-- Helmet, CSP, CORS y límite JSON de 32 KiB
  |-- autenticación JWT y autorización ADMIN/USER
  |-- validación y manejo uniforme de errores
  |-- rutas de autenticación, recursos, préstamos, usuarios y reportes
       |
       v
SQLite
  |-- users
  |-- resources
  `-- loans
```

La aplicación se mantiene como un monolito modular para que el prototipo sea fácil de ejecutar y evaluar. Las consultas emplean parámetros y las operaciones que modifican préstamo e inventario usan transacciones. SQLite sustituye a MySQL en esta entrega académica para ofrecer una demostración reproducible sin un servidor de base de datos externo.

## Requisitos

- Node.js `22.13.0` o posterior.
- npm, incluido con Node.js.
- Docker Desktop o Docker Engine, únicamente si se utilizará el contenedor o el escaneo local con ZAP.

## Instalación local

1. Instala exactamente las dependencias registradas:

   ```bash
   npm ci
   ```

2. Configura las variables. `.env.example` documenta todos los valores, pero la aplicación no carga archivos `.env` por sí sola. En macOS o Linux puedes exportarlos para la terminal actual:

   ```bash
   export NODE_ENV=development
   export PORT=3000
   export JWT_SECRET="reemplace-por-un-secreto-aleatorio-de-al-menos-32-bytes"
   export DATABASE_PATH="./data/eduprestamo.sqlite"
   export CORS_ORIGIN="http://localhost:3000"
   ```

   Genera un secreto con `openssl rand -hex 32`. En desarrollo se crea uno temporal si se omite, pero los tokens dejarán de ser válidos al reiniciar el proceso. En producción, `JWT_SECRET` es obligatorio.

3. Carga datos de demostración:

   ```bash
   npm run seed:demo
   ```

4. Inicia el sistema:

   ```bash
   npm start
   ```

5. Abre [http://localhost:3000](http://localhost:3000). El estado del servicio se comprueba en [http://localhost:3000/health](http://localhost:3000/health).

Durante desarrollo también puede utilizarse `npm run dev`, que reinicia el servidor cuando cambia el código.

## Credenciales de demostración

Estas cuentas existen solo después de ejecutar `npm run seed:demo` y no deben utilizarse en producción.

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@eduprestamo.local` | `Admin123!` |
| Usuario | `usuario@eduprestamo.local` | `Usuario123!` |

Para crear un administrador sin datos de ejemplo, define `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`, ejecuta `npm run seed:admin` y elimina esas variables al terminar.

## Uso básico

### Como usuario

1. Inicia sesión o registra una cuenta.
2. Consulta y filtra el catálogo.
3. Selecciona un recurso, indica cantidad y propósito, y crea una solicitud.
4. Revisa el estado de tus solicitudes y cancela únicamente las que sigan pendientes.

### Como administrador

1. Consulta el resumen de inventario, usuarios y préstamos.
2. Crea, actualiza o da de baja recursos.
3. Aprueba o rechaza solicitudes; después registra la entrega y la devolución.
4. Administra roles y desbloquea cuentas.

## API REST

Las rutas protegidas reciben el encabezado `Authorization: Bearer <token>`. `Usuario` significa cualquier cuenta autenticada; `ADMIN` indica acceso exclusivo de administrador.

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| `GET` | `/health` | Público | Estado y versión del servicio |
| `POST` | `/api/auth/register` | Público | Registrar una cuenta `USER` |
| `POST` | `/api/auth/login` | Público | Autenticar y obtener un JWT |
| `GET` | `/api/auth/me` | Usuario | Consultar el perfil actual |
| `GET` | `/api/resources` | Usuario | Listar, buscar y filtrar recursos |
| `GET` | `/api/resources/:id` | Usuario | Consultar un recurso |
| `POST` | `/api/resources` | `ADMIN` | Crear un recurso |
| `PUT`, `PATCH` | `/api/resources/:id` | `ADMIN` | Actualizar un recurso |
| `DELETE` | `/api/resources/:id` | `ADMIN` | Dar de baja un recurso |
| `GET` | `/api/loans` | Usuario | Listar préstamos visibles para la cuenta |
| `GET` | `/api/loans/:id` | Usuario | Consultar un préstamo visible |
| `POST` | `/api/loans` | Usuario | Solicitar un préstamo |
| `PATCH` | `/api/loans/:id/cancel` | Usuario | Cancelar una solicitud pendiente propia |
| `PATCH` | `/api/loans/:id/approve` | `ADMIN` | Aprobar y reservar existencias |
| `PATCH` | `/api/loans/:id/reject` | `ADMIN` | Rechazar una solicitud |
| `PATCH` | `/api/loans/:id/deliver` | `ADMIN` | Registrar la entrega |
| `PATCH` | `/api/loans/:id/return` | `ADMIN` | Registrar la devolución y restaurar existencias |
| `GET` | `/api/users` | `ADMIN` | Listar usuarios |
| `GET` | `/api/users/:id` | `ADMIN` | Consultar un usuario |
| `PATCH` | `/api/users/:id/role` | `ADMIN` | Cambiar un rol |
| `PATCH` | `/api/users/:id/unlock` | `ADMIN` | Desbloquear una cuenta |
| `GET` | `/api/reports/summary` | `ADMIN` | Obtener indicadores operativos |

Ejemplo de autenticación:

```bash
curl --request POST http://localhost:3000/api/auth/login \
  --header 'Content-Type: application/json' \
  --data '{"email":"usuario@eduprestamo.local","password":"Usuario123!"}'
```

## Pruebas y cobertura

Ejecuta la revisión completa con:

```bash
npm run check
```

O ejecuta cada etapa por separado:

```bash
npm run lint
npm test
npm run test:coverage
npm run build
```

La configuración de Jest detiene el proceso si statements, branches, functions o lines quedan por debajo de 80 %. El último reporte generado en este repositorio registra 27 pruebas aprobadas en 4 suites y la siguiente cobertura global:

| Métrica | Resultado | Umbral |
|---|---:|---:|
| Statements | 94.86 % | 80 % |
| Branches | 85.71 % | 80 % |
| Functions | 98.64 % | 80 % |
| Lines | 96.02 % | 80 % |

Consulta el [reporte HTML de cobertura](reports/coverage/index.html), el [resumen JSON](reports/coverage/coverage-summary.json) y el [resumen de la ejecución](reports/unit/test-summary.md). La cobertura corresponde al backend; la interfaz ubicada en `src/public/` no forma parte del cálculo de Jest.

## CI/CD con GitHub Actions

El workflow [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) se activa en pushes a `main` o `codex/**`, pull requests y ejecuciones manuales. Sus etapas son:

1. `quality`: instalación reproducible con `npm ci`, ESLint, Jest y publicación de cobertura.
2. `container_security`: compilación, imagen Docker, secreto JWT efímero, despliegue de prueba aislado, healthcheck y escaneo OWASP ZAP.
3. `sonar`: análisis opcional con SonarCloud o SonarQube cuando existe `SONAR_TOKEN`.

El despliegue es efímero y exclusivo para validación: el contenedor y su red se eliminan al finalizar. Los reportes se conservan como artefactos del workflow durante 30 días.

Las etapas principales se validaron localmente. Aún no existe una ejecución remota porque el proyecto no está conectado a un repositorio de GitHub. Consulta la [evidencia local de CI/CD](reports/cicd/local-validation.md).

Para habilitar Sonar en GitHub configura:

- Secret: `SONAR_TOKEN`.
- SonarCloud: variable `SONAR_ORGANIZATION` y, opcionalmente, `SONAR_PROJECT_KEY`.
- SonarQube autohospedado: variable `SONAR_HOST_URL` y, opcionalmente, `SONAR_PROJECT_KEY`.

## Docker

La imagen usa Node 22 Alpine, instala solo dependencias de producción y se ejecuta como el usuario no privilegiado `node`.

```bash
export JWT_SECRET="reemplace-por-un-secreto-seguro"
docker compose up --build
```

Docker Compose añade persistencia mediante el volumen `eduprestamo-data`, sistema de archivos de solo lectura, eliminación de capacidades, `no-new-privileges` y healthcheck. Para detener el servicio:

```bash
docker compose down
```

Agrega `--volumes` únicamente si también deseas eliminar la base de datos persistente.

## OWASP ZAP

El escaneo solo debe ejecutarse contra un ambiente propio o expresamente autorizado. Con la aplicación disponible en el puerto 3000:

```bash
bash security/zap/run-zap.sh
```

La automatización utiliza la imagen oficial `ghcr.io/zaproxy/zaproxy:stable` y escribe HTML, JSON y Markdown en `reports/security/zap/`. Para otro destino define `ZAP_TARGET_URL`; para alcanzar rutas protegidas proporciona un JWT de prueba de corta duración en `ZAP_AUTH_TOKEN` sin guardarlo en el repositorio. Las reglas hacen que alertas de XSS y SQLi bloqueen la etapa.

El análisis final se ejecutó con OWASP ZAP 2.17.0 contra el entorno local autorizado. Registró 0 alertas altas, 2 medias, 0 bajas y 4 informativas. No encontró XSS ni inyección SQL. Las alertas medias corresponden a la ausencia de token CSRF en una aplicación que autentica con JWT Bearer y al uso de HTTP en el entorno local. Consulta el [resumen del análisis](reports/security/zap/scan-summary.md) y los reportes originales en `reports/security/zap/`.

Consulta las [instrucciones de ZAP](security/zap/README.md) y el [directorio de evidencia](reports/security/zap/README.md).

## SonarQube o SonarCloud

`sonar-project.properties` conecta fuentes, pruebas y `reports/coverage/lcov.info`. Con un servidor y token válidos puede ejecutarse el analizador oficial o dejar que el job `sonar` lo haga en GitHub Actions.

El análisis local con SonarQube 10.6.0 obtuvo Quality Gate aprobado, 0 bugs, 0 vulnerabilidades, 0 code smells, 0 minutos de deuda técnica, 0.0 % de duplicación y 91.6 % de cobertura general. Los cuatro hotspots se revisaron y documentaron; dos pertenecen a credenciales exclusivamente demo, uno es un falso positivo en la validación de contraseñas y otro queda limitado por la longitud máxima del correo. Consulta el [resumen SonarQube](reports/quality/sonarqube/analysis-summary.md) y la [revisión de hotspots](reports/quality/sonarqube/hotspot-review.md).

Consulta las [instrucciones para conservar la evidencia Sonar](reports/quality/sonarqube/README.md).

## Evidencia del proyecto

| Evidencia | Ruta |
|---|---|
| Cobertura Jest | [`reports/coverage/`](reports/coverage/) |
| Pruebas unitarias y de integración | [`reports/unit/test-summary.md`](reports/unit/test-summary.md) |
| Reportes ZAP | [`reports/security/zap/scan-summary.md`](reports/security/zap/scan-summary.md) |
| Reportes Sonar | [`reports/quality/sonarqube/analysis-summary.md`](reports/quality/sonarqube/analysis-summary.md) |
| Pipeline | [`reports/cicd/local-validation.md`](reports/cicd/local-validation.md) |
| Despliegue de prueba | [`reports/deployment/container-evidence.md`](reports/deployment/container-evidence.md) |
| Capturas de la interfaz | [`docs/assets/`](docs/assets/) |

Capturas disponibles:

- [Inicio de sesión](docs/assets/ui-login.png)
- [Resumen administrativo](docs/assets/ui-admin-summary.png)
- [Gestión de recursos](docs/assets/ui-admin-resources.png)
- [Catálogo del usuario](docs/assets/ui-user-catalog.png)

Cada evidencia final debe indicar fecha, comando, versión de la herramienta, commit de Git y resultado. Los archivos `README.md` dentro de `reports/` son instrucciones y no sustituyen reportes reales.

## Estructura del repositorio

```text
.
|-- .github/workflows/ci-cd.yml   # pipeline CI/CD y DevSecOps
|-- docs/                         # informe, presentación, guion y capturas
|-- reports/                      # evidencia generada por las herramientas
|-- scripts/build.js              # construcción del artefacto verificable
|-- security/zap/                 # automatización y reglas de ZAP
|-- src/
|   |-- public/                   # interfaz web
|   |-- routes/                   # endpoints por dominio
|   |-- app.js                    # composición de Express
|   |-- db.js                     # esquema y transacciones SQLite
|   |-- security.js               # JWT, autenticación y roles
|   `-- server.js                 # arranque del servicio
|-- tests/                        # pruebas Jest/Supertest
|-- Dockerfile
|-- docker-compose.yml
|-- sonar-project.properties
|-- package.json
`-- package-lock.json
```

## Consideraciones de seguridad

- Nunca confirmes `.env`, secretos JWT, tokens Sonar ni tokens de prueba ZAP en Git.
- Cambia las credenciales de demostración y usa TLS antes de cualquier despliegue fuera de un entorno local.
- Restringe `CORS_ORIGIN` al origen real de la interfaz.
- Conserva el límite de intentos y revisa los tiempos de bloqueo según la política institucional.
- Revisa los hotspots de Sonar y clasifica cada alerta de ZAP; la ausencia de fallos en pruebas unitarias no sustituye una evaluación de seguridad.

## Guion y documentación de entrega

El [guion de presentación de 15 minutos](docs/Guion-Presentacion-15-min.md) distribuye la demostración conforme a la rúbrica. Los informes y presentaciones finales se almacenan en `docs/` y deben referenciar el mismo commit que los reportes técnicos.

## Licencia y alcance

Proyecto académico de ingeniería de software. Antes de un uso institucional se requieren revisión de privacidad, respaldo y recuperación, TLS, gestión centralizada de secretos, monitoreo y una base de datos administrada acorde con la carga esperada.
