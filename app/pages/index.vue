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
          <div class="pt-10 space-y-3 max-w-xl mx-auto">
            <div class="flex gap-2 justify-center">
              <button
                v-for="tab in ['Linux/Mac', 'Windows']"
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
      <div class="mt-32 space-y-32">
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

      <!-- Feature Cards -->
      <div class="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="glow-card p-7 rounded-xl bg-charcoal-900/80 border border-charcoal-800 cursor-default"
        >
          <div class="w-10 h-10 rounded-lg bg-jano-600/10 flex items-center justify-center mb-4">
            <span class="text-jano-400 text-lg">⚡</span>
          </div>
          <h3 class="text-lg font-semibold text-charcoal-100 mb-2">
            {{ $t("features.plugins.title") }}
          </h3>
          <p class="text-sm text-charcoal-400 leading-relaxed">
            {{ $t("features.plugins.description") }}
          </p>
        </div>
        <div
          class="glow-card p-7 rounded-xl bg-charcoal-900/80 border border-charcoal-800 cursor-default"
        >
          <div class="w-10 h-10 rounded-lg bg-plum-600/10 flex items-center justify-center mb-4">
            <span class="text-plum-400 text-lg">🚀</span>
          </div>
          <h3 class="text-lg font-semibold text-charcoal-100 mb-2">
            {{ $t("features.performance.title") }}
          </h3>
          <p class="text-sm text-charcoal-400 leading-relaxed">
            {{ $t("features.performance.description") }}
          </p>
        </div>
        <div
          class="glow-card p-7 rounded-xl bg-charcoal-900/80 border border-charcoal-800 cursor-default"
        >
          <div class="w-10 h-10 rounded-lg bg-jano-600/10 flex items-center justify-center mb-4">
            <span class="text-jano-400 text-lg">⌨</span>
          </div>
          <h3 class="text-lg font-semibold text-charcoal-100 mb-2">
            {{ $t("features.shortcuts.title") }}
          </h3>
          <p class="text-sm text-charcoal-400 leading-relaxed">
            {{ $t("features.shortcuts.description") }}
          </p>
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
const { t } = useI18n();

const { data: plugins } = await useAsyncData("plugins", () => $fetch("/api/plugins"));
const pluginCount = computed(() => String(plugins.value?.length || 0));

const detectedTab = computed(() => {
  if (import.meta.server) return "Linux/Mac";
  const ua = navigator.userAgent;
  if (/Win/i.test(ua)) return "Windows";
  return "Linux/Mac";
});
const activeTab = ref(detectedTab.value);
onMounted(() => {
  activeTab.value = detectedTab.value;
});
const copied = ref(false);
const modalVideo = ref<string | null>(null);

const installCommand = computed(() =>
  activeTab.value === "Windows"
    ? "irm https://janoeditor.dev/install.ps1 | iex"
    : "curl -fsSL https://janoeditor.dev/install.sh | bash",
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
  void navigator.clipboard.writeText(installCommand.value);
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
