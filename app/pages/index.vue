<template>
  <div class="min-h-screen bg-charcoal-950 text-charcoal-50">
    <!-- Hero with gradient background -->
    <div class="hero-bg">
      <div class="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <div class="text-center space-y-6 animate-fade-up">
          <img
            src="/images/logo_180-180.png"
            alt="jano"
            class="w-28 h-28 mx-auto rounded-2xl glow-jano"
            width="112"
            height="112"
          />
          <h1 class="text-7xl font-extrabold tracking-tight">
            <span class="text-gradient">jano</span>
          </h1>
          <p class="text-xl text-charcoal-300 max-w-md mx-auto">
            {{ $t("hero.tagline") }}
          </p>
          <p class="text-charcoal-500 text-lg">
            {{ $t("hero.subtitle") }}
          </p>

          <!-- Install commands -->
          <ClientOnly>
            <div class="pt-10 space-y-3 max-w-xl mx-auto">
              <div class="flex gap-2 justify-center">
                <button
                  v-for="tab in ['Linux/Mac', 'Homebrew', 'Windows']"
                  :key="tab"
                  class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                  :class="
                    activeTab === tab
                      ? 'bg-jano-600 text-white shadow-lg shadow-jano-600/20'
                      : 'bg-charcoal-800 text-charcoal-400 hover:bg-charcoal-700 hover:text-charcoal-300'
                  "
                  @click="activeTab = tab"
                >
                  {{ tab }}
                </button>
              </div>

              <div
                class="p-4 rounded-xl bg-charcoal-900/80 border border-charcoal-700/50 backdrop-blur-sm font-mono text-sm text-left flex items-center justify-between"
              >
                <code class="text-jano-400">{{ installCommand }}</code>
                <button
                  class="ml-3 shrink-0 px-3 py-1 rounded-md text-sm transition-all"
                  :class="
                    copied
                      ? 'text-green-400 bg-green-400/10'
                      : 'text-charcoal-500 hover:text-charcoal-300 hover:bg-charcoal-800'
                  "
                  @click="copyInstall"
                >
                  {{ copied ? "✓ Copied!" : "Copy" }}
                </button>
              </div>
            </div>
          </ClientOnly>

          <div class="flex justify-center gap-4 pt-6">
            <UButton size="lg" color="plum" variant="outline" to="/plugins" class="px-8">
              {{ $t("hero.pluginStore") }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-6">
      <!-- Stats Bar -->
      <div class="flex justify-center -mt-2">
        <div
          class="grid grid-cols-2 sm:flex sm:items-center gap-6 sm:gap-0 px-10 py-6 rounded-2xl bg-charcoal-900/60 border border-charcoal-800/40 backdrop-blur-sm"
        >
          <template v-for="(stat, i) in stats" :key="stat.label">
            <div v-if="i > 0" class="stat-divider hidden sm:block mx-6 md:mx-10" />
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-jano-400">{{ stat.value }}</div>
              <div class="text-xs text-charcoal-500 mt-1 uppercase tracking-wider">
                {{ stat.label }}
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Video Showcases -->
      <h2 class="text-4xl font-bold text-center mt-32 mb-4">Highlights</h2>
      <p class="text-center text-charcoal-500 mb-14 max-w-md mx-auto">
        {{ $t("highlights.subtitle") }}
      </p>
      <div class="space-y-32">
        <!-- Format & Validation -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-4">
            <div
              class="inline-block px-3 py-1 rounded-full bg-jano-600/10 text-jano-400 text-xs font-medium uppercase tracking-wider"
            >
              F3 Format · F4 Diagnostics
            </div>
            <h2 class="text-4xl font-bold text-charcoal-100">
              {{ $t("features.formatValidation.title") }}
            </h2>
            <p class="text-charcoal-400 text-lg leading-relaxed">
              {{ $t("features.formatValidation.description") }}
            </p>
          </div>
          <div
            class="terminal-frame rounded-xl overflow-hidden border border-charcoal-700/50 bg-charcoal-900 cursor-pointer group"
            @click="openVideo('/videos/vid-format-validation.webm')"
          >
            <div
              class="flex items-center gap-2 px-4 py-2.5 bg-charcoal-800/80 border-b border-charcoal-700/50"
            >
              <span class="w-3 h-3 rounded-full bg-red-500/70" />
              <span class="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span class="w-3 h-3 rounded-full bg-green-500/70" />
              <span class="ml-3 text-xs text-charcoal-500 font-mono">jano - test.json</span>
            </div>
            <video autoplay loop muted playsinline preload="none" class="w-full">
              <source src="/videos/vid-format-validation.webm" type="video/webm" />
            </video>
          </div>
        </div>

        <!-- Multi-Cursor -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            class="order-2 lg:order-1 terminal-frame rounded-xl overflow-hidden border border-charcoal-700/50 bg-charcoal-900 cursor-pointer group"
            @click="openVideo('/videos/vid-multi-cursor.webm')"
          >
            <div
              class="flex items-center gap-2 px-4 py-2.5 bg-charcoal-800/80 border-b border-charcoal-700/50"
            >
              <span class="w-3 h-3 rounded-full bg-red-500/70" />
              <span class="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span class="w-3 h-3 rounded-full bg-green-500/70" />
              <span class="ml-3 text-xs text-charcoal-500 font-mono">jano - config.yaml</span>
            </div>
            <video autoplay loop muted playsinline preload="none" class="w-full">
              <source src="/videos/vid-multi-cursor.webm" type="video/webm" />
            </video>
          </div>
          <div class="order-1 lg:order-2 space-y-4">
            <div
              class="inline-block px-3 py-1 rounded-full bg-plum-600/10 text-plum-400 text-xs font-medium uppercase tracking-wider"
            >
              Ctrl+Shift+Arrow
            </div>
            <h2 class="text-4xl font-bold text-charcoal-100">
              {{ $t("features.multiCursor.title") }}
            </h2>
            <p class="text-charcoal-400 text-lg leading-relaxed">
              {{ $t("features.multiCursor.description") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Why you'll love jano -->
      <div class="mt-32">
        <h2 class="text-4xl font-bold text-center mb-4">
          {{ $t("whyJano.title") }}
        </h2>
        <p class="text-center text-charcoal-500 mb-14 max-w-md mx-auto">
          {{ $t("whyJano.subtitle") }}
        </p>
        <div class="space-y-6 max-w-3xl mx-auto">
          <div
            v-for="(fact, i) in facts"
            :key="i"
            class="flex items-start gap-5 p-6 rounded-xl bg-charcoal-900/40 border border-charcoal-800/40 hover:border-charcoal-700/60 transition-colors"
          >
            <div
              class="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              :class="i % 2 === 0 ? 'bg-jano-600/10' : 'bg-plum-600/10'"
            >
              <UIcon
                :name="factIcons[i]"
                class="w-6 h-6"
                :class="i % 2 === 0 ? 'text-jano-400' : 'text-plum-400'"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-charcoal-100 mb-1">
                {{ fact.title }}
              </h3>
              <p class="text-sm text-charcoal-400 leading-relaxed">
                {{ fact.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Why jano? Comparison -->
      <div class="mt-32">
        <h2 class="text-4xl font-bold text-center mb-4">
          {{ $t("compare.title") }}
        </h2>
        <p class="text-center text-charcoal-500 mb-14 max-w-md mx-auto">
          Terminal editors shouldn't make you choose between power and simplicity.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="editor in ['nano', 'vim', 'jano'] as const"
            :key="editor"
            class="p-8 rounded-xl border text-center transition-all duration-300"
            :class="
              editor === 'jano'
                ? 'bg-jano-950/30 border-jano-500/30 ring-1 ring-jano-500/10 glow-jano scale-105'
                : 'bg-charcoal-900/50 border-charcoal-800 opacity-70 hover:opacity-100'
            "
          >
            <h3
              class="text-3xl font-bold mb-3 font-mono"
              :class="editor === 'jano' ? 'text-gradient' : 'text-charcoal-400'"
            >
              {{ $t(`compare.${editor}.name`) }}
            </h3>
            <p
              class="text-sm font-bold mb-4 uppercase tracking-wider"
              :class="editor === 'jano' ? 'text-green-400' : 'text-red-400/60'"
            >
              {{ $t(`compare.${editor}.verdict`) }}
            </p>
            <p class="text-sm text-charcoal-400 leading-relaxed">
              {{ $t(`compare.${editor}.description`) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Support -->
    <div class="max-w-5xl mx-auto px-6 mt-32">
      <div
        class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-charcoal-900 to-charcoal-950 border border-charcoal-800/40 p-12 text-center"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-jano-600/5 to-plum-600/5 pointer-events-none"
        />
        <div class="relative">
          <h2 class="text-4xl font-bold mb-4">
            {{ $t("support.title") }}
          </h2>
          <p class="text-charcoal-400 mb-10 max-w-md mx-auto">
            {{ $t("support.subtitle") }}
          </p>
          <div
            class="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4 md:gap-6"
          >
            <a
              href="https://github.com/jano-editor/jano"
              target="_blank"
              rel="noopener"
              class="group flex items-center gap-3 px-8 py-4 rounded-xl bg-charcoal-800 border border-charcoal-700/50 hover:border-yellow-500/50 hover:bg-charcoal-800/80 transition-all"
            >
              <UIcon
                name="i-lucide-star"
                class="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform"
              />
              <div class="text-left">
                <div class="font-semibold text-charcoal-100">
                  {{ $t("support.star") }}
                </div>
                <div class="text-xs text-charcoal-500">
                  {{ $t("support.starDescription") }}
                </div>
              </div>
            </a>
            <a
              href="https://github.com/sponsors/flo0806"
              target="_blank"
              rel="noopener"
              class="group flex items-center gap-3 px-8 py-4 rounded-xl bg-charcoal-800 border border-charcoal-700/50 hover:border-jano-500/50 hover:bg-charcoal-800/80 transition-all"
            >
              <UIcon
                name="i-lucide-heart"
                class="w-6 h-6 text-jano-400 group-hover:scale-110 transition-transform"
              />
              <div class="text-left">
                <div class="font-semibold text-charcoal-100">
                  {{ $t("support.sponsor") }}
                </div>
                <div class="text-xs text-charcoal-500">
                  {{ $t("support.sponsorDescription") }}
                </div>
              </div>
            </a>
            <a
              href="https://www.buymeacoffee.com/flo0806"
              target="_blank"
              rel="noopener"
              class="group flex items-center gap-3 px-8 py-4 rounded-xl bg-charcoal-800 border border-charcoal-700/50 hover:border-plum-500/50 hover:bg-charcoal-800/80 transition-all"
            >
              <UIcon
                name="i-lucide-coffee"
                class="w-6 h-6 text-plum-400 group-hover:scale-110 transition-transform"
              />
              <div class="text-left">
                <div class="font-semibold text-charcoal-100">
                  {{ $t("support.coffee") }}
                </div>
                <div class="text-xs text-charcoal-500">
                  {{ $t("support.coffeeDescription") }}
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="border-t border-charcoal-800/30 mt-32">
      <div
        class="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-charcoal-600"
      >
        <div class="flex items-center gap-4">
          <span>{{ $t("footer.license") }}</span>
          <span class="text-charcoal-800">·</span>
          <span>{{ $t("footer.madeWith") }}</span>
        </div>
        <div class="flex items-center gap-4">
          <a
            href="https://github.com/jano-editor/jano"
            target="_blank"
            rel="noopener"
            class="hover:text-charcoal-400 transition-colors"
          >
            GitHub
          </a>
          <span class="text-charcoal-800">·</span>
          <NuxtLink to="/plugins" class="hover:text-charcoal-400 transition-colors">
            Plugins
          </NuxtLink>
          <span class="text-charcoal-800">·</span>
          <NuxtLink to="/docs" class="hover:text-charcoal-400 transition-colors"> Docs </NuxtLink>
        </div>
      </div>
    </footer>

    <!-- Video Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="modalVideo"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
          @click.self="modalVideo = null"
        >
          <div class="relative w-full max-w-5xl mx-4">
            <button
              class="absolute -top-12 right-0 text-charcoal-500 hover:text-white text-2xl transition-colors"
              @click="modalVideo = null"
            >
              ✕
            </button>
            <div
              class="terminal-frame rounded-xl overflow-hidden border border-charcoal-700/50 bg-charcoal-900"
            >
              <div
                class="flex items-center gap-2 px-4 py-2.5 bg-charcoal-800/80 border-b border-charcoal-700/50"
              >
                <span class="w-3 h-3 rounded-full bg-red-500/70" />
                <span class="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span class="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <video autoplay loop muted playsinline class="w-full">
                <source :src="modalVideo" type="video/webm" />
              </video>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const { t, tm, rt } = useI18n();

const { data: plugins } = await useAsyncData("plugins", () => $fetch("/api/plugins"));
const pluginCount = computed(() => String(plugins.value?.length || 0));

const activeTab = ref(
  import.meta.client && /Win/i.test(navigator.userAgent) ? "Windows" : "Linux/Mac",
);
const copied = ref(false);
const modalVideo = ref<string | null>(null);

const installCommands: Record<string, string> = {
  "Linux/Mac": "curl -fsSL https://janoeditor.dev/install.sh | bash",
  Homebrew: "brew tap jano-editor/jano && brew install jano",
  Windows: "irm https://janoeditor.dev/install.ps1 | iex",
};
const installCommand = computed(() => installCommands[activeTab.value]);

const factIcons = [
  "i-lucide-keyboard",
  "i-lucide-package",
  "i-lucide-puzzle",
  "i-lucide-zap",
  "i-lucide-heart",
];

const facts = computed(() =>
  (tm("whyJano.facts") as { title: unknown; description: unknown }[]).map((f) => ({
    title: rt(f.title as string),
    description: rt(f.description as string),
  })),
);

const stats = computed(() => [
  { value: t("stats.size"), label: t("stats.sizeLabel") },
  { value: t("stats.deps"), label: t("stats.depsLabel") },
  { value: pluginCount.value, label: t("stats.pluginsLabel") },
  { value: t("stats.js"), label: t("stats.jsLabel") },
  { value: t("stats.oss"), label: t("stats.ossLabel") },
]);

function openVideo(src: string) {
  modalVideo.value = src;
}

function copyInstall() {
  void navigator.clipboard.writeText(installCommand.value ?? "");
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
