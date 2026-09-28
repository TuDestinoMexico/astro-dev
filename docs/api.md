# API

> Endpoints internos y externos del proyecto tdmx-astro.

## Resumen

El proyecto expone endpoints API server-side (proxy y webhook de Openpay, además de proxys a CRM de reservas y grupos) y consume una API REST externa para el catálogo de productos. También genera un robots.txt dinámico.

---

## Endpoints internos (Astro server)

### `POST /api/openpay-cargo`

Crea un cargo en Openpay.

- **Archivo:** `src/pages/api/openpay-cargo.ts`
- **Método:** POST
- **Autenticación:** Bearer ID token de Firebase; requiere email verificado.
- **Protección:** rate limit distribuido por UID/IP e `Idempotency-Key` obligatorio.
- **Body permitido:**
  ```json
  {
    "method": "card|store|bank_account",
    "amount": "number con máximo dos decimales",
    "description": "string",
    "customer": {
      "name": "string",
      "last_name": "string",
      "phone_number": "string"
    }
  }
  ```
- **Validaciones server-side:** método permitido, importe entre `OPENPAY_MIN_AMOUNT` y `OPENPAY_MAX_AMOUNT`, datos básicos del cliente, body JSON y tamaño máximo.
- **Campos controlados por servidor:** email desde el token Firebase, `confirm`, `send_email` y `redirect_url`.
- **Respuesta éxito:** `{ success: true, id, status, payment_method }` con solo los campos necesarios del voucher Openpay.
- **Variables de entorno:** `OPENPAY_MERCHANT_ID`, `OPENPAY_PRIVATE_KEY`, `OPENPAY_API_BASE_URL`, `OPENPAY_MIN_AMOUNT`, `OPENPAY_MAX_AMOUNT`, `SITE_URL` y credenciales `FIREBASE_ADMIN_*`.
- **URL destino:** `{OPENPAY_API_BASE_URL}/v1/{merchantId}/charges`
- **Auth externa:** Basic Auth con `OPENPAY_PRIVATE_KEY`; nunca se expone al cliente.
- **Errores:** `400` payload inválido, `401` sesión ausente o inválida, `403` email no verificado, `409` idempotencia en proceso, `413` body demasiado grande, `415` content type incorrecto, `429` rate limit, `502` respuesta Openpay inválida, `503` protección no disponible y `500` configuración/error interno.
- **Headers requeridos:** `Authorization: Bearer <id-token>` e `Idempotency-Key` de 8 a 128 caracteres seguros.

Los formularios de pago adjuntan el Bearer token y una `Idempotency-Key` generada en cliente. La clave se conserva durante reintentos y se limpia después de una respuesta exitosa. Los cargos exitosos se guardan server-side en `users/{uid}/pagos/{paymentId}`.

### `GET /api/openpay-check`

Verifica el estado de una transacción Openpay.

- **Archivo:** `src/pages/api/openpay-check.ts`
- **Método:** GET
- **Autenticación:** Bearer ID token de Firebase; requiere email verificado.
- **Query params:** `paymentId` (string, requerido) — ID del documento en `users/{uid}/pagos`.
- **Respuesta:** respuesta normalizada del cargo, limitada a los campos necesarios para mostrar su estado.
- **Variables de entorno:** `OPENPAY_MERCHANT_ID`, `OPENPAY_PRIVATE_KEY`, `OPENPAY_API_BASE_URL` y credenciales `FIREBASE_ADMIN_*`.
- **Flujo:** primero verifica que el `paymentId` pertenezca al usuario autenticado; después obtiene el `openpayChargeId` guardado y consulta Openpay.
- **Actualización:** sincroniza el estado del documento de historial.
- **Redirect Openpay:** Openpay puede regresar a `SITE_URL?id={openpayChargeId}`. `WelcomeModal` acepta ese parámetro, lo usa como `paymentId` y conserva el retorno al login sin permitir URLs externas.
- **Errores:** `400` paymentId inválido, `401` sesión ausente o inválida, `403` email no verificado, `404` pago no encontrado, `502` error de Openpay y `500` error interno.

### `POST /api/openpay-webhook`

Recibe notificaciones de estado de cargos desde Openpay.

