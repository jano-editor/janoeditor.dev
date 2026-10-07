<script setup lang="ts">
import { highlight, type Frame, type TokenType } from "~/utils/replay";

// Draws one frame of a replay as a jano window: title bar, gutter, code, status bar, overlays.

const props = defineProps<{ frame: Frame; rows?: number }>();

const TAB_SIZE = 4;
const rows = computed(() => props.rows ?? 10);

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Emoji and CJK take two cells in a terminal, like in jano itself. */
function isWide(g: string): boolean {
  const cp = g.codePointAt(0) ?? 0;
  if (g.includes("\uFE0F") && cp >= 0x80) return true;
  return (
    /^\p{Emoji_Presentation}/u.test(g) ||
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xff00 && cp <= 0xff60)
  );
}

interface Cell {
  text: string;
  width: number;
  type: TokenType;
  selected: boolean;
  cursor: "primary" | "extra" | null;
}

function cellsOf(lineIndex: number): Cell[] {
  const f = props.frame;
  const line = f.lines[lineIndex] ?? "";
  const cells: Cell[] = [];
  let idx = 0;
  let col = 0;

  const cursorAt = (i: number) => {
    const k = f.cursors.findIndex((c) => c.line === lineIndex && c.col === i);
    return k === -1 ? null : k === 0 ? "primary" : "extra";
  };
  const selectedAt = (i: number) =>
    f.selections.some((s) => s.line === lineIndex && i >= s.from && i < s.to);

  for (const token of highlight(line, f.lang)) {
    for (const { segment } of segmenter.segment(token.text)) {
      const width = segment === "\t" ? TAB_SIZE - (col % TAB_SIZE) : isWide(segment) ? 2 : 1;
      cells.push({
        text: segment === "\t" ? " " : segment,
        width,
        type: token.type,
        selected: selectedAt(idx),
        cursor: cursorAt(idx),
      });
      idx += segment.length;
      col += width;
    }
  }
  // a cursor at the end of the line sits on an empty cell
  const end = cursorAt(line.length);
  if (end) cells.push({ text: " ", width: 1, type: "plain", selected: false, cursor: end });
  return cells;
}

const visibleLines = computed(() =>
  Array.from({ length: rows.value }, (_, i) => (i < props.frame.lines.length ? cellsOf(i) : null)),
);

const primary = computed(() => props.frame.cursors[0] ?? { line: 0, col: 0 });

const title = computed(() => {
  const f = props.frame;
  return `${f.file}${f.langLabel ? ` [${f.langLabel}]` : ""}`;
});

// the startup animation types "jano" into the title, like the real editor
const revealLetters = computed(() => {
  const r = props.frame.reveal;
  if (r === undefined) return null;
  return "jano".split("").map((ch, i) => ({
    text: i === r - 1 ? ch.toUpperCase() : ch,
    state: i < r - 1 ? "done" : i === r - 1 ? "entering" : "hidden",
  }));
});
</script>

