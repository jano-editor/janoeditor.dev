<template>
  <div class="min-h-screen bg-charcoal-950 text-charcoal-50">
    <div class="hero-bg">
      <div class="max-w-3xl mx-auto px-6 pt-20 pb-10">
        <div class="animate-fade-up">
          <div
            class="inline-block px-3 py-1 rounded-full bg-jano-600/10 text-jano-400 text-xs font-medium uppercase tracking-wider mb-6"
          >
            @jano-editor/plugin-types
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight mb-4">{{ $t("pluginDocs.title") }}</h1>
          <p class="text-charcoal-400 text-lg leading-relaxed">{{ $t("pluginDocs.intro") }}</p>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-6 pb-20">
      <!-- Required Fields -->
      <section class="mb-14">
        <h2 class="text-xl font-bold text-charcoal-100 mb-5 flex items-center gap-3">
          <span
            class="w-8 h-8 rounded-lg bg-jano-600/10 flex items-center justify-center text-jano-400 text-sm"
            >1</span
          >
          {{ $t("pluginDocs.required") }}
        </h2>
        <div class="space-y-3">
          <div
            class="flex gap-4 p-4 rounded-lg bg-charcoal-900/60 border border-charcoal-800/50 items-baseline"
          >
            <code
              class="text-plum-400 font-mono text-sm shrink-0 bg-plum-600/10 px-2 py-0.5 rounded"
              >name</code
            >
            <span class="text-charcoal-400 text-sm">{{
              $t("pluginDocs.requiredFields.name")
            }}</span>
          </div>
          <div
            class="flex gap-4 p-4 rounded-lg bg-charcoal-900/60 border border-charcoal-800/50 items-baseline"
          >
            <code
              class="text-plum-400 font-mono text-sm shrink-0 bg-plum-600/10 px-2 py-0.5 rounded"
              >extensions</code
            >
            <span class="text-charcoal-400 text-sm">{{
              $t("pluginDocs.requiredFields.extensions")
            }}</span>
          </div>
        </div>
      </section>

      <!-- Optional Hooks -->
      <section class="mb-14">
        <h2 class="text-xl font-bold text-charcoal-100 mb-5 flex items-center gap-3">
          <span
            class="w-8 h-8 rounded-lg bg-jano-600/10 flex items-center justify-center text-jano-400 text-sm"
            >2</span
          >
          {{ $t("pluginDocs.optional") }}
        </h2>
        <div class="space-y-3">
          <div
            v-for="(desc, hook) in hooks"
            :key="hook"
            class="glow-card p-5 rounded-lg bg-charcoal-900/60 border border-charcoal-800/50"
          >
            <code class="text-plum-400 font-mono text-sm bg-plum-600/10 px-2 py-0.5 rounded">{{
              hook
            }}</code>
            <p class="text-sm text-charcoal-400 mt-2 leading-relaxed">{{ desc }}</p>
          </div>
        </div>
      </section>

      <!-- File Structure -->
      <section class="mb-14">
        <h2 class="text-xl font-bold text-charcoal-100 mb-5 flex items-center gap-3">
          <span
            class="w-8 h-8 rounded-lg bg-jano-600/10 flex items-center justify-center text-jano-400 text-sm"
            >3</span
          >
          {{ $t("pluginDocs.structure") }}
        </h2>
        <p class="text-charcoal-400 text-sm mb-4">{{ $t("pluginDocs.structureDesc") }}</p>
        <pre
          class="p-5 rounded-xl bg-charcoal-900/80 border border-charcoal-800/50 text-sm font-mono text-charcoal-300 overflow-x-auto leading-relaxed"
        >