- **Archivo:** `src/pages/api/openpay-webhook.ts`
- **Método:** POST
- **Autenticación:** token secreto server-side mediante `X-Openpay-Webhook-Token` o el query param `token` configurado en la URL del webhook.
- **Body:** JSON de Openpay; acepta el cargo en `transaction`, `charge` o `data`.
- **Eventos:** creación, éxito/completado, rechazo, fallo, cancelación, expiración y reembolso.
- **Flujo:** extrae el ID del cargo, busca `users/{uid}/pagos` por `openpayChargeId` mediante `collectionGroup` y actualiza únicamente el documento encontrado.
- **Idempotencia:** las notificaciones repetidas actualizan el mismo documento y no crean pagos nuevos. Los cargos desconocidos se confirman sin exponer información.
- **Variables de entorno:** `OPENPAY_WEBHOOK_TOKEN` y credenciales `FIREBASE_ADMIN_*`.
- **Configuración Openpay:** registrar `https://tu-dominio/api/openpay-webhook?token=OPENPAY_WEBHOOK_TOKEN` en Sandbox y Production. No usar el mismo token entre entornos.
- **Errores:** `400` payload inválido, `401` token ausente/incorrecto, `413` body demasiado grande, `415` content type incorrecto y `500` error interno.

### `POST /api/crm-consultar`

Proxy autenticado a la API CRM de Tu Destino Mexico. Consulta una reserva por CT y correo durante la vinculación, o el CT ya vinculado durante la consulta de detalle.

- **Archivo:** `src/pages/api/crm-consultar.ts`
- **Método:** POST
- **Autenticación:** `Authorization: Bearer <Firebase ID token>` con correo verificado.
- **Body:**
  ```json
  { "ct": "string (required)", "email": "string (email, required)" }
  ```
- **Detalle:** `{ "ct": "string (required)", "detail": true }`. El servidor verifica que el CT pertenezca al usuario autenticado y obtiene el correo vinculado desde Firestore.
- **Respuesta éxito:** `{ "success": true, "data": { ...datos reserva } }`
- **Respuesta error:** `{ "success": false, "message": "..." }`
- **URL destino:** `{API_CRM_URL}/api/reservas/consultar`
- **Variables de entorno:** `API_CRM_URL`
- **Error 400:** `{ "success": false, "message": "Faltan CT o email" }`
- **Error 500:** `{ "success": false, "message": "Error de conexión..." }`

### `POST /api/crm-grupo-consultar`

Proxy autenticado a la API CRM de Tu Destino Mexico. Consulta un grupo por GB y correo durante la vinculación, o el GB ya vinculado durante la consulta de detalle.

- **Archivo:** `src/pages/api/crm-grupo-consultar.ts`
- **Método:** POST
- **Autenticación:** `Authorization: Bearer <Firebase ID token>` con correo verificado.
- **Body:**
  ```json
  { "gb": "string (required)", "email": "string (email, required)" }
  ```
- **Detalle:** `{ "gb": "string (required)", "detail": true }`. El servidor verifica que el GB pertenezca al usuario autenticado y obtiene el correo vinculado desde Firestore.
- **Respuesta éxito:** `{ "success": true, "data": { ...datos grupo } }`
- **Respuesta error:** `{ "success": false, "message": "..." }`
- **URL destino:** `{API_CRM_URL}/api/grupos/consultar`
- **Variables de entorno:** `API_CRM_URL`
- **Error 400:** `{ "success": false, "message": "Faltan GB o email" }`
- **Error 500:** `{ "success": false, "message": "Error de conexión..." }`

### `POST /api/crm-documentos`

Proxy a la API CRM. Lista los documentos de una reserva (CT) o grupo (GB) vinculado, o genera la URL firmada de previsualización de un documento.

- **Archivo:** `src/pages/api/crm-documentos.ts`
- **Método:** POST
- **Body:**
  ```json
  { "tipo": "ct|gb (required)", "codigo": "string (required)", "email": "string (email, required)", "documentoId": "number (opcional)" }
  ```
  - Sin `documentoId` → lista documentos de la entidad.
  - Con `documentoId` → devuelve URL firmada (5 min) del documento.
