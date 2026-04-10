import {defineConfig} from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import react from "@astrojs/react";


import vercel from "@astrojs/vercel";


export default defineConfig({
  output: 'server',
  vite: {
      plugins: [tailwindcss()],
  },
  integrations: [icon(), react()],
  adapter: vercel(),
});