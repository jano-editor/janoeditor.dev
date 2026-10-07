// Scripted replays of jano for the landing page. A scene is written as a small script
// ("type this", "press Ctrl+D", "show a dialog"), the builder turns it into frames that
// <JanoTerminal> renders. No videos: crisp at any size, translatable, tiny.

export type Lang = "typescript" | "python" | "makefile" | "text";

export interface Cursor {
  line: number;
  col: number;
}

export interface Selection {
  line: number;
  from: number;
  to: number;
}

export type Overlay =
  | { kind: "banner"; tone: "warn" | "info" | "error"; text: string; position: "top" | "bottom" }
  | {
      kind: "dialog";
      title: string;
      rows: { mark?: string; text: string; detail?: string; active?: boolean }[];
      footer?: string;
      progress?: number;
    }
  | { kind: "popup"; items: { label: string; icon: string }[]; selected: number }
  | { kind: "shell"; lines: string[] };

export interface Frame {
  file: string;
  lang: Lang;
  /** shown in the title bar, e.g. "TypeScript" */
  langLabel?: string;
  lines: string[];
  cursors: Cursor[];
  selections: Selection[];
  overlay?: Overlay;
  /** key combo shown in the keycast, e.g. "Ctrl+D" */
  key?: string;
  dirty: boolean;
  /** startup animation: letters of "jano" shown, undefined when done */
  reveal?: number;
  /** status bar extras, e.g. "· CRLF" or diagnostics */
  status?: string;
  /** line numbers with an error marker */
  errors?: number[];
  /** how long this frame stays, in ms */
  duration: number;
}

export interface Scene {
  id: string;
  frames: Frame[];
}

type State = Omit<Frame, "duration">;

/** Builds the frames of a scene step by step. */
export class Script {
  private state: State;
  readonly frames: Frame[] = [];

  constructor(file: string, lang: Lang, lines: string[], langLabel?: string) {
    this.state = {
      file,
      lang,
      langLabel,
      lines: [...lines],
      cursors: [{ line: 0, col: 0 }],
      selections: [],
      dirty: false,
    };
  }

  private push(duration: number, patch: Partial<State> = {}) {
    this.state = { ...this.state, ...patch };
    this.frames.push({
      ...this.state,
      lines: [...this.state.lines],
      cursors: this.state.cursors.map((c) => ({ ...c })),
      selections: this.state.selections.map((s) => ({ ...s })),
      duration,
    });
    // a key press is shown for one frame only
    this.state.key = undefined;
    return this;
  }

  /** jano's startup animation: "jano" is typed into the title bar. */
  boot() {
    for (let i = 0; i <= 4; i++) this.push(130, { reveal: i });
    this.push(250, { reveal: 4 });
    return this.push(150, { reveal: undefined });
  }

  wait(ms: number) {
    return this.push(ms);
  }

  /** Shows a key combo in the keycast. */
  key(label: string, duration = 450) {
    return this.push(duration, { key: label });
  }

  cursor(line: number, col: number) {
    return this.push(300, { cursors: [{ line, col }], selections: [] });
  }

  cursors(cursors: Cursor[], duration = 300) {
    return this.push(duration, { cursors });
  }

  select(selections: Selection[], duration = 350) {
    return this.push(duration, { selections });
  }

  /** Types text at every cursor, replacing selections first. */
  type(text: string, speed = 65) {
    this.replaceSelections();
    for (const ch of Array.from(text)) {
      const lines = [...this.state.lines];
      // later cursors on the same line first, so earlier columns stay valid
      const order = [...this.state.cursors].sort((a, b) => b.line - a.line || b.col - a.col);
      for (const c of order) {
        const line = lines[c.line] ?? "";
        lines[c.line] = line.slice(0, c.col) + ch + line.slice(c.col);
      }
      // each cursor moves by every insert at or before it on the same line (its own included)
      const cursors = this.state.cursors.map((c) => {
        const inserts = this.state.cursors.filter(
          (o) => o.line === c.line && o.col <= c.col,
        ).length;
        return { line: c.line, col: c.col + inserts * ch.length };
      });
      this.push(speed, { lines, cursors, dirty: true });
    }
    return this;
  }

