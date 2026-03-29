<script setup lang="ts">
const { locale } = useI18n();
const ogLocale = computed(() => (locale.value === "de" ? "de_DE" : "en_US"));

const description = computed(() =>
  locale.value === "de"
    ? "Ein moderner Terminal-Editor mit Plugin-Unterstützung. Open Source."
    : "A modern terminal editor with plugin support. Open source.",
);

useSeoMeta({
  title: "jano",
  ogTitle: "jano",
  description,
  ogDescription: description,
  ogImage: "https://janoeditor.dev/og-image.png",
  ogUrl: "https://janoeditor.dev",
  ogType: "website",
  ogLocale,
  twitterCard: "summary_large_image",
  twitterTitle: "jano",
  twitterDescription: description,
  twitterImage: "https://janoeditor.dev/og-image.png",
});
</script>

<template>
  <UApp>
    <AppHeader />
    <NuxtRouteAnnouncer />
    <main class="pt-14">
      <NuxtPage />
    </main>
  </UApp>
</template>
