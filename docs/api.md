# API

> Endpoints internos y externos del proyecto tdmx-astro.

## Resumen

El proyecto expone tres endpoints API server-side (proxy a Openpay y proxy a CRM de reservas) y consume una API REST externa para el catálogo de productos. También genera un robots.txt dinámico.

---

## Endpoints internos (Astro server)

### `POST /api/openpay-cargo`

Crea un cargo en Openpay.

- **Archivo:** `src/pages/api/openpay-cargo.ts`
- **Método:** POST
- **Body:** JSON — cualquier payload válido para Openpay charges API
- **Respuesta:** JSON con la respuesta de Openpay (status code espejeado)
- **Variables de entorno:** `OPENPAY_MERCHANT_ID`, `OPENPAY_PRIVATE_KEY`
- **URL destino:** `https://api.openpay.mx/v1/{merchantId}/charges`
- **Auth:** Basic Auth con `OPENPAY_PRIVATE_KEY`
- **Error:** Retorna `{ error: 'Error interno del servidor' }` con status 500

### `GET /api/openpay-check`

Verifica el estado de una transacción Openpay.

- **Archivo:** `src/pages/api/openpay-check.ts`
- **Método:** GET
- **Query params:** `id` (string, requerido) — Transaction ID
- **Respuesta:** JSON con la respuesta de Openpay
- **Variables de entorno:** `OPENPAY_MERCHANT_ID`, `OPENPAY_PRIVATE_KEY`
- **URL destino:** `https://api.openpay.mx/v1/{merchantId}/charges/{transactionId}`
- **Auth:** Basic Auth con `OPENPAY_PRIVATE_KEY`
- **Error 400:** `{ error: 'Falta el transactionId' }`
- **Error 500:** `{ error: 'Error interno del servidor' }`

### `POST /api/crm-consultar`

Proxy a la API CRM de Tu Destino Mexico. Consulta una reserva por CT y correo.

- **Archivo:** `src/pages/api/crm-consultar.ts`
- **Método:** POST
- **Body:**
  ```json
  { "ct": "string (required)", "email": "string (email, required)" }
  ```
- **Respuesta éxito:** `{ "success": true, "data": { ...datos reserva } }`
- **Respuesta error:** `{ "success": false, "message": "..." }`
- **URL destino:** `{API_CRM_URL}/api/reservas/consultar`
- **Variables de entorno:** `API_CRM_URL`
- **Error 400:** `{ "success": false, "message": "Faltan CT o email" }`
- **Error 500:** `{ "success": false, "message": "Error de conexión..." }`

### `GET /robots.txt`

Genera robots.txt dinámico.

- **Archivo:** `src/pages/robots.txt.ts`
- **Contenido:** `User-agent: *` + `Allow: /` + `Sitemap: {site}/sitemap-index.xml`
- **Uso:** Referenciado en layouts via `<link rel="sitemap">`

---

## API externa

### CRM (Reservas)

- **Base URL:** `https://xolopi.tudestinomx.com` (configurable vía `API_CRM_URL`)
- **Uso:** Proxy server-side a través de `/api/crm-consultar`
- **Autenticación:** Endpoint público (sin token), usa CT + email para validar

### Estructura de datos de reserva

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | ID interno |
| `ct` | string | Código único |
| `email` | string | Correo del cliente |
| `client_name` | string | Nombre del titular |
| `phone_number` | string | Teléfono principal |
| `phone_secondary` | string | Teléfono secundario |
| `client_age` | number | Edad del titular |
| `client_sub` | string | Nombre del acompañante |
| `client_sub_age` | number | Edad del acompañante |
| `address` | string | Dirección |
| `cp` | string | Código postal |
| `city` | string | Ciudad |
| `state` | string | Estado |
| `date_reserva` | string | Fecha-hora de reserva |
| `destino` | string | Destino |
| `hotel` | string | Hotel |
| `checkin` | string | Fecha check-in |
| `checkout` | string | Fecha check-out |
| `cantidad_noches` | string | Ej. "5 dias 4 noches" |
| `type_room` | string | Tipo de habitación |
| `plan_alimentos` | string | Plan alimenticio |
| `habitaciones` | number | Cantidad de habitaciones |
| `pax` | string | Ej. "2.1.0" |
| `reservation_type` | string | Tipo (NQ, etc.) |
| `precio_total` | string | Precio total MXN |
| `tarifa_neta` | string | Tarifa neta MXN |
| `utilidad` | string | Utilidad MXN |
| `ninos` | array | `[{ nombre, edad }]` |
| `adultos` | null | No usado (info via `client_name` + `client_sub`) |
| `description` | object | `{ vp, cliente }` — generalmente null |
| `pdf_url` | string | URL del PDF |
| `created_at` | string | ISO creation |
| `updated_at` | string | ISO last update |

### Catálogo (Hoteles y Tours)

- **Base URL:** `https://api.tudestinomx.com`

### Autenticación

Bearer token enviado en todas las requests:

```
Authorization: Bearer {VITE_API_TOKEN}
Accept: application/json
```

### Endpoints

| Método | Endpoint | Respuesta | Uso en proyecto |
|---|---|---|---|
| GET | `/api/hotel` | Array de hoteles | `Welcome.astro`, `hoteles.astro` |
| GET | `/api/hotel/slug/{slug}` | Objeto hotel | `hotel/[slug].astro` |
| GET | `/api/tour` | Array de tours | `tours.astro` |
| GET | `/api/tour/slug/{slug}` | Objeto tour | `tour/[slug].astro` |

### Estructura de respuesta

Las respuestas pueden venir como array directo o como `{ data: [...] }`. El proyecto normaliza con:

```js
const data = Array.isArray(raw) ? raw : (raw.data || []);
```

### Campos detectados en hoteles

| Campo | Tipo | Notas |
|---|---|---|
| `name` | string | Nombre del hotel |
| `slug` | string | Identificador URL |
| `active` | number | 1 = activo, 0 = inactivo |
| `images` | object | `principal`, `secundaria`, `adicional` (arrays de objetos con `url`) |
| `description` | string | Descripción HTML |
| `address` | string | Dirección |
| `amenities_list` | string[] | Lista de amenidades |
| `google_maps` | number[] | Coordenadas `[lat, lng]` |
| `reviews` | string | Calificación |
| `destino` | string | Destino asociado |

---

## Consumidores de API

| Componente | API | Momento |
|---|---|---|
| `Welcome.astro` | REST (hoteles) | SSR - frontmatter |
| `hoteles.astro` | REST (hoteles) | SSR - frontmatter |
| `hotel/[slug].astro` | REST (hotel detail) | SSR - frontmatter |
| `tours.astro` | REST (tours) | SSR - frontmatter |
| `tour/[slug].astro` | REST (tour detail) | SSR - frontmatter |
| `PaymentMethods.jsx` | `/api/openpay-cargo` | Client-side fetch |
| `WelcomeModal.tsx` | `/api/openpay-check` | Client-side fetch |
| `ClientReservas.jsx` | `/api/crm-consultar` | Client-side fetch (link + ver detalle) |

---

## Variables de entorno requeridas

| Variable | Propósito |
|---|---|
| `API_CRM_URL` | URL base de la API CRM de reservas |

## Pendiente de documentar

- Estructura de respuesta de tours
- Rate limiting de API externa
- Documentación Openpay (referencia externa)
- Manejo de errores detallado de API externa
