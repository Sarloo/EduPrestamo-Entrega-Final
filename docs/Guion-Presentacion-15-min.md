# Guion de presentación final de EduPréstamo

Duración total: **15:00 minutos exactos**. Modalidad: individual. El guion respeta los cinco bloques sugeridos en la rúbrica y reserva una acción visible para cada afirmación técnica.

## Preparación antes de iniciar

- Abrir la aplicación con los datos demo cargados y comprobar `/health`.
- Mantener abiertas, en este orden: pantalla de acceso, terminal, workflow de GitHub Actions, reporte ZAP, tablero o exportación Sonar y presentación.
- Tener una terminal en la raíz del repositorio y otra disponible para la demostración.
- Usar una ejecución real del commit entregado. No mostrar tokens, secretos ni archivos `.env`.
- Sustituir todos los marcadores `PENDIENTE` de este guion con datos obtenidos de los reportes finales.
- Practicar las transiciones. Si una herramienta externa tarda, mostrar la evidencia guardada y explicar el comando reproducible en vez de esperar.

## 0:00–3:00 — Objetivo, módulo, JWT, roles y cobertura

### 0:00–0:25 — Apertura

**En pantalla:** portada con nombre del proyecto.

**Decir:**

> Buenos días. Presento EduPréstamo, un sistema web para controlar recursos educativos y su ciclo completo de solicitud, autorización, entrega y devolución. La solución responde a un problema concreto: sustituir registros dispersos por trazabilidad, control de existencias y responsabilidades claras.

### 0:25–0:55 — Objetivo SMART

**En pantalla:** objetivo SMART y alcance.

**Decir:**

> El objetivo fue implementar y validar un módulo funcional de gestión de recursos con autenticación JWT y roles ADMIN y USER, alcanzar al menos 80 por ciento de cobertura en las cuatro métricas de Jest, automatizar pruebas, construcción y despliegue de prueba, y conservar evidencia de ZAP y Sonar para el cierre de esta entrega.

### 0:55–2:10 — Demostración funcional

**En pantalla y acciones:**

1. Iniciar sesión con `usuario@eduprestamo.local`.
2. Mostrar el catálogo y crear una solicitud de préstamo.
3. Cerrar sesión e ingresar como `admin@eduprestamo.local`.
4. Mostrar la solicitud y la acción administrativa de aprobación, sin exponer el JWT.

**Decir mientras se demuestra:**

> La contraseña se almacena con bcrypt. Al autenticar, el servidor entrega un JWT firmado con identidad, rol, emisor, audiencia y caducidad. El middleware valida el token y consulta nuevamente al usuario. El rol USER puede ver recursos y administrar únicamente sus propias solicitudes. El rol ADMIN además controla inventario, usuarios, reportes y transiciones de préstamo. Al aprobar, una transacción reserva existencias; al devolver, las restaura.

### 2:10–3:00 — Pruebas y cobertura

**En pantalla:** terminal con `npm run test:coverage` ya ejecutado y reporte HTML.

**Decir:**

> Las pruebas verifican autenticación, bloqueo tras tres intentos, permisos, validación, inventario, privacidad entre usuarios, transiciones y consistencia de existencias. El resultado final fue 27 pruebas aprobadas en 4 suites. La cobertura fue 94.71 por ciento en statements, 85.33 en branches, 98.59 en functions y 95.89 en lines. Las cuatro superan el umbral obligatorio de 80 por ciento; si alguna baja, Jest falla el pipeline.

**Transición a los 3:00:**

> Ahora mostraré cómo estas verificaciones se ejecutan automáticamente.

## 3:00–6:00 — Pipeline de CI/CD

### 3:00–3:40 — Disparadores y control de calidad

**En pantalla:** `.github/workflows/ci-cd.yml` o vista del workflow.

**Decir:**

> El workflow se activa con push a main o ramas codex, pull requests y ejecución manual. El primer job hace checkout, instala las versiones bloqueadas con npm ci, ejecuta ESLint y corre Jest con el umbral global de 80 por ciento. La cobertura se publica como artefacto durante 30 días.

### 3:40–4:45 — Construcción y despliegue de prueba

**En pantalla:** pasos del job `container_security` y evidencia del healthcheck.

