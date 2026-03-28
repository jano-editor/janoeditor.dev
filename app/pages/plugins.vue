<template>
  <div class="min-h-screen bg-charcoal-950 text-charcoal-50">
    <div class="max-w-5xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-12">
        <div class="flex items-center gap-4">
          <NuxtLink to="/">
            <img src="/images/logo_180-180.png" alt="jano" class="w-10 h-10 rounded-lg" />
          </NuxtLink>
          <h1 class="text-3xl font-bold">
            {{ $t("pluginStore.title") }}
          </h1>
        </div>

        <div v-if="isLoggedIn && user" class="flex items-center gap-4">
          <img :src="user.avatarUrl" :alt="user.login" class="w-8 h-8 rounded-full" />
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

      <!-- Publish -->
      <div v-if="isLoggedIn" class="mb-8 p-4 rounded-xl bg-charcoal-900 border border-charcoal-800">
        <form class="flex items-center gap-4" @submit.prevent="publishPlugin">
          <UInput
            v-model="repoUrl"
            :placeholder="$t('pluginStore.repoPlaceholder')"
            :disabled="publishing"
            class="flex-1"
          />
          <UButton type="submit" color="primary" :loading="publishing">
            {{ $t("pluginStore.publishPlugin") }}
          </UButton>
        </form>

        <div v-if="publishSteps.length > 0" class="mt-4 space-y-1 text-sm font-mono">
          <div v-for="step in publishSteps" :key="step.step" class="flex items-center gap-2">
            <span v-if="step.status === 'running'" class="text-jano-400">●</span>
            <span v-else-if="step.status === 'done'" class="text-green-400">✓</span>
            <span v-else class="text-red-400">✗</span>
            <span :class="step.status === 'error' ? 'text-red-400' : 'text-charcoal-300'">
              {{ stepLabels[step.step] || step.step }}
            </span>
            <span v-if="step.message" class="text-charcoal-500">— {{ step.message }}</span>
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
          class="rounded-xl bg-charcoal-900 border border-charcoal-800 transition-colors"
          :class="expanded === plugin.name ? 'border-jano-600' : 'hover:border-charcoal-700'"
        >
          <!-- Card header (always visible) -->
          <div class="p-5 cursor-pointer" @click="toggleExpand(plugin.name)">
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
                    class="text-xs px-2 py-0.5 rounded bg-charcoal-800 text-charcoal-300"
                  >
                    {{ ext }}
                  </span>
                </div>
              </div>
              <div class="text-right text-sm text-charcoal-500">
                <div>v{{ plugin.latestVersion }}</div>
                <div>{{ plugin.totalDownloads }} downloads</div>
                <div class="text-charcoal-600 mt-1">
                  {{ $t("pluginStore.by") }} {{ plugin.author }}
                </div>
              </div>
            </div>
          </div>

          <!-- Expanded detail -->
          <div v-if="expanded === plugin.name" class="px-5 pb-5 border-t border-charcoal-800 pt-4">
            <!-- Install command -->
            <div
              class="mb-4 p-3 rounded-lg bg-charcoal-950 font-mono text-sm text-charcoal-300 flex items-center justify-between"
            >
              <span>jano plugin install {{ plugin.name }}</span>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                @click.stop="copyToClipboard(`jano plugin install ${plugin.name}`)"
              >
                {{ copied === plugin.name ? "✓" : "⎘" }}
              </UButton>
            </div>

            <!-- Info -->
            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
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
              class="mb-4 p-4 rounded-lg bg-charcoal-950 text-sm text-charcoal-400 whitespace-pre-wrap max-h-60 overflow-y-auto"
            >
              {{ pluginDetail.readme }}
            </div>

            <!-- Versions -->
            <div v-if="pluginDetail?.versions?.length" class="mb-4">
              <h4 class="text-sm font-semibold text-charcoal-300 mb-2">
                {{ $t("pluginStore.versions") }}
              </h4>
              <div class="space-y-1">
                <div
                  v-for="ver in pluginDetail.versions"
                  :key="ver.version"
                  class="flex items-center justify-between p-2 rounded bg-charcoal-950 text-sm"
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
                      {{ copied === `${plugin.name}@${ver.version}` ? "✓ Copied" : "⎘ Copy" }}
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
            <div v-if="isOwner(plugin)" class="pt-3 border-t border-charcoal-800">
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

      <div v-else class="text-center text-charcoal-500 py-20">
        {{ $t("pluginStore.comingSoon") }}
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
