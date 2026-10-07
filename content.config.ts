import { defineCollection, defineContentConfig, z } from "@nuxt/content";

// One collection per language. Files live in content/<lang>/docs/, the language is not part of
// the path, so /docs/cli and /de/docs/cli point to the same page in two languages.
const docs = (lang: string) =>
  defineCollection({
    type: "page",
    source: { include: `${lang}/docs/**/*.md`, prefix: "/docs" },
    schema: z.object({
      /** short label for the sidebar, falls back to the title */
      nav: z.string().optional(),
    }),
  });

export default defineContentConfig({
  collections: {
    docs_en: docs("en"),
    docs_de: docs("de"),
  },
});
