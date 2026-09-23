# Proyecto

tdmx-astro — Plataforma web de la agencia de viajes **Tu Destino MX**, basada en Cancún, Quintana Roo.

# Objetivo

Plataforma conversional con catálogo de hoteles y tours, cotizaciones, pagos online (Openpay), panel administrativo y contenido promocional. SSR con Astro para SEO y componentes React interactivos ("islas").

# Stack detectado

- **Runtime:** Bun 1.4.0 para instalación y desarrollo; Node.js en el runtime SSR de Vercel. TypeScript (strict)
- **Framework principal:** Astro v6 (SSR, output: server)
- **UI interactiva:** React 19 (islas con client:*)
- **Estilos:** Tailwind CSS v4 (Vite plugin), Google Fonts Poppins, Material Icons
- **Animaciones:** GSAP + @gsap/react
- **Iconos:** Lucide React, Astro Icon, Iconify
- **Base de datos:** Firebase Firestore (NoSQL)
- **Archivos:** Firebase Storage
- **Auth:** Firebase Auth solo client-side: Google para clientes y email/contraseña para administradores
- **API externa:** https://api.tudestinomx.com (hoteles, tours, destinos)
- **API CRM:** https://xolopi.tudestinomx.com (reservas, pagos)
- **Firestore users/{uid}/reservas:** Reservas vinculadas por clientes (Google Auth)
- **Pagos:** Openpay (tarjetas, OXXO, transferencias, SPEI)
- **Mapas:** @react-google-maps/api
- **SEO:** astro-seo, @astrojs/sitemap, robots.txt dinámico
- **Analytics:** @vercel/analytics
- **Fecha:** date-fns
- **Galería:** astro-lightgallery
- **Despliegue:** Vercel (@astrojs/vercel)
- **Package manager:** Bun 1.4.0 (`bun.lock`, `vercel.json`)
- **Testing:** No configurado
- **Linting/Formato:** No configurado

# Convenciones de código

1. **Componentes `.astro`** → layouts, páginas, shells estáticos. Frontmatter con `interface Props {}`. Template HTML con Tailwind classes. `<style>` scoped para CSS extra.
2. **Componentes React `.tsx` / `.jsx`** → solo para interactividad client-side. Usar `export default function`. Hooks: useState, useEffect, useRef, useMemo.
3. **Nombrado de archivos:** PascalCase para componentes (Header.astro, LoginForm.jsx). kebab-case para páginas (terminos-condiciones.astro).
4. **Nombrado de carpetas:** descriptivo en inglés (layout/, payments/, ui/admin/).
5. **Variables:** camelCase. Props: `interface Props {}`.
6. **Rutas API:** archivos dentro de `src/pages/api/`.
7. **Variables de entorno:** `import.meta.env.PUBLIC_*` para público, `import.meta.env.*` para privado (solo en endpoints server).
8. **Firebase:** instancia única en `src/lib/firebase.js`. Importar con `import { auth, db, storage } from '$lib/firebase'`.
9. **Estilos:** Tailwind utility classes ante todo. NUNCA CSS modules, styled-components ni archivos .css sueltos (excepto global.css).
10. **Data fetching en Astro:** fetch() en frontmatter de páginas. En React: fetch() a rutas API propias o Firebase SDK directo.
11. **Páginas admin:** protegidas client-side con onAuthStateChanged en DashboardLayout.jsx.
12. **ClientReservas.jsx** usa campos reales del CRM mapping (no asumir nombres como `checkIn`, `monto`, `adultos` como array). Revisar `docs/api.md` sección CRM antes de modificar. Consulta CT (`/api/crm-consultar`) y GB (`/api/crm-grupo-consultar`); vincula en `users/{uid}/reservas` y `users/{uid}/grupos`. El detalle de grupo usa `GrupoDetalle.jsx` con `hoteles[]`, `cliente` y `reservation_type`. Cada tarjeta tiene un botón de documentos que abre `DocumentosModal.jsx`.
13. **ClientTopbar.jsx** estructura: los botones con `flex-col items-start justify-between space-y-1.5`. "Mis Reservas" = bg-indigo-600 + LayoutDashboard (hidden mobile, xl:flex). "Mis Ofertas" = bg-emerald-600 + Tag (hidden mobile, xl:flex). "Mis Pagos" = bg-amber-600 + Wallet (hidden mobile, xl:flex). "Mis Favoritos" = bg-rose-600 + Heart (hidden mobile, xl:flex). "Mi Cuenta" = bg-purple-800 + foto usuario + dropdown con Volver al Sitio y Cerrar Sesión. Logo dinámico desde Firestore `config/general.logoUrl` con fallback. Dropdown se cierra con click outside (useRef + mousedown listener). Botones compactos: `p-3`, `min-w-30 xl:min-w-32`.
14. **ClientPagos.jsx** usa los CTs vinculados en `users/{uid}/reservas` y los GBs en `users/{uid}/grupos` (Firestore) y consume `/api/crm-pagos` (proxy a `{API_CRM_URL}/api/pago/{ct}`) o `/api/crm-grupo-pagos` (proxy a `{API_CRM_URL}/api/gb/{gb}/pagos`) según el chip activo. No guarda datos en Firestore.
15. **ClientPanel.jsx** ya no usa ClientSidebar ni hamburger. Layout: `<ClientTopbar>` + contenido. Sin sidebar.
16. **Documentos (clientes):** `DocumentosModal.jsx` consume `/api/crm-documentos` (listar/preview) y `/api/crm-documentos-upload` (multipart), que hacen proxy a `api-crm-tdmx` con `X-Api-Token`. Los tipos permitidos por entidad los define el backend según `reservation_type` (Q/NQ). El cliente puede subir y ver (no eliminar). Los docs subidos por el cliente se marcan `origen=cliente` + `email_cliente` y nacen con `estado=pendiente`; el admin los aprueba o rechaza (con motivo) en la página Documentos de `tdmx_v3` (`POST /api/documentos/{id}/verificar`). Solo los `verificado` cuentan como cargados en el checklist del cliente; los `rechazado` muestran `motivo_rechazo`. Viven en Firebase Storage bucket `tudestinomx` y en la tabla compartida `documentos`. Revisar `docs/api.md` sección "Documentos (CRM)".
17. **Favoritos:** `FavoriteButton.jsx` guarda snapshots de hoteles/tours en `users/{uid}/favoritos` con ID determinista `${tipo}-${slug}`. `favoritosStore.js` mantiene un único listener de Auth/Firestore por página. `ClientFavoritos.jsx` lee y elimina favoritos en tiempo real. Revisar `docs/database.md` y `docs/ui.md`.
18. **Ofertas:** `OfertasView.jsx` administra la colección `ofertas` en tiempo real con orden manual, vigencia y estado activo. `ClientOfertas.jsx` filtra ofertas ocultas/vencidas y permite reclamar por WhatsApp. Revisar `docs/database.md` y `docs/ui.md`.
19. **BookingCalendar:** usa `react-day-picker`, GSAP, `createPortal` y APIs del navegador; debe montarse con `client:only="react"` en hoteles y tours para evitar cargar GSAP durante SSR en Vercel.

