<script setup lang="ts">
// One plugin: install command, facts, the README (sanitized on the server) and all versions.
// The owner can delete single versions or the whole plugin from here.

const route = useRoute();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const { isLoggedIn, user } = useAuth();

const name = computed(() => String(route.params.name));

const { data: plugin, refresh } = await useFetch(() => `/api/plugins/${name.value}`);
if (!plugin.value) {
  throw createError({ statusCode: 404, statusMessage: "Plugin not found", fatal: true });
}

useSeoMeta({
  title: () => `${plugin.value?.name ?? name.value} · jano plugins`,
  description: () => plugin.value?.description,
});

const isOfficial = computed(() =>
  plugin.value?.repoUrl.startsWith("https://github.com/jano-editor/"),
);
const isOwner = computed(() => isLoggedIn.value && user.value?.id === plugin.value?.publishedBy);
const repoLabel = computed(() => plugin.value?.repoUrl.replace("https://github.com/", "") ?? "");

function date(iso: string) {
  return new Date(iso).toLocaleDateString(locale.value === "de" ? "de-DE" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const { copied, failed, copy } = useCopy();
function copyLabel(text: string, idle: string) {
  if (copied.value === text) return t("hero.copied");
  if (failed.value === text) return t("hero.copyFailed");
  return idle;
}
const installCommand = computed(() => `jano plugin install ${name.value}`);

async function deleteVersion(version: string) {
  if (!confirm(t("pluginStore.confirmDeleteVersion", { version }))) return;
  await $fetch(`/api/plugins/${name.value}/delete`, { method: "POST", body: { version } });
  await refresh();
}

async function deletePlugin() {
  if (!confirm(t("pluginStore.confirmDeletePlugin"))) return;
  await $fetch(`/api/plugins/${name.value}/delete`, { method: "POST" });
  await navigateTo(localePath("/plugins"));
}
</script>

<template>
  <div v-if="plugin" class="plugin">
    <NuxtLink :to="localePath('/plugins')" class="back">← {{ $t("pluginStore.title") }}</NuxtLink>

    <header class="head">
      <h1 class="title">
        {{ plugin.name }}
        <span v-if="isOfficial" class="official">official</span>
      </h1>
      <p class="lead">{{ plugin.description }}</p>
    </header>

    <div class="install">
      <span class="prompt" aria-hidden="true">$</span>
      <code class="cmd">{{ installCommand }}</code>
      <button class="copy" @click="copy(installCommand)">
        {{ copyLabel(installCommand, $t("hero.copy")) }}
      </button>
    </div>

    <div class="layout">
      <article class="readme">
        <!-- sanitized on the server (server/utils/readme.ts): no raw HTML, safe links, proxied images -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="plugin.readmeHtml" class="prose" v-html="plugin.readmeHtml" />
        <p v-else class="no-readme">{{ $t("pluginStore.noReadme") }}</p>
      </article>

      <aside class="facts">
        <dl>
          <dt>{{ $t("pluginStore.version") }}</dt>
          <dd class="mono">v{{ plugin.latestVersion }}</dd>
          <dt>{{ $t("pluginStore.files") }}</dt>
          <dd class="mono">{{ plugin.extensions.join(" ") }}</dd>
          <dt>{{ $t("pluginStore.author") }}</dt>
          <dd>{{ plugin.author }}</dd>
          <template v-if="plugin.license">
            <dt>{{ $t("pluginStore.license") }}</dt>
            <dd>{{ plugin.license }}</dd>
          </template>
          <dt>{{ $t("pluginStore.repository") }}</dt>
          <dd>
            <a :href="plugin.repoUrl" target="_blank" rel="noopener" class="link">{{
              repoLabel
            }}</a>
          </dd>
          <dt>{{ $t("pluginStore.downloadsLabel") }}</dt>
          <dd class="mono">{{ plugin.totalDownloads }}</dd>
          <dt>{{ $t("pluginStore.api") }}</dt>
          <dd class="mono">v{{ plugin.apiVersion }}</dd>
          <dt>{{ $t("pluginStore.updated") }}</dt>
          <dd>{{ date(plugin.updatedAt) }}</dd>
        </dl>

        <h2 class="facts-title">{{ $t("pluginStore.versions") }}</h2>
        <ul class="versions">
          <li v-for="v in plugin.versions" :key="v.version" class="version-row">
            <span class="mono">v{{ v.version }}</span>
            <span class="muted">{{ date(v.createdAt) }}</span>
            <button
              class="text-btn"
              :title="`jano plugin install ${plugin.name}@${v.version}`"
              @click="copy(`jano plugin install ${plugin.name}@${v.version}`)"
            >
              {{
                copyLabel(
                  `jano plugin install ${plugin.name}@${v.version}`,
                  $t("pluginStore.copyInstall"),
                )
              }}
            </button>
            <button
              v-if="isOwner && plugin.versions.length > 1"
              class="text-btn danger"
              @click="deleteVersion(v.version)"
            >
              {{ $t("pluginStore.deleteVersion") }}
            </button>
          </li>
        </ul>

        <button v-if="isOwner" class="delete" @click="deletePlugin">
          {{ $t("pluginStore.deletePlugin") }}
        </button>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.plugin {
  max-width: 72rem;
  margin: 0 auto;
  padding: 3rem 1.5rem 0;
  color: var(--color-text);
}
.back {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: #8a909b;
}
.back:hover {
  color: var(--color-title);
}
.head {
  margin-top: 1.5rem;
}
.title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5ch;
  font-family: var(--font-mono);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-title);
}
.official {
  padding: 0 0.6ch;
  border: 1px solid var(--color-title);
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 0;
}
.lead {
  margin-top: 0.6rem;
  font-size: 1.1rem;
  max-width: 60ch;
}
.install {
  display: flex;
  align-items: center;
  gap: 1ch;
  max-width: 40rem;
  margin-top: 1.75rem;
  padding: 0.7rem 1.5ch;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.9rem;
}
.prompt {
  color: var(--color-cursor);
}
.cmd {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  color: #d7dae0;
}
.copy {
  color: #8a909b;
  cursor: pointer;
}
.copy:hover {
  color: var(--color-title);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18rem;
  gap: 3.5rem;
  align-items: start;
  margin-top: 3rem;
}
/* the README's own title repeats the plugin name above */
.readme :deep(.prose > h1:first-child) {
  display: none;
}
.readme :deep(.prose) {
  margin-top: 0;
}
.readme :deep(.prose h1) {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-title);
  margin-top: 2.5rem;
}
.readme :deep(.prose img) {
  display: inline-block;
  max-width: 100%;
  vertical-align: middle;
}
.no-readme {
  color: #8a909b;
}

