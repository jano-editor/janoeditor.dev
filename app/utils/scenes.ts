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

export function buildScenes(): Scene[] {
  return [multiCursor()];
}
