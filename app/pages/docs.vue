<template>
  <div class="min-h-screen bg-charcoal-950 text-charcoal-50">
    <div class="hero-bg">
      <div class="max-w-3xl mx-auto px-6 pt-20 pb-10">
        <div class="animate-fade-up">
          <h1 class="text-4xl font-extrabold tracking-tight mb-4">{{ $t("docs.title") }}</h1>
          <p class="text-charcoal-400 text-lg leading-relaxed">{{ $t("docs.intro") }}</p>

          <!-- Section tabs -->
          <div class="flex gap-2 mt-8">
            <button
              v-for="tab in ['usage', 'plugins'] as const"
              :key="tab"
              class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              :class="
                activeSection === tab
                  ? 'bg-jano-600 text-white shadow-lg shadow-jano-600/20'
                  : 'bg-charcoal-800 text-charcoal-400 hover:bg-charcoal-700 hover:text-charcoal-300'
              "
              @click="activeSection = tab"
            >
              {{ $t(`docs.tabs.${tab}`) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-6 pb-20">
      <!-- Usage Documentation -->
      <template v-if="activeSection === 'usage'">
        <!-- CLI Commands -->
        <section class="mb-14">
          <h2 class="text-xl font-bold text-charcoal-100 mb-5 flex items-center gap-3">
            <span
              class="w-8 h-8 rounded-lg bg-jano-600/10 flex items-center justify-center text-jano-400 text-sm"
            >
              <UIcon name="i-lucide-terminal" class="w-4 h-4" />
            </span>
            {{ $t("docs.cli.title") }}
          </h2>
          <div class="space-y-3">
            <div
              v-for="cmd in cliCommands"
              :key="cmd.command"
              class="flex flex-col sm:flex-row gap-1 sm:gap-4 p-4 rounded-lg bg-charcoal-900/60 border border-charcoal-800/50 sm:items-baseline"
            >
              <code
                class="text-jano-400 font-mono text-sm shrink-0 bg-jano-600/10 px-2 py-0.5 rounded"
                >{{ cmd.command }}</code
              >
              <span class="text-charcoal-400 text-sm">{{ cmd.description }}</span>
            </div>
          </div>
        </section>

        <!-- Plugin Commands -->
        <section class="mb-14">
          <h2 class="text-xl font-bold text-charcoal-100 mb-5 flex items-center gap-3">
            <span
              class="w-8 h-8 rounded-lg bg-plum-600/10 flex items-center justify-center text-plum-400 text-sm"
            >
              <UIcon name="i-lucide-puzzle" class="w-4 h-4" />
            </span>
            {{ $t("docs.pluginCli.title") }}
          </h2>
          <div class="space-y-3">
            <div
              v-for="cmd in pluginCommands"
              :key="cmd.command"
              class="flex flex-col sm:flex-row gap-1 sm:gap-4 p-4 rounded-lg bg-charcoal-900/60 border border-charcoal-800/50 sm:items-baseline"
            >
              <code
                class="text-plum-400 font-mono text-sm shrink-0 bg-plum-600/10 px-2 py-0.5 rounded"
                >{{ cmd.command }}</code
              >
              <span class="text-charcoal-400 text-sm">{{ cmd.description }}</span>
            </div>
          </div>
        </section>

        <!-- Keyboard Shortcuts -->
        <section class="mb-14">
          <h2 class="text-xl font-bold text-charcoal-100 mb-5 flex items-center gap-3">
            <span
              class="w-8 h-8 rounded-lg bg-jano-600/10 flex items-center justify-center text-jano-400 text-sm"
            >
              <UIcon name="i-lucide-keyboard" class="w-4 h-4" />
            </span>
            {{ $t("docs.shortcuts.title") }}
          </h2>

          <div v-for="group in shortcutGroups" :key="group.label" class="mb-6">
            <h3 class="text-sm font-semibold text-charcoal-300 uppercase tracking-wider mb-3">
              {{ group.label }}
            </h3>
            <div class="space-y-2">
              <div
                v-for="shortcut in group.items"
                :key="shortcut.keys"
                class="flex items-center justify-between p-3 rounded-lg bg-charcoal-900/60 border border-charcoal-800/50"
              >
                <span class="text-charcoal-400 text-sm">{{ shortcut.action }}</span>
                <kbd class="text-xs font-mono text-jano-400 bg-jano-600/10 px-2 py-1 rounded">{{
                  shortcut.keys
                }}</kbd>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- Plugin Development Documentation -->
      <template v-if="activeSection === 'plugins'">
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
              class="flex flex-col sm:flex-row gap-1 sm:gap-4 p-4 rounded-lg bg-charcoal-900/60 border border-charcoal-800/50 sm:items-baseline"
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
              class="flex flex-col sm:flex-row gap-1 sm:gap-4 p-4 rounded-lg bg-charcoal-900/60 border border-charcoal-800/50 sm:items-baseline"
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
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const activeSection = ref<"usage" | "plugins">("usage");

const cliCommands = computed(() => [
  { command: "jano", description: t("docs.cli.open") },
  { command: "jano <file>", description: t("docs.cli.openFile") },
  { command: "jano --version", description: t("docs.cli.version") },
  { command: "jano update", description: t("docs.cli.update") },
  { command: "jano --help, -h", description: t("docs.cli.help") },
]);

const pluginCommands = computed(() => [
  { command: "jano plugin install <name>", description: t("docs.pluginCli.install") },
  {
    command: "jano plugin install <name@version>",
    description: t("docs.pluginCli.installVersion"),
  },
  { command: "jano plugin remove <name>", description: t("docs.pluginCli.remove") },
  { command: "jano plugin list", description: t("docs.pluginCli.list") },
  { command: "jano plugin search", description: t("docs.pluginCli.search") },
  { command: "jano plugin search <query>", description: t("docs.pluginCli.searchQuery") },
]);

const shortcutGroups = computed(() => [
  {
    label: t("docs.shortcuts.fileOps"),
    items: [
      { keys: "Ctrl+S", action: t("docs.shortcuts.save") },
      { keys: "Ctrl+Q", action: t("docs.shortcuts.quit") },
    ],
  },
  {
    label: t("docs.shortcuts.editing"),
    items: [
      { keys: "Ctrl+Z", action: t("docs.shortcuts.undo") },
      { keys: "Ctrl+Y", action: t("docs.shortcuts.redo") },
      { keys: "Ctrl+X", action: t("docs.shortcuts.cut") },
      { keys: "Ctrl+C", action: t("docs.shortcuts.copy") },
      { keys: "Ctrl+V", action: t("docs.shortcuts.paste") },
      { keys: "Ctrl+A", action: t("docs.shortcuts.selectAll") },
    ],
  },
  {
    label: t("docs.shortcuts.navigation"),
    items: [
      { keys: "Ctrl+F", action: t("docs.shortcuts.search") },
      { keys: "Ctrl+G", action: t("docs.shortcuts.goToLine") },
      { keys: "Ctrl+Left/Right", action: t("docs.shortcuts.wordNav") },
      { keys: "Home / End", action: t("docs.shortcuts.lineNav") },
      { keys: "Page Up / Down", action: t("docs.shortcuts.pageNav") },
    ],
  },
  {
    label: t("docs.shortcuts.multiCursor"),
    items: [
      { keys: "Ctrl+Shift+Up/Down", action: t("docs.shortcuts.addCursor") },
      { keys: "Ctrl+Alt+Up/Down", action: t("docs.shortcuts.addCursorWin") },
      { keys: "Ctrl+D", action: t("docs.shortcuts.selectNext") },
      { keys: "Escape", action: t("docs.shortcuts.clearCursors") },
    ],
  },
  {
    label: t("docs.shortcuts.lines"),
    items: [
      { keys: "Alt+Up/Down", action: t("docs.shortcuts.moveLine") },
      { keys: "Ctrl+Backspace", action: t("docs.shortcuts.deleteWordBack") },
      { keys: "Ctrl+Delete", action: t("docs.shortcuts.deleteWordFwd") },
    ],
  },
  {
    label: t("docs.shortcuts.autocomplete"),
    items: [
      { keys: "Ctrl+Space", action: t("docs.shortcuts.triggerAutocomplete") },
      { keys: "Ctrl+N", action: t("docs.shortcuts.acceptAutocomplete") },
    ],
  },
  {
    label: t("docs.shortcuts.mouse"),
    items: [
      { keys: "Click", action: t("docs.shortcuts.mouseClick") },
      { keys: "Double-Click", action: t("docs.shortcuts.mouseDoubleClick") },
      { keys: "Triple-Click", action: t("docs.shortcuts.mouseTripleClick") },
      { keys: "Drag", action: t("docs.shortcuts.mouseDrag") },
      { keys: "Scroll", action: t("docs.shortcuts.mouseScroll") },
    ],
  },
  {
    label: t("docs.shortcuts.functionKeys"),
    items: [
      { keys: "F1", action: t("docs.shortcuts.help") },
      { keys: "F2", action: t("docs.shortcuts.history") },
      { keys: "F3", action: t("docs.shortcuts.format") },
      { keys: "F4", action: t("docs.shortcuts.diagnostics") },
      { keys: "F9", action: t("docs.shortcuts.settings") },
    ],
  },
]);

const hooks = computed(() => ({
  highlight: t("pluginDocs.optionalHooks.highlight"),
  highlightLine: t("pluginDocs.optionalHooks.highlightLine"),
  onKeyDown: t("pluginDocs.optionalHooks.onKeyDown"),
  onCursorAction: t("pluginDocs.optionalHooks.onCursorAction"),
  onFormat: t("pluginDocs.optionalHooks.onFormat"),
  onSave: t("pluginDocs.optionalHooks.onSave"),
  onOpen: t("pluginDocs.optionalHooks.onOpen"),
  onValidate: t("pluginDocs.optionalHooks.onValidate"),
  onComplete: t("pluginDocs.optionalHooks.onComplete"),
}));

const tipsCount = 6;
</script>
