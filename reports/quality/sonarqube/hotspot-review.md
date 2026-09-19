# Revisión de hotspots de seguridad

SonarQube identificó cuatro puntos que requieren revisión humana. Ninguno se
clasificó como vulnerabilidad confirmada.

| Ubicación | Regla o motivo | Evaluación | Tratamiento |
|---|---|---|---|
| `src/seed.js:11` | Contraseña de demostración | Riesgo aceptado solo para la demostración local | El seed está bloqueado en producción. Las cuentas reales se crean con variables de entorno o registro público USER. |
| `src/seed.js:17` | Contraseña de demostración | Riesgo aceptado solo para la demostración local | No reutilizar estas credenciales en despliegues reales y retirar el seed en producción. |
| `src/validation.js:35` | Posible credencial incrustada | Falso positivo | La línea valida complejidad de contraseñas y no contiene una contraseña real. |
| `src/validation.js:3` | Posible backtracking en expresión regular | Riesgo limitado | La entrada está restringida a 254 caracteres. Se propone sustituirla por una validación lineal antes de un despliegue público. |

Los dos riesgos aceptados dependen de que `NODE_ENV` no sea `production`. El
servidor rechaza la carga de datos demo en producción. El plan de mejora también
incluye eliminar las credenciales visibles y usar un mecanismo de aprovisionamiento
seguro para administradores.
