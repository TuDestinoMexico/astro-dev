---
name: release-flow
description: Flujo de ramas y promoción de tdmx-astro (experimental/* → dev → master). Usar cuando se hable de ramas, commits, merge, deploy, Preview, promoción a producción o rollback.
---

# Flujo de ramas y promoción

Fuente completa: `docs/deployment.md`, sección "Flujo de ramas y promoción". Este skill resume las reglas obligatorias.

## Reglas

- Trabajo funcional: crear `experimental/<alcance>` desde `dev`. Estas ramas son solo locales.
- Nunca hacer `git push` de `experimental/*` ni abrir Pull Requests desde ellas.
- Integrar en `dev` con `git merge --no-ff`. Solo el push a `dev` activa el Preview de Vercel.
- Eliminar la rama experimental con `git branch -d` tras integrar y publicar `dev`. Si se abandona, usar `git branch -D`.
- Antes de cualquier promoción a `master`, validar el Preview.
- Nunca hacer push directo a `master` ni promover sin aprobación explícita del usuario.
- Rollback: preferir el rollback de Vercel o `git revert`. No usar `reset --hard` ni reescribir `master`.
- Antes de cambiar de rama, revisar `git status` y la rama actual.
- `firestore.rules`, `storage.rules` y `firebase.json` son locales e ignorados; no agregarlos.
- El indicador `Entorno: Desarrollo` del Footer solo se muestra en local o en el Preview de `dev`, nunca en Production de `master`.

## Recordatorio

Este skill no autoriza commits, push ni merges. Esas acciones requieren instrucción explícita del usuario.
