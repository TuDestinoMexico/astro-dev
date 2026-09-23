# Deployment

> Despliegue del proyecto tdmx-astro.

## Resumen

El proyecto se despliega en Vercel usando el adapter oficial `@astrojs/vercel`. Bun 1.4.0 se usa para instalar dependencias y ejecutar el build; el runtime SSR de las funciones de Vercel continúa siendo Node.js.

---

## Estrategia de ramas

El repositorio mantiene dos ramas principales con responsabilidades distintas:

| Rama | Propósito | Deployment esperado |
|---|---|---|
| `master` | Producción. Solo debe contener cambios validados y listos para usuarios finales. | Production Deployment de Vercel |
| `dev` | Pruebas e integración. Es la rama de trabajo para validar cambios antes de producción. | Preview Deployment de Vercel |

### Flujo recomendado

1. Confirmar la rama actual con `git branch --show-current` y el estado con `git status`.
2. Trabajar y probar los cambios en `dev`.
3. Validar la aplicación en el Preview Deployment asociado a `dev`.
4. Promover los cambios de `dev` a `master` mediante Pull Request o merge explícito y revisado.
5. Confirmar el Production Deployment de Vercel después de la promoción.

No se deben probar cambios directamente en `master`, hacer merge de `dev` hacia `master` automáticamente ni asumir que un Preview Deployment es producción.

### Protección recomendada

La configuración externa debe reforzar esta política:

- GitHub: proteger `master` y requerir Pull Request para incorporar cambios.
- Vercel: configurar `master` como Production Branch y `dev` como rama de Preview.
- Vercel: mantener variables de entorno separadas entre Production y Preview.
- Revisar manualmente la rama de destino antes de cualquier merge, push o deploy.

Estas protecciones no se configuran desde este repositorio; deben verificarse en GitHub y en el dashboard de Vercel.

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

---

## Sitemap y SEO

- `@astrojs/sitemap` genera `sitemap-index.xml` automáticamente
- `site: 'https://tudestinomx.com'` configurado en `astro.config.mjs`
- `robots.txt` dinámico via endpoint server

---

## CI/CD

No hay archivos en `.github/` ni configuración de pipelines. Vercel genera deployments automáticos desde las ramas conectadas al proyecto; los Preview Deployments se usan para validar cambios antes de producción.

---

## Pendiente de documentar

- Estrategia de caché y CDN
- Monitoreo y alertas
- Rollback strategy
- Dominios y DNS
- HTTPS/SSL configuration
