<template>
  <div class="landing">
    <!-- Hero: the headline next to a replayed jano session -->
    <section class="hero">
      <div class="hero-text">
        <h1 class="hero-title">{{ $t("hero.headline") }}</h1>
        <p class="hero-sub">{{ $t("hero.subtitle") }}</p>

        <ClientOnly>
          <div class="install">
            <div class="install-tabs" role="tablist">
              <button
                v-for="tab in ['Linux/Mac', 'Homebrew', 'Windows']"
                :key="tab"
                role="tab"
                :aria-selected="activeTab === tab"
                class="install-tab"
                :class="{ active: activeTab === tab }"
                @click="activeTab = tab"
              >
                {{ tab }}
              </button>
            </div>
            <div class="install-line">
              <span class="install-prompt">$</span>
              <code class="install-cmd">{{ installCommand }}</code>
              <button class="install-copy" @click="copyInstall">
                {{ copied ? $t("hero.copied") : $t("hero.copy") }}
              </button>
            </div>
          </div>
        </ClientOnly>

        <NuxtLink :to="$localePath('/plugins')" class="hero-link">{{
          $t("hero.pluginStore")
        }}</NuxtLink>
      </div>

      <JanoShowcase class="hero-demo" :scenes="scenes" :labels="sceneLabels" />
    </section>

    <div class="page">
      <!-- the numbers, as one quiet status line under the demo -->
      <p class="stats">
        <span v-for="stat in stats" :key="stat.label" class="stat"
          ><b>{{ stat.value }}</b> {{ stat.label }}</span
        >
      </p>

      <!-- features: the key you press, and what it does -->
      <section class="section">
        <h2 class="section-title">{{ $t("landing.keys.title") }}</h2>
        <p class="section-sub">{{ $t("landing.keys.subtitle") }}</p>
        <dl class="keys">
          <div v-for="item in keyItems" :key="item.title" class="keys-row">
            <dt class="keys-chips">
              <kbd v-for="k in item.keys" :key="k" class="kbd">{{ k }}</kbd>
            </dt>
            <dd>
              <span class="keys-title">{{ item.title }}</span>
              {{ item.text }}
            </dd>
          </div>
        </dl>
        <p v-if="isMac" class="mac-hint">{{ $t("landing.keys.macHint") }}</p>
      </section>

      <!-- nano / vim / jano -->
      <section class="section">
        <h2 class="section-title">{{ $t("compare.title") }}</h2>
        <div class="compare">
          <div
            v-for="editor in ['nano', 'vim', 'jano'] as const"
            :key="editor"
            class="compare-row"
            :class="{ ours: editor === 'jano' }"
          >
            <span class="compare-name">{{ $t(`compare.${editor}.name`) }}</span>
            <span class="compare-verdict">{{ $t(`compare.${editor}.verdict`) }}</span>
            <span class="compare-text">{{ $t(`compare.${editor}.description`) }}</span>
          </div>
        </div>
      </section>

      <!-- plugins, live from the registry, like `jano plugin search` prints them -->
      <section class="section">
        <h2 class="section-title">{{ $t("landing.plugins.title") }}</h2>
        <p class="section-sub">{{ $t("landing.plugins.subtitle") }}</p>
        <div class="console">
          <div><span class="prompt">$</span> jano plugin search</div>
          <div class="dim">Available plugins:</div>
          <div class="plugin-list">
            <NuxtLink
              v-for="p in pluginList"
              :key="p.name"
              :to="{ path: $localePath('/plugins'), query: { name: p.name } }"
              class="plugin-row"
            >
              <span class="plugin-name">{{ p.name }}</span>
              <span class="plugin-version">v{{ p.latestVersion }}</span>
              <span class="plugin-desc">{{ p.description }}</span>
            </NuxtLink>
          </div>
          <div class="console-gap"><span class="prompt">$</span> jano plugin install python</div>
          <div class="ok">[jano] ✓ Installed python.</div>
        </div>
        <NuxtLink :to="$localePath('/plugins')" class="link">{{
          $t("landing.plugins.store")
        }}</NuxtLink>
      </section>

      <!-- roadmap, read like git log --graph -->
      <section class="section">
        <h2 class="section-title">{{ $t("landing.roadmap.title") }}</h2>
        <p class="section-sub">{{ $t("landing.roadmap.subtitle") }}</p>
        <ol class="graph">
          <li v-for="(item, i) in roadmap" :key="i" class="graph-row" :class="item.stage">
            <span class="graph-dot" aria-hidden="true">*</span>
            <span class="graph-ref">({{ $t(`landing.roadmap.${item.stage}`) }})</span>
            <span class="graph-msg">{{ item.text }}</span>
          </li>
        </ol>
      </section>

      <!-- support -->
      <section class="section">
        <h2 class="section-title">{{ $t("support.title") }}</h2>
        <p class="section-sub">{{ $t("support.subtitle") }}</p>
        <ul class="support">
          <li v-for="s in support" :key="s.href">
            <a :href="s.href" target="_blank" rel="noopener" class="support-link">
              <span class="support-icon" aria-hidden="true">{{ s.icon }}</span>
              <span class="support-title">{{ s.title }}</span>
              <span class="support-text">{{ s.text }}</span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, tm, rt } = useI18n();

