// Copy to the clipboard and remember the outcome for a moment, so a button can say
// "Copied" only when it really worked (the browser may refuse, e.g. without permission).

export function useCopy(resetAfter = 2000) {
  const copied = ref<string | null>(null);
  const failed = ref<string | null>(null);
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function copy(text: string) {
    if (timer) clearTimeout(timer);
    copied.value = null;
    failed.value = null;
    try {
      await navigator.clipboard.writeText(text);
      copied.value = text;
    } catch {
      failed.value = text;
    }
    timer = setTimeout(() => {
      copied.value = null;
      failed.value = null;
    }, resetAfter);
  }

  return { copied, failed, copy };
}
