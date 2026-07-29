# UI

> Componentes de interfaz de usuario del proyecto tdmx-astro.

## Resumen

El proyecto utiliza dos tipos de componentes: `.astro` para markup SSR y React (`.tsx`/`.jsx`) para interactividad client-side. Los estilos son exclusivamente Tailwind CSS v4 con clases utilitarias. Animaciones con GSAP.

---

## Componentes Astro (SSR)

Renderizados en servidor. Sin estado cliente.

| Componente | Ruta | Propósito |
|---|---|---|
| `Header.astro` | `components/layout/Header.astro` | Nav principal con logo, contacto, menú sticky, submenú horizontal |
| `Footer.astro` | `components/layout/Footer.astro` | Footer con SECTUR, SAT, redes sociales, términos, badge de desarrollo |
| `Content.astro` | `components/layout/Content.astro` | Wrapper simple con `<slot/>` |
| `Banner.astro` | `components/ui/Banner.astro` | Banner promocional con imagen y enlace |
| `Button.astro` | `components/ui/Button.astro` | Botón reutilizable |
| `Grid.astro` | `components/ui/Grid.astro` | Grid responsive con título opcional |
| `IconSocial.astro` | `components/ui/IconSocial.astro` | Icono de red social |
| `MenuBar.astro` | `components/ui/MenuBar.astro` | Barra de contacto con icono, título, subtítulo |
| `SubMenu.astro` | `components/ui/SubMenu.astro` | Item de navegación con icono Material |
| `FooterBanner.astro` | `components/ui/FooterBanner.astro` | Banner promocional pre-footer |
| `HeroBanner.astro` | `components/ui/single/HeroBanner.astro` | Banner de cabecera para páginas de listing |
| `HeroBannerOutBounds.astro` | `components/ui/single/HeroBannerOutBounds.astro` | Hero banner extendido |
| `Card.astro` | `components/ui/single/Card.astro` | Tarjeta reutilizable para hoteles/tours |
| `Gallery.astro` | `components/ui/hotel/Gallery.astro` | Galería de imágenes con LightGallery |
| `MemberCard.astro` | `components/ui/team/MemberCard.astro` | Tarjeta de miembro del equipo |
| `MemberSkeleton.astro` | `components/ui/team/MemberSkeleton.astro` | Skeleton loading para miembros |
| `AppDownload.astro` | `components/ui/home/AppDownload.astro` | Sección de descarga de app |
| `YouTubeCTA.astro` | `components/ui/home/YouTubeCTA.astro` | CTA de YouTube |
| `DigitalChannels.astro` | `components/ui/home/DigitalChannels.astro` | Canales digitales |
| `RecomendacionesBanner.astro` | `components/ui/home/RecomendacionesBanner.astro` | Banner de recomendaciones |
| `Welcome.astro` | `components/Welcome.astro` | Composición de homepage (hero slider + grid + modales) |

---

## Componentes React (client islands)

### Homepage

| Componente | Directiva | Propósito |
|---|---|---|
| `EventsHeroSlider.jsx` | `client:only` | Slider principal con GSAP, 2 slides corporativos |
| `HotSalePromoRibbon.jsx` | (no determinada) | Cinta promocional Hot Sale |
| `WorldCupPromoRibbon.jsx` | (no determinada) | Cinta promocional Mundial 2026 |
| `WorldCupCelebration.jsx` | (no determinada) | Sección celebración mundial |
| `MatchPoll.jsx` | (no determinada) | Encuesta en tiempo real (Firestore onSnapshot) |
| `WelcomeModal.tsx` | `client:only` | Modal de estado de pago (check vía query param `id`) |
| `RecentlyViewed.jsx` | `client:only` | Tarjetas de últimos visitados (localStorage) |
| `PromoLocker.jsx` | `client:only` | Locker promocional (actualmente comentado) |

### Hoteles

| Componente | Directiva | Propósito |
|---|---|---|
| `HotelTabs.tsx` | `client:load` | Tabs de descripción/amenidades/ubicación con Google Maps iframe |
| `BookingCalendar.tsx` | `client:visible` | Calendario de reserva con formulario y envío WhatsApp |

### Tours

| Componente | Directiva | Propósito |
|---|---|---|
| `BookingCalendar.tsx` | `client:visible` | Mismo componente, usado con `isSingleDate=true` |

### Timeline / Mapas

| Componente | Directiva | Propósito |
|---|---|---|
| `Timeline.tsx` | (no determinada) | Línea de tiempo |
| `TimelineItem.tsx` | (no determinada) | Item de línea de tiempo |
| `MexicoMap.tsx` | (no determinada) | Mapa de México interactivo |

### Recomendaciones

| Componente | Directiva | Propósito |
|---|---|---|
| `FacebookReel.jsx` | (no determinada) | Reel embebido de Facebook |

### Pagos

| Componente | Directiva | Propósito |
|---|---|---|
| `PaymentMethods.jsx` | `client:only` | Grid de métodos con modales dinámicos y animación GSAP |
| `CreditCardDrawer.jsx` | — | Formulario tarjeta crédito/débito |
| `StorePaymentForm.jsx` | — | Pago en tiendas de conveniencia |
| `BankTransferForm.jsx` | — | Pago servicios BBVA |
| `DirectTransferForm.jsx` | — | Transferencia interbancaria SPEI |
| `CounterPaymentForm.jsx` | — | Pago en ventanilla |
| `OxxoDepositForm.jsx` | — | Depósito OXXO |

### Admin

| Componente | Directiva | Propósito |
|---|---|---|
| `LoginForm.jsx` | `client:only` | Formulario login Firebase |
| `DashboardLayout.jsx` | `client:only` | Layout admin con tabs y auth guard |
| `Sidebar.jsx` | — | Navegación lateral admin |
| `LeadsView.jsx` | — | Últimas cotizaciones (Firestore, limit 5) |
| `TeamView.jsx` | — | CRUD equipo con drag & drop, paginación, búsqueda, selector de fotos |
| `MediaManager.jsx` | — | Explorador Firebase Storage con CRUD de archivos/carpetas |
| `ConfigView.jsx` | — | Configuración global (nombre, logo, WhatsApp, maintenance) |

### Otros

| Componente | Propósito |
|---|---|
| `MinorAges.tsx` | Inputs de edades para menores (usado por BookingCalendar) |

---

## Estilos

- **Framework:** Tailwind CSS v4 (plugin Vite, sin archivo de configuración)
- **Fuente:** Google Fonts Poppins (300, 400, 600, 700, 800)
- **Iconos:** Material Icons Outlined (vía Google Fonts), Lucide React, Astro Icon con sets Iconify
- **CSS global:** `src/assets/styles/global.css` → solo `@import "tailwindcss"`
- **CSS adicional:** Scoped `<style>` blocks en componentes `.astro`
- **Animaciones:** GSAP (`EventsHeroSlider`, `PaymentMethods`), CSS transitions, `@keyframes` en style blocks

---

## Directivas de carga

| Directiva | Uso |
|---|---|
| `client:only="react"` | Componentes que no deben renderizarse en SSR (LoginForm, DashboardLayout, PaymentMethods, WelcomeModal, RecentlyViewed, EventsHeroSlider) |
| `client:load` | HotelTabs (necesario inmediato) |
| `client:visible` | BookingCalendar (carga cuando entra en viewport) |
| `client:idle` | No detectado en uso actual |

---

## Pendiente de documentar

- Props específicas de cada componente (consultar código fuente)
- Estados de carga/error/vacío de cada componente
- Responsive breakpoints utilizados
- Patrón de manejo de errores en componentes React