<template>
  <div class="term" :style="{ '--rows': rows }">
    <div class="titlebar">
      <span class="title">
        <template v-if="revealLetters">
          <span v-for="(l, i) in revealLetters" :key="i" :class="`reveal-${l.state}`">{{
            l.state === "hidden" ? " " : l.text
          }}</span
          ><span class="reveal-cursor">█</span>
        </template>
        <template v-else>jano</template>
        — {{ title }}
      </span>
    </div>

    <div class="body">
      <div v-for="(cells, i) in visibleLines" :key="i" class="row">
        <span
          class="gutter"
          :class="{ current: i === primary.line, error: frame.errors?.includes(i) }"
          >{{ cells ? String(i + 1).padStart(2, " ") : "  " }}</span
        >
        <span v-if="cells" class="code" :class="{ 'error-line': frame.errors?.includes(i) }">
          <span
            v-for="(c, k) in cells"
            :key="k"
            :class="[
              `t-${c.type}`,
              { sel: c.selected, cur: c.cursor === 'primary', xcur: c.cursor === 'extra' },
            ]"
            :style="c.width !== 1 ? { width: `${c.width}ch` } : undefined"
            >{{ c.text }}</span
          >
        </span>
      </div>

      <!-- overlays -->
      <div
        v-if="frame.overlay?.kind === 'banner'"
        class="banner"
        :class="[`tone-${frame.overlay.tone}`, frame.overlay.position]"
      >
        <span class="banner-icon">{{
          frame.overlay.tone === "warn" ? "!" : frame.overlay.tone === "error" ? "✗" : "i"
        }}</span>
        <span class="banner-text">{{ frame.overlay.text }}</span>
        <span class="banner-icon">✕</span>
      </div>

      <div v-else-if="frame.overlay?.kind === 'dialog'" class="dialog">
        <div class="dialog-title">{{ frame.overlay.title }}</div>
        <div
          v-for="(r, i) in frame.overlay.rows"
          :key="i"
          class="dialog-row"
          :class="{ active: r.active }"
        >
          <span class="dialog-mark">{{ r.mark ?? "" }}</span>
          <span class="dialog-text">{{ r.text }}</span>
          <span class="dialog-detail">{{ r.detail ?? "" }}</span>
        </div>
        <div v-if="frame.overlay.progress !== undefined" class="progress">
          <span class="progress-fill" :style="{ width: `${frame.overlay.progress * 100}%` }" />
        </div>
        <div v-if="frame.overlay.footer" class="dialog-footer">{{ frame.overlay.footer }}</div>
      </div>

      <div
        v-else-if="frame.overlay?.kind === 'popup'"
        class="popup"
        :style="{
          top: `calc(${primary.line + 1} * var(--lh))`,
          left: `calc(${primary.col + 3}ch)`,
        }"
      >
        <div
          v-for="(item, i) in frame.overlay.items"
          :key="i"
          class="popup-item"
          :class="{ active: i === frame.overlay.selected }"
        >
          <span class="popup-icon">{{ item.icon }}</span
          >{{ item.label }}
        </div>
      </div>

      <div v-else-if="frame.overlay?.kind === 'shell'" class="shell">
        <div v-for="(l, i) in frame.overlay.lines" :key="i">{{ l }}</div>
      </div>

      <span v-if="frame.key" :key="frame.key + frame.duration" class="keycast">{{
        frame.key
      }}</span>
    </div>

    <div class="statusbar">
      <span>Ln {{ primary.line + 1 }}, Col {{ primary.col + 1 }}</span>
      <span class="status-center" :class="{ dirty: frame.dirty }"
        >{{ frame.lines.length }} lines{{ frame.status ?? "" }}{{ frame.dirty ? " ●" : "" }}</span
      >
      <span>{{ frame.cursors.length > 1 ? `${frame.cursors.length} cursors` : "" }}</span>
    </div>
  </div>
</template>

<style scoped>
.term {
  --lh: 1.55em;
  font-family: var(--font-mono);
  font-size: var(--term-size, 13px);
  color: #abb2bf;
  background: #1b1e24;
  border: 1px solid #373c46;
  border-radius: 6px;
  overflow: hidden;
  white-space: pre;
  line-height: var(--lh);
}

.titlebar {
  position: relative;
  height: var(--lh);
  border-bottom: 1px solid #373c46;
  text-align: center;
}
.title {
  color: #e6c864;
  padding: 0 0.6ch;
}
.reveal-done {
  color: #e6c864;
}
.reveal-entering {
  color: #d250ef;
}
.reveal-hidden {
  color: transparent;
}
.reveal-cursor {
  color: #d250ef;
}

