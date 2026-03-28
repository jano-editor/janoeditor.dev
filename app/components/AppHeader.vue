<template>
  <header
    class="fixed top-0 inset-x-0 z-40 bg-charcoal-950/80 backdrop-blur-md border-b border-charcoal-800/50"
  >
    <div class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 text-charcoal-50 hover:text-jano-400 transition-colors"
      >
        <img
          src="/images/logo_180-180.png"
          alt="jano"
          class="w-7 h-7 rounded-md"
          width="28"
          height="28"
        />
        <span class="font-semibold text-lg">jano</span>
      </NuxtLink>

      <nav class="flex items-center gap-6">
        <NuxtLink
          to="/plugins"
          class="text-sm text-charcoal-400 hover:text-charcoal-50 transition-colors"
        >
          {{ $t("nav.plugins") }}
        </NuxtLink>

        <NuxtLink
          to="/docs"
          class="text-sm text-charcoal-400 hover:text-charcoal-50 transition-colors"
        >
          {{ $t("nav.docs") }}
        </NuxtLink>

        <a
          href="https://github.com/jano-editor/jano"
          target="_blank"
          rel="noopener"
          class="text-charcoal-400 hover:text-charcoal-50 transition-colors"
        >
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
        </a>

        <UDropdownMenu :items="localeItems">
          <button class="text-lg text-charcoal-400 hover:text-charcoal-50 transition-colors">
            {{ localeFlags[locale as string] || locale }}
          </button>
        </UDropdownMenu>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { locale, setLocale, locales } = useI18n();

const localeFlags: Record<string, string> = {
  en: "\uD83C\uDDEC\uD83C\uDDE7",
  de: "\uD83C\uDDE9\uD83C\uDDEA",
};

const localeItems = computed(() =>
  (locales.value as Array<{ code: string; name: string }>)
    .filter((l) => l.code !== locale.value)
    .map((l) => ({
      label: `${localeFlags[l.code] || ""}  ${l.name}`,
      onSelect: () => setLocale(l.code as "en" | "de"),
    })),
);
</script>
