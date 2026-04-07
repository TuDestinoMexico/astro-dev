import {defineConfig, fontProviders} from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import vue from "@astrojs/vue";

import icon from "astro-icon";

import react from "@astrojs/react";

export default defineConfig({
  output: 'server',
  vite: {
      plugins: [tailwindcss()],
  },

  experimental: {
      fonts: [
          {
              provider: fontProviders.googleicons(),
              name: "Material Icons Outlined",
              cssVariable: "--font-icons"
          },
          {
              provider: fontProviders.google(),
              name: "Poppins",
              cssVariable: "--font-poppins"
          }
      ]
  },

  integrations: [vue(), icon(), react()]
});