my-plugin/
├── src/
│   └── index.ts        # plugin code
├── plugin.json         # manifest
├── package.json        # npm config + build script
└── README.md           # shown in plugin store</pre
        >
      </section>

      <!-- Plugin Manifest -->
      <section class="mb-14">
        <h2 class="text-xl font-bold text-charcoal-100 mb-5 flex items-center gap-3">
          <span
            class="w-8 h-8 rounded-lg bg-jano-600/10 flex items-center justify-center text-jano-400 text-sm"
            >4</span
          >
          {{ $t("pluginDocs.manifest") }}
        </h2>
        <p class="text-charcoal-400 text-sm mb-4">{{ $t("pluginDocs.manifestDesc") }}</p>
        <div class="rounded-xl overflow-hidden border border-charcoal-800/50">
          <div
            class="flex items-center gap-2 px-4 py-2 bg-charcoal-800/60 border-b border-charcoal-800/50"
          >
            <span class="text-xs text-charcoal-500 font-mono">plugin.json</span>
          </div>
          <pre
            class="p-5 bg-charcoal-900/80 text-sm font-mono text-charcoal-300 overflow-x-auto leading-relaxed"
          >
{
  "name": "my-language",
  "version": "1.0.0",
  "api": 1,
  "description": "My language support for jano",
  "extensions": [".ext"],
  "entry": "index.js",
  "author": "your-name",
  "license": "MIT"
}</pre
          >
        </div>
      </section>

      <!-- Minimal Example -->
      <section class="mb-14">
        <h2 class="text-xl font-bold text-charcoal-100 mb-5 flex items-center gap-3">
          <span
            class="w-8 h-8 rounded-lg bg-jano-600/10 flex items-center justify-center text-jano-400 text-sm"
            >5</span
          >
          {{ $t("pluginDocs.example") }}
        </h2>
        <div class="rounded-xl overflow-hidden border border-charcoal-800/50">
          <div
            class="flex items-center gap-2 px-4 py-2 bg-charcoal-800/60 border-b border-charcoal-800/50"
          >
            <span class="text-xs text-charcoal-500 font-mono">src/index.ts</span>
          </div>
          <pre
            class="p-5 bg-charcoal-900/80 text-sm font-mono text-charcoal-300 overflow-x-auto leading-relaxed"
          >
import type { LanguagePlugin } from "@jano-editor/plugin-types";

const plugin: LanguagePlugin = {
  name: "My Language",
  extensions: [".ext"],

  highlight: {
    keywords: ["if", "else", "return", "function"],
    patterns: {
      comment: /\/\/.*$/gm,
      string: /"(?:[^"\\]|\\.)*"|'[^']*'/g,
      number: /\b\d+\.?\d*\b/g,
    },
  },

  onCursorAction(ctx) {
    if (ctx.action?.type !== "newline") return null;
    const prev = ctx.lines[ctx.action.cursor.position.line - 1] || "";
    const indent = prev.match(/^(\s*)/)?.[1] || "";
    if (!indent) return null;
    const line = ctx.action.cursor.position.line;
    return {
      edits: [{ range: { start: { line, col: 0 }, end: { line, col: 0 } }, text: indent }],
      cursors: [{ position: { line, col: indent.length }, anchor: null }],
    };
  },
};

export default plugin;</pre
          >
        </div>
        <div
          class="mt-4 p-4 rounded-lg bg-jano-950/20 border border-jano-600/20 flex items-center gap-3"
        >
          <span class="text-jano-400">→</span>
          <span class="text-sm text-charcoal-400">
            {{ $t("pluginDocs.exampleRepo") }}
            <a
              href="https://github.com/jano-editor/plugin-yaml"
              target="_blank"
              rel="noopener"
              class="text-jano-400 hover:underline font-mono"
            >
              jano-editor/plugin-yaml
            </a>
          </span>
        </div>
      </section>

      <!-- Tips -->
      <section class="mb-14">
        <h2 class="text-xl font-bold text-charcoal-100 mb-5 flex items-center gap-3">
          <span class="text-jano-400 text-lg">💡</span>
          {{ $t("pluginDocs.tips") }}
        </h2>
        <div class="p-6 rounded-xl bg-charcoal-900/60 border border-charcoal-800/50 space-y-3">
          <div
            v-for="i in tipsCount"
            :key="i"
            class="text-sm text-charcoal-400 flex gap-3 leading-relaxed"
          >
            <span class="text-jano-500 shrink-0 mt-0.5">→</span>
            <span>{{ $t(`pluginDocs.tipsList[${i - 1}]`) }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const hooks = computed(() => ({
  highlight: t("pluginDocs.optionalHooks.highlight"),
  highlightLine: t("pluginDocs.optionalHooks.highlightLine"),
  onKeyDown: t("pluginDocs.optionalHooks.onKeyDown"),
  onCursorAction: t("pluginDocs.optionalHooks.onCursorAction"),
  onFormat: t("pluginDocs.optionalHooks.onFormat"),
  onSave: t("pluginDocs.optionalHooks.onSave"),
  onOpen: t("pluginDocs.optionalHooks.onOpen"),
  onValidate: t("pluginDocs.optionalHooks.onValidate"),
}));

const tipsCount = 6;
</script>
