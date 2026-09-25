# Database

> Bases de datos y almacenamiento del proyecto tdmx-astro.

## Resumen

El proyecto utiliza tres fuentes de datos: Firebase Firestore (NoSQL) para datos de aplicación y admin, Firebase Storage para archivos multimedia, y una API REST externa para el catálogo de hoteles y tours.

---

## Firebase Firestore

Instancia única inicializada en `src/lib/firebase.js` con `experimentalForceLongPolling: true` para compatibilidad con Node.js.

### Colecciones detectadas

#### `config/general`
Documento único con configuración global del sitio.

| Campo | Tipo | Propósito |
|---|---|---|
| `sitioNombre` | string | Nombre comercial de la empresa |
| `logoUrl` | string | URL del logo en Firebase Storage |
| `whatsappGlobal` | string | Número WhatsApp (solo dígitos, con código país) |
| `modoMantenimiento` | boolean | Activa/desactiva modo mantenimiento |

**Uso:** `Header.astro` (lectura SSR con timeout 2.5s), `ConfigView.jsx` (CRUD admin), `middleware.js` (lectura con caché 30s).

#### `equipo`
Colección de miembros del equipo, ordenada por `posicion`.

| Campo | Tipo | Propósito |
|---|---|---|
| `nombre` | string | Nombre completo |
| `puesto` | string | Puesto o rol |
| `foto` | string | URL de foto en Storage |
| `posicion` | number | Orden de aparición |
| `activo` | boolean | Visible en sitio público |

**Uso:** `TeamView.jsx` (CRUD admin con drag & drop, paginación, búsqueda), `nosotros.astro` (SSR).

#### `cotizaciones`
Colección de leads/cotizaciones del sitio.

| Campo | Tipo | Propósito |
|---|---|---|
| `nombre` | string | Nombre del cliente |
| `destino` | string | Destino de interés |
| `estatus` | string | Estado de la cotización |
| `createdAt` | timestamp | Fecha de creación |

**Uso:** `LeadsView.jsx` (lectura admin, ordenado por fecha descendente, limit 5).

#### `encuestas/mexico_inglaterra`
Documento único con votos de encuesta del Mundial 2026.

| Campo | Tipo | Propósito |
|---|---|---|
| `votos` | (no determinado) | Votos de la encuesta |

**Uso:** `MatchPoll.jsx` (lectura/escritura con `onSnapshot` en tiempo real).

---

## Firebase Storage

Almacenamiento de archivos multimedia. Las URLs son públicas (sin token de seguridad).

### Rutas detectadas

| Ruta | Propósito |
|---|---|
| `config/` | Logos e imágenes de configuración |
| `equipo/` | Fotos de miembros del equipo |
| (carpetas dinámicas) | Navegación libre desde MediaManager |

### Gestión de archivos

- `MediaManager.jsx` — Explorador de archivos con navegación por carpetas, subida, borrado y copia de URLs.
- `ConfigView.jsx` — Subida de logos con selector de historial.
- `TeamView.jsx` — Subida de fotos con selector de galería existente.

---

## API REST externa

Endpoint base: `https://api.tudestinomx.com`

Autenticación: Bearer token vía `VITE_API_TOKEN`.

| Endpoint | Propósito | Uso |
|---|---|---|
| `GET /api/hotel` | Listado de hoteles | `Welcome.astro`, `hoteles.astro` |
| `GET /api/hotel/slug/{slug}` | Detalle de hotel | `hotel/[slug].astro` |
| `GET /api/tour` | Listado de tours | `tours.astro` |
| `GET /api/tour/slug/{slug}` | Detalle de tour | `tour/[slug].astro` |

Campos detectados en respuestas: `name`, `slug`, `active`, `images` (principal, secundaria, adicional), `description`, `address`, `amenities_list`, `google_maps` (coordenadas), `reviews`, `destino`.

---

## Colecciones de clientes

#### `users/{userId}/reservas/{reservaId}`

Reservas vinculadas por clientes autenticados con Google Auth.

| Campo | Tipo | Propósito |
|---|---|---|
| `correo_reserva` | string | Email asociado a la reserva |
| `ct` | string | Código de reserva (CT) |
| `fechaVinculacion` | timestamp | Momento en que se vinculó |

