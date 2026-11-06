# UI

> Componentes de interfaz de usuario del proyecto tdmx-astro.

## Resumen

El proyecto utiliza dos tipos de componentes: `.astro` para markup SSR y React (`.tsx`/`.jsx`) para interactividad client-side. Los estilos son exclusivamente Tailwind CSS v4 con clases utilitarias. Animaciones con GSAP.

---

## Componentes Astro (SSR)

Renderizados en servidor. Sin estado cliente.

| Componente | Ruta | Propósito |
|---|---|---|
| `Header.astro` | `components/layout/Header.astro` | Escritorio (≥1280 px): barra de 80 px con logo, navegación principal con ícono (Hoteles, Tours, Destinos) y a la derecha "Pagar en línea", "Cotizar" por WhatsApp, menú hamburguesa (Convenios, Quiénes somos, Reseñas y Llamar a ventas) y botón de cuenta redondo. Móvil y tablet: barra superior con Pagar, WhatsApp y menú (Destinos, Convenios, Quiénes somos, Reseñas y teléfono), más una barra inferior fija con Inicio, Hoteles, Cotizar (WhatsApp), Tours y Cuenta. Sin header pegajoso. Los menús se animan con opacidad y desplazamiento de 200 ms; con movimiento reducido no animan. Los paneles cerrados son `inert` y no reciben foco. El botón de cuenta tiene contenedor de tamaño fijo para evitar saltos al hidratar. `body` recibe padding inferior en pantallas menores de 1280 px para no tapar contenido |
| `Footer.astro` | `components/layout/Footer.astro` | Footer en cuatro bloques: verificación (SECTUR y SAT) arriba, contacto con teléfono y WhatsApp, horarios en hora de Cancún, empresa y redes; texto legal al final. En móvil, Empresa y Síguenos se pliegan con `details` y un script los abre en escritorio. Encabezados reales en cada bloque, foco visible en todos los controles y aviso de copiado para lectores de pantalla (`role="status"`). Insignia de desarrollo sin cambios |
| `tu-destino-mexico-es-confiable.astro` | `pages/tu-destino-mexico-es-confiable.astro` | Página pública de identidad empresarial y orientación para verificar datos antes de reservar; usa la imagen cuadrada de la marca como vista previa social |
| `Content.astro` | `components/layout/Content.astro` | Wrapper simple con `<slot/>` |
| `Banner.astro` | `components/ui/Banner.astro` | Banner promocional con imagen y enlace |
| `Button.astro` | `components/ui/Button.astro` | Botón reutilizable |
| `Grid.astro` | `components/ui/Grid.astro` | Grid responsive con título opcional |
| `IconSocial.astro` | `components/ui/IconSocial.astro` | Icono de red social |
| `MenuBar.astro` | `components/ui/MenuBar.astro` | Barra de contacto adaptable al ancho disponible con icono, título y subtítulo |
| `SubMenu.astro` | `components/ui/SubMenu.astro` | Item de navegación con icono Material |
| `HeroBanner.astro` | `components/ui/single/HeroBanner.astro` | Banner de cabecera para páginas de listing |
| `HeroBannerOutBounds.astro` | `components/ui/single/HeroBannerOutBounds.astro` | Hero banner extendido |
| `Card.astro` | `components/ui/single/Card.astro` | Tarjeta reutilizable para hoteles/tours (incluye botón favorito `FavoriteButton.jsx` en zona de imagen) |
| `Gallery.jsx` | `components/ui/hotel/Gallery.jsx` | Mosaico SSR de portada y tarjetas por categoría que abren el visor modal filtrado; diseño adaptable a iPhone/iPad con áreas seguras, altura dinámica, controles táctiles de 44 px y navegación por swipe/teclado |
| `MemberCard.astro` | `components/ui/team/MemberCard.astro` | Tarjeta editorial de miembro del equipo con foto, rol y tratamiento de Vacation Planner |
| `MemberSkeleton.astro` | `components/ui/team/MemberSkeleton.astro` | Skeleton loading para miembros |
| `AppDownload.astro` | `components/ui/home/AppDownload.astro` | Sección de descarga de app |
| `TikTokCTA.astro` | `components/ui/home/TikTokCTA.astro` | CTA visual para promocionar `@tudestinomexico` en TikTok con tarjeta vertical tipo video corto |
| `FeaturedHotels.astro` | `components/ui/home/FeaturedHotels.astro` | Server island del catálogo destacado; carga tras el HTML crítico con fallback SSR estable |
| `RecomendacionesBanner.astro` | `components/ui/home/RecomendacionesBanner.astro` | Banner de recomendaciones |
| `Welcome.astro` | `components/Welcome.astro` | Composición de homepage (hero SSR, server island de hoteles y modales) |

