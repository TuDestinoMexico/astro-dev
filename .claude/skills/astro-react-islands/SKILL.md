---
name: astro-react-islands
description: Convenciones de componentes Astro y React (islas) de tdmx-astro, incluidas directivas client:*, estilos Tailwind, nombrado y estructura de carpetas. Usar al crear o modificar componentes .astro, .tsx o .jsx, páginas, layouts o al decidir una directiva de carga.
---

# Astro + React islands

Fuente completa: `docs/ui.md` y `docs/architecture.md`. Las reglas de `AGENTS.md` tienen prioridad.

## Componentes

- `.astro`: layouts, páginas y shells estáticos. Usar `interface Props {}` en el frontmatter. `<style>` scoped solo si Tailwind no alcanza.
- `.tsx` / `.jsx`: solo para interactividad en el cliente. Usar `export default function` y hooks (`useState`, `useEffect`, `useRef`, `useMemo`).
- Nombrado: PascalCase para componentes y kebab-case para páginas (`terminos-condiciones.astro`).
- Variables en camelCase. Carpetas descriptivas en inglés (`layout/`, `payments/`, `ui/admin/`).
- No refactorizar componentes funcionales a clases ni al revés.

## Estilos

- Tailwind v4 con el plugin de Vite. Usar utility classes.
- Prohibido: CSS modules, styled-components y archivos `.css` sueltos. Solo se permite `global.css`.
- No cambiar la configuración de Tailwind ni migrar a v3.

## Directivas de carga

- Preferir `client:visible` o `client:idle` sobre `client:load`.
- `client:only="react"` para componentes que dependan del navegador: GSAP, portales o APIs inexistentes en SSR. Ejemplos: `BookingCalendar`, `LoginForm`, `DashboardLayout`, `PaymentMethods`, `WelcomeModal`, `EventsHeroSlider`.
- `client:idle` para `FavoriteButton` dentro de `Card.astro`.

## Patrones de UI

- Data fetching en Astro: `fetch()` en el frontmatter. En React: `fetch()` a rutas propias o SDK de Firebase directo.
- Para datos recurrentes (header, footer, config), usar `fetch` en el frontmatter del layout.
- `ClientTopbar.jsx`: los botones usan `flex-col items-start justify-between space-y-1.5`. Colores: Mis Reservas indigo-600, Mis Ofertas emerald-600, Mis Pagos amber-600, Mis Favoritos rose-600, Mi Cuenta purple-800. Los iconos de las cuatro primeras son ocultos en mobile y visibles en `xl:flex`. El dropdown se cierra con click fuera.
- Revisar `Header.astro` y `Footer.astro` si se modifica el layout global.

## Qué no hacer

- No crear archivos `.md` fuera de `/docs`.
- No agregar un linter ni un framework de tests sin instrucción explícita.
