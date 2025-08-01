import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  devServer: {
    host: '0.0.0.0',
    port: 3001,
  },

  runtimeConfig: {
  },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxt/ui'],

  ui: {
    fonts: false
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});