.facts {
  position: sticky;
  top: 5rem;
  font-size: 0.9rem;
}
.facts dl {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.5rem 1.5ch;
}
.facts dt {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #8a909b;
}
.facts dd {
  overflow-wrap: anywhere;
  color: #e6e9ee;
}
.mono {
  font-family: var(--font-mono);
  font-size: 0.85rem;
}
.muted {
  color: #7d838e;
}
.link {
  color: var(--color-cursor);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.facts-title {
  margin-top: 2rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--color-line);
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-title);
}
.versions {
  margin-top: 0.5rem;
}
.version-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.2rem 1.5ch;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--color-line);
}
.text-btn {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: #8a909b;
  cursor: pointer;
}
.text-btn + .text-btn {
  margin-left: 0;
}
.text-btn:hover {
  color: var(--color-title);
}
.text-btn.danger:hover {
  color: #e06c75;
}
.delete {
  margin-top: 2rem;
  padding: 0.35rem 1.5ch;
  border: 1px solid #e06c75;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #e06c75;
  cursor: pointer;
}
.delete:hover {
  background: #e06c75;
  color: var(--color-ink);
}
.back:focus-visible,
.copy:focus-visible,
.link:focus-visible,
.text-btn:focus-visible,
.delete:focus-visible {
  outline: 2px solid var(--color-cursor);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .facts {
    position: static;
    order: -1;
  }
}
</style>
