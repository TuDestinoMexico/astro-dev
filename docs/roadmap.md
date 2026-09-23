# Roadmap

> Estado actual de funcionalidades detectadas en el proyecto tdmx-astro.

## Resumen

Funcionalidades identificadas en el código fuente actual. No incluye planificación futura (no detectada en el proyecto).

---

## Completado

### Core
- [x] SSR con Astro v6 (output: server)
- [x] TypeScript strict mode
- [x] Tailwind CSS v4 (Vite plugin)
- [x] Google Fonts (Poppins) + Material Icons
- [x] Vercel Analytics

### Catálogo
- [x] Listado de hoteles con fetch SSR paginado (8 en 8)
- [x] Página de detalle de hotel con galería, tabs, calendario, mapa
- [x] Listado de tours
- [x] Página de detalle de tour
- [x] Página de destinos

### Pagos (Openpay)
- [x] 6 métodos de pago: tarjeta, tiendas, BBVA, SPEI, ventanilla, OXXO
- [x] Proxy server-side para Openpay (cargo + check)
- [x] Modal de verificación de pago en homepage

### Panel Administrativo
- [x] Login con Firebase Auth (Google para clientes, email/contraseña para admin)
- [x] Dashboard con tabs (Inicio, Equipo, Multimedia, Configuración)
- [x] Vista de leads/cotizaciones recientes
- [x] CRUD de equipo con drag & drop, paginación, búsqueda
- [x] Explorador de Firebase Storage (navegación, subida, borrado)
- [x] Configuración global (nombre, logo, WhatsApp, maintenance)

### UI/UX
- [x] Hero slider con GSAP
- [x] Cintas promocionales automáticas (Hot Sale, Mundial 2026)
- [x] Encuesta en tiempo real (Firestore onSnapshot)
- [x] "Vistos recientemente" con localStorage
- [x] Calendario de reserva con envío a WhatsApp
- [x] Galería de imágenes con LightGallery
- [x] Google Maps integrado (iframe)
- [x] Timeline interactiva
- [x] Mapa de México
- [x] Facebook Reel embebido

### SEO
- [x] astro-seo para meta tags
- [x] Sitemap automático
- [x] robots.txt dinámico
- [x] Página 404

### Infraestructura
- [x] Middleware de modo mantenimiento con caché 30s
- [x] Página de mantenimiento (HTTP 503, Retry-After)
- [x] Despliegue en Vercel (serverless)

### Páginas estáticas
- [x] Términos y condiciones
- [x] Aviso de privacidad
- [x] Quiénes somos / equipo
- [x] Convenios corporativos
- [x] Recomendaciones
- [x] XoloRuta

---

## No detectado / Pendiente

Las siguientes áreas no tienen implementación detectable en el código:

- [ ] Testing automatizado (unit, integration, e2e)
- [ ] Linting / formato (ESLint, Prettier)
- [ ] CI/CD pipeline
- [ ] PWA / Service Worker
- [ ] i18n / internacionalización
- [ ] Modo offline
- [ ] Caché server-side (CDN, ISR)
- [ ] Registro de usuarios (solo login admin)
- [ ] Recuperación de contraseña
- [ ] Roles y permisos de admin
- [ ] Rate limiting en API endpoints
- [ ] Logging / monitoreo
- [ ] Storybook / documentación de componentes
- [ ] Modo oscuro