  private replaceSelections() {
    if (this.state.selections.length === 0) return;
    const lines = [...this.state.lines];
    const sorted = [...this.state.selections].sort((a, b) => b.line - a.line || b.from - a.from);
    for (const s of sorted) {
      const line = lines[s.line] ?? "";
      lines[s.line] = line.slice(0, s.from) + line.slice(s.to);
    }
    // a cursor where each selection started, shifted by removed text earlier on the line
    const cursors = this.state.selections.map((s) => {
      const removedBefore = this.state.selections
        .filter((o) => o.line === s.line && o.from < s.from)
        .reduce((sum, o) => sum + (o.to - o.from), 0);
      return { line: s.line, col: s.from - removedBefore };
    });
    this.state = { ...this.state, lines, cursors, selections: [], dirty: true };
  }

  /** Inserts a newline at the (single) cursor, with the given indent. */
  newline(indent = "") {
    const c = this.state.cursors[0] ?? { line: 0, col: 0 };
    const lines = [...this.state.lines];
    const line = lines[c.line] ?? "";
    lines.splice(c.line, 1, line.slice(0, c.col), indent + line.slice(c.col));
    return this.push(120, {
      lines,
      cursors: [{ line: c.line + 1, col: indent.length }],
      dirty: true,
    });
  }

  set(patch: Partial<State>, duration = 400) {
    return this.push(duration, patch);
  }

  overlay(overlay: Overlay | undefined, duration = 800) {
    return this.push(duration, { overlay });
  }

  save(status?: string) {
    return this.push(500, { dirty: false, key: "Ctrl+S", ...(status ? { status } : {}) });
  }

  done(): Frame[] {
    return this.frames;
  }
}

// ----- highlighting -----

export type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "type"
  | "function"
  | "property"
  | "constant"
  | "plain";

export interface Token {
  text: string;
  type: TokenType;
}

const KEYWORDS: Record<Lang, Set<string>> = {
  typescript: new Set(
    "const let var function return if else for while import from export async await new class interface type extends implements".split(
      " ",
    ),
  ),
  python: new Set(
    "def class return if elif else for while import from as with try except pass in not and or".split(
      " ",
    ),
  ),
  makefile: new Set(["ifeq", "endif", "include"]),
  text: new Set(),
};

const CONSTANTS = new Set([
  "true",
  "false",
  "null",
  "undefined",
  "None",
  "True",
  "False",
  "this",
  "self",
]);

/** Small display-only highlighter, close enough to jano's plugins for the replays. */
export function highlight(line: string, lang: Lang): Token[] {
  if (lang === "text") return [{ text: line, type: "plain" }];
  const tokens: Token[] = [];
  const comment = lang === "typescript" ? "//" : "#";
  const re =
    /("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`[^`]*`?)|(\d[\d_.]*)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;
  const commentAt = line.indexOf(comment);
  const code = commentAt === -1 ? line : line.slice(0, commentAt);

  for (const m of code.matchAll(re)) {
    const [text, str, num, ident] = m;
    if (str) tokens.push({ text, type: "string" });
    else if (num) tokens.push({ text, type: "number" });
    else if (ident) {
      const after = code.slice((m.index ?? 0) + text.length);
      const before = code.slice(0, m.index ?? 0);
      let type: TokenType = "plain";
      if (KEYWORDS[lang].has(text)) type = "keyword";
      else if (CONSTANTS.has(text)) type = "constant";
      else if (lang === "makefile" && /^\s*:/.test(after) && before.trim() === "")
        type = "function";
      else if (/^\s*\(/.test(after)) type = "function";
      else if (before.endsWith(".")) type = "property";
      else if (/^[A-Z]/.test(text)) type = "type";
      tokens.push({ text, type });
    } else tokens.push({ text, type: "plain" });
  }
  if (commentAt !== -1) tokens.push({ text: line.slice(commentAt), type: "comment" });
  return tokens;
}
