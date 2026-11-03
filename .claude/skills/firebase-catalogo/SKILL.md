---
name: firebase-catalogo
description: Acceso a Firebase en tdmx-astro (Admin SDK en SSR, SDK cliente, colecciones hotels y tours compartidas con tdmx_v3, Storage y URLs firmadas). Usar al leer o escribir Firestore, al tocar src/lib/firebase.js, src/lib/catalog.ts, páginas de hoteles o tours, o al manejar onSnapshot.
---

# Firebase y catálogo

Fuente completa: `docs/database.md` y `docs/auth.md`.

## Reglas generales

- Instancia única del SDK cliente en `src/lib/firebase.js`. Importar `auth`, `db` y `storage` desde ahí.
- Toda llamada a Firestore va en try/catch.
- En React, usar `onSnapshot` con cleanup en `useEffect`.
- Autenticación solo en cliente. No agregar cookies de sesión ni validación de sesión en middleware. El middleware es solo para mantenimiento.
- Admin protegido en el cliente con `onAuthStateChanged` en `DashboardLayout.jsx`.

## Catálogo compartido

- SSR lee `hotels` y `tours` con Firebase Admin SDK sobre la base `FIRESTORE_DATABASE` (por defecto `tdmx-db`), compartida con `tdmx_v3`.
- Lógica en `src/lib/catalog.ts`. Filtra documentos con `active: false`. Los documentos sin `active` se consideran activos.
- Los detalles se resuelven por `slug`. Si falta, se deriva de `name` o del ID en memoria. Los slugs generados no se guardan en Firestore.
- Galerías: `gallery[].path` se convierte en URL firmada de una hora usando `CATALOG_STORAGE_BUCKET` (por defecto `tudestinomx`).
- Amenidades: conservar `category`, `icon` e `items`. `amenities_list` es solo metadata.
- Defaults solo al renderizar. No escribir defaults de vuelta a Firestore.
- Errores de lectura o firma se tratan como indisponibilidad temporal y se registran solo en el servidor. Usar `CatalogUnavailable.astro` en detalles.

## Storage

- Las imágenes del sitio se acceden por URL pública, sin token.
- Los documentos de cliente viven en el bucket `tudestinomx` y en la tabla compartida `documentos`.

## Qué no hacer

- No hardcodear credenciales de Firebase Admin ni llaves de Maps.
- No asumir un esquema fijo en Firestore: es schemaless, valida en el código del componente.
