# Decisions

> Decisiones arquitectónicas y técnicas detectadas en el proyecto tdmx-astro.

## Resumen

Decisiones de diseño inferidas del código fuente. Basadas en patrones observados, no en documentación explícita.

---

## Arquitectura

### SSR con Astro + React islands (no SPA)
Se eligió Astro SSR con React solo para componentes interactivos, aprovechando el renderizado server-side para SEO y la capacidad de Astro de entregar HTML minimalista con cero JavaScript en páginas estáticas.

### Firebase Auth solo client-side
La autenticación se maneja exclusivamente en el navegador mediante `onAuthStateChanged`. No hay middleware de verificación server-side, cookies de sesión ni JWT validation en endpoints. Esto simplifica la implementación pero deja las rutas API sin protección.

### Tailwind v4 con Vite plugin
Se utiliza Tailwind CSS v4 con `@tailwindcss/vite` en lugar del enfoque tradicional PostCSS. Esto elimina la necesidad de `tailwind.config.js` y `postcss.config.js`. No se detectaron archivos de configuración de Tailwind v3.

---

## Frontend

### Sin CSS modules ni styled-components
Todas las clases CSS son utility classes de Tailwind. No se usa CSS modules, styled-components ni archivos .css sueltos (excepto `global.css` que solo importa Tailwind).

### Google Maps via iframe embebido (no SDK)
Aunque `@react-google-maps/api` está en dependencias, el componente `HotelTabs.tsx` usa un iframe de Google Maps Embed API con una API key hardcodeada en el código fuente. Esto es un riesgo de seguridad documentado.

### GSAP para animaciones premium
Se usa GSAP para animaciones que requieren control fino (hero slider, payment methods stagger). Para animaciones simples se usan CSS transitions y `@keyframes`.

### localStorage para "vistos recientemente"
En lugar de backend o cookies, se usa `localStorage` con key `tdmx_recently_viewed` (máximo 4 items). Esto evita llamadas server-side pero pierde persistencia entre dispositivos.

---

## Backend

### Openpay con proxy server-side
Los endpoint de Openpay (`/api/openpay-cargo`, `/api/openpay-check`) actúan como proxy para no exponer la llave privada (`OPENPAY_PRIVATE_KEY`) al cliente. El cliente llama a endpoints propios, que internamente hacen fetch a Openpay con Basic Auth.

### Firestore con force long polling
En `src/lib/firebase.js` se configura `experimentalForceLongPolling: true` y `useFetchStreams: false` para garantizar compatibilidad con el runtime Node.js de Astro (Firestore usa streams HTTP/2 que no están disponibles en Node estándar).

### Timeout de 2.5s en Header.astro
El header usa `Promise.race` entre `getDoc` de Firestore y un timeout de 2.5s. Si Firestore no responde, se usa logo y WhatsApp de respaldo. Esto evita bloquear el renderizado SSR por lentitud de Firebase.

### Middleware de mantenimiento con caché
El middleware usa una variable en memoria con caché de 30 segundos para evitar leer Firestore en cada request. Esto es adecuado para un flag que cambia raramente.

---

## Base de datos

### Firebase sobre backend propio
Se eligió Firebase (Firestore + Auth + Storage) como backend de datos en lugar de un backend propio. Para el catálogo público (hoteles/tours) se consume una API REST externa (Laravel).

### Sin ORM ni schema migrations
Firestore es schemaless. No hay migraciones, validación de esquemas ni tipado estricto para las colecciones. Los tipos se validan implícitamente en el código de componentes.

---

## Seguridad

### API key de Google Maps hardcodeada
`HotelTabs.tsx` contiene `apiKey = "AIzaSyCXKmnPdBL8H7egOAKRnfdSYDc2H0fAI5E"` directamente en el código fuente del componente. Esto expone la key en el bundle del cliente.

### Sin protección server-side en rutas API
Los endpoints `/api/openpay-cargo` y `/api/openpay-check` no tienen autenticación ni validación de origen (CORS). Cualquier cliente puede llamarlos.

---

## Pendiente de documentar

- Razón de la inclusión de Vue en dependencias (no usado en código)
- Estrategia de manejo de errores global
- Decisiones de performance y optimización
- Criterios de elección de librerías específicas