---

## Componentes React (client islands)

### Homepage

| Componente | Directiva | Propósito |
|---|---|---|
| `HomeBanner.astro` | — | Banner a ancho completo con imagen de escritorio y de móvil (`<picture>`). El texto va dentro de la imagen; el banner completo es un enlace si hay URL. El buscador se monta encima de su borde inferior. Sin banner activo muestra solo el buscador |
| `HomeSearch.tsx` | `client:load` | Buscador de hoteles o tours: pestañas Hotel/Tour, destino, fechas (entrada y salida para hotel, una para tour) con `SearchDatePicker` y viajeros. Viajeros abre un `<dialog>` modal con contadores de adultos y menores, y selector de edad por menor. Envía a `/hoteles` o `/tours` con parámetros en la URL, sin datos personales. El campo destino muestra sugerencias del catálogo mientras se escribe (combobox con teclado, desde 2 caracteres, con espera de 250 ms); al elegir una, guarda su nombre en el campo sin navegar; la búsqueda se envía con el botón |
| `/api/catalogo-buscar` | — | Endpoint GET de solo lectura para las sugerencias (`tipo=hotel|tour`, `q`). Devuelve hasta 8 coincidencias y guarda la lista del catálogo 60 s en memoria por instancia |
| `SearchSummary.astro` | — | Resumen de la búsqueda en `/hoteles` y `/tours` (destino, fechas, viajeros y conteo de resultados) Se muestra solo cuando hay filtros |
| `SearchEditor.tsx` | `client:load` | Botón "Cambiar búsqueda" de `/hoteles` y `/tours`. Despliega en el mismo lugar el buscador de la portada (`HomeSearch` con `initial`), ya con la búsqueda actual. La animación es una transición de `grid-template-rows` de 300 ms; con movimiento reducido no anima. El panel cerrado queda `inert` |
| `SearchResultsSkeleton.astro` | `<script>` | Skeleton de tarjetas con íconos de Lucide/Iconify mientras se muestran los resultados de `/hoteles` y `/tours`. Mantiene el skeleton ~1.4 s (0.3 s con movimiento reducido) y luego revela los resultados ya renderizados. Sin JavaScript se muestran directo |
| `SearchLoader` (en `HomeSearch.tsx`) | — | Pantalla de espera al enviar la búsqueda: íconos que cambian cada 1.1 s, con un retardo de 600 ms antes de navegar. Se reinicia al volver con el historial (`pageshow`) |
| `src/lib/searchParams.ts` | — | Valida los parámetros del buscador (`destino`, `entrada`, `salida`, `fecha`, `adultos`, `menores`, `edades`) y filtra por destino sin importar acentos ni mayúsculas. Las fechas de disponibilidad no filtran el catálogo: no hay inventario en Firestore |
| `BookingCalendar.tsx` (`initialSearch`) | `client:only` | Precarga fechas y viajeros desde el buscador en la ficha del hotel, con un aviso para revisarlos antes de enviar la solicitud |
| `EventsHero.astro`, `EventsHeroControls.jsx` | — | Hero de diapositivas anterior. Ya no se importa en la portada; se conservan en el repo |
| `HotSalePromoRibbon.jsx` | (no determinada) | Cinta promocional Hot Sale |
| `WorldCupPromoRibbon.jsx` | (no determinada) | Cinta promocional Mundial 2026 |
| `WorldCupCelebration.jsx` | (no determinada) | Sección celebración mundial |
| `MatchPoll.jsx` | (no determinada) | Encuesta en tiempo real (Firestore onSnapshot) |
| `WelcomeModal.tsx` | `client:only` | Modal accesible de estado de pago (check vía query param `id`), con estados de carga, confirmado, pendiente y error; presenta el comprobante con lenguaje visual de pase de abordar |
| `OfficialAnnouncementModal.jsx` | `client:only` desde `Welcome.astro` | Comunicado oficial público del home, mostrado en cada carga o actualización mientras esté activo |
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
| `HotelTabs.tsx` | `client:load` | Tabs de descripción/amenidades/ubicación; presenta amenidades por categoría con el icono Lucide definido en Firestore y conserva fallback para listas planas |
| `BookingCalendar.tsx` | `client:only="react"` | Modal accesible responsive de reserva con selector profesional de rango para hoteles (dos meses desktop, uno móvil, preview y mínimo una noche), footer de aplicación y formulario con envío WhatsApp. Usa GSAP, portal al `body` y trap de foco |