.body {
  position: relative;
  /* extra room below the code, so dialogs have space around them */
  height: calc(var(--rows) * var(--lh) + 80px);
  padding: 0.25em 0;
}
.row {
  display: flex;
  height: var(--lh);
}
.gutter {
  flex: none;
  width: 4ch;
  padding-right: 1ch;
  text-align: right;
  color: #464b55;
}
.gutter.current {
  color: #b4b9c3;
}
.gutter.error {
  color: #ff5050;
}
.code span {
  display: inline-block;
}
.error-line {
  background: #3c1414;
}
.t-keyword {
  color: #c678dd;
}
.t-string {
  color: #98c379;
}
.t-comment {
  color: #5c6370;
}
.t-number,
.t-constant {
  color: #d19a66;
}
.t-type {
  color: #e5c07b;
}
.t-function {
  color: #61afef;
}
.t-property {
  color: #e06c75;
}
.sel {
  background: #3c64b4;
  color: #fff !important;
}
.cur {
  background: #d250ef;
  color: #1b1e24 !important;
  animation: blink 1.1s steps(1) infinite;
}
.xcur {
  background: #c8c8c8;
  color: #000 !important;
}
@keyframes blink {
  50% {
    background: transparent;
    color: inherit;
  }
}

.banner {
  position: absolute;
  left: 8%;
  right: 8%;
  display: flex;
  align-items: center;
  height: var(--lh);
}
.banner.top {
  top: 0.25em;
}
.banner.bottom {
  bottom: 0.25em;
}
.banner-text {
  flex: 1;
  padding: 0 1ch;
  overflow: hidden;
  text-overflow: ellipsis;
}
.banner-icon {
  padding: 0 1ch;
}
.tone-warn .banner-text {
  background: #5a4614;
  color: #faf0d2;
}
.tone-warn .banner-icon {
  background: #dcb43c;
  color: #1b1e24;
}
.tone-info .banner-text {
  background: #283c5a;
  color: #dce6f0;
}
.tone-info .banner-icon {
  background: #508cc8;
  color: #1b1e24;
}
.tone-error .banner-text {
  background: #5a1e1e;
  color: #fadcdc;
}
.tone-error .banner-icon {
  background: #dc5050;
  color: #1b1e24;
}

.dialog {
  position: absolute;
  top: 0.6em;
  left: 50%;
  transform: translateX(-50%);
  width: min(52ch, 92%);
  background: #1e2128;
  border: 1px solid #505a69;
  border-radius: 6px;
  padding: 0 0 0.3em;
}
.dialog-title {
  text-align: center;
  color: #e6c864;
  margin-bottom: 0.2em;
}
.dialog-row {
  display: flex;
  gap: 1ch;
  padding: 0 1.5ch;
}
.dialog-row.active {
  background: #3c64b4;
  color: #fff;
}
.dialog-mark {
  width: 3ch;
  flex: none;
}
.dialog-text {
  flex: none;
  min-width: 11ch;
}
.dialog-detail {
  overflow: hidden;
  text-overflow: ellipsis;
  color: #646973;
}
.dialog-row.active .dialog-detail {
  color: #fff;
}
.dialog-footer {
  padding: 0.2em 1.5ch 0;
  color: #464b55;
}
.progress {
  margin: 0.4em 1.5ch 0;
  height: 0.7em;
  background: #3c4048;
}
.progress-fill {
  display: block;
  height: 100%;
  background: #d250ef;
  transition: width 0.25s;
}

.popup {
  position: absolute;
  min-width: 18ch;
  background: #23262d;
  border: 1px solid #3c4148;
}
.popup-item {
  padding: 0 1ch;
}
.popup-item.active {
  background: #3c64b4;
  color: #fff;
}
.popup-icon {
  display: inline-block;
  width: 2ch;
  color: #c678dd;
}

.shell {
  position: absolute;
  inset: 0;
  background: #111317;
  color: #c8ccd4;
  padding: 0.25em 1.5ch;
}

.keycast {
  position: absolute;
  right: 1.5ch;
  bottom: 0.4em;
  padding: 0 1ch;
  border: 1px solid #505a69;
  border-radius: 4px;
  background: #2d323c;
  color: #e6c864;
  animation: keycast 0.9s ease-out forwards;
}
@keyframes keycast {
  0%,
  60% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.statusbar {
  display: flex;
  justify-content: space-between;
  padding: 0 1.5ch;
  background: #2d323c;
  color: #b4b9c3;
}
.status-center.dirty {
  color: #e5c07b;
}

@media (prefers-reduced-motion: reduce) {
  .cur,
  .keycast {
    animation: none;
  }
}
</style>
