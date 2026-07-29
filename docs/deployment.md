# Deployment

> Despliegue del proyecto tdmx-astro.

## Resumen

El proyecto se despliega en Vercel usando el adapter oficial `@astrojs/vercel`. No se detectaron archivos de configuración de CI/CD, Docker u otras plataformas.

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

---

## Build

### Scripts

| Comando | Descripción |
|---|---|
| `npm run build` | Compila proyecto con `astro build` |
| `npm run dev` | Servidor de desarrollo |
| `npm run preview` | Previsualiza build local |

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

---

## Sitemap y SEO

- `@astrojs/sitemap` genera `sitemap-index.xml` automáticamente
- `site: 'https://tudestinomx.com'` configurado en `astro.config.mjs`
- `robots.txt` dinámico via endpoint server

---

## CI/CD

No detectado. No hay archivos en `.github/` ni configuración de pipelines.

---

## Pendiente de documentar

- Configuración específica de Vercel (regiones, funciones serverless, etc.)
- Estrategia de caché y CDN
- Monitoreo y alertas
- Rollback strategy
- Dominios y DNS
- HTTPS/SSL configuration