**Decir:**

> Cuando calidad termina correctamente, el pipeline construye el artefacto y la imagen Docker. Genera un secreto JWT efímero, crea una red aislada y despliega un contenedor de prueba. El pipeline espera hasta que Docker marque el servicio como healthy y además consulta `/health`. Esto demuestra que no solo compila: la aplicación realmente arranca en un entorno reproducible.

### 4:45–5:30 — Seguridad y Sonar dentro del pipeline

**En pantalla:** pasos ZAP, artefactos y job Sonar.

**Decir:**

> Sobre ese mismo despliegue se ejecuta OWASP ZAP. Los reportes se guardan junto con la inspección del contenedor. El job Sonar reutiliza la cobertura LCOV y admite SonarCloud o SonarQube autohospedado mediante secretos y variables, sin guardar credenciales en Git.

### 5:30–6:00 — Evidencia de la ejecución

**En pantalla:** ejecución real de GitHub Actions.

**Decir:**

> Esta es la ejecución asociada al commit entregado: **PENDIENTE: agregar SHA, URL o número de ejecución y estado real de cada job**. Los artefactos permiten auditar la cobertura, el despliegue y el escaneo sin depender de capturas manuales.

**Transición a los 6:00:**

> Con el despliegue verificado, paso a los resultados de seguridad y calidad.

## 6:00–9:00 — OWASP ZAP y SonarQube

### 6:00–7:20 — Prueba dinámica con OWASP ZAP

**En pantalla:** reporte HTML/JSON real de ZAP, primero el resumen y después los detalles relevantes.

**Decir:**

> ZAP ejecutó un full scan autorizado contra el ambiente de prueba. La configuración trata las alertas de XSS y SQL injection como bloqueantes. El resultado final fue: **PENDIENTE: fecha, imagen o versión, commit, URL del ambiente, alertas high/medium/low/informational y estado del escaneo**.

> El hallazgo principal fue **PENDIENTE: nombre exacto del reporte o indicar “sin hallazgos bloqueantes” solo si el reporte lo confirma**. La decisión fue **PENDIENTE: corrección, aceptación justificada o falso positivo**, y la revalidación mostró **PENDIENTE: resultado real de la segunda ejecución**.

**Demostrar:** abrir una alerta y relacionarla con la ruta y la corrección. Si no hubo alertas bloqueantes, mostrar el conteo real y explicar las defensas observables: consultas parametrizadas, CSP, validación, límite JSON y control de acceso.

### 7:20–8:35 — Calidad con SonarQube/SonarCloud

**En pantalla:** Quality Gate o respuesta exportada de la API.

**Decir:**

> Sonar analizó el mismo commit y consumió el archivo LCOV generado por Jest. El Quality Gate fue **PENDIENTE: estado real**. Las métricas fueron: **PENDIENTE: bugs, vulnerabilidades, hotspots, code smells, deuda técnica, duplicación y cobertura reportada por Sonar**.

> La métrica que requiere mayor atención es **PENDIENTE: seleccionar a partir del análisis real**. La acción concreta es **PENDIENTE: mejora verificable y plazo**. Estos valores no se estiman; proceden del tablero o de la API y se conservan en `reports/quality/sonarqube/`.

### 8:35–9:00 — Lectura conjunta

**Decir:**

> Jest comprueba el comportamiento esperado, ZAP observa el sistema en ejecución y Sonar analiza riesgos y mantenibilidad del código. Son controles complementarios: aprobar uno no sustituye los demás.

**Transición a los 9:00:**

> Con esa evidencia, comparo el resultado con la planeación original.

## 9:00–12:00 — Cierre: plan frente a ejecución y lecciones

### 9:00–10:35 — Comparación plan versus ejecución

**En pantalla:** tabla comparativa del informe de cierre.

**Decir:**

> La planeación contemplaba autenticación, inventario, catálogo, solicitudes, aprobación, entrega, devolución, historial y reportes. En la ejecución se completó ese flujo como un monolito modular. Los perfiles alumno y docente se consolidaron en USER, conservando ADMIN, para ajustarse a la rúbrica sin duplicar permisos equivalentes.

