# UI

> Componentes de interfaz de usuario del proyecto tdmx-astro.

## Resumen

El proyecto utiliza dos tipos de componentes: `.astro` para markup SSR y React (`.tsx`/`.jsx`) para interactividad client-side. Los estilos son exclusivamente Tailwind CSS v4 con clases utilitarias. Animaciones con GSAP.

---

## Componentes Astro (SSR)

Renderizados en servidor. Sin estado cliente.

| Componente | Ruta | Propósito |
|---|---|---|
| `Header.astro` | `components/layout/Header.astro` | Nav principal con logo de dimensiones reservadas, contacto, menú sticky, submenú horizontal y panel móvil responsive de una columna hasta 399px |
| `Footer.astro` | `components/layout/Footer.astro` | Footer con SECTUR, SAT, redes sociales y términos |
| `Content.astro` | `components/layout/Content.astro` | Wrapper simple con `<slot/>` |
| `Banner.astro` | `components/ui/Banner.astro` | Banner promocional con imagen y enlace |
| `Button.astro` | `components/ui/Button.astro` | Botón reutilizable |
| `Grid.astro` | `components/ui/Grid.astro` | Grid responsive con título opcional |
| `IconSocial.astro` | `components/ui/IconSocial.astro` | Icono de red social |
| `MenuBar.astro` | `components/ui/MenuBar.astro` | Barra de contacto adaptable al ancho disponible con icono, título y subtítulo |
| `SubMenu.astro` | `components/ui/SubMenu.astro` | Item de navegación con icono Material |
| `FooterBanner.astro` | `components/ui/FooterBanner.astro` | Banner promocional pre-footer |
| `HeroBanner.astro` | `components/ui/single/HeroBanner.astro` | Banner de cabecera para páginas de listing |
| `HeroBannerOutBounds.astro` | `components/ui/single/HeroBannerOutBounds.astro` | Hero banner extendido |
| `Card.astro` | `components/ui/single/Card.astro` | Tarjeta reutilizable para hoteles/tours (incluye botón favorito `FavoriteButton.jsx` en zona de imagen) |
| `Gallery.astro` | `components/ui/hotel/Gallery.astro` | Galería de imágenes con LightGallery |
| `MemberCard.astro` | `components/ui/team/MemberCard.astro` | Tarjeta de miembro del equipo |
| `MemberSkeleton.astro` | `components/ui/team/MemberSkeleton.astro` | Skeleton loading para miembros |
| `AppDownload.astro` | `components/ui/home/AppDownload.astro` | Sección de descarga de app |
| `YouTubeCTA.astro` | `components/ui/home/YouTubeCTA.astro` | CTA de YouTube |
| `RecomendacionesBanner.astro` | `components/ui/home/RecomendacionesBanner.astro` | Banner de recomendaciones |
| `Welcome.astro` | `components/Welcome.astro` | Composición de homepage (hero SSR + grid + modales) |

---

## Componentes React (client islands)

### Homepage

| Componente | Directiva | Propósito |
|---|---|---|
| `EventsHero.astro` | — | Shell SSR del hero principal: renderiza la primera diapositiva, imagen LCP y CTA funcional sin JavaScript |
| `EventsHeroControls.jsx` | `client:load` | Controles del hero y transiciones GSAP; actualiza las diapositivas después de la hidratación |
| `HotSalePromoRibbon.jsx` | (no determinada) | Cinta promocional Hot Sale |
| `WorldCupPromoRibbon.jsx` | (no determinada) | Cinta promocional Mundial 2026 |
| `WorldCupCelebration.jsx` | (no determinada) | Sección celebración mundial |
| `MatchPoll.jsx` | (no determinada) | Encuesta en tiempo real (Firestore onSnapshot) |
| `WelcomeModal.tsx` | `client:only` | Modal accesible de estado de pago (check vía query param `id`) |
| `RecentlyViewed.jsx` | `client:only` | Tarjetas de últimos visitados (localStorage) |
| `PromoLocker.jsx` | `client:only` | Locker promocional (actualmente comentado) |

### Favoritos

