---
name: docs-sync
description: Mantiene la documentación de tdmx-astro al día tras cambios de código. Usar después de modificar endpoints, componentes, colecciones, variables de entorno, flujos de deploy o autenticación, para actualizar solo el documento afectado en /docs.
---

# Sincronizar documentación

Regla de `AGENTS.md`: toda la documentación técnica vive en `/docs`. No crear archivos `.md` fuera de esa carpeta.

## Mapa de documentos

| Si cambia... | Actualizar |
|---|---|
| Endpoints `/api/*`, CRM, Openpay, respuestas | `docs/api.md` |
| Colecciones Firestore, Storage, reglas | `docs/database.md` |
| Login, roles, rutas admin o cliente | `docs/auth.md` |
| Build, deploy, ramas, Vercel, variables de entorno de despliegue | `docs/deployment.md` |
| Componentes, páginas, estilos, directivas | `docs/ui.md` |
| Carpetas, layouts, middleware, flujo general | `docs/architecture.md` |
| Dependencias, scripts, variables de entorno | `docs/project.md` |
| Decisiones técnicas | `docs/decisions.md` |
| Estado de tareas | `docs/roadmap.md` |

## Pasos

1. Identificar el área afectada.
2. Leer solo ese documento.
3. Actualizar únicamente las secciones que cambiaron. No reescribir el documento completo.
4. No documentar secretos ni valores de variables de entorno, solo sus nombres.
5. Si la decisión es nueva, agregarla a `docs/decisions.md`.
