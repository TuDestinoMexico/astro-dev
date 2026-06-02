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
  integrations: [icon(), react(), sitemap()],
  adapter: vercel(),
});