| Componente | Directiva | Propósito |
|---|---|---|
| `FavoriteButton.jsx` | `client:idle` (desde `Card.astro`, `hotel/[slug].astro` y `tour/[slug].astro`) | Botón corazón para guardar/quitar favoritos (`users/{uid}/favoritos`, ID `${tipo}-${slug}`); sin sesión redirige a `/cliente/login`; estado sincronizado vía `favoritosStore.js` con `useSyncExternalStore` |
| `favoritosStore.js` | — | Store singleton en `src/lib/`: un solo listener Firestore + auth por página, expone subscribe/getClaves/getUser/guardar/quitar |

### Hoteles

| Componente | Directiva | Propósito |
|---|---|---|
| `HotelTabs.tsx` | `client:load` | Tabs de descripción/amenidades/ubicación con Google Maps iframe; recibe `descriptionHtml` saneado en SSR |
| `BookingCalendar.tsx` | `client:only="react"` | Modal accesible responsive de reserva con selector profesional de rango para hoteles (dos meses desktop, uno móvil, preview y mínimo una noche), footer de aplicación y formulario con envío WhatsApp. Usa GSAP, portal al `body` y trap de foco |

### Tours

| Componente | Directiva | Propósito |
|---|---|---|
| `BookingCalendar.tsx` | `client:only="react"` | Mismo modal accesible en modo fecha única (`isSingleDate=true`) para tours; `client:only` evita cargar GSAP durante SSR en Vercel |

### Timeline / Mapas

| Componente | Directiva | Propósito |
|---|---|---|
| `Timeline.tsx` | `client:only="react"` | Controlador de Xolo Ruta: hito activo, resumen, transición GSAP, navegación y sincronización con mapa |
| `TimelineItem.tsx` | — | Card editorial del hito activo con ciudad, fecha, contenido, imagen y navegación anterior/siguiente |
| `TimelineNavigation.tsx` | — | Cronología accesible agrupada por año, con navegación por teclado y scroll horizontal móvil |
| `RouteSummary.tsx` | — | Resumen visual de paradas y periodo de Xolo Ruta |
| `MexicoMap.tsx` | — | Mapa de México interactivo con marcadores, carga, error recuperable y fallback de ciudades |

### Recomendaciones

| Componente | Directiva | Propósito |
|---|---|---|
| `FacebookReel.jsx` | `client:only="react"` | Reel embebido de Facebook con formato vertical máximo de 315x560px y ancho adaptable en móviles |

### Pagos

| Componente | Directiva | Propósito |
|---|---|---|
| `PaymentMethods.jsx` | `client:only` | Métodos de pago agrupados por tipo (pago en línea, banca y efectivo), con tarjeta como opción principal, botones nativos navegables por teclado (Enter/Espacio), diálogo dinámico con trap de foco y animación GSAP; exige sesión y correo verificado solo para tarjeta, tiendas y BBVA; SPEI, ventanilla y OXXO son públicos |
| `CreditCardDrawer.jsx` | — | Formulario tarjeta crédito/débito; envía ID token Firebase e `Idempotency-Key` al crear el cargo |
| `StorePaymentForm.jsx` | — | Pago en tiendas de conveniencia con autenticación e idempotencia; modal de tiendas con scroll exterior responsive basado en `100dvh` |
| `BankTransferForm.jsx` | — | Pago servicios BBVA con autenticación e idempotencia |
| `DirectTransferForm.jsx` | — | Transferencia interbancaria SPEI |
| `CounterPaymentForm.jsx` | — | Pago en ventanilla |
| `OxxoDepositForm.jsx` | — | Depósito OXXO |

### Cliente

