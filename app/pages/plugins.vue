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
          <UButton size="sm" color="plum" variant="outline" @click="logout">
            {{ $t("pluginStore.logout") }}
          </UButton>
        </div>
        <div v-else>
          <UButton size="sm" color="primary" @click="login">
            {{ $t("pluginStore.loginWithGithub") }}
          </UButton>
        </div>
      </div>

      <!-- Publish -->
      <div v-if="isLoggedIn" class="mb-8 p-4 rounded-xl bg-charcoal-900 border border-charcoal-800">
        <form class="flex items-center gap-4" @submit.prevent="submitPlugin">
          <UInput
            v-model="repoUrl"
            :placeholder="$t('pluginStore.repoPlaceholder')"
            class="flex-1"
          />
          <UButton type="submit" color="primary" :loading="submitting">
            {{ $t("pluginStore.publishPlugin") }}
          </UButton>
        </form>
        <p
          v-if="submitMessage"
          class="mt-2 text-sm"
          :class="submitError ? 'text-red-400' : 'text-green-400'"
        >
          {{ submitMessage }}
        </p>
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
              <div>v{{ plugin.version }}</div>
              <div>{{ plugin.downloads }} downloads</div>
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
const submitting = ref(false);
const submitMessage = ref("");
const submitError = ref(false);

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

async function submitPlugin() {
  if (!repoUrl.value) return;
  submitting.value = true;
  submitMessage.value = "";
  submitError.value = false;

  try {
    const result = await $fetch("/api/plugins/submit", {
      method: "POST",
      body: { repoUrl: repoUrl.value },
    });
    submitMessage.value = `${result.status === "updated" ? "Updated" : "Published"}: ${result.name} v${result.version}`;
    repoUrl.value = "";
    await refresh();
  } catch (err: any) {
    submitError.value = true;
    submitMessage.value = err?.data?.message || "Failed to submit plugin.";
  } finally {
    submitting.value = false;
  }
}
</script>