- **Respuesta listado éxito:** `{ "success": true, "data": [...], "tipos_permitidos": [...], "mime_types_permitidos": [...], "tamano_maximo": 10485760 }`
- **Respuesta preview éxito:** `{ "success": true, "data": { "url": "...", "file_name": "...", "file_type": "..." } }`
- **URL destino:** `{API_CRM_URL}/api/{reservas|grupos}/{codigo}/documentos?email=...` o `{API_CRM_URL}/api/documentos/{id}/preview?ct|gb=...&email=...`
- **Variables de entorno:** `API_CRM_URL`, `API_CRM_TOKEN`
- **Error 400:** `{ "success": false, "message": "Faltan tipo, código o email" }`
- **Error 500:** `{ "success": false, "message": "Error de conexión..." }`

### `POST /api/crm-documentos-upload`

Proxy a la API CRM. Sube un documento a la reserva (CT) o grupo (GB) indicado (multipart).

- **Archivo:** `src/pages/api/crm-documentos-upload.ts`
- **Método:** POST
- **Body (multipart/form-data):**
  - `tipo` (required) — `ct` o `gb`
  - `codigo` (required) — CT o GB
  - `email` (required) — correo del cliente
  - `tipo_documento` (required) — uno de los `tipos_permitidos` de la entidad
  - `descripcion` (opcional)
  - `archivo` (required) — JPG, PNG, PDF, DOC, DOCX; máx 10MB
- **Respuesta éxito:** `{ "success": true, "data": { ...documento }, "message": "Documento subido exitosamente" }` (201)
- **URL destino:** `{API_CRM_URL}/api/{reservas|grupos}/{codigo}/documentos`
- **Variables de entorno:** `API_CRM_URL`, `API_CRM_TOKEN`
- **Error 500:** `{ "success": false, "message": "Error de conexión..." }`

### `GET /robots.txt`

Genera robots.txt dinámico.

- **Archivo:** `src/pages/robots.txt.ts`
- **Contenido:** `User-agent: *` + `Allow: /` + `Sitemap: {site}/sitemap-index.xml`
- **Uso:** Referenciado en layouts via `<link rel="sitemap">`

---

## API externa

### CRM (Reservas y Grupos)

- **Base URL:** `https://xolopi.tudestinomx.com` (configurable vía `API_CRM_URL`)
- **Uso:** Proxy server-side a través de `/api/crm-consultar` (reservas), `/api/crm-grupo-consultar` (grupos), `/api/crm-pagos` (pagos por CT), `/api/crm-grupo-pagos` (pagos por GB) y `/api/crm-documentos` / `/api/crm-documentos-upload` (documentos)
- **Autenticación:** Endpoints públicos (sin token de usuario). Requieren header `X-Api-Token` con el valor de `API_CRM_TOKEN` (server-side, nunca expuesto al cliente). El CRM exige este header en `/api/gb/{gb}/pagos` y en los endpoints de documentos.

### Pagos (CRM)

