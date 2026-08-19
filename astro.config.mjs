import {defineConfig} from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import react from "@astrojs/react";


import vercel from "@astrojs/vercel";


import sitemap from "@astrojs/sitemap";


export default defineConfig({
  site: 'https://tudestinomx.com',
  compressHTML: true,
  output: 'server',
  vite: {
      plugins: [tailwindcss()],
  },
  integrations: [
    icon(), 
    react(), 
    sitemap({
      filter: (page) => {
        const excludedPaths = ['/admin/', '/cliente/', '/api/', '/404', '/mantenimiento'];
        return !excludedPaths.some(path => page.includes(path));
      },
      changefreq: 'weekly',
      priority: (page) => {
        if (page === 'https://tudestinomx.com/') return 1.0;
        if (page.includes('/hotel/') || page.includes('/tour/')) return 0.9;
        if (page.includes('/hoteles') || page.includes('/tours') || page.includes('/destinos')) return 0.8;
        if (page.includes('/nosotros') || page.includes('/recomendaciones') || page.includes('/convenios')) return 0.7;
        return 0.6;
      },
      lastmod: new Date(),
      serialize: (item) => ({
        ...item,
        lastmod: new Date().toISOString()
      })
    })
  ],
  adapter: vercel(),
});