<script setup lang="ts">
// The plugin store: every plugin as one row, searched like `jano plugin search` does it.
// Signed-in authors publish from here, the steps stream in like a build log.

const { t } = useI18n();
const localePath = useLocalePath();
const { isLoggedIn, user, login, logout } = useAuth();

useSeoMeta({ title: () => `${t("pluginStore.title")} · jano` });

const { data: plugins, refresh } = await useFetch("/api/plugins");

const search = ref("");
const filtered = computed(() => {
  const items = plugins.value ?? [];
  const q = search.value.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.extensions.some((e) => e.toLowerCase().includes(q)),
  );
});

function isOfficial(repoUrl: string) {
  return repoUrl.startsWith("https://github.com/jano-editor/");
}

// ----- publishing -----

interface PublishStep {
  step: string;
  status: "running" | "done" | "error";
  message?: string;
}

const repoUrl = ref("");
const publishing = ref(false);
const publishSteps = ref<PublishStep[]>([]);
const published = ref<string | null>(null);

const STEP_LABELS: Record<string, string> = {
  "validate-url": "Validating repository URL",
  "check-repo": "Checking repository exists",
  "fetch-manifest": "Fetching plugin.json",
  "check-version": "Checking version",
  "check-conflicts": "Checking extension conflicts",
  clone: "Cloning repository",
  security: "Security scan",
  build: "Building plugin",
  save: "Saving artifact",
  readme: "Fetching README",
  publish: "Publishing to store",
  connection: "Connection",
};

async function publishPlugin() {
  if (!repoUrl.value || publishing.value) return;
  publishing.value = true;
  publishSteps.value = [];
  published.value = null;

  try {
    const response = await fetch("/api/plugins/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl: repoUrl.value }),
    });
    const reader = response.body?.getReader();
    if (!reader) return;

    // server-sent events: one "data: {...}" line per step update
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        let data: PublishStep & { result?: { name: string } };
        try {
          data = JSON.parse(line.slice(6));
        } catch {
          continue;
        }
        if (data.step === "complete") {
          published.value = data.result?.name ?? null;
          repoUrl.value = "";
          await refresh();
          continue;
        }
        const idx = publishSteps.value.findIndex((s) => s.step === data.step);
        if (idx >= 0) publishSteps.value[idx] = data;
        else publishSteps.value.push(data);
      }
    }
  } catch (err) {
    publishSteps.value.push({
      step: "connection",
      status: "error",
      message: err instanceof Error ? err.message : "Connection failed",
    });
  } finally {
    publishing.value = false;
  }
}
</script>

<template>
  <div class="store">
    <h1 class="title">{{ $t("pluginStore.title") }}</h1>
    <p class="lead">{{ $t("pluginStore.lead") }}</p>

    <!-- search, worded like the CLI command it mirrors -->
    <label class="search">
      <span class="search-prompt" aria-hidden="true">$ jano plugin search</span>
      <input
        v-model="search"
        class="search-input"
        type="search"
        :placeholder="$t('pluginStore.searchPlaceholder')"
        :aria-label="$t('pluginStore.searchPlaceholder')"
        spellcheck="false"
        autocomplete="off"
      />
    </label>

    <ul v-if="filtered.length" class="list">
      <li v-for="p in filtered" :key="p.name">
        <NuxtLink :to="localePath(`/plugins/${p.name}`)" class="row">
          <span class="row-head">
            <span class="name">{{ p.name }}</span>
            <span class="version">v{{ p.latestVersion }}</span>
            <span v-if="isOfficial(p.repoUrl)" class="official">official</span>
          </span>
          <span class="desc">{{ p.description }}</span>
          <span class="meta">
            <span class="exts">{{ p.extensions.join(" ") }}</span>
            <span class="downloads">{{
              $t("pluginStore.downloads", { n: p.totalDownloads })
            }}</span>
          </span>
        </NuxtLink>
      </li>
    </ul>

    <p v-else-if="search" class="empty">{{ $t("pluginStore.noResults", { query: search }) }}</p>
    <p v-else class="empty">{{ $t("pluginStore.comingSoon") }}</p>

    <!-- publishing -->
    <section class="publish">
      <h2 class="section-title">{{ $t("pluginStore.publishTitle") }}</h2>
      <p class="section-text">
        {{ $t("pluginStore.publishHint") }}
        <NuxtLink :to="localePath('/docs/plugins')" class="link">{{
          $t("pluginStore.publishDocs")
        }}</NuxtLink>
      </p>

      <template v-if="isLoggedIn && user">
        <div class="account">
          <span
            >{{ $t("pluginStore.signedInAs") }} <b>{{ user.login }}</b></span
          >
          <button class="text-btn" @click="logout()">{{ $t("pluginStore.logout") }}</button>
        </div>

        <form class="publish-form" @submit.prevent="publishPlugin">
          <span class="search-prompt" aria-hidden="true">$</span>
          <input
            v-model="repoUrl"
            class="search-input"
            :placeholder="$t('pluginStore.repoPlaceholder')"
            :aria-label="$t('pluginStore.repoPlaceholder')"
            :disabled="publishing"
            spellcheck="false"
            autocomplete="off"
          />
          <button type="submit" class="btn" :disabled="publishing || !repoUrl">
            {{ publishing ? $t("pluginStore.publishing") : $t("pluginStore.publishPlugin") }}
          </button>
        </form>

        <div v-if="publishSteps.length" class="log" aria-live="polite">
          <div v-for="step in publishSteps" :key="step.step" class="log-row" :class="step.status">
            <span class="log-mark">{{
              step.status === "done" ? "✓" : step.status === "error" ? "✗" : "…"
            }}</span>
            <span>{{ STEP_LABELS[step.step] ?? step.step }}</span>
            <span v-if="step.message" class="log-msg">{{ step.message }}</span>
          </div>
          <div v-if="published" class="log-row done">
            <span class="log-mark">✓</span>
            <NuxtLink :to="localePath(`/plugins/${published}`)" class="link">{{
              $t("pluginStore.publishedLink", { name: published })
            }}</NuxtLink>
          </div>
        </div>
      </template>

      <button v-else class="btn" @click="login()">{{ $t("pluginStore.loginWithGithub") }}</button>
    </section>
  </div>
