# Resumen del análisis OWASP ZAP

## Ejecución

- Fecha: 18 de septiembre de 2026
- Imagen: `ghcr.io/zaproxy/zaproxy:stable`
- Versión registrada: OWASP ZAP 2.17.0
- Entorno autorizado: aplicación local de prueba en `http://host.docker.internal:3101`
- Archivos originales: `zap-report.html`, `zap-report.json` y `zap-report.md`

## Resultado

| Severidad | Tipos de alerta |
|---|---:|
| Alta | 0 |
| Media | 2 |
| Baja | 0 |
| Informativa | 4 |

No se detectaron alertas de inyección SQL, XSS ni severidad alta. El conjunto de
reglas del proyecto trata los identificadores de XSS y SQLi como bloqueantes.

## Revisión de alertas

**Ausencia de token anti CSRF.** ZAP informó cinco instancias en formularios de
la interfaz. La aplicación no usa cookies para autenticar solicitudes; el token
JWT se envía explícitamente en el encabezado `Authorization`. El formulario de
inicio de sesión y el de registro son públicos, y el formulario modal se procesa
en JavaScript. Por ese motivo se documentó como alerta aceptada para este
prototipo. Una migración futura a cookies HttpOnly deberá incorporar protección
CSRF.

**Sitio solo HTTP.** El entorno analizado es local y no tiene certificado TLS.
La aplicación debe publicarse detrás de HTTPS antes de usarse fuera del entorno
de prueba.

Las alertas informativas describen la detección del formulario de autenticación,
el comportamiento de caché y el uso de una aplicación web moderna; no representan
vulnerabilidades confirmadas.

## Alcance y limitación

El spider recorrió la interfaz pública y el endpoint de autenticación. Las rutas
protegidas se validaron principalmente mediante las pruebas HTTP automatizadas.
Como mejora se propone agregar una especificación OpenAPI y un escaneo autenticado
separado para los roles USER y ADMIN.