# Buenas prácticas

- Preferir `client:visible` o `client:idle` sobre `client:load` para islas React. Usar `client:only="react"` cuando el componente dependa exclusivamente del navegador, portal, GSAP o APIs que no existen durante SSR.
- Toda llamada a Firestore debe manejarse con try/catch. Usar `onSnapshot` con cleanup en useEffect.
- Las rutas API deben validar el método HTTP y responder con `Response` de Astro.
- El middleware solo debe usarse para lógica global (maintenance mode). No poner auth aquí.
- Las imágenes en Firebase Storage se acceden por URL pública (sin token de seguridad).
- Las claves de Openpay viven en .env, NUNCA hardcodeadas.
- Para data recurrente (header, footer, config), usar fetch en frontmatter de layouts.
- Para formularios de pago, mantener la lógica dentro del componente React, llamando a `/api/openpay-*`.
- Para instalación y desarrollo usar `bun install`, `bun run dev` y `bun run build`; Vercel conserva Node como runtime SSR.
- `master` es producción y `dev` es la rama de pruebas; verificar siempre la rama actual con `git branch --show-current` antes de modificar archivos.

# Qué nunca debe hacer un agente

1. **NUNCA** modificar `.env` ni exponer sus valores en código.
2. **NUNCA** hardcodear API keys, tokens o secretos.
3. **NUNCA** instalar dependencias sin verificar package.json primero.
4. **NUNCA** cambiar la configuración de Tailwind v4 (plugin Vite) ni migrar a v3.
5. **NUNCA** eliminar el modo maintenance del middleware sin validación explícita.
6. **NUNCA** agregar un test framework o linter sin instrucción expresa.
7. **NUNCA** crear archivos de documentación fuera de /docs.
8. **NUNCA** cambiar el sistema de autenticación (Firebase Auth client-side) sin consultar.
9. **NUNCA** eliminar Vue de dependencias (es residual, pero no se debe modificar sin orden).
10. **NUNCA** renombrar carpetas o archivos sin verificar todas las referencias.
11. **NUNCA** refactorizar componentes funcionales a clases ni viceversa.
12. **NUNCA** hacer commit, push ni deploy sin instrucción explícita.
13. **NUNCA** hacer pruebas directamente en `master` ni hacer merge `dev` → `master` sin autorización explícita y validación previa.

# Flujo recomendado para modificar código

1. Leer el archivo completo antes de editarlo.
2. Identificar si es `.astro` (SSR) o React (client island).
3. Si se agrega funcionalidad que requiere estado en cliente, usar React + hooks locales.
4. Si se requiere acceso a datos persistentes, usar Firestore (admin) o API REST (público).
5. Verificar que las variables de entorno necesarias existen en .env.
6. Si se modifica el layout global, revisar Header.astro y Footer.astro.
7. Probar con `bun run dev`.
8. No ejecutar `bun run build` a menos que se solicite.

# Ubicación de la documentación

Toda la documentación del proyecto vive dentro de /docs. No crear archivos .md ni documentación fuera de esa carpeta.

## Uso de la documentación

Antes de responder o modificar código:

1. Identifica qué área del proyecto está involucrada.
2. Lee únicamente el documento correspondiente dentro de /docs.
3. No cargues documentos que no sean necesarios.
4. Si modificas el proyecto, actualiza únicamente el documento afectado.
5. Mantén AGENTS.md como un archivo breve de reglas; toda la documentación técnica debe permanecer en /docs.

## Estrategia de ramas

- Usar `dev` para cambios, pruebas e integración.
- Promover a `master` únicamente cambios validados y listos para producción.
- Consultar `docs/deployment.md` para el flujo de ramas y la configuración esperada de Vercel.
