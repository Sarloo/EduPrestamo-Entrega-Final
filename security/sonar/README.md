# SonarQube local reproducible

Este flujo levanta o reutiliza un SonarQube Community aislado en Docker,
ejecuta `sonar-scanner`, espera a que el servidor procese el analisis y guarda
evidencia verificable en `reports/quality/sonarqube/`.

## Requisitos

- Docker Desktop iniciado.
- Node.js, `curl`, Git y Bash disponibles.
- Dependencias instaladas y cobertura generada:

```bash
npm ci
npm run test:coverage
```

## Ejecutar

```bash
./security/sonar/run-sonar-local.sh
```

El primer arranque puede tardar varios minutos. El dashboard queda disponible
en <http://localhost:9001/dashboard?id=eduprestamo>. El contenedor y sus
volumenes se conservan para que las siguientes ejecuciones sean mas rapidas.

El script usa versiones fijas por defecto:

- `sonarqube:10.6.0-community`
- `sonarsource/sonar-scanner-cli:5.0.1`

Para Apple Silicon, si una version local de Docker no selecciona la arquitectura
correcta automaticamente, se puede forzar la emulacion:

```bash
SONAR_PLATFORM=linux/amd64 ./security/sonar/run-sonar-local.sh
```

## Credenciales y token

En un contenedor nuevo SonarQube usa la credencial local inicial `admin/admin`.
El servicio se publica exclusivamente en `127.0.0.1`. El script crea un token
con nombre unico, lo mantiene fuera de la linea de comandos del scanner y lo
revoca al terminar, incluso si el analisis falla. Los reportes nunca contienen
el token.

Si la clave de administrador ya fue cambiada, la opcion recomendada es guardarla
en un archivo legible solo por el usuario y pasar su ruta:

```bash
chmod 600 /ruta/segura/sonar-admin-password
SONAR_ADMIN_PASSWORD_FILE=/ruta/segura/sonar-admin-password \
  ./security/sonar/run-sonar-local.sh
```

Tambien se admite `SONAR_ADMIN_PASSWORD`, pero el archivo evita dejar la clave
en el historial del shell. El valor se elimina del entorno antes de invocar a
Docker y no se imprime.

## Evidencias generadas

El directorio `reports/quality/sonarqube/` contiene:

- `measures.json`: cobertura, deuda tecnica, code smells, duplicacion,
  vulnerabilidades y demas medidas disponibles.
- `quality-gate.json`: estado y condiciones del Quality Gate.
- `issues.json`: incidencias abiertas del proyecto.
- `security-hotspots.json`: hotspots de seguridad que requieren revisión manual.
- `compute-engine-task.json`: resultado del procesamiento del analisis.
- `report-task.txt`: identificadores tecnicos de la ejecucion.
- `metadata.json`: fecha UTC, commit analizado e imagenes utilizadas; no incluye
  secretos.

El script devuelve codigo `0` cuando el Quality Gate es `OK` y codigo `2` cuando
el analisis se completo pero el Quality Gate no fue aprobado. En ambos casos se
exportan los JSON.

## Variables opcionales

| Variable | Predeterminado | Uso |
| --- | --- | --- |
| `SONAR_PORT` | `9001` | Puerto local del dashboard y API. |
| `SONAR_CONTAINER_NAME` | `eduprestamo-sonarqube` | Nombre del contenedor administrado. |
| `SONAR_IMAGE` | `sonarqube:10.6.0-community` | Version del servidor. |
| `SONAR_SCANNER_IMAGE` | `sonarsource/sonar-scanner-cli:5.0.1` | Version del scanner. |
| `SONAR_PLATFORM` | vacio | Plataforma Docker opcional, por ejemplo `linux/amd64`. |
| `SONAR_SCAN_DIR` | raiz del repositorio | Copia materializada del mismo commit que se analizara, util en carpetas sincronizadas por macOS. |
| `SONAR_START_TIMEOUT` | `360` | Segundos maximos para iniciar SonarQube. |
| `SONAR_ANALYSIS_TIMEOUT` | `300` | Segundos maximos para procesar el analisis. |
| `SONAR_ADMIN_PASSWORD_FILE` | vacio | Archivo privado con la clave local de admin. |

`SONAR_API_URL` y `SONAR_SCANNER_HOST_URL` permiten adaptar escenarios Docker
avanzados. En Docker Desktop, los valores predeterminados usan `127.0.0.1` desde
macOS y `host.docker.internal` desde el contenedor del scanner.

## Limpieza

Eliminar el contenedor y conservar el historial/datos:

```bash
./security/sonar/cleanup-sonar-local.sh
```

Eliminar tambien los volumenes y restablecer por completo la instancia local:

```bash
./security/sonar/cleanup-sonar-local.sh --purge-data
```

La limpieza comprueba etiquetas de propiedad y se niega a borrar contenedores o
volumenes ajenos que tengan el mismo nombre.
