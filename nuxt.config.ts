// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/a11y", "@nuxt/image", "@nuxt/test-utils", "@nuxt/ui", "@nuxtjs/i18n"],

  css: ["~/assets/css/main.css"],

  colorMode: {
    preference: "dark",
  },
});
