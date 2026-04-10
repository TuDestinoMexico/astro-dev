import {defineConfig} from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import node from '@astrojs/node';
import vue from "@astrojs/vue";
import icon from "astro-icon";
import react from "@astrojs/react";


export default defineConfig({
  output: 'server',
  vite: {
      plugins: [tailwindcss()],
  },
  integrations: [vue(), icon(), react()],
   adapter: node(
   {
         mode: 'middleware',
      }
    )
});