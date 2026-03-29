<template>
  <div class="min-h-screen bg-charcoal-950 text-charcoal-50">
    <div class="hero-bg">
      <div class="max-w-5xl mx-auto px-6 pt-20 pb-10">
        <div class="flex items-center justify-between animate-fade-up">
          <h1 class="text-4xl font-extrabold tracking-tight">
            {{ $t("pluginStore.title") }}
          </h1>

          <div v-if="isLoggedIn && user" class="flex items-center gap-4">
            <img
              :src="user.avatarUrl"
              :alt="user.login"
              class="w-8 h-8 rounded-full ring-2 ring-charcoal-700"
            />
            <span class="text-charcoal-400 text-sm">{{ user.login }}</span>
            <UButton size="sm" color="plum" variant="outline" @click="handleLogout">
              {{ $t("pluginStore.logout") }}
            </UButton>
          </div>
          <div v-else>
            <UButton size="sm" color="primary" @click="handleLogin">
              {{ $t("pluginStore.loginWithGithub") }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-6 pb-20">
      <!-- Publish -->
      <div
        v-if="isLoggedIn"
        class="mb-10 p-6 rounded-xl bg-charcoal-900/60 border border-charcoal-800/50 backdrop-blur-sm"
      >
        <form class="flex items-center gap-4" @submit.prevent="publishPlugin">
          <UInput
            v-model="repoUrl"
            :placeholder="$t('pluginStore.repoPlaceholder')"
            :disabled="publishing"
            class="flex-1"
          />
          <UButton
            type="submit"
            color="primary"
            :loading="publishing"
            class="shadow-lg shadow-jano-600/10"
          >
            {{ $t("pluginStore.publishPlugin") }}
          </UButton>
        </form>

        <p class="text-xs text-charcoal-500 mt-3">
          {{ $t("pluginStore.publishHint") }}
          <NuxtLink to="/docs" class="text-jano-400 hover:underline ml-1">
            {{ $t("nav.docs") }} →
          </NuxtLink>
        </p>

        <details class="mt-4">
          <summary
            class="text-sm text-charcoal-400 cursor-pointer hover:text-charcoal-300 transition-colors"
          >
            {{ $t("pluginStore.howItWorks") }}
          </summary>
          <ol class="mt-3 space-y-2 text-sm text-charcoal-500 list-decimal list-inside">
            <li v-for="i in 5" :key="i">
              {{ $t(`pluginStore.howItWorksSteps[${i - 1}]`) }}
            </li>
          </ol>
        </details>

        <div
          v-if="publishSteps.length > 0"
          class="mt-5 p-4 rounded-lg bg-charcoal-950/50 space-y-2 text-sm font-mono"
        >
          <div v-for="step in publishSteps" :key="step.step" class="flex items-center gap-2">
            <span v-if="step.status === 'running'" class="text-jano-400 animate-pulse">●</span>
            <span v-else-if="step.status === 'done'" class="text-green-400">✓</span>
            <span v-else class="text-red-400">✗</span>
            <span :class="step.status === 'error' ? 'text-red-400' : 'text-charcoal-300'">
              {{ stepLabels[step.step] || step.step }}
            </span>
            <span v-if="step.message" class="text-charcoal-600 whitespace-pre-wrap">{{
              step.message
            }}</span>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="mb-8">
        <UInput
          v-model="search"
          :placeholder="$t('pluginStore.searchPlaceholder')"
          size="lg"
          class="w-full"
        />
      </div>

      <!-- Plugin List -->
      <div v-if="filteredPlugins.length > 0" class="space-y-4">
        <div
          v-for="plugin in filteredPlugins"
          :key="plugin.name"
          class="glow-card rounded-xl bg-charcoal-900/60 border transition-all duration-200"
          :class="
            expanded === plugin.name
              ? 'border-jano-500/40 ring-1 ring-jano-500/10'
              : 'border-charcoal-800/50 hover:border-charcoal-700'
          "
        >
          <!-- Card header -->
          <div class="p-6 cursor-pointer" @click="toggleExpand(plugin.name)">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-semibold text-jano-400">
                  {{ plugin.name }}
                </h3>
                <p class="text-sm text-charcoal-400 mt-1">
                  {{ plugin.description }}
                </p>
                <div class="flex gap-2 mt-3">
                  <span
                    v-for="ext in plugin.extensions"
                    :key="ext"
                    class="text-xs px-2.5 py-1 rounded-md bg-charcoal-800/60 text-charcoal-300 font-mono"
                  >
                    {{ ext }}
                  </span>
                </div>
              </div>
              <div class="text-right text-sm text-charcoal-500 shrink-0 ml-6">
                <div class="font-mono text-charcoal-400">v{{ plugin.latestVersion }}</div>
                <div class="mt-1">{{ plugin.totalDownloads }} downloads</div>
                <div class="text-charcoal-600 mt-1">
                  {{ $t("pluginStore.by") }} {{ plugin.author }}
                </div>
              </div>
            </div>
          </div>

          <!-- Expanded detail -->
          <div
            v-if="expanded === plugin.name"
            class="px-6 pb-6 border-t border-charcoal-800/50 pt-5"
          >
            <!-- Install command -->
            <div
              class="mb-5 p-4 rounded-lg bg-charcoal-950/60 font-mono text-sm text-charcoal-300 flex items-center justify-between border border-charcoal-800/30"
            >
              <span class="text-jano-400">jano plugin install {{ plugin.name }}</span>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                @click.stop="copyToClipboard(`jano plugin install ${plugin.name}`)"
              >
                {{ copied === plugin.name ? "✓ Copied" : "Copy" }}
              </UButton>
            </div>

            <!-- Info -->
            <div class="grid grid-cols-2 gap-4 text-sm mb-5">
              <div v-if="plugin.repoUrl">
                <span class="text-charcoal-500">Repository: </span>
                <a :href="plugin.repoUrl" target="_blank" class="text-jano-400 hover:underline">
                  {{ plugin.repoUrl.replace("https://github.com/", "") }}
                </a>
              </div>
              <div v-if="plugin.license">
                <span class="text-charcoal-500">License: </span>
                <span class="text-charcoal-300">{{ plugin.license }}</span>
              </div>
            </div>

            <!-- README -->
            <div
              v-if="pluginDetail?.readme"
              class="mb-5 p-5 rounded-lg bg-charcoal-950/60 border border-charcoal-800/30 text-sm text-charcoal-400 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed"
            >
              {{ pluginDetail.readme }}
            </div>

            <!-- Versions -->
            <div v-if="pluginDetail?.versions?.length" class="mb-5">
              <h4 class="text-sm font-semibold text-charcoal-300 mb-3">
                {{ $t("pluginStore.versions") }}
              </h4>
              <div class="space-y-2">
                <div
                  v-for="ver in pluginDetail.versions"
                  :key="ver.version"
                  class="flex items-center justify-between p-3 rounded-lg bg-charcoal-950/60 border border-charcoal-800/30 text-sm"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-charcoal-300 font-mono">v{{ ver.version }}</span>
                    <span class="text-charcoal-600 text-xs">{{
                      new Date(ver.createdAt).toLocaleDateString()
                    }}</span>
                    <span class="text-charcoal-600 text-xs">{{ ver.downloads }} downloads</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      :title="`jano plugin install ${plugin.name}@${ver.version}`"
                      @click.stop="
                        copyToClipboard(
                          `jano plugin install ${plugin.name}@${ver.version}`,
                          `${plugin.name}@${ver.version}`,
                        )
                      "
                    >
                      {{ copied === `${plugin.name}@${ver.version}` ? "✓ Copied" : "Copy" }}
                    </UButton>
                    <UButton
                      v-if="isOwner(plugin) && pluginDetail.versions.length > 1"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      @click.stop="confirmDeleteVersion(plugin.name, ver.version)"
                    >
                      {{ $t("pluginStore.deleteVersion") }}
                    </UButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- Delete plugin button -->
            <div v-if="isOwner(plugin)" class="pt-4 border-t border-charcoal-800/50">
              <UButton
                size="sm"
                color="neutral"
                variant="outline"
                @click.stop="confirmDeletePlugin(plugin.name)"
              >
                {{ $t("pluginStore.deletePlugin") }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-24">
        <p class="text-charcoal-500 text-lg">{{ $t("pluginStore.comingSoon") }}</p>
        <NuxtLink to="/docs" class="text-jano-400 hover:underline text-sm mt-2 inline-block">
          {{ $t("nav.docs") }} →
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, user, login, logout } = useAuth();
const search = ref("");
const repoUrl = ref("");
const publishing = ref(false);
const expanded = ref<string | null>(null);
const pluginDetail = ref<any>(null);
const copied = ref<string | null>(null);

function copyToClipboard(text: string, key?: string) {
  void navigator.clipboard.writeText(text);
  copied.value = key || text.split(" ").pop() || text;
  setTimeout(() => {
    copied.value = null;
  }, 2000);
}

interface PublishStep {
  step: string;
  status: "running" | "done" | "error";
  message?: string;
}

const publishSteps = ref<PublishStep[]>([]);

const stepLabels: Record<string, string> = {
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
  complete: "Done",
};

const { data: plugins, refresh } = await useFetch("/api/plugins");

const filteredPlugins = computed(() => {
  const items = plugins.value || [];
  if (!search.value) return items;
  const q = search.value.toLowerCase();
  return items.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.extensions.some((e: string) => e.toLowerCase().includes(q)),
  );
});