| Componente | Directiva | Propósito |
|---|---|---|
| `ClientLoginButton.jsx` | `client:only` | Botón "Área de Clientes" en Header.astro + diálogo accesible de Google sign-in |
| `ClientPanel.jsx` | `client:only` | Layout dashboard cliente (auth guard + topbar + contenido) |
| `ClientTopbar.jsx` | — | Topbar estilo sitio: logo dinámico con dimensiones reservadas (Firestore `config/general.logoUrl`) + "Mis Reservas" (indigo) + "Mis Ofertas" (emerald) + "Mis Pagos" (amber) + "Mis Favoritos" (rose) + "Mi Cuenta" (purple) con dropdown |
| `ClientOfertas.jsx` | — | Tarjetas de promociones en tiempo real (Firestore `ofertas` vía `onSnapshot`, orden por `posicion`): filtra ocultas y vencidas, botón "Reclamar" abre WhatsApp con mensaje prellenado (número de `config/general.whatsappGlobal` con fallback) |
| `ClientPagos.jsx` | — | Abonos de reservas y grupos vinculados: chips mixtos de CT (ámbar) y GB (cian), barra de progreso, tarjetas monetarias responsive de 1/2/3 columnas con formato compacto MXN, lista de abonos con método y referencia, e historial independiente de vouchers Openpay |
| `ClientFavoritos.jsx` | — | Favoritos reales del cliente (Firestore `users/{uid}/favoritos` vía `onSnapshot`, recientes primero): tarjetas con imagen/nombre/destino/badge Hotel-Tour, link al detalle `/{tipo}/{slug}` y eliminar con confirmación |
| `ClientReservas.jsx` | — | Consulta, vincula, elimina reservas (CT) y grupos (GB) CRM con toggle segmentado. Persiste solo el vínculo mínimo; el detalle (reserva / `GrupoDetalle`) y PDF se consultan bajo demanda con autenticación + botón de documentos por tarjeta |
| `DocumentosModal.jsx` | — | Diálogo accesible de documentos de una reserva (CT) o grupo (GB): checklist de tipos solicitados (según Q/NQ) con estados (Pendiente / En revisión / Verificado "Tú" / Rechazado / Agente), lista de documentos con badge de estado + motivo de rechazo (incl. documentos rechazados por el admin) sin botón de vista previa, y formulario de subida (drag&drop, máx 10MB, JPG/PNG/PDF/DOC/DOCX). Consume `/api/crm-documentos` y `/api/crm-documentos-upload` |
| `GrupoDetalle.jsx` | — | Contenido del modal de detalle de grupo: hero con GB y tipo (Q/NQ), timeline, stats, cliente titular, sección de hoteles con pasajeros |
| `LayoutClient.astro` | SSR | Shell layout con Poppins, SEO, Analytics (sin Header.astro) |

### Admin

| Componente | Directiva | Propósito |
|---|---|---|
| `LoginForm.jsx` | `client:only` | Formulario login Firebase |
| `DashboardLayout.jsx` | `client:only` | Layout admin con tabs y auth guard |
| `Sidebar.jsx` | — | Navegación lateral admin |
| `LeadsView.jsx` | — | Últimas cotizaciones (Firestore, limit 5) |
| `TeamView.jsx` | — | CRUD equipo con drag & drop, paginación, búsqueda, selector de fotos |
| `OfertasView.jsx` | — | CRUD de ofertas (Firestore `ofertas` con `onSnapshot`, tiempo real): formulario (título, descripción, descuento, código, color, vigencia opcional, activo), tabla con drag & drop + búsqueda + paginación, toggle visible/oculta y badge "Vencida" |
| `MediaManager.jsx` | — | Explorador Firebase Storage con CRUD de archivos/carpetas |
| `ConfigView.jsx` | — | Configuración global (nombre, logo, WhatsApp, maintenance) |

### Otros

| Componente | Propósito |
|---|---|
| `MinorAges.tsx` | Inputs de edades para menores (usado por BookingCalendar) |

---

## Diálogos accesibles

Los modales críticos reutilizan `src/hooks/useAccessibleDialog.ts`. El patrón aplica `role="dialog"`, `aria-modal="true"`, foco inicial, trap de foco con `Tab`/`Shift+Tab`, cierre con `Escape`, restauración del foco disparador y bloqueo reversible del scroll del `body`. El contenedor del diálogo debe incluir `aria-labelledby` y `tabIndex={-1}`; los botones de cierre deben declarar `type="button"` y una etiqueta accesible cuando solo contienen un icono.

El hook no controla la animación ni el portal: cada componente conserva su comportamiento visual y solo entrega la referencia del contenedor. `BookingCalendar.tsx` usa el mismo patrón junto con GSAP y `createPortal`.

