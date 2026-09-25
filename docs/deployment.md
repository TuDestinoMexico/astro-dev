# Deployment

> Despliegue del proyecto tdmx-astro.

## Resumen

El proyecto se despliega en Vercel usando el adapter oficial `@astrojs/vercel`. Bun 1.4.0 se usa para instalar dependencias y ejecutar el build; el runtime SSR de las funciones de Vercel continúa siendo Node.js.

---

## Plataforma

**Vercel** — Plataforma principal de despliegue.

### Adapter

`@astrojs/vercel` v10.0.8

Configuración en `astro.config.mjs`:

```js
import vercel from "@astrojs/vercel";
adapter: vercel()
```

### Analytics

`@vercel/analytics` v2.0.1 — Integrado via componente `<Analytics/>` en ambos layouts.

### Configuración de Vercel

`vercel.json` fija la versión de Bun usada por Vercel:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "bunVersion": "1.4.0"
}
```

Configuración del proyecto en el dashboard de Vercel:

| Configuración | Valor |
|---|---|
| Install Command | `bun install --frozen-lockfile` |
| Build Command | `bun run build` |
| Framework Preset | Astro |
| Runtime SSR | Node.js mediante `@astrojs/vercel` |

---

## Build

### Scripts

| Comando | Descripción |
|---|---|
| `bun run build` | Compila proyecto con `astro build` |
| `bun run dev` | Servidor de desarrollo |
| `bun run preview` | No soportado por `@astrojs/vercel`; usar Preview Deployment o `vercel dev` |

### Output

`output: 'server'` — Funciones serverless de Vercel. Sin SSG.

### Compresión

`compressHTML: true` activado en `astro.config.mjs`.

---

## Variables de entorno requeridas

Todas las variables deben configurarse en el dashboard de Vercel. No hay archivo `.env.production` en el repositorio (verificado).

| Variable | Ámbito | Requerida para |
|---|---|---|
| `PUBLIC_FIREBASE_API_KEY` | Público | Firebase Auth, Firestore, Storage |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | Público | Firebase Auth |
| `PUBLIC_FIREBASE_PROJECT_ID` | Público | Firebase |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | Público | Firebase Storage |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Público | Firebase |
| `PUBLIC_FIREBASE_APP_ID` | Público | Firebase |
| `VITE_API_TOKEN` | Público | API REST externa |
| `OPENPAY_MERCHANT_ID` | Privado | Endpoints Openpay |
| `OPENPAY_PRIVATE_KEY` | Privado | Endpoints Openpay |
| `API_CRM_URL` | Privado | Proxies de reservas, grupos, pagos y documentos |
| `API_CRM_TOKEN` | Privado | Header `X-Api-Token` del CRM |

### Reglas de Firebase

Las reglas se mantienen en `firestore.rules` y `storage.rules`, referenciadas desde `firebase.json`. Para desplegarlas contra un proyecto seleccionado explícitamente:

```bash
firebase deploy --project PROJECT_ID --only firestore:rules,storage
```

Antes de desplegar, verificar en el proyecto de prueba que una cuenta con `admin: true` puede operar el panel y que una cuenta de cliente no puede leer ni modificar las colecciones administrativas.

---

## Sitemap y SEO

- `@astrojs/sitemap` genera `sitemap-index.xml` automáticamente
- `site: 'https://tudestinomx.com'` configurado en `astro.config.mjs`
- `robots.txt` dinámico via endpoint server

---

## Flujo de ramas y promoción

El proyecto utiliza un flujo de ramas por ambientes con Preview Deployments:

| Rama | Propósito | Despliegue esperado |
|---|---|---|
| `experimental/<alcance>` | Desarrollo aislado local de una funcionalidad o corrección | No se publica ni genera Preview |
| `dev` | Integración y validación | Preview Deployment de Vercel |
| `master` | Producción | Production Deployment de Vercel |

### Flujo estándar

1. Verificar el estado antes de comenzar:

```bash
git status --short --branch
git switch dev
git pull --ff-only origin dev
```

2. Crear la rama experimental:

```bash
git switch -c experimental/ALCANCE
```

Las ramas `experimental/*` son exclusivamente locales. No deben publicarse con `git push`, no deben abrir Pull Requests y no deben configurarse como ramas de Vercel.

3. Implementar, revisar y confirmar los cambios en la rama experimental:

```bash
git status
git diff
git add ARCHIVOS_DEL_CAMBIO
git diff --cached
git commit -m "tipo: descripcion del cambio"
```

4. Integrar en `dev` y activar el Preview de Vercel:

```bash
git switch dev
git pull --ff-only origin dev
git merge --no-ff experimental/ALCANCE -m "merge: integrar ALCANCE en dev"
git push origin dev
```

5. Eliminar la rama experimental local después de confirmar que la integración y el push a `dev` fueron correctos:

```bash
git branch -d experimental/ALCANCE
```

No se debe ejecutar `git push origin experimental/ALCANCE`. Si la rama se abandona antes de integrarse, eliminarla con:

```bash
git branch -D experimental/ALCANCE
```

6. Validar el Preview de Vercel antes de promoverlo:

- El deployment y el build terminan correctamente.
- Las variables de entorno del entorno Preview están configuradas.
- El flujo principal modificado funciona en escritorio y móvil.
- La autenticación y autorización se comportan correctamente.
- Firestore y Storage conservan los permisos esperados.
- No hay errores relevantes en los logs del deployment o del navegador.

7. Promover a producción únicamente después de aprobar el Preview:

```bash
git switch master
git pull --ff-only origin master
git merge --no-ff dev -m "release: promover dev a produccion"
git push origin master
```

### Rollback

Si el deployment de producción presenta un problema, detener la promoción y volver a desplegar el último commit estable desde Vercel. Para corregir el historial de ramas, crear una corrección nueva o revertir el merge con `git revert`; no reescribir historial compartido.

### Archivos locales de Firebase

`firestore.rules`, `storage.rules` y `firebase.json` se mantienen localmente y están excluidos por `.gitignore`. No forman parte del Preview de Vercel ni del repositorio. Las reglas de Firebase deben aplicarse manualmente desde un entorno local autorizado y verificarse por separado del despliegue de Astro.

### Indicador de entorno del footer

La insignia `Entorno: Desarrollo` en `Footer.astro` se controla con las variables de entorno de Vercel:

- Desarrollo local (`import.meta.env.DEV`): visible.
- Preview generado desde la rama `dev` (`VERCEL_ENV=preview` y `VERCEL_GIT_COMMIT_REF=dev`): visible.
- Preview de otra rama: oculta.
- Production de `master` (`VERCEL_ENV=production`): oculta.

No se debe reemplazar esta condición por texto hardcodeado ni por una comprobación exclusiva de `import.meta.env.PROD`, porque los Preview Deployments también se construyen en modo producción.

## CI/CD

No hay archivos en `.github/` ni configuración de pipelines. Vercel genera deployments automáticos desde las ramas conectadas al proyecto: `dev` se usa para Preview y `master` para producción.

---

## Pendiente de documentar

- Estrategia de caché y CDN
- Monitoreo y alertas
- Rollback strategy
- Dominios y DNS
- HTTPS/SSL configuration
