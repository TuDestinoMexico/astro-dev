import {defineConfig} from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import vue from "@astrojs/vue";

import icon from "astro-icon";

import react from "@astrojs/react";

import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  vite: {
      plugins: [tailwindcss()],
  },

  integrations: [vue(), icon(), react()],

  adapter: netlify(),
});