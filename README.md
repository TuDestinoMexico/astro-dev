# ✈️ Tu Destino MX - Plataforma Web

Plataforma web moderna, rápida y orientada a la conversión para la agencia de viajes **Tu Destino MX**. Construida con arquitectura **SSR** (Server-Side Rendering) y **SSG** (Static Site Generation) para garantizar el mejor SEO y rendimiento, combinada con islas interactivas de React para una experiencia de usuario premium.

## 🚀 Tecnologías Principales (Stack)

* **Framework Core:** [Astro](https://astro.build/) (Renderizado rápido e Islas)
* **Componentes UI:** [React](https://reactjs.org/)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Animaciones:** [GSAP](https://gsap.com/) (`@gsap/react`)
* **Iconografía:** [Lucide React](https://lucide.dev/) y [Astro Icon](https://github.com/natemoo-re/astro-icon)

## ✨ Funcionalidades Destacadas

* **Páginas Dinámicas (Hoteles y Tours):** Consumo de REST API (`api.tudestinomx.com`) desde el servidor de Astro para generar vistas SEO-friendly de manera instantánea.
* **Historial "Vistos Recientemente":** Sistema de almacenamiento en `localStorage` que guarda la navegación del usuario sin comprometer el rendimiento del servidor, mostrando tarjetas cinemáticas de los últimos destinos visitados.
* **Sliders Premium:** Carruseles automatizados (Autoplay) con animaciones de entrada, escalado y transiciones fluidas controladas por GSAP.
* **Marketing Automatizado (Ribbons):** Cintas promocionales en el Header (Hot Sale, Mundial 2026) que reaccionan de forma autónoma a la fecha del sistema, alternando entre contadores regresivos y botones de acción (WhatsApp).
* **Diseño orientado a Conversión:** Integración profunda con enlaces pre-generados de WhatsApp, botones flotantes adaptativos y copiado al portapapeles con redirección automática (Ej. Verificación de SECTUR).

## 📁 Estructura del Proyecto

```text
/
├── public/                 # Assets estáticos (imágenes, favicons)
├── src/
│   ├── components/         # Componentes modulares
│   │   ├── layout/         # Header, Footer, Ribbons promocionales
│   │   └── ui/             # Tarjetas, Sliders, Vistos Recientemente (React)
│   ├── layouts/            # Plantillas base de las páginas (Layout.astro)
│   └── pages/              # Rutas de la aplicación (index, /hotel/[slug], /tour/[slug])
├── astro.config.mjs        # Configuración de Astro e integraciones
├── tailwind.config.cjs     # Configuración de diseño y clases
└── package.json            # Dependencias y scripts
