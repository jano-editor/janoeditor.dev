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

        <!-- Live publish log -->
        <div v-if="publishSteps.length > 0" class="mt-4 space-y-1 text-sm font-mono">
          <div v-for="step in publishSteps" :key="step.step" class="flex items-center gap-2">
            <span v-if="step.status === 'running'" class="text-jano-400"> ● </span>
            <span v-else-if="step.status === 'done'" class="text-green-400"> ✓ </span>
            <span v-else class="text-red-400"> ✗ </span>
            <span :class="step.status === 'error' ? 'text-red-400' : 'text-charcoal-300'">
              {{ stepLabels[step.step] || step.step }}
            </span>
            <span v-if="step.message" class="text-charcoal-500"> — {{ step.message }} </span>
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
        <NuxtLink
          v-for="plugin in filteredPlugins"
          :key="plugin.name"
          :to="`/plugins/${plugin.name}`"
          class="block p-5 rounded-xl bg-charcoal-900 border border-charcoal-800 hover:border-jano-600 transition-colors"
        >
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
            </div>
          </div>
        </NuxtLink>
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
    (p: any) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.extensions.some((e: string) => e.toLowerCase().includes(q)),
  );
});

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
            await refresh();
          } else {
            // update existing step or add new
            const idx = publishSteps.value.findIndex((s) => s.step === data.step);
            if (idx >= 0) {
              publishSteps.value[idx] = data;
            } else {
              publishSteps.value.push(data);
            }
          }
        } catch {
          // ignore parse errors
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
