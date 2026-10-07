<script setup lang="ts">
// The top bar, drawn like jano's title bar. The active section is underlined like a selected tab.

const { locale, setLocale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

// `section` is the part of the site the link stands for, it stays active on every page below it
const links = computed(() => [
  { to: localePath("/plugins"), section: localePath("/plugins"), label: "nav.plugins" },
  {
    // /docs itself is only a redirect, so link the first page directly
    to: localePath("/docs/getting-started"),
    section: localePath("/docs/getting-started").replace(/\/getting-started$/, ""),
    label: "nav.docs",
  },
]);

function isActive(section: string) {
  return route.path === section || route.path.startsWith(`${section}/`);
}

const searchOpen = ref(false);
</script>

<template>
  <header class="header">
    <div class="inner">
      <NuxtLink :to="localePath('/')" class="brand" aria-label="jano">
        <img src="/images/logo_180-180.png" alt="" class="logo" width="24" height="24" />
        <span class="brand-text">jano</span>
      </NuxtLink>

      <nav class="nav">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ active: isActive(link.section) }"
          :aria-current="isActive(link.section) ? 'page' : undefined"
          >{{ $t(link.label) }}</NuxtLink
        >

        <button class="search-btn" :aria-label="$t('search.open')" @click="searchOpen = true">
          <span class="search-label">{{ $t("search.button") }}</span>
          <kbd class="search-key">Ctrl K</kbd>
        </button>

        <a
          href="https://github.com/jano-editor/jano"
          target="_blank"
          rel="noopener"
          class="icon-link"
          aria-label="GitHub"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
        </a>

        <div class="lang" role="group" :aria-label="$t('nav.language')">
          <button
            v-for="code in ['en', 'de'] as const"
            :key="code"
            class="lang-btn"
            :class="{ active: locale === code }"
            :aria-pressed="locale === code"
            @click="setLocale(code)"
          >
            {{ code.toUpperCase() }}
          </button>
        </div>
      </nav>
    </div>

    <JanoSearch v-model:open="searchOpen" />
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 40;
  background: color-mix(in srgb, var(--color-ink) 88%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-line);
  font-family: var(--font-mono);
}
.inner {
  max-width: 80rem;
  height: 3.5rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  color: var(--color-title);
}
.logo {
  border-radius: 4px;
}
.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.85rem;
}
.nav-link {
  padding: 0.2rem 0;
  border-bottom: 2px solid transparent;
  color: #8a909b;
}
.nav-link:hover {
  color: #e6e9ee;
}
.nav-link.active {
  color: var(--color-title);
  border-color: var(--color-cursor);
}
.search-btn {
  display: flex;
  align-items: center;
  gap: 1.5ch;
  padding: 0.25rem 0.5rem 0.25rem 1ch;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  border-radius: 4px;
  color: #8a909b;
  cursor: pointer;
}
.search-btn:hover {
  color: #e6e9ee;
}
.search-key {
  padding: 0 0.5ch;
  background: #3c414b;
  color: #dcdcdc;
  font-size: 0.75rem;
}
.icon-link {
  color: #8a909b;
}
.icon-link:hover {
  color: #e6e9ee;
}
.icon {
  width: 1.25rem;
  height: 1.25rem;
}
.lang {
  display: flex;
  gap: 0.25rem;
}
.lang-btn {
  padding: 0 0.5ch;
  color: #8a909b;
  cursor: pointer;
}
.lang-btn:hover {
  color: #e6e9ee;
}
.lang-btn.active {
  background: #3c64b4;
  color: #fff;
}
.brand:focus-visible,
.nav-link:focus-visible,
.search-btn:focus-visible,
.icon-link:focus-visible,
.lang-btn:focus-visible {
  outline: 2px solid var(--color-cursor);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .inner {
    padding: 0 1rem;
  }
  .nav {
    gap: 1rem;
  }
  .search-label,
  .search-key {
    display: none;
  }
  .search-btn::before {
    content: "/";
    color: var(--color-cursor);
  }
}
/* the smallest phones (320px): GitHub is in the footer, the logo is enough as brand */
@media (max-width: 400px) {
  .nav {
    gap: 0.75rem;
  }
  .icon-link,
  .brand-text {
    display: none;
  }
}
</style>