Los formularios deben asociar cada `label` con su control mediante `htmlFor` e `id`. El `placeholder` se utiliza únicamente como ejemplo o ayuda contextual; nunca reemplaza el nombre visible o accesible del campo. Los controles dinámicos, como las edades de `MinorAges.tsx`, deben generar IDs únicos por instancia.

El HTML del catálogo externo se sanea server-side mediante `src/lib/sanitizeHtml.ts` antes de llegar a `HotelTabs` o a cualquier `set:html`. La política usa una allowlist estricta y las metadata/JSON-LD usan texto plano.

## Estilos

- **Framework:** Tailwind CSS v4 (plugin Vite, sin archivo de configuración)
- **Fuente:** Google Fonts Poppins (300, 400, 600, 700, 800)
- **Iconos:** Lucide como biblioteca SVG canónica para controles; `lucide-react` en React y Astro Icon con el set Lucide en Astro. Iconify queda para logotipos de marcas y recursos externos.
- **CSS global:** `src/assets/styles/global.css` → `@import "tailwindcss"` y tokens de marca mediante `@theme`
- **CSS adicional:** Scoped `<style>` blocks en componentes `.astro`
- **Animaciones:** GSAP (`EventsHeroSlider`, `PaymentMethods`), CSS transitions, `@keyframes` en style blocks

Los tokens de marca controlan la paleta primaria, superficies, radios y sombras compartidas. Los emojis se reservan para contenido editorial; los controles y estados de interfaz usan iconos SVG con `aria-hidden` cuando son decorativos.

---

## Directivas de carga

| Directiva | Uso |
|---|---|
| `client:only="react"` | Componentes que no deben renderizarse en SSR (LoginForm, DashboardLayout, PaymentMethods, WelcomeModal, RecentlyViewed, EventsHeroSlider, BookingCalendar) |
| `client:load` | HotelTabs (necesario inmediato) |
| `client:idle` | `FavoriteButton.jsx` dentro de `Card.astro` y botones de favoritos en páginas de detalle |

---

## Estados De Datos

Los componentes que consumen Firestore, Storage o APIs deben distinguir carga, error, vacío y datos disponibles. Las operaciones de usuario agregan estados de progreso, éxito y error sin reemplazar silenciosamente el contenido existente.

- `role="status"` + `aria-live="polite"` para carga, progreso, éxito y estados vacíos dinámicos.
- `role="alert"` + `aria-live="assertive"` para errores de validación, red o permisos.
- Toda consulta recuperable debe ofrecer `Reintentar` y no presentar un estado vacío mientras continúa cargando.
- Los listeners `onSnapshot` deben limpiar su suscripción y volver a suscribirse cuando el usuario solicita un reintento.
- Las acciones de documentos, pagos, reservas y administración deben deshabilitar solo el control afectado durante su progreso.

| Componente | Fuente | Estados cubiertos |
|---|---|---|
| `ClientFavoritos.jsx` | Firestore `users/{uid}/favoritos` | Carga, error con reintento, vacío, eliminación con error |
| `ClientOfertas.jsx` | Firestore `ofertas` + `config/general` | Carga, error con reintento, vacío |
| `ClientPagos.jsx` | Firestore + CRM | Carga de vínculos, historial y pagos; errores con reintento; vacíos por contexto |
| `ClientReservas.jsx` | Firestore + CRM | Carga de vínculos, consulta, detalle, error con reintento y vacío |
| `DocumentosModal.jsx` | CRM documentos | Carga, error con reintento, vacío, subida, éxito y error |
| `LeadsView.jsx` | Firestore `cotizaciones` | Carga, error con reintento y vacío |
| `TeamView.jsx` | Firestore `equipo` + Firebase Storage | Carga, error con reintento, vacío y acciones de edición |
| `OfertasView.jsx` | Firestore `ofertas` | Carga, error con reintento, vacío y acciones de edición |
| `ConfigView.jsx` | Firestore `config/general` + Firebase Storage | Carga, error con reintento, progreso de upload y éxito/error de guardado |
| `MediaManager.jsx` | Firebase Storage | Debe conservar estados de carga, error, vacío y acciones de archivo por operación |
| `BookingCalendar.tsx` | Estado local | Validación inline; edades de menores enteras entre 0 y 17; envío deshabilitado hasta completar datos válidos |
