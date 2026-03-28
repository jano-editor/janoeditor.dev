<template>
  <div class="min-h-screen bg-charcoal-950 text-charcoal-50">
    <div class="max-w-4xl mx-auto px-6 py-20">
      <div class="text-center space-y-6">
        <img src="/images/logo_180-180.png" alt="jano" class="w-24 h-24 mx-auto rounded-2xl" />
        <h1 class="text-6xl font-bold">
          <span class="text-jano-500">jano</span>
        </h1>
        <p class="text-xl text-charcoal-400">
          {{ $t("hero.tagline") }}
        </p>
        <p class="text-charcoal-500">
          {{ $t("hero.subtitle") }}
        </p>

        <!-- Install commands -->
        <div class="pt-8 space-y-3 max-w-lg mx-auto">
          <div class="flex gap-2">
            <button
              v-for="tab in ['Linux/Mac', 'Windows']"
              :key="tab"
              class="px-4 py-1.5 rounded-lg text-sm transition-colors"
              :class="
                activeTab === tab
                  ? 'bg-jano-600 text-white'
                  : 'bg-charcoal-800 text-charcoal-400 hover:bg-charcoal-700'
              "
              @click="activeTab = tab"
            >
              {{ tab }}
            </button>
          </div>

          <div
            class="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 font-mono text-sm text-left flex items-center justify-between"
          >
            <code class="text-jano-400">{{ installCommand }}</code>
            <button
              class="text-charcoal-500 hover:text-charcoal-300 ml-3 shrink-0"
              @click="copyInstall"
            >
              {{ copied ? "✓" : "⎘" }}
            </button>
          </div>
        </div>

        <div class="flex justify-center gap-4 pt-4">
          <UButton size="lg" color="plum" variant="outline" to="/plugins">
            {{ $t("hero.pluginStore") }}
          </UButton>
        </div>
      </div>

      <div class="mt-24 grid grid-cols-3 gap-8">
        <div class="p-6 rounded-xl bg-charcoal-900 border border-charcoal-800">
          <h3 class="text-lg font-semibold text-jano-400 mb-2">
            {{ $t("features.plugins.title") }}
          </h3>
          <p class="text-sm text-charcoal-400">
            {{ $t("features.plugins.description") }}
          </p>
        </div>
        <div class="p-6 rounded-xl bg-charcoal-900 border border-charcoal-800">
          <h3 class="text-lg font-semibold text-plum-400 mb-2">
            {{ $t("features.multiCursor.title") }}
          </h3>
          <p class="text-sm text-charcoal-400">
            {{ $t("features.multiCursor.description") }}
          </p>
        </div>
        <div class="p-6 rounded-xl bg-charcoal-900 border border-charcoal-800">
          <h3 class="text-lg font-semibold text-jano-400 mb-2">
            {{ $t("features.shortcuts.title") }}
          </h3>
          <p class="text-sm text-charcoal-400">
            {{ $t("features.shortcuts.description") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const activeTab = ref("Linux/Mac");
const copied = ref(false);

const installCommand = computed(() =>
  activeTab.value === "Windows"
    ? "irm https://janoeditor.dev/install.ps1 | iex"
    : "curl -fsSL https://janoeditor.dev/install.sh | bash",
);

function copyInstall() {
  void navigator.clipboard.writeText(installCommand.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>