> La propuesta inicial sugería MySQL. Para esta entrega se utilizó SQLite con `node:sqlite`, porque permite un entorno de demostración y CI reproducible sin un servicio externo. El esquema conserva claves, restricciones, índices y transacciones, por lo que una migración posterior es viable.

> **PENDIENTE: añadir cualquier diferencia real adicional del informe, con causa, impacto y tratamiento; no presentar supuestos como hechos.**

### 10:35–11:35 — Lecciones aprendidas

**En pantalla:** tres lecciones con evidencia.

**Decir:**

> Primera lección: construir un recorrido vertical temprano —login, autorización, operación y persistencia— descubre dependencias antes que desarrollar cada capa por separado. Segunda: las pruebas de error son tan importantes como el camino exitoso; detectaron la forma real del error de unicidad de SQLite y permitieron devolver conflictos correctos. Tercera: generar evidencia como parte del pipeline evita que cobertura, seguridad y despliegue queden como actividades manuales de último momento.

### 11:35–12:00 — Estado de cierre

**Decir:**

> El alcance funcional está implementado y las pruebas superan el umbral. **PENDIENTE: confirmar aquí el estado final de CI, ZAP y Sonar de acuerdo con la evidencia**. Las limitaciones restantes se convierten en acciones medibles del plan de mejora.

**Transición a los 12:00:**

> Cierro con ese plan y la propuesta de innovación.

## 12:00–15:00 — Mejora continua e innovación

### 12:00–13:35 — Plan medible

**En pantalla:** hoja de ruta con responsable, plazo, KPI y meta.

**Decir:**

> En los primeros 30 días, el responsable de desarrollo mantendrá protección de rama y exigirá que el 100 por ciento de los cambios a main tengan pipeline verde y revisión. En 60 días, seguridad incorporará un escenario ZAP autenticado y buscará cero alertas high o medium sin justificar. En 90 días, infraestructura preparará migración a una base administrada y una prueba de restauración, con RPO de 24 horas y RTO de 2 horas. En el mismo horizonte, producto añadirá notificaciones y medirá que al menos 90 por ciento de las transiciones relevantes genere un aviso trazable.

### 13:35–14:35 — Innovación con datos

**En pantalla:** propuesta de predicción de demanda.

**Decir:**

> La innovación propuesta es un modelo de predicción de demanda por categoría. Primero se reunirán al menos seis meses de historial limpio. Después se comparará un modelo contra una línea base estacional. Solo se pilotará si logra un error porcentual absoluto medio igual o menor a 20 por ciento y mejora la línea base. La recomendación apoyará compras y disponibilidad, pero la decisión final seguirá en manos del administrador.

### 14:35–15:00 — Cierre exacto

**En pantalla:** resumen de cuatro evidencias: sistema, cobertura, pipeline y mejora.

**Decir:**

> En conclusión, EduPréstamo integra un flujo funcional, seguridad por diseño, pruebas superiores al 80 por ciento y una entrega automatizada con evidencia auditable. El plan propuesto convierte las limitaciones actuales en mejoras con responsables, plazos y métricas. Muchas gracias.

Detener el cronómetro en **15:00**.

## Plan de contingencia para una demostración fluida

- Si la red falla, usar la aplicación local, la ejecución descargada del pipeline y los reportes guardados en `reports/`.
- Si el servidor no responde, mostrar `/health`, reiniciar con `npm start` y continuar con capturas mientras inicia.
- Si ZAP o Sonar tardan, no ejecutarlos en vivo; mostrar el reporte del commit final y el comando reproducible.
- Si una acción de demo altera el inventario, restaurar los datos antes de presentar o usar una base de demostración nueva.
- Si se pierde tiempo, conservar la evidencia técnica y abreviar frases; no omitir los cinco bloques de la rúbrica.

## Lista final de sustituciones obligatorias

- [ ] SHA y ejecución real de GitHub Actions.
- [ ] Resultado y conteos reales de OWASP ZAP.
- [ ] Hallazgos, correcciones y revalidación real de ZAP.
- [ ] Quality Gate y métricas reales de Sonar.
- [ ] Diferencias adicionales entre plan y ejecución, solo si están documentadas.
- [ ] Estado final consistente entre guion, diapositivas, informe y reportes.
