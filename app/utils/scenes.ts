import { Script, type Scene } from "./replay";

// The landing page showcase. Each scene shows one feature in a replayed jano session.
// The texts inside the terminal are jano's own UI strings, so they stay English.

function multiCursor(): Scene {
  const s = new Script(
    "app.ts",
    "typescript",
    [
      'import { getUser, notify } from "./users";',
      "",
      "const user = await getUser(id);",
      "console.log(user.name);",
      "if (user.active) notify(user);",
      "export default user;",
    ],
    "TypeScript",
  );

  s.boot().wait(400).cursor(2, 10);
  // Ctrl+D: select the word, then every next occurrence
  const hits = [
    { line: 2, from: 6, to: 10 },
    { line: 3, from: 12, to: 16 },
    { line: 4, from: 4, to: 8 },
    { line: 4, from: 24, to: 28 },
    { line: 5, from: 15, to: 19 },
  ];
  for (let i = 1; i <= hits.length; i++) {
    const picked = hits.slice(0, i);
    s.key("Ctrl+D", 120).set(
      {
        selections: picked,
        cursors: picked.map((h) => ({ line: h.line, col: h.to })),
      },
      380,
    );
  }
  s.wait(300).type("account", 90).wait(700).save().wait(1600);
  return { id: "multi-cursor", frames: s.done() };
}

function recovery(): Scene {
  const original = ["# Release checklist", ""];
  const s = new Script("todo.txt", "text", original);

  s.boot()
    .wait(300)
    .cursor(1, 0)
    .type("- update changelog", 55)
    .newline()
    .type("- tag v1.0.0", 55)
    .wait(600);
  // the process gets killed, nothing was saved
  s.overlay(
    { kind: "shell", lines: ["$ kill -9 $(pidof jano)", "Killed", "", "$ jano todo.txt"] },
    1800,
  );
  s.set({ overlay: undefined, lines: original, cursors: [{ line: 0, col: 0 }], dirty: false }, 100);
  s.boot();
  s.overlay(
    {
      kind: "banner",
      tone: "warn",
      position: "bottom",
      text: "1 unsaved file from a crash. Ctrl+R or click to recover",
    },
    1600,
  );
  s.key("Ctrl+R", 200).overlay(
    {
      kind: "dialog",
      title: "Recover Unsaved Files",
      rows: [{ mark: "", text: "todo.txt", detail: "just now · 3 lines", active: true }],
      footer: "↑↓ Navigate  Enter Restore  Del Delete  Esc Close",
    },
    1600,
  );
  s.key("Enter", 150).set(
    {
      overlay: undefined,
      lines: ["# Release checklist", "- update changelog", "- tag v1.0.0"],
      cursors: [{ line: 2, col: 12 }],
      dirty: true,
    },
    2200,
  );
  return { id: "recovery", frames: s.done() };
}

function plugins(): Scene {
  const s = new Script("package.json", "text", [
    "{",
    '  "name": "my-app",',
    '  "version": "1.0.0",',
    '  "private": true,',
    '  "scripts": { "dev": "vite" }',
    "}",
  ]);
  const names = [
    ["javascript", "JavaScript and TypeScript highlighting"],
    ["json", "JSON highlighting and formatting"],
    ["python", "Python highlighting and auto-indent"],
    ["toml", "TOML highlighting"],
    ["yaml", "YAML highlighting and formatting"],
  ] as const;

  s.boot().wait(400);
  s.overlay(
    {
      kind: "dialog",
      title: "Welcome to jano",
      rows: names.map(([name, detail], i) => ({
        mark: "[x]",
        text: name,
        detail,
        active: i === 0,
      })),
      footer: "↑↓ Move  Space Toggle  Enter Install  Esc Later",
    },
    1800,
  );
  s.key("Enter", 150);
  // one plugin after the other, with the progress bar
  for (let done = 0; done <= names.length; done++) {
    s.overlay(
      {
        kind: "dialog",
        title: "Welcome to jano",
        rows: names.map(([name, detail], i) => ({
          mark: i < done ? " ✓ " : i === done ? " … " : " · ",
          text: name,
          detail,
        })),
        progress: done / names.length,
        footer:
          done === names.length ? "All set, plugins are active now. Enter Close" : "Installing...",
      },
      done === names.length ? 1300 : 420,
    );
  }
  // the open file gets its colors right away, no restart
  s.key("Enter", 150).set({ overlay: undefined, lang: "typescript", langLabel: "JSON" }, 2400);
  return { id: "plugins", frames: s.done() };
}

function unicode(): Scene {
  const s = new Script("status.txt", "text", [
    "name\tok\tnote",
    "jano\t✅\tfast",
    "日本語\t🎉\tworks",
    "emoji\t❤️\taligned",
  ]);

  s.boot().wait(700).cursor(2, 0);
  // the cursor steps over whole characters: kanji, the tab and the emoji
  for (const col of [1, 2, 3, 4, 6]) s.set({ cursors: [{ line: 2, col }], key: "→" }, 300);
  // backspace removes the emoji as a whole, never half of it
  s.wait(300).backspace().wait(400).type("🚀", 100).wait(2000);
  return { id: "unicode", frames: s.done() };
}

function projectSettings(): Scene {
  const s = new Script("Makefile", "makefile", ["build:", "\tvp build", "", "test:"], "Makefile");

  s.overlay(
    {
      kind: "shell",
      lines: [
        "$ cat .editorconfig",
        "[Makefile]",
        "indent_style = tab",
        "tab_width = 8",
        "",
        "$ jano Makefile",
      ],
    },
    2200,
  );
  s.overlay(undefined, 50).boot().wait(300);
  s.key("F9", 150).overlay(
    {
      kind: "dialog",
      title: "Settings › Editor",
      rows: [
        { text: "Tab Size", detail: "‹ 4 ›  · project: 8 (.editorconfig)" },
        { text: "Insert Spaces", detail: "on  · project: off (.editorconfig)", active: true },
        { text: "Line Numbers", detail: "on" },
        { text: "Auto Complete", detail: "on" },
      ],
      footer: "↑↓ Navigate  ←→ Change  Enter Apply  Esc Back",
    },
    2600,
  );
  // the project wins: Tab inserts a real tab in the Makefile
  s.key("Esc", 150).overlay(undefined, 300).cursor(3, 5).newline().key("Tab", 150);
  s.type("\t", 200).type("vp test", 70).wait(600).save().wait(1600);
  return { id: "project-settings", frames: s.done() };
}

function autocomplete(): Scene {
  const s = new Script(
    "greet.py",
    "python",
    ["def greet(name):", '    message = f"Hello {name}!"', "    print("],
    "Python",
  );

  s.boot().wait(300).cursor(2, 10).type("mes", 120);
  // words from the file are suggested while typing
  s.overlay({ kind: "popup", items: [{ label: "message", icon: "χ" }], selected: 0 }, 1200);
  s.key("Tab", 150).set(
    {
      overlay: undefined,
      lines: ["def greet(name):", '    message = f"Hello {name}!"', "    print(message"],
      cursors: [{ line: 2, col: 17 }],
    },
    300,
  );
  s.type(")", 100).newline("    ").type("return message", 60).wait(500).save().wait(1600);
  return { id: "autocomplete", frames: s.done() };
}

export function buildScenes(): Scene[] {
  return [multiCursor(), recovery(), plugins(), unicode(), projectSettings(), autocomplete()];
}
