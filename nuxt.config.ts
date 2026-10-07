// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/a11y",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxt/content",
    "@nuxtjs/i18n",
    "@nuxtjs/sitemap",
    "nuxt-auth-utils",
  ],

  css: ["~/assets/css/main.css"],

  content: {
    build: {
      markdown: {
        // One Dark: the same colors jano's plugins use in the terminal
        highlight: {
          theme: "one-dark-pro",
          langs: ["ts", "js", "json", "bash", "ini", "makefile", "yaml", "python", "toml"],
        },
      },
    },
  },

  // the docs start with getting started, jano's error messages link to /docs
  routeRules: {
    "/docs": { redirect: "/docs/getting-started" },
    "/de/docs": { redirect: "/de/docs/getting-started" },
  },

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