### Tours

| Componente | Directiva | Propósito |
|---|---|---|
| `TourExperienceDetails.tsx` | SSR | Resumen editorial responsive con duración, categoría, destacados, incluidos y no incluidos; omite campos y secciones sin datos |
| `HotelTabs.tsx` | `client:load` | Reutiliza descripción y ubicación en tours, ocultando la pestaña de amenidades que no aplica; en hoteles conserva descripción/amenidades/ubicación |
| `BookingCalendar.tsx` | `client:only="react"` | Mismo modal accesible en modo fecha única (`isSingleDate=true`) para tours; `client:only` evita cargar GSAP durante SSR en Vercel |

### Recomendaciones

| Componente | Directiva | Propósito |
|---|---|---|
| `FacebookReel.jsx` | `client:only="react"` | Reel embebido de Facebook con formato vertical máximo de 315x560px y ancho adaptable en móviles |
| `FacebookReviewsBanner.astro` | — | Banner responsive clicable a las reseñas de Facebook con imágenes generadas para móvil (1536×1024) y escritorio (2172×724); identifica la marca con el texto «Tu Destino México» |

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
| `ClientLoginButton.jsx` | `client:only` | Botón redondo con ícono de usuario ("Área de clientes") en Header.astro + diálogo accesible de inicio con Google y Facebook |
| `ClientPanel.jsx` | `client:only` | Layout dashboard cliente (auth guard + topbar + contenido) |
| `ClientTopbar.jsx` | — | Topbar estilo sitio: logo dinámico con dimensiones reservadas (Firestore `config/general.logoUrl`) + "Mis Reservas" (indigo) + "Mis Ofertas" (emerald) + "Mis Pagos" (amber) + "Mis Favoritos" (rose) + "Mi Cuenta" (purple) con dropdown |
| `ClientOfertas.jsx` | — | Tarjetas de promociones en tiempo real (Firestore `ofertas` vía `onSnapshot`, orden por `posicion`): filtra ocultas y vencidas, botón "Reclamar" abre WhatsApp con mensaje prellenado (número de `config/general.whatsappGlobal` con fallback) |
| `ClientPagos.jsx` | — | Abonos CRM de reservas y grupos vinculados: chips mixtos de CT (ámbar) y GB (cian), barra de progreso, tarjetas monetarias responsive de 1/2/3 columnas con formato compacto MXN y lista de abonos. Durante mantenimiento oculta esa consulta y muestra un aviso, conservando visible el historial independiente de vouchers Openpay |
| `ClientFavoritos.jsx` | — | Favoritos reales del cliente (Firestore `users/{uid}/favoritos` vía `onSnapshot`, recientes primero): tarjetas con imagen/nombre/destino/badge Hotel-Tour, link al detalle `/{tipo}/{slug}` y eliminar con confirmación |
| `ClientReservas.jsx` | — | Consulta, vincula, elimina reservas (CT) y grupos (GB) CRM con toggle segmentado. Persiste solo el vínculo mínimo; el detalle (reserva / `GrupoDetalle`) y PDF se consultan bajo demanda con autenticación + botón de documentos por tarjeta. Durante mantenimiento o pausa administrativa de consultas muestra un aviso casual y no ofrece consultas CRM |
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
| `HomeBannerView.jsx` | — | Pestaña "Banner inicio" del admin: textos, enlace, vigencia y dos imágenes (escritorio y móvil) subidas a Storage en `home-banner/`. Guarda en `config/homeBanner` |
| `MediaManager.jsx` | — | Explorador Firebase Storage con CRUD de archivos/carpetas |
| `ConfigView.jsx` | — | Configuración global (nombre, logo, WhatsApp, mantenimiento general y pausa de consultas CRM para reservas/grupos), comunicado oficial, conversión WebP adaptable y eliminación sincronizada de imágenes |