</template>

<style scoped>
.store {
  max-width: 60rem;
  margin: 0 auto;
  padding: 4rem 1.5rem 0;
  color: var(--color-text);
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
  font-size: 1.1rem;
  max-width: 60ch;
}

.search,
.publish-form {
  display: flex;
  align-items: center;
  gap: 1ch;
  margin-top: 2rem;
  padding: 0.7rem 1.5ch;
  background: #111317;
  border: 1px solid var(--color-line);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.9rem;
}
.search:focus-within,
.publish-form:focus-within {
  border-color: var(--color-cursor);
}
.search-prompt {
  flex: none;
  color: var(--color-cursor);
}
.search-input {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  color: #e6e9ee;
  font: inherit;
  caret-color: var(--color-cursor);
}
.search-input::placeholder {
  color: #5c6370;
}

.list {
  margin-top: 1.5rem;
  border-top: 1px solid var(--color-line);
}
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.25rem 2rem;
  padding: 1rem 1.5ch;
  border-bottom: 1px solid var(--color-line);
}
.row:hover,
.row:focus-visible {
  background: #3c64b4;
  outline: none;
}
.row:hover *,
.row:focus-visible * {
  color: #fff !important;
}
.row-head {
  display: flex;
  align-items: baseline;
  gap: 1.5ch;
  font-family: var(--font-mono);
}
.name {
  color: #61afef;
  font-weight: 700;
}
.version {
  color: #d19a66;
  font-size: 0.85rem;
}
.official {
  padding: 0 0.6ch;
  border: 1px solid var(--color-title);
  border-radius: 3px;
  color: var(--color-title);
  font-size: 0.7rem;
}
.desc {
  grid-column: 1;
  color: #a0a6b0;
}
.meta {
  grid-column: 2;
  grid-row: 1 / span 2;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0.2rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
}
.exts {
  color: #c8ccd4;
}
.downloads {
  color: #7d838e;
}
.empty {
  margin-top: 2rem;
  color: #8a909b;
}

.publish {
  margin-top: 5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-line);
}
.section-title {
  font-family: var(--font-mono);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-title);
}
.section-text {
  margin-top: 0.5rem;
  max-width: 65ch;
  line-height: 1.6;
}
.link {
  color: var(--color-cursor);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.account {
  display: flex;
  align-items: center;
  gap: 2ch;
  margin-top: 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
}
.account b {
  color: #e6e9ee;
}
.text-btn {
  color: #8a909b;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.text-btn:hover {
  color: var(--color-title);
}
.btn {
  flex: none;
  margin-top: 1.25rem;
  padding: 0.4rem 1.5ch;
  background: var(--color-cursor);
  color: var(--color-ink);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
}
.publish-form .btn {
  margin-top: 0;
}
.btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.log {
  margin-top: 1rem;
  padding: 0.8rem 1.5ch;
  background: #111317;
  border: 1px solid var(--color-line);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.8;
}
.log-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.5ch;
}
.log-mark {
  width: 1ch;
}
.log-row.done .log-mark {
  color: #98c379;
}
.log-row.running .log-mark {
  color: var(--color-title);
}
.log-row.error {
  color: #e06c75;
}
.log-msg {
  flex-basis: 100%;
  padding-left: 2.5ch;
  white-space: pre-wrap;
  color: #7d838e;
}
.search-input:focus-visible,
.link:focus-visible,
.text-btn:focus-visible,
.btn:focus-visible {
  outline: 2px solid var(--color-cursor);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .search-prompt {
    display: none;
  }
  .publish-form .search-prompt {
    display: inline;
  }
  .row {
    grid-template-columns: 1fr;
  }
  .meta {
    grid-column: 1;
    grid-row: auto;
    flex-direction: row;
    justify-content: flex-start;
    gap: 2ch;
  }
}
</style>
