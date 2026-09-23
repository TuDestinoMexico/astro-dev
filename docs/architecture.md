# Architecture

> Arquitectura general del proyecto tdmx-astro.

## Resumen

Aplicación web SSR con Astro v6, utilizando React para componentes interactivos ("islands") y Firebase como backend de datos. El renderizado es server-side con `output: 'server'` y se despliega en Vercel como funciones serverless. Bun 1.4.0 gestiona la instalación y el build; Node.js permanece como runtime SSR de Vercel.

---

## Diagrama de flujo

```
Cliente (Browser)
    │
    ├── Astro SSR ──────────── API REST externa (hoteles, tours)
    │       │                     https://api.tudestinomx.com
    │       │
    │       ├── Páginas .astro (SSR)
    │       ├── Layouts (Layout.astro, LayoutAdmin.astro)
    │       └── Componentes .astro (Header, Footer, etc.)
    │
    ├── React Islands ──────── Firebase (Auth, Firestore, Storage)
    │       │
│       ├── Admin (DashboardLayout, LoginForm, OfertasView, etc.)
    │       ├── Payments (PaymentMethods, CreditCardDrawer, etc.)
│       └── UI (EventsHeroSlider, BookingCalendar, FavoriteButton, etc.)
    │
    ├── API Routes ─────────── Openpay/CRM APIs (proxies server-side)
    │       /api/openpay-cargo
    │       /api/openpay-check
    │
    └── Middleware ──────────── Firestore (modo mantenimiento)
            src/middleware.js
```

---

## Patrón de renderizado

- **SSR (`output: 'server'`):** todas las páginas se renderizan en el servidor.
- **React islands:** componentes con directivas `client:only`, `client:load`, `client:visible` para interactividad. `BookingCalendar` usa `client:only="react"` porque depende de GSAP, `createPortal` y APIs del navegador.
- **No hay SSG** (no se prerenderizan páginas estáticamente).

---

## Estructura de carpetas

```
src/
├── assets/styles/global.css   # @import "tailwindcss"
├── components/
│   ├── layout/                # Header.astro, Footer.astro, Content.astro
│   ├── modal/                 # WelcomeModal.tsx
│   ├── payments/              # PaymentMethods.jsx, type/*.jsx
│   └── ui/
│       ├── admin/             # DashboardLayout, LoginForm, Sidebar, etc.
│       ├── client/            # ClientPanel, ClientTopbar, ClientReservas
│       ├── home/              # EventsHeroSlider, MatchPoll, Promo ribbons
│       ├── hotel/             # Gallery.astro, HotelTabs.tsx
│       ├── recomendacion/     # FacebookReel.jsx
│       ├── single/            # Card.astro, HeroBanner.astro
│       ├── team/              # MemberCard.astro, MemberSkeleton.astro
│       ├── timeline/          # MexicoMap.tsx, Timeline.tsx, TimelineItem.tsx
│       ├── Banner.astro, BookingCalendar.tsx, Button.astro, etc.
├── layouts/
│   ├── Layout.astro           # Layout público (Poppins, Analytics, SEO)
│   ├── LayoutAdmin.astro      # Layout admin (mismo base que público)
│   └── LayoutClient.astro     # Layout cliente (sin Header.astro, Poppins + SEO)
├── lib/
│   └── firebase.js            # Singleton Firebase (Auth, Firestore, Storage)
├── vercel.json                 # Versión Bun usada por Vercel
├── bun.lock                    # Lockfile de Bun
├── middleware.js               # Maintenance mode (cada 30s cache)
└── pages/
    ├── api/
    │   ├── openpay-cargo.ts   # POST - crear cargo
    │   ├── openpay-check.ts   # GET - verificar transacción
    │   ├── crm-consultar.ts   # POST - proxy a CRM de reservas (CT)
    │   ├── crm-pagos.ts       # POST - proxy a CRM de pagos (GET /api/pago/{ct})
    │   ├── crm-grupo-consultar.ts # POST - proxy a CRM de grupos (GB)
    │   ├── crm-grupo-pagos.ts # POST - proxy a CRM de pagos de grupo (GET /api/gb/{gb}/pagos)
    │   ├── crm-documentos.ts  # POST - proxy a CRM de documentos (listar / preview)
    │   └── crm-documentos-upload.ts # POST - proxy a CRM de documentos (subida multipart)
    ├── cliente/
    │   ├── login.astro        # Login cliente (isla ClientLoginButton)
    │   └── dashboard.astro    # Dashboard cliente (isla ClientPanel)
    ├── admin/
    │   ├── dashboard.astro    # Panel admin (client:only react)
    │   └── login.astro        # Login admin (client:only react)
    ├── hotel/[slug].astro     # Detalle de hotel (SSR + API externa)
    ├── tour/[slug].astro      # Detalle de tour (SSR + API externa)
    ├── index.astro            # Homepage
    ├── hoteles.astro          # Listado hoteles
    ├── tours.astro            # Listado tours
    ├── destinos.astro         # Página destinos
    ├── convenios.astro        # Convenios corporativos
    ├── nosotros.astro         # Quiénes somos / equipo
    ├── pagos.astro            # Métodos de pago Openpay
    ├── recomendaciones.astro  # Recomendaciones
    ├── xolo-ruta.astro        # XoloRuta
    ├── mantenimiento.astro    # Página 503 mantenimiento
    ├── terminos-condiciones.astro
    ├── privacidad.astro
    ├── robots.txt.ts          # Robots dinámico
    └── 404.astro
```

---

## Módulos principales

### Layouts
- `Layout.astro` — Base pública con Google Fonts (Poppins), Material Icons, Vercel Analytics, SEO component, favicon desde Firebase Storage.
- `LayoutAdmin.astro` — Misma base que Layout.astro, usada para páginas admin.

### Middleware
- `src/middleware.js` — Lee `config/general.modoMantenimiento` de Firestore con caché de 30s. Si está activo, redirige todo el tráfico (excepto `/admin`) a `/mantenimiento` (HTTP 503).

### Firebase Singleton
- `src/lib/firebase.js` — Inicializa Firebase con `experimentalForceLongPolling: true` para compatibilidad Node.js. Exporta `auth`, `db` y `storage`.

### API Routes
- `/api/openpay-cargo` — Proxy POST a Openpay API (crear cargo). Usa `OPENPAY_MERCHANT_ID` y `OPENPAY_PRIVATE_KEY` del servidor.
- `/api/openpay-check` — Proxy GET a Openpay API (verificar transacción por `id`).

---

## Flujo de datos

### Hoteles / Tours (público)
1. Página Astro (`hoteles.astro`, `hotel/[slug].astro`) hace fetch SSR a API externa.
2. Renderiza HTML con datos. React islands agregan interactividad (BookingCalendar, HotelTabs).

### Admin (Firebase directo)
1. Componentes React (`LeadsView`, `TeamView`, `ConfigView`, `MediaManager`) usan Firebase SDK directo.
2. Autenticación client-side via `onAuthStateChanged`.

### Pagos (Openpay)
1. Componente React (`PaymentMethods`) muestra opciones de pago.
2. Formularios específicos (`CreditCardDrawer`, etc.) envían datos a `/api/openpay-cargo`.
3. Modal `WelcomeModal` en homepage verifica estado vía `/api/openpay-check?id=...`.