### Otros

| Componente | Propósito |
|---|---|
| `FeaturedTours.astro` | Sección "Tours para complementar tu viaje" de la home. Carga hasta 6 tours activos de Firestore (`fetchTourList`) en `MobileRail`, con estado de catálogo no disponible |
| `MobileRail.astro` | Fila de tarjetas que en móvil se desliza en horizontal con ajuste a cada tarjeta (78 % del ancho) y desde md se vuelve cuadrícula. Se usa en Hoteles destacados, `/hoteles` y `/tours`. En `/hoteles`, "Ver más" solo aparece en escritorio, porque en móvil el carrusel muestra todas las tarjetas |
| `BuenFinTopbar.tsx` (`client:only`) | Barra promocional del Buen Fin encima del header, montada en `Layout.astro`. Cuenta regresiva en hora de Cancún: "EMPIEZA EN" hasta el 13 de noviembre de 2026 a las 00:00 y "TERMINA EN" hasta el 17 a las 23:59:59; después no se muestra. Vigencia en `src/lib/buenFin.ts`. Muestra una insignia roja "BUEN FIN :)". En la fase activa, si `ctaEnabled` es `true`, muestra "Cotiza ahora" hacia el WhatsApp de la empresa con un mensaje de la promoción, y una segunda línea con el cupón simbólico `BUENFIN-TDMX` y botón de copiar. Mientras `ctaEnabled` sea `false`, muestra "Próximamente" |
| `MinorAges.tsx` | Inputs de edades para menores (usado por BookingCalendar) |

---

## Diálogos accesibles

Los modales críticos reutilizan `src/hooks/useAccessibleDialog.ts`. El patrón aplica `role="dialog"`, `aria-modal="true"`, foco inicial, trap de foco con `Tab`/`Shift+Tab`, cierre con `Escape`, restauración del foco disparador y bloqueo reversible del scroll del `body`. El contenedor del diálogo debe incluir `aria-labelledby` y `tabIndex={-1}`; los botones de cierre deben declarar `type="button"` y una etiqueta accesible cuando solo contienen un icono.

El hook no controla la animación ni el portal: cada componente conserva su comportamiento visual y solo entrega la referencia del contenedor. `BookingCalendar.tsx` usa el mismo patrón junto con GSAP y `createPortal`.

Los formularios deben asociar cada `label` con su control mediante `htmlFor` e `id`. El `placeholder` se utiliza únicamente como ejemplo o ayuda contextual; nunca reemplaza el nombre visible o accesible del campo. Los controles dinámicos, como las edades de `MinorAges.tsx`, deben generar IDs únicos por instancia.

La descripción del catálogo se sanea server-side mediante `src/lib/sanitizeHtml.ts` antes de llegar a `HotelTabs` o a cualquier `set:html`. La política usa una allowlist estricta y las metadata/JSON-LD usan texto plano.

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
| `ClientPagos.jsx` | Firestore + CRM | Carga de vínculos y abonos CRM; aviso durante mantenimiento; historial de vouchers Openpay independiente, errores con reintento y vacíos por contexto |
| `ClientReservas.jsx` | Firestore + CRM | Carga de vínculos, consulta, detalle, error con reintento y vacío |
| `DocumentosModal.jsx` | CRM documentos | Carga, error con reintento, vacío, subida, éxito y error |
| `LeadsView.jsx` | Firestore `cotizaciones` | Carga, error con reintento y vacío |
| `TeamView.jsx` | Firestore `equipo` + Firebase Storage | Carga, error con reintento, vacío y acciones de edición |
| `OfertasView.jsx` | Firestore `ofertas` | Carga, error con reintento, vacío y acciones de edición |
| `ConfigView.jsx` | Firestore `config/general` + Firebase Storage | Carga, error con reintento, progreso de upload y éxito/error de guardado |
| `MediaManager.jsx` | Firebase Storage | Debe conservar estados de carga, error, vacío y acciones de archivo por operación |
| `BookingCalendar.tsx` | Estado local | Validación inline; edades de menores enteras entre 0 y 17; envío deshabilitado hasta completar datos válidos |
