<script setup lang="ts">
import type { Scene } from "~/utils/replay";

// Plays the scenes in a jano window. The bar below works like jano's own help bar:
// each key opens one scene. Scenes run on their own and pause when the window is out of view.

const props = defineProps<{ scenes: Scene[]; labels: string[] }>();

const sceneIndex = ref(0);
const frameIndex = ref(0);
const reducedMotion = ref(false);
const visible = ref(true);
const root = ref<HTMLElement | null>(null);

const scene = computed(() => props.scenes[sceneIndex.value]!);
// as tall as the longest scene: no empty space, no jumping between scenes
const rows = computed(() =>
  Math.max(6, ...props.scenes.flatMap((s) => s.frames.map((f) => f.lines.length + 1))),
);
const frame = computed(() => {
  const frames = scene.value.frames;
  // reduced motion: a still image of the scene's end state
  return reducedMotion.value ? frames[frames.length - 1] : frames[frameIndex.value];
});

let timer: ReturnType<typeof setTimeout> | null = null;

function schedule() {
  if (timer) clearTimeout(timer);
  if (reducedMotion.value || !visible.value) return;
  timer = setTimeout(next, frame.value.duration);
}

function next() {
  if (frameIndex.value < scene.value.frames.length - 1) frameIndex.value++;
  else play((sceneIndex.value + 1) % props.scenes.length);
  schedule();
}

function play(index: number) {
  sceneIndex.value = index;
  frameIndex.value = 0;
  schedule();
}

function onKey(e: KeyboardEvent) {
  const n = Number(e.key);
  if (n >= 1 && n <= props.scenes.length) play(n - 1);
  else if (e.key === "ArrowRight") play((sceneIndex.value + 1) % props.scenes.length);
  else if (e.key === "ArrowLeft")
    play((sceneIndex.value - 1 + props.scenes.length) % props.scenes.length);
  else return;
  e.preventDefault();
}

let observer: IntersectionObserver | null = null;

onMounted(() => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion.value = media.matches;
  media.addEventListener("change", (e) => {
    reducedMotion.value = e.matches;
    schedule();
  });
  observer = new IntersectionObserver(([entry]) => {
    visible.value = entry.isIntersecting && !document.hidden;
    schedule();
  });
  if (root.value) observer.observe(root.value);
  schedule();
});

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
  observer?.disconnect();
});
</script>

<template>
  <div ref="root" class="showcase" role="group" tabindex="0" @keydown="onKey">
    <JanoTerminal :frame="frame" :rows="rows" />
    <div class="keys" role="tablist">
      <button
        v-for="(label, i) in labels.slice(0, scenes.length)"
        :key="i"
        role="tab"
        :aria-selected="i === sceneIndex"
        class="key"
        :class="{ active: i === sceneIndex }"
        @click="play(i)"
      >
        <span class="key-name">F{{ i + 1 }}</span
        >{{ label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.showcase {
  font-family: var(--font-mono);
  outline: none;
  border-radius: 6px;
}
.showcase:focus-visible {
  box-shadow: 0 0 0 2px #d250ef;
}
.keys {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25ch;
  margin-top: 0.6rem;
  font-size: 0.8rem;
}
.key {
  display: inline-flex;
  align-items: center;
  gap: 0.6ch;
  padding: 0;
  background: none;
  border: none;
  color: #8a909b;
  cursor: pointer;
  font: inherit;
}
.key-name {
  padding: 0 0.6ch;
  background: #3c414b;
  color: #dcdcdc;
}
.key:hover,
.key.active {
  color: #e6c864;
}
.key.active .key-name {
  background: #d250ef;
  color: #1b1e24;
}
.key:focus-visible {
  outline: 2px solid #d250ef;
  outline-offset: 2px;
}
</style>
