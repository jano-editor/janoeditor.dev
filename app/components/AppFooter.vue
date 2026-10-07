<template>
  <!-- drawn like jano's status bar, on every page -->
  <footer class="footer">
    <div class="footer-inner">
      <span>jano · {{ $t("footer.license") }}</span>
      <span class="footer-mid">{{ $t("footer.madeWith") }}</span>
      <nav class="footer-links">
        <a href="https://github.com/jano-editor/jano" target="_blank" rel="noopener">GitHub</a>
        <NuxtLink :to="$localePath('/plugins')">Plugins</NuxtLink>
        <NuxtLink :to="$localePath('/docs/getting-started')">Docs</NuxtLink>
        <a href="https://fh-softdev.de/imprint" target="_blank" rel="noopener">{{
          $t("footer.imprint")
        }}</a>
        <NuxtLink :to="$localePath('/privacy')">{{ $t("footer.privacy") }}</NuxtLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 7rem;
  background: var(--color-panel);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #b4b9c3;
}
.footer-inner {
  max-width: 68rem;
  margin: 0 auto;
  padding: 0.5rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 2ch;
}
.footer-mid {
  color: #8a909b;
}
.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 2ch;
}
.footer a:hover {
  color: var(--color-title);
}
.footer a:focus-visible {
  outline: 2px solid var(--color-cursor);
  outline-offset: 2px;
}
</style>
