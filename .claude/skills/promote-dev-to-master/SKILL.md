---
name: promote-dev-to-master
description: Analiza qué cambios de dev aún no existen en master en tdmx-astro, los enlista para aprobación y, solo con aprobación explícita, los promueve a master (producción). Usar cuando el usuario pregunte qué falta en master, pida revisar pendientes de promoción, o diga que promueva o mande dev a master.
---

# Promover dev a master

Este skill trabaja sobre el flujo de `release-flow` (`docs/deployment.md`, "Flujo de ramas y promoción"). `master` es producción: nada se publica ahí sin aprobación explícita de la lista exacta.

## Paso 1: revisar el estado

1. Ejecutar `git status --short --branch`. Si hay cambios sin commitear, detenerse y avisar. No cambiar de rama con cambios pendientes.
2. Ejecutar `git fetch origin --prune`.
3. Confirmar que `dev` local coincide con `origin/dev`. Si no coincide, detenerse y avisar: primero hay que llevar `dev` al remoto con el flujo de `release-flow`.
4. Confirmar que `master` no tiene cambios de contenido que `dev` no tenga:

```bash
git log --oneline origin/dev..origin/master
git diff --stat origin/dev origin/master
```

   Los commits que solo existen en `master` suelen ser los merges previos `release: promover dev a produccion`, que no se regresan a `dev`. Es normal. Continuar solo si:
   - Todos los commits solo en `master` son de tipo `release:`, y
   - `git diff --stat origin/dev origin/master` solo muestra archivos que también aparecen en `git diff --stat origin/master origin/dev` (es decir, los mismos pendientes, al revés).

   Si aparece algún cambio de contenido en `master` que no esté en `dev`, detenerse y avisar al usuario antes de cualquier promoción.

## Paso 2: listar los pendientes

Commits que existen en `dev` y no en `master`:

```bash
git log --oneline --no-merges origin/master..origin/dev
git log --oneline --merges origin/master..origin/dev
git diff --stat origin/master origin/dev
```

Presentar al usuario una lista numerada agrupada por funcionalidad:

- Hash corto, tipo de cambio (`feat`, `fix`, `style`, `docs`, `refactor`, `merge`) y descripción en español.
- Archivos afectados, agrupados por área (portada, convenios, hoteles, tours, admin, docs, skills).
- Un resumen de una línea de qué cambia para el visitante, cuando sea visible.
- Si no hay pendientes, decir que `master` ya tiene todo lo de `dev` y terminar.

Señalar cualquier commit que parezca de prueba, un borrador o un cambio que el usuario no haya revisado en el Preview.

## Paso 3: pedir aprobación

Terminar con una sola pregunta que incluya el número de commits pendientes, por ejemplo: "¿Apruebas promover estos N commits de dev a master?". No ejecutar ningún comando de escritura hasta recibir una aprobación explícita de esa lista.

La aprobación debe ser de la lista que se presentó. Un "manda a push", "empuja dev" o "ya lo revisé" no equivalen a aprobar la promoción. Si el usuario aprueba solo algunos commits, no hacer promoción parcial: explicar que requiere una rama experimental nueva con esos cambios y una nueva aprobación.

## Paso 4: promover (solo tras aprobación)

Antes de ejecutar, repetir el conteo del paso 1 para confirmar que la lista no cambió. Si cambió, volver a pedir aprobación.

```bash
git switch master
git pull --ff-only origin master
git merge --no-ff dev -m "release: promover dev a produccion"
git push origin master
git switch dev
```

Después del push, verificar con `git rev-parse --short origin/master` que el remoto apunta al nuevo commit y reportar el hash. Recordar al usuario que el deployment de producción en Vercel debe validarse.

## Reglas

- No hacer push a `dev`, ni crear o borrar ramas `experimental/*` desde este skill.
- No promover sin aprobación explícita de la lista exacta.
- No reescribir `master` ni usar `reset --hard`.
- Si cualquier comando falla, detenerse y reportar la salida completa.
- Al terminar, dejar el repositorio en `dev`.
