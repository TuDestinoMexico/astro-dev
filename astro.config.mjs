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
      priority: 0.7,
      lastmod: new Date(),
      serialize: (item) => {
        const url = item.url;
        let priority = 0.6;
        if (url === 'https://tudestinomx.com/') priority = 1.0;
        else if (url.includes('/hotel/') || url.includes('/tour/')) priority = 0.9;
        else if (url.includes('/hoteles') || url.includes('/tours') || url.includes('/destinos')) priority = 0.8;
        else if (url.includes('/nosotros') || url.includes('/recomendaciones') || url.includes('/convenios')) priority = 0.7;
        
        return {
          ...item,
          priority,
          lastmod: new Date().toISOString()
        };
      }
    })
  ],
  adapter: vercel(),
});