**Uso:** `ClientReservas.jsx` (lectura con `onSnapshot`, escritura con `setDoc` al consultar una reserva). El ID del documento es el código normalizado (`ct` en mayúsculas, ej. `CT-12345`), lo que hace imposible duplicados a nivel Firestore. Antes de consultar, el componente valida contra el estado local que el CT/GB no esté ya vinculado (comparación case-insensitive) y bloquea con mensaje sin llamar a la API.

---

#### `users/{userId}/grupos/{grupoId}`

Grupos GB vinculados por clientes autenticados.

| Campo | Tipo | Propósito |
|---|---|---|
| `correo_grupo` | string | Email asociado al grupo |
| `gb` | string | Código único del grupo |
| `detalles` | object | Snapshot de la respuesta CRM, incluyendo `hoteles`, `cliente` y `reservation_type` |
| `pdf_url` | string | URL del PDF del grupo, cuando existe |
| `fechaVinculacion` | timestamp | Momento en que se vinculó |

**Uso:** `ClientReservas.jsx` y `ClientPagos.jsx`. El documento se guarda con `setDoc` usando el código GB normalizado como ID para evitar duplicados.

---

#### `ofertas/{ofertaId}`

Ofertas exclusivas para clientes, gestionadas desde el admin (`OfertasView.jsx`) y consumidas en tiempo real por `ClientOfertas.jsx`.

| Campo | Tipo | Propósito |
|---|---|---|
| `titulo` | string | Título de la oferta |
| `descripcion` | string | Detalle de la promoción |
| `descuento` | string | Etiqueta de descuento (ej. `30%`, `2x1`, `-1`) |
| `codigo` | string | Código promocional (se guarda en mayúsculas) |
| `color` | string | Color de tarjeta: `emerald` \| `amber` \| `violet` \| `cyan` |
| `vigencia` | timestamp \| null | Fecha de vencimiento; `null` = sin límite. La oferta es válida todo el día de vencimiento y se oculta al día siguiente (filtro client-side contra inicio del día) |
| `activo` | boolean | Default `true`; toggle para ocultar sin eliminar |
| `posicion` | number | Orden manual (drag & drop en admin con `writeBatch`) |
| `creadoEn` | timestamp | Momento de creación |

**Uso:** `OfertasView.jsx` (CRUD admin con `onSnapshot`) y `ClientOfertas.jsx` (`onSnapshot` ordenado por `posicion` asc; filtra `activo !== false` y vencidas en memoria — no requiere índices compuestos). El botón "Reclamar" abre WhatsApp usando `config/general.whatsappGlobal` (fallback `529987141365`).

---

#### `users/{userId}/favoritos/{tipo-slug}`

Hoteles y tours del catálogo API guardados por clientes desde el sitio público (botón corazón).

| Campo | Tipo | Propósito |
|---|---|---|
| `tipo` | string | `hotel` \| `tour` |
| `slug` | string | Slug del item en la API externa (URL de detalle: `/{tipo}/{slug}`) |
| `nombre` | string | Nombre del hotel/tour al guardar |
| `imagen` | string | URL de imagen principal (snapshot) |
| `destino` | string | Destino asociado |
| `fechaGuardado` | timestamp | Momento en que se guardó |

**Uso:** El ID del documento es `${tipo}-${slug}` (determinista vía `setDoc`) → duplicados imposibles. Escritura: `FavoriteButton.jsx` en sitio público a través del store singleton `src/lib/favoritosStore.js` (un solo `onAuthStateChanged` + un solo `onSnapshot` por página, consumido con `useSyncExternalStore`). Lectura/eliminación: `ClientFavoritos.jsx`. Guarda snapshot de visualización, no referencia viva a la API — el token nunca llega al cliente.

---

## Reglas de seguridad

Las reglas se versionan en la raíz del proyecto:

- `firestore.rules` — deniega por defecto, permite escrituras administrativas solo con el custom claim `admin: true` y limita `users/{uid}` al propietario.
- `storage.rules` — permite lecturas públicas para conservar las URLs actuales y limita subidas, modificaciones y eliminaciones a administradores.
- `firebase.json` — vincula ambos archivos con Firebase CLI.

`config`, `equipo` y `ofertas` son públicos en lectura porque son consumidos por el sitio. `cotizaciones` queda restringida a administradores. La encuesta conserva escritura anónima únicamente para los dos contadores existentes.

---

## Pendiente de documentar

- Índices compuestos de Firestore.
- Estructura completa de `encuestas/`.
- Campos restantes de `cotizaciones`.