// the hero replays, built once (same frames on server and client)
const scenes = buildScenes();
const sceneLabels = computed(() => [
  t("showcase.multiCursor"),
  t("showcase.recovery"),
  t("showcase.plugins"),
  t("showcase.unicode"),
  t("showcase.projectSettings"),
  t("showcase.autocomplete"),
]);

const { data: plugins } = await useAsyncData("plugins", () => $fetch("/api/plugins"));
const pluginList = computed(() => (plugins.value ?? []).slice(0, 8));

const activeTab = ref(
  import.meta.client && /Win/i.test(navigator.userAgent) ? "Windows" : "Linux/Mac",
);
const copied = ref(false);

// on macOS jano uses Ctrl too, the terminal keeps Cmd for itself
const isMac = ref(false);
onMounted(() => {
  isMac.value = /Mac|iPhone|iPad/i.test(navigator.userAgent);
});

const installCommands: Record<string, string> = {
  "Linux/Mac": "curl -fsSL https://janoeditor.dev/install.sh | bash",
  Homebrew: "brew tap jano-editor/jano && brew install jano",
  Windows: "irm https://janoeditor.dev/install.ps1 | iex",
};
const installCommand = computed(() => installCommands[activeTab.value]);

const stats = computed(() => [
  { value: "1", label: t("landing.stats.binary") },
  { value: "0", label: t("landing.stats.setup") },
  { value: String(plugins.value?.length ?? 0), label: t("landing.stats.plugins") },
  { value: "100%", label: t("landing.stats.typescript") },
  { value: "MIT", label: t("landing.stats.license") },
]);

// the keys stay the same in every language, only the texts are translated
const KEYS = [
  ["Ctrl+S", "Ctrl+Z", "Ctrl+F"],
  ["Ctrl+D"],
  ["F3", "F4"],
  ["Ctrl+R"],
  ["F9"],
  ["F2"],
  ["F1"],
];
const keyItems = computed(() =>
  (tm("landing.keys.items") as { title: unknown; text: unknown }[]).map((item, i) => ({
    keys: KEYS[i] ?? [],
    title: rt(item.title as string),
    text: rt(item.text as string),
  })),
);

const ROADMAP_STAGES = [
  "next",
  "next",
  "next",
  "later",
  "later",
  "later",
  "later",
  "shipped",
  "shipped",
  "shipped",
  "shipped",
  "shipped",
] as const;
const roadmap = computed(() =>
  (tm("landing.roadmap.items") as unknown[]).map((text, i) => ({
    stage: ROADMAP_STAGES[i] ?? "shipped",
    text: rt(text as string),
  })),
);