- **Proxy:** `POST /api/crm-pagos` con body `{ ct }` → `GET {API_CRM_URL}/api/pago/{ct}`
- **Respuesta:** `{ success: true, data: [...] }` — `data` es un array de registros de pago por reserva
- **Uso:** `ClientPagos.jsx` (selecciona CT vinculado en Firestore `users/{uid}/reservas`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | ID interno del pago |
| `reserva_id` | number | ID de la reserva asociada |
| `ct` | string | Código de reserva |
| `abonos` | array | `[{ fecha_abono, cantidad, tipo_pago: { metodo_pago, referencia } }]` |
| `precio_total` | string | Precio total MXN (ej. "86885.00") |
| `fecha_liquidacion` | string | Fecha-hora de liquidación |
| `fecha_cambios` | string | Fecha-hora de últimos cambios |
| `created_at` | string | ISO creation |
| `updated_at` | string | ISO last update |
| `proveedor` | object | `{ proveedor }` — nombre del proveedor |
| `plan_pagos` | null | Sin uso por ahora |

### Pagos de grupos (CRM)

- **Proxy:** `POST /api/crm-grupo-pagos` con body `{ gb }` → `GET {API_CRM_URL}/api/gb/{gb}/pagos`
- **Respuesta:** `{ success: true, data: [...] }` — `data` es un array de registros de pago por grupo, cada uno con campo `gb` inyectado y relación `grupo` oculta
- **Uso:** `ClientPagos.jsx` (selecciona GB vinculado en Firestore `users/{uid}/grupos`)
- **Estructura:** igual a "Pagos (CRM)" pero con `gb` en lugar de `ct` (los abonos comparten `fecha_abono`, `cantidad`, `tipo_pago.metodo_pago`, `tipo_pago.referencia`)

### Documentos (CRM)

- **Proxys:** `POST /api/crm-documentos` (listar/preview) y `POST /api/crm-documentos-upload` (multipart)
- **Listado:** `GET {API_CRM_URL}/api/reservas/{ct}/documentos?email=` o `GET {API_CRM_URL}/api/grupos/{gb}/documentos?email=` — valida CT/GB + email (igual que consultar). Devuelve `data`, `tipos_permitidos` (según `reservation_type` Q/NQ), `mime_types_permitidos` y `tamano_maximo`.
- **Subida (cliente):** `POST {API_CRM_URL}/api/reservas/{ct}/documentos` o `/api/grupos/{gb}/documentos` (multipart con `email`, `archivo`, `tipo_documento`, `descripcion`). Máx 10MB; JPG/PNG/PDF/DOC/DOCX. Las subidas de clientes nacen con `estado=pendiente` (requieren verificación del admin).
- **Subida (admin/reservas, tdmx_v3):** `POST /api/reservas/{reserva}/documentos` o `/api/grupos/{grupo}/documentos` con `archivo`, `tipo_documento`, `descripcion` y opcionalmente `estado` (`verificado`|`rechazado`, default `verificado`) y `motivo_rechazo` (obligatorio si `estado=rechazado`). El usuario que sube queda como `verificado_por`.
- **Preview:** `GET {API_CRM_URL}/api/documentos/{id}/preview?ct|gb=...&email=...` — **bloqueado para clientes** (devuelve 403 con mensaje claro). El cliente no puede visualizar los documentos; solo ve su estado en el modal.
- **Uso:** `DocumentosModal.jsx` (desde `ClientReservas.jsx`, botón carpeta por tarjeta CT/GB vinculada)
- **Origen:** los docs subidos por el cliente se registran con `origen=cliente` y `email_cliente`; los del agente con `origen=agente` y `uploaded_by`. Ambos se almacenan en Firebase Storage (bucket `tudestinomx`) y en la tabla compartida `documentos`.

**Verificación (ciclo de estados):** las subidas de clientes nacen `pendiente`. El admin las aprueba o rechaza desde la página Documentos del panel (`tdmx_v3`). Solo al aprobarse (`estado=verificado`) el documento cuenta como cargado para el checklist del cliente. El rechazo es visible para el cliente con el `motivo_rechazo`.

| Estado | Descripción |
|---|---|
| `pendiente` | Subido por el cliente, esperando revisión del admin |
| `verificado` | Aprobado por el admin (también es el estado por defecto de los docs de agente y de los existentes) |
| `rechazado` | Rechazado por el admin; `motivo_rechazo` opcional |

Estructura de un documento:

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | ID interno |
| `tipo_documento` | string | `pre_confirmacion`, `carta_aceptacion`, `voucher`, `ine_frente`, `ine_vuelta`, `tarjetas_pago`, `tarjetas_club`, `ingresos`, etc. |
| `tipo_documento_label` | string | Etiqueta legible |
| `descripcion` | string \| null | Descripción opcional |
| `file_name` | string | Nombre original del archivo |
| `file_type` | string | MIME |
| `file_size` | number | Bytes |
| `file_size_formatted` | string | Ej. "1.2 MB" |
| `origen` | string | `cliente` o `agente` |
| `email_cliente` | string \| null | Correo del cliente que subió el doc (si `origen=cliente`) |
| `estado` | string | `pendiente`, `verificado` o `rechazado` |
| `estado_label` | string | Etiqueta legible (Pendiente/Verificado/Rechazado) |
| `motivo_rechazo` | string \| null | Motivo opcional cuando `estado=rechazado` |
| `created_at` | string | ISO creation |

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

### Estructura de datos de grupo (GB)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | ID interno |
| `gb` | string | Código único del grupo |
| `reservation_type` | string | Tipo (`Q` o `NQ`) |
| `fecha_reserva` | string | Fecha de reserva |
| `precio_total` | string | Precio total MXN |
| `precio_neto` | string | Precio neto MXN |
| `utilidad` | string | Utilidad MXN |
| `locked_at` | string \| null | Fecha-hora de bloqueo |
| `pdf_url` | string | URL del PDF |
| `cliente` | object | Cliente titular: `client_name`, `email`, `phone_number`, `edad`, `client_ocupacion` |
| `hoteles` | array | Lista de hoteles del grupo |

Cada elemento de `hoteles`:

| Campo | Tipo | Descripción |
|---|---|---|
| `hotel` | string | Nombre del hotel |
| `destino` | string | Destino |
| `checkin` | string | Fecha check-in |
| `checkout` | string | Fecha check-out |
| `cantidad_noches` | string | Ej. "5 días 4 noches" |
| `plan_alimentos` | string | Plan alimenticio |
| `habitacion` | array | Tipos de habitación |
| `pax` | number | Total de pasajeros |
| `cantidad_adultos` | number | Adultos |
| `cantidad_ninos` | number | Menores |
| `edades_adultos` | array | Edades de adultos |
| `edades_ninos` | array | Edades de menores |
| `tripadvisor` | string \| null | Calificación TripAdvisor |

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

### Manejo de errores del catálogo

Las páginas SSR consumen el catálogo mediante `src/lib/catalog.ts`, que centraliza headers, timeout, validación y normalización de respuestas.

- **Timeout:** 8 segundos por solicitud mediante `AbortSignal.timeout`.
- **Headers:** `Accept: application/json` y `Authorization: Bearer {VITE_API_TOKEN}`.
- **HTTP 404:** se interpreta como recurso inexistente. En páginas de detalle redirige a `/404`; en listados se conserva el estado vacío.
- **Otros errores HTTP:** se consideran indisponibilidad temporal del catálogo.
- **Timeout, error de red o JSON inválido:** se consideran indisponibilidad temporal del catálogo.
- **Estructura inválida:** una lista debe ser un array directo o estar dentro de `data`; un detalle debe ser un objeto directo o estar dentro de `data`.
- **Logging:** los errores se registran únicamente server-side con recurso, tipo de consulta, slug cuando aplica y código HTTP. Nunca se registran tokens, headers sensibles ni cuerpos completos de respuesta.

### Fallbacks públicos

- **Homepage (`/`):** si falla el listado de hoteles, se muestra el resto de la página y un mensaje informativo en la sección del catálogo.
- **Listados (`/hoteles`, `/tours`):** muestran un mensaje de catálogo temporalmente no disponible. Las respuestas válidas sin resultados conservan el mensaje de catálogo vacío.
- **Detalles (`/hotel/{slug}`, `/tour/{slug}`):** muestran `CatalogUnavailable.astro` para fallos temporales y mantienen `Header` y `Footer`. No se renderizan datos dependientes del producto, favoritos, calendario, historial reciente ni schema específico del producto.
- **SEO:** los schemas `ItemList`, `Hotel` y `Tour` solo se emiten cuando existe una respuesta válida del catálogo.

### Campos detectados en hoteles

| Campo | Tipo | Notas |
|---|---|---|
| `name` | string | Nombre del hotel |
| `slug` | string | Identificador URL |
| `active` | number | 1 = activo, 0 = inactivo |
| `images` | object | `principal`, `secundaria`, `adicional` (arrays de objetos con `url`) |
| `description` | string | Descripción HTML; se sanea server-side con una allowlist antes de renderizar |
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
| `ClientReservas.jsx` | `/api/crm-consultar`, `/api/crm-grupo-consultar`, `/api/crm-documentos`, `/api/crm-documentos-upload` | Client-side fetch (consultar/vincular + ver detalle de CT y GB + documentos) |
| `DocumentosModal.jsx` | `/api/crm-documentos`, `/api/crm-documentos-upload` | Client-side fetch (listar, preview y subir documentos) |
| `ClientPagos.jsx` | `/api/crm-pagos`, `/api/crm-grupo-pagos` | Client-side fetch (pagos por CT o GB vinculado) |

---

## Variables de entorno requeridas

| Variable | Propósito |
|---|---|
| `API_CRM_URL` | URL base de la API CRM de reservas |
| `API_CRM_TOKEN` | Token para header `X-Api-Token` en requests al CRM (server-side) |

## Pendiente de documentar

- Estructura de respuesta de tours
- Rate limiting de API externa
- Documentación Openpay (referencia externa)
