<script setup lang="ts">
// Docs search, drawn like a jano dialog. Opens with Ctrl+K (Cmd+K) or "/".
// The sections of all docs pages are loaded once per language and searched in the browser.

const open = defineModel<boolean>("open", { default: false });

const { locale, t } = useI18n();
const localePath = useLocalePath();

interface Section {
  id: string;
  title: string;
  titles: string[];
  content: string;
  level: number;
}

const sections = ref<Section[]>([]);
let loadedFor = "";

async function load() {
  if (loadedFor === locale.value) return;
  const collection = locale.value === "de" ? "docs_de" : "docs_en";
  sections.value = (await queryCollectionSearchSections(collection)) as Section[];
  loadedFor = locale.value;
}

const query = ref("");
const selected = ref(0);
const input = ref<HTMLInputElement | null>(null);
let returnFocus: HTMLElement | null = null;

interface Hit {
  id: string;
  title: string;
  path: string;
  /** the snippet, split so the matched term can be marked without v-html */
  before: string;
  match: string;
  after: string;
}

const MAX_HITS = 8;

const hits = computed<Hit[]>(() => {
  const terms = query.value.toLowerCase().split(/\s+/).filter(Boolean);
  // no query: the pages themselves, as a table of contents
  if (terms.length === 0) {
    return sections.value
      .filter((s) => s.level === 1)
      .map((s) => ({ id: s.id, title: s.title, path: "", before: "", match: "", after: "" }));
  }

  const scored: { section: Section; score: number }[] = [];
  for (const section of sections.value) {
    const title = section.title.toLowerCase();
    const parents = section.titles.join(" ").toLowerCase();
    const content = section.content.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 10;
      else if (parents.includes(term)) score += 3;
      else if (content.includes(term)) score += 1;
      else {
        score = 0;
        break;
      }
    }
    if (score > 0) scored.push({ section, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.section.level - b.section.level)
    .slice(0, MAX_HITS)
    .map(({ section }) => ({
      id: section.id,
      title: section.title,
      path: section.titles.join(" › "),
      ...snippet(section.content, terms[0]!),
    }));
});

/** A short piece of the text around the first match. */
function snippet(text: string, term: string) {
  const at = text.toLowerCase().indexOf(term);
  if (at === -1) return { before: text.slice(0, 90), match: "", after: "" };
  const start = Math.max(0, at - 40);
  return {
    before: (start > 0 ? "…" : "") + text.slice(start, at),
    match: text.slice(at, at + term.length),
    after: text.slice(at + term.length, at + term.length + 60),
  };
}

watch(query, () => {
  selected.value = 0;
});

watch(open, async (isOpen) => {
  if (isOpen) {
    returnFocus = document.activeElement as HTMLElement | null;
    query.value = "";
    selected.value = 0;
    await nextTick();
    input.value?.focus();
    await load();
  } else {
    returnFocus?.focus();
  }
});

// switching the language while open loads the other language's sections
watch(locale, () => {
  if (open.value) void load();
});

function go(hit: Hit | undefined) {
  if (!hit) return;
  open.value = false;
  // the id is "path#heading", only the path is localized
  const [path = "", hash] = hit.id.split("#");
  void navigateTo(localePath(path) + (hash ? `#${hash}` : ""));
}

function onKey(e: KeyboardEvent) {
  if (e.key === "ArrowDown") selected.value = Math.min(selected.value + 1, hits.value.length - 1);
  else if (e.key === "ArrowUp") selected.value = Math.max(selected.value - 1, 0);
  else if (e.key === "Enter") go(hits.value[selected.value]);
  else if (e.key === "Escape") open.value = false;
  else if (e.key === "Tab") {
    // the input is the only control, keep the focus in the dialog
  } else return;
  e.preventDefault();
}

function onGlobalKey(e: KeyboardEvent) {
  if (open.value) return;
  const target = e.target as HTMLElement | null;
  const typing =
    target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
  if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) {
    e.preventDefault();
    open.value = true;
  }
}

onMounted(() => window.addEventListener("keydown", onGlobalKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onGlobalKey));

const activeId = computed(() => (hits.value[selected.value] ? `search-hit-${selected.value}` : ""));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="backdrop" @mousedown.self="open = false">
      <div class="dialog" role="dialog" aria-modal="true" :aria-label="t('search.title')">
        <div class="title">{{ t("search.title") }}</div>

        <div class="field">
          <span class="prompt" aria-hidden="true">›</span>
          <input
            ref="input"
            v-model="query"
            class="input"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="search-hits"
            :aria-expanded="hits.length > 0"
            :aria-activedescendant="activeId"
            :placeholder="t('search.placeholder')"
            spellcheck="false"
            autocomplete="off"
            @keydown="onKey"
          />
        </div>

        <ul id="search-hits" class="hits" role="listbox">
          <li
            v-for="(hit, i) in hits"
            :id="`search-hit-${i}`"
            :key="hit.id"
            role="option"
            :aria-selected="i === selected"
            class="hit"
            :class="{ active: i === selected }"
            @mousemove="selected = i"
            @click="go(hit)"
          >
            <span class="hit-title"
              ><span v-if="hit.path" class="hit-path">{{ hit.path }} › </span>{{ hit.title }}</span
            >
            <span v-if="hit.before || hit.match" class="hit-text"
              >{{ hit.before }}<mark>{{ hit.match }}</mark
              >{{ hit.after }}</span
            >
          </li>
          <li v-if="query && hits.length === 0" class="empty">
            {{ t("search.empty", { query }) }}
          </li>
        </ul>

        <div class="footer">
          ↑↓ {{ t("search.move") }} Enter {{ t("search.go") }} Esc {{ t("search.close") }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 12vh 1rem 0;
  background: rgb(10 11 14 / 0.6);
}
.dialog {
  width: min(40rem, 100%);
  background: #1e2128;
  border: 1px solid #505a69;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-text);
  overflow: hidden;
}
.title {
  padding-top: 0.4rem;
  text-align: center;
  color: var(--color-title);
}
.field {
  display: flex;
  align-items: center;
  gap: 1ch;
  margin: 0.6rem 1.5ch;
  padding: 0.5rem 1ch;
  background: #111317;
  border: 1px solid var(--color-line);
}
.field:focus-within {
  border-color: var(--color-cursor);
}
.prompt {
  color: var(--color-cursor);
}
.input {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  color: #e6e9ee;
  font: inherit;
  caret-color: var(--color-cursor);
}
.input::placeholder {
  color: #5c6370;
}
.hits {
  max-height: 55vh;
  overflow-y: auto;
}
.hit {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.45rem 1.5ch;
  cursor: pointer;
}
.hit.active {
  background: #3c64b4;
  color: #fff;
}
.hit-title {
  color: #e6e9ee;
}
.hit.active .hit-title {
  color: #fff;
}
.hit-path {
  color: #8a909b;
}
.hit.active .hit-path {
  color: #dce6f0;
}
.hit-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: #8a909b;
}
.hit.active .hit-text {
  color: #dce6f0;
}
mark {
  background: none;
  color: var(--color-title);
}
.hit.active mark {
  color: #fff;
  text-decoration: underline;
}
.empty {
  padding: 0.6rem 1.5ch;
  color: #8a909b;
}
.footer {
  padding: 0.4rem 1.5ch;
  border-top: 1px solid var(--color-line);
  color: #5c6370;
}
</style>