const support = computed(() => [
  {
    icon: "★",
    href: "https://github.com/jano-editor/jano",
    title: t("support.star"),
    text: t("support.starDescription"),
  },
  {
    icon: "♥",
    href: "https://github.com/sponsors/flo0806",
    title: t("support.sponsor"),
    text: t("support.sponsorDescription"),
  },
  {
    icon: "☕",
    href: "https://www.buymeacoffee.com/flo0806",
    title: t("support.coffee"),
    text: t("support.coffeeDescription"),
  },
]);

function copyInstall() {
  void navigator.clipboard.writeText(installCommand.value ?? "");
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<style scoped>
.landing {
  min-height: 100vh;
}
.page {
  max-width: 68rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem 2.5ch;
  margin-top: -1.5rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #8a909b;
}
.stats b {
  color: var(--color-title);
  font-weight: 700;
}
.section {
  margin-top: 7rem;
}
.section-title {
  font-family: var(--font-mono);
  font-size: clamp(1.35rem, 2.6vw, 1.9rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-title);
}
.section-sub {
  margin-top: 0.5rem;
  max-width: 60ch;
  font-size: 1.05rem;
}
.link {
  display: inline-block;
  margin-top: 1.25rem;
  color: var(--color-cursor);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.link:focus-visible,
.plugin-row:focus-visible,
.support-link:focus-visible {
  outline: 2px solid var(--color-cursor);
  outline-offset: 2px;
}

/* keys */
.keys {
  margin-top: 2.25rem;
  border-top: 1px solid var(--color-line);
}
.keys-row {
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
  gap: 1.5rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--color-line);
  line-height: 1.6;
}
.keys-chips {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 0.4rem;
}
.kbd {
  padding: 0.05rem 0.6ch;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  background: #3c414b;
  color: #dcdcdc;
  border-bottom: 2px solid #23262d;
  border-radius: 3px;
}
.mac-hint {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #8a909b;
}
.keys-title {
  color: #e6e9ee;
  font-weight: 700;
}

/* compare */
.compare {
  margin-top: 2rem;
  font-size: 1rem;
}
.compare-row {
  display: grid;
  grid-template-columns: 6ch 14ch minmax(0, 1fr);
  gap: 1.5rem;
  padding: 0.9rem 1rem;
  border-left: 3px solid transparent;
  color: #7d838e;
}
.compare-name,
.compare-verdict {
  font-family: var(--font-mono);
  font-size: 0.9rem;
}
.compare-row.ours {
  border-color: var(--color-cursor);
  background: var(--color-panel);
  color: var(--color-text);
}
.compare-row.ours .compare-name {
  color: var(--color-title);
  font-weight: 700;
}
.compare-row.ours .compare-verdict {
  color: #98c379;
}

/* console */
.console {
  margin-top: 2rem;
  padding: 1rem 1.5ch;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.75;
  background: #111317;
  border: 1px solid var(--color-line);
  border-radius: 6px;
  overflow-x: auto;
}
.prompt {
  color: var(--color-cursor);
}
.dim {
  color: #7d838e;
}
.ok {
  color: #98c379;
}
.console-gap {
  margin-top: 0.9rem;
}
.plugin-list {
  margin-top: 0.3rem;
}
.plugin-row {
  display: grid;
  grid-template-columns: 13ch 9ch minmax(0, 1fr);
  gap: 1ch;
  padding-left: 2ch;
  color: #c8ccd4;
}
.plugin-row:hover {
  background: #3c64b4;
  color: #fff;
}
.plugin-row:hover .plugin-version,
.plugin-row:hover .plugin-desc {
  color: #fff;
}
.plugin-name {
  color: #61afef;
}
.plugin-version {
  color: #d19a66;
}
.plugin-desc {
  color: #8a909b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* roadmap */
.graph {
  margin-top: 2rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
}
.graph-row {
  position: relative;
  display: flex;
  gap: 1.5ch;
  padding: 0.35rem 0 0.35rem 3ch;
}
.graph-row::before {
  /* the vertical line of the graph */
  content: "";
  position: absolute;
  left: 0.5ch;
  top: 0;
  bottom: 0;
  border-left: 1px solid var(--color-line);
}
.graph-row:first-child::before {
  top: 50%;
}
.graph-row:last-child::before {
  bottom: 50%;
}
.graph-dot {
  position: absolute;
  left: 0;
  width: 1ch;
  text-align: center;
  background: var(--color-ink);
  color: var(--color-cursor);
}
.graph-ref {
  flex: none;
  width: 10ch;
}
.next .graph-ref {
  color: var(--color-title);
}
.later .graph-ref {
  color: #61afef;
}
.shipped .graph-ref,
.shipped .graph-dot {
  color: #5c6370;
}
.shipped .graph-msg {
  color: #7d838e;
}
.next .graph-msg,
.later .graph-msg {
  color: #e6e9ee;
}

/* support */
.support {
  margin-top: 2rem;
}
.support-link {
  display: grid;
  grid-template-columns: 2ch 14rem minmax(0, 1fr);
  gap: 1rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--color-line);
}
.support-icon {
  color: var(--color-cursor);
}
.support-title {
  color: #e6e9ee;
  font-weight: 700;
}
.support-link:hover .support-title {
  color: var(--color-title);
}

@media (max-width: 700px) {
  .section {
    margin-top: 4.5rem;
  }
  .keys-row,
  .compare-row,
  .support-link {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }
  .support-link {
    grid-template-columns: 2ch minmax(0, 1fr);
  }
  .support-text {
    grid-column: 2;
  }
  .plugin-row {
    grid-template-columns: 13ch minmax(0, 1fr);
  }
  .plugin-desc {
    display: none;
  }
}
.hero {
  max-width: 68rem;
  margin: 0 auto;
  padding: 5rem 1.5rem 4rem;
  text-align: center;
}
.hero-title {
  font-family: var(--font-mono);
  font-size: clamp(1.7rem, 4.2vw, 3.1rem);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-title);
  text-wrap: balance;
  max-width: 24ch;
  margin: 0 auto;
}
.hero-sub {
  margin-top: 1rem;
  font-size: 1.15rem;
  color: var(--color-text);
}
.install {
  margin: 2rem auto 0;
  max-width: 46rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
}
.install-tabs {
  display: flex;
  justify-content: center;
  gap: 1.5ch;
}
.install-tab {
  padding: 0.15rem 0;
  border-bottom: 2px solid transparent;
  color: #8a909b;
  cursor: pointer;
}
.install-tab.active {
  color: var(--color-title);
  border-color: var(--color-cursor);
}
.install-tab:focus-visible,
.install-copy:focus-visible,
.hero-link:focus-visible {
  outline: 2px solid var(--color-cursor);
  outline-offset: 2px;
}
.install-line {
  margin-top: 0.6rem;
  display: flex;
  align-items: center;
  gap: 1ch;
  padding: 0.7rem 1ch;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  border-radius: 6px;
}
.install-prompt {
  color: var(--color-cursor);
}
.install-cmd {
  flex: 1;
  text-align: left;
  min-width: 0;
  overflow-wrap: anywhere;
  color: #d7dae0;
}
.install-copy {
  color: #8a909b;
  cursor: pointer;
}
.install-copy:hover {
  color: var(--color-title);
}
.hero-link {
  display: inline-block;
  margin-top: 1.5rem;
  color: var(--color-cursor);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.hero-demo {
  display: block;
  margin-top: 3.5rem;
  text-align: left;
  --term-size: clamp(9px, 1.35vw, 16px);
}
@media (max-width: 700px) {
  .hero {
    padding-top: 3rem;
  }
  .hero-demo {
    margin-top: 2.5rem;
    --term-size: clamp(7.5px, 2.3vw, 12px);
  }
}
</style>