function isOwner(plugin: any): boolean {
  return isLoggedIn.value && user.value?.id === plugin.publishedBy;
}

async function toggleExpand(name: string) {
  if (expanded.value === name) {
    expanded.value = null;
    pluginDetail.value = null;
    return;
  }
  expanded.value = name;
  pluginDetail.value = await $fetch(`/api/plugins/${name}`);
}

async function confirmDeletePlugin(name: string) {
  if (!confirm(`Are you sure you want to delete '${name}' and all its versions?`)) return;
  await $fetch(`/api/plugins/${name}/delete`, { method: "POST" });
  expanded.value = null;
  pluginDetail.value = null;
  await refresh();
}

async function confirmDeleteVersion(name: string, version: string) {
  if (!confirm(`Delete version ${version}?`)) return;
  await $fetch(`/api/plugins/${name}/delete`, {
    method: "POST",
    body: { version },
  });
  pluginDetail.value = await $fetch(`/api/plugins/${name}`);
  await refresh();
}

function handleLogin() {
  void login();
}

function handleLogout() {
  void logout();
}

async function publishPlugin() {
  if (!repoUrl.value || publishing.value) return;
  publishing.value = true;
  publishSteps.value = [];

  try {
    const response = await fetch("/api/plugins/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl: repoUrl.value }),
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.step === "complete") {
            repoUrl.value = "";
            expanded.value = null;
            pluginDetail.value = null;
            await refresh();
          } else {
            const idx = publishSteps.value.findIndex((s) => s.step === data.step);
            if (idx >= 0) {
              publishSteps.value[idx] = data;
            } else {
              publishSteps.value.push(data);
            }
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (err: any) {
    publishSteps.value.push({
      step: "connection",
      status: "error",
      message: err?.message || "Connection failed",
    });
  } finally {
    publishing.value = false;
  }
}
</script>
