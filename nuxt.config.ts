// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/a11y",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxtjs/i18n",
    "@nuxtjs/sitemap",
    "nuxt-auth-utils",
  ],

  css: ["~/assets/css/main.css"],

  colorMode: {
    preference: "dark",
  },

  ui: {
    theme: {
      colors: ["jano", "plum", "charcoal"],
    },
  },

  i18n: {
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "de", name: "Deutsch", file: "de.json" },
    ],
    defaultLocale: "en",
  },
});
