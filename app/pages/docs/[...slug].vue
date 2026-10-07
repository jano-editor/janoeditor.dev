<script setup lang="ts">
// One docs page: sidebar with all pages, the article, and the headings of this page on the right.
// Content comes from content/<lang>/docs/, see content.config.ts.

const route = useRoute();
const { locale } = useI18n();
const localePath = useLocalePath();

const collection = computed(() => (locale.value === "de" ? "docs_de" : "docs_en"));
// the language prefix (/de) is not part of the content path
const path = computed(() => {
  const slug = route.params.slug;
  const parts = Array.isArray(slug) ? slug : slug ? [slug] : [];
  return ["/docs", ...parts].join("/").replace(/\/$/, "");
});

const { data: page } = await useAsyncData(
  () => `docs:${collection.value}:${path.value}`,
  () => queryCollection(collection.value).path(path.value).first(),
  { watch: [collection, path] },
);
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

const { data: nav } = await useAsyncData(
  () => `docs-nav:${collection.value}`,
  () =>
    queryCollection(collection.value)
      .select("path", "title", "nav", "stem")
      .order("stem", "ASC")
      .all(),
  { watch: [collection] },
);

const { data: around } = await useAsyncData(
  () => `docs-around:${collection.value}:${path.value}`,
  () => queryCollectionItemSurroundings(collection.value, path.value, { fields: ["title"] }),
  { watch: [collection, path] },
);

const toc = computed(() => page.value?.body?.toc?.links ?? []);

useSeoMeta({
  title: () => `${page.value?.title ?? "Docs"} · jano`,
  description: () => page.value?.description,
});
</script>

<template>
  <div class="docs">
    <nav class="side" :aria-label="$t('docs.title')">
      <NuxtLink
        v-for="item in nav"
        :key="item.path"
        :to="localePath(item.path)"
        class="side-link"
        :class="{ active: item.path === path }"
        >{{ item.nav ?? item.title }}</NuxtLink
      >
    </nav>

    <article v-if="page" class="article">
      <h1 class="title">{{ page.title }}</h1>
      <p v-if="page.description" class="lead">{{ page.description }}</p>
      <ContentRenderer :value="page" :prose="false" class="prose" />

      <nav class="around">
        <NuxtLink v-if="around?.[0]" :to="localePath(around[0].path)" class="around-link">
          <span class="around-arrow">←</span>{{ around[0].title }}
        </NuxtLink>
        <span v-else />
        <NuxtLink v-if="around?.[1]" :to="localePath(around[1].path)" class="around-link next">
          {{ around[1].title }}<span class="around-arrow">→</span>
        </NuxtLink>
      </nav>
    </article>

    <aside v-if="toc.length" class="toc">
      <p class="toc-title">{{ $t("docs.onThisPage") }}</p>
      <template v-for="link in toc" :key="link.id">
        <a :href="`#${link.id}`" class="toc-link">{{ link.text }}</a>
        <a
          v-for="sub in link.children ?? []"
          :key="sub.id"
          :href="`#${sub.id}`"
          class="toc-link sub"
          >{{ sub.text }}</a
        >
      </template>
    </aside>
  </div>
</template>

<style scoped>
.docs {
  max-width: 80rem;
  margin: 0 auto;
  padding: 3rem 1.5rem 0;
  display: grid;
  grid-template-columns: 13rem minmax(0, 1fr) 12rem;
  gap: 3rem;
  align-items: start;
  color: var(--color-text);
}

/* sidebar, like a list in a jano dialog */
.side {
  position: sticky;
  top: 5rem;
  display: flex;
  flex-direction: column;
  font-family: var(--font-mono);
  font-size: 0.85rem;
}
.side-link {
  padding: 0.3rem 1ch;
  color: #8a909b;
  border-left: 2px solid var(--color-line);
}
.side-link:hover {
  color: #e6e9ee;
}
.side-link.active {
  color: #fff;
  background: #3c64b4;
  border-color: var(--color-cursor);
}

.title {
  font-family: var(--font-mono);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-title);
}
.lead {
  margin-top: 0.6rem;
  font-size: 1.15rem;
  max-width: 62ch;
}

.around {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 4rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-line);
  font-family: var(--font-mono);
  font-size: 0.85rem;
}
.around-link {
  display: inline-flex;
  align-items: center;
  gap: 1ch;
  color: #c8ccd4;
}
.around-link:hover {
  color: var(--color-title);
}
.around-arrow {
  color: var(--color-cursor);
}

.toc {
  position: sticky;
  top: 5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
}
.toc-title {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #8a909b;
  margin-bottom: 0.25rem;
}
.toc-link {
  color: #a0a6b0;
}
.toc-link.sub {
  padding-left: 1.5ch;
}
.toc-link:hover {
  color: var(--color-title);
}

.side-link:focus-visible,
.around-link:focus-visible,
.toc-link:focus-visible {
  outline: 2px solid var(--color-cursor);
  outline-offset: 2px;
}

@media (max-width: 1100px) {
  .docs {
    grid-template-columns: 12rem minmax(0, 1fr);
  }
  .toc {
    display: none;
  }
}
@media (max-width: 760px) {
  .docs {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding-top: 2rem;
  }
  .side {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .side-link {
    border-left: none;
    border-bottom: 2px solid var(--color-line);
  }
}
</style>
