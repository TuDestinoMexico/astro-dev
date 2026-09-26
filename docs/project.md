# Project

> Resumen ejecutivo del proyecto tdmx-astro.

## Nombre

`tdmx-astro` — Plataforma web de la agencia de viajes **Tu Destino MX**.

## Versión

0.0.1

## Herramientas

- Package manager: Bun 1.4.0
- Lockfile: `bun.lock` (se conserva `package-lock.json` durante la migración)
- Runtime local: Bun
- Runtime SSR en Vercel: Node.js

## Razón social

TU DESTINO MX ROLANDO X MEXICO S.A. de C.V.

## Contacto

- Teléfono: (998) 980 6611
- WhatsApp: 529987141365
- Sitio: https://tudestinomx.com
- Redes: Facebook, Instagram, TikTok, YouTube (@tudestinomexico)

## Propósito

Plataforma conversional con SSR (Astro) para SEO, catálogo de hoteles y tours desde API REST externa, pagos online vía Openpay, panel administrativo con Firebase y contenido promocional animado con GSAP.

---

## Dependencias

### Producción

| Paquete | Versión | Propósito |
|---|---|---|
| astro | ^6.4.2 | Framework core SSR |
| react / react-dom | ^19.2.4 | UI interactiva (islands) |
| @astrojs/react | ^5.0.6 | Integración React en Astro |
| @astrojs/vercel | ^10.0.8 | Adapter Vercel serverless |
| @astrojs/sitemap | ^3.7.3 | Sitemap automático |
| tailwindcss | ^4.1.18 | Estilos utilitarios |
| @tailwindcss/vite | ^4.1.18 | Plugin Vite para Tailwind v4 |
| firebase | ^12.13.0 | Auth, Firestore, Storage |
| gsap / @gsap/react | ^3.14.2 / ^2.1.2 | Animaciones |
| lucide-react | ^1.8.0 | Iconos |
| @react-google-maps/api | ^2.20.8 | Google Maps |
| @vercel/analytics | ^2.0.1 | Analytics Vercel |
| astro-seo | ^1.1.0 | Meta tags SEO |
| astro-lightgallery | ^2.3.0 | Galería de imágenes |
| date-fns | ^4.1.0 | Manipulación de fechas |
| react-day-picker | ^10.0.1 | Selector de fechas y rangos del calendario de reservas |
| @iconify-json/material-symbols | ^1.2.73 | Iconos Material |
| @iconify-json/simple-icons | ^1.2.68 | Iconos redes sociales |
| vue | ^3.5.27 | Residual (no usado en código fuente) |

### Desarrollo

| Paquete | Versión | Propósito |
|---|---|---|
| astro-icon | ^1.1.5 | Componente Icon para Astro |
| @iconify-json/bxl | ^1.2.4 | Iconos Boxicons |
| @iconify-json/fa7-solid | ^1.2.3 | Iconos Font Awesome |
| @iconify-json/lucide | ^1.2.102 | Iconos Lucide |
| @iconify-json/mdi | ^1.2.3 | Iconos Material Design |

---

## Scripts

| Comando | Acción |
|---|---|
| `bun run dev` | Inicia servidor de desarrollo Astro |
| `bun run build` | Compila para producción |
| `bun run preview` | Previsualiza build local cuando el adapter lo permite |
| `bun run astro` | CLI de Astro |

---

## Variables de entorno

| Variable | Ámbito | Propósito |
|---|---|---|
| `PUBLIC_FIREBASE_API_KEY` | Público | Firebase API Key |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | Público | Firebase Auth domain |
| `PUBLIC_FIREBASE_PROJECT_ID` | Público | Firebase Project ID |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | Público | Firebase Storage bucket |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Público | Firebase Sender ID |
| `PUBLIC_FIREBASE_APP_ID` | Público | Firebase App ID |
| `VITE_API_TOKEN` | Público | Token API REST externa |
| `OPENPAY_MERCHANT_ID` | Privado | ID de comercio Openpay |
| `OPENPAY_PRIVATE_KEY` | Privado | Llave privada Openpay (producción) |
| `OPENPAY_API_BASE_URL` | Privado | Base URL de Openpay Sandbox o Production |
| `OPENPAY_MIN_AMOUNT` | Privado | Importe mínimo permitido para cargos |
| `OPENPAY_MAX_AMOUNT` | Privado | Importe máximo permitido para cargos |
| `SITE_URL` | Privado | URL del sitio usada para redirecciones Openpay |
| `OPENPAY_WEBHOOK_TOKEN` | Privado | Token secreto para autenticar webhooks Openpay |
| `VITE_SX_OPENPAY_PRIVATE_KEY` | Público | Llave sandbox Openpay (comentada en API) |
| `API_CRM_URL` | Privado | URL base de la API CRM |
| `API_CRM_TOKEN` | Privado | Token `X-Api-Token` para el CRM |
| `FIREBASE_ADMIN_PROJECT_ID` | Privado | Project ID para Firebase Admin SDK server-side |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Privado | Email de la cuenta de servicio Firebase Admin |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Privado | Llave privada Firebase Admin; nunca se expone al cliente |
| `UPSTASH_REDIS_REST_URL` | Privado | Endpoint Redis para rate limit e idempotencia |
| `UPSTASH_REDIS_REST_TOKEN` | Privado | Token Redis server-side |
| `OPENPAY_RATE_LIMIT_USER_MAX` | Privado | Máximo de cargos por usuario |
| `OPENPAY_RATE_LIMIT_USER_WINDOW_SECONDS` | Privado | Ventana de rate limit por usuario |
| `OPENPAY_RATE_LIMIT_IP_MAX` | Privado | Máximo de cargos por IP |
| `OPENPAY_RATE_LIMIT_IP_WINDOW_SECONDS` | Privado | Ventana de rate limit por IP |
| `OPENPAY_IDEMPOTENCY_TTL_SECONDS` | Privado | TTL de las claves idempotentes |

---

## Testing / Linting

No configurado. No se detectaron archivos de test ni configuraciones de ESLint/Prettier.

---

## Licencia

No especificada (Pendiente de documentar).
