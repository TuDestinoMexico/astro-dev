---
name: release-flow
description: Flujo de ramas y promoción de tdmx-astro (experimental/* → dev → master). Usar cuando se cree un plan de cambios, al aprobar cambios, al hacer merge, push, Preview, promoción a producción o rollback.
---

# Flujo de ramas y promoción

Fuente completa: `docs/deployment.md`, sección "Flujo de ramas y promoción". Este skill resume el flujo acordado con el usuario.

## Flujo acordado

1. **Al crear un plan** de cambios funcionales: crear la rama `experimental/<alcance>` desde `dev` (comprobar antes `git status` y la rama actual). Todo el trabajo del plan va en esa rama.
2. **Trabajar y confirmar** en la rama experimental. Los commits solo se hacen si el usuario lo pide o lo aprueba en el plan.
3. **Al aprobar los cambios** el usuario autoriza, en ese mismo acto, integrarlos en `dev` y hacer push de `dev`. No hace falta una confirmación extra para esos pasos:
   - `git switch dev` y `git pull --ff-only origin dev`
   - `git merge --no-ff experimental/<alcance>`
   - `git push origin dev` (esto activa el Preview de Vercel)
   - `git branch -d experimental/<alcance>`. El borrado va **después** del merge y el push, porque `-d` rechaza borrar una rama que no esté fusionada y borrarla antes perdería el trabajo.
4. **Esperar al usuario.** Tras el push, el usuario revisa los cambios en el sitio de `dev`. No se propone ni se ejecuta nada sobre `master` hasta que él lo pida.
5. **Promover a `master` solo con instrucción explícita** del usuario, después de que revise `dev`. Entonces: `git switch master`, `git pull --ff-only origin master`, `git merge --no-ff dev -m "release: promover dev a produccion"`, `git push origin master`.

## Reglas

- Las ramas `experimental/*` son solo locales. Nunca hacer `git push` de ellas ni abrir Pull Requests desde ellas.
- Integrar en `dev` con `git merge --no-ff`. Solo el push a `dev` activa el Preview de Vercel.
- Si un plan se abandona antes de integrarse, borrar la rama con `git branch -D experimental/<alcance>`, y avisar al usuario antes de hacerlo.
- Nunca hacer push directo a `master` ni promover sin instrucción explícita del usuario. Un "manda a push" o "empuja los cambios de dev" no autoriza promover a `master`.
- Rollback: preferir el rollback de Vercel o `git revert`. No usar `reset --hard` ni reescribir `master`.
- Antes de cambiar de rama, revisar `git status` y la rama actual.
- `firestore.rules`, `storage.rules` y `firebase.json` son locales e ignorados; no agregarlos.
- El indicador `Entorno: Desarrollo` del Footer solo se muestra en local o en el Preview de `dev`, nunca en Production de `master`.

## Recordatorio

La autorización de integrar y hacer push a `dev` cubre solo los cambios que el usuario aprobó en la rama experimental. Cualquier otro commit, push o merge requiere su instrucción explícita.
