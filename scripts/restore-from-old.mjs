// Fill empty fortune*/rorschach* fields in src/content/zodiacs from the
// snapshot in "src/content/old zodiacs", and rewrite the top-of-file comment
// into a TODO listing what still needs doing.
//
//   tidy facets      — every entry whose facets were rewritten in the 328-pass
//   redo fortunes    — only where fortunes were restored from the old snapshot
//   redo rorschachs  — only where rorschachs were restored from the old snapshot
//
// Run: node scripts/restore-from-old.mjs [--dry]
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CUR = resolve(root, "src/content/zodiacs");
const OLD = resolve(root, "src/content/old zodiacs");
const dry = process.argv.includes("--dry");

const FORTUNES = ["fortuneMost", "fortuneHigh", "fortuneMid", "fortuneLow", "fortuneLeast"];
const RORSCHACHS = ["rorschachMost", "rorschachHigh", "rorschachMid", "rorschachLow", "rorschachLeast"];

// Only entries carrying one of these markers had their facets rewritten.
const CHANGED = /^#\s*(CHANGED SINCE THIS CONTENT WAS WRITTEN|COMPLETELY NEEDS UPDATING)/;

const readField = (text, key) => {
  const m = text.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m"));
  return m ? m[1] : null;
};

let filesTouched = 0, fortuneFields = 0, rorschachFields = 0, commentsWritten = 0;
const unresolved = [];

for (const file of readdirSync(CUR).filter((f) => f.endsWith(".md"))) {
  const curPath = `${CUR}/${file}`;
  const oldPath = `${OLD}/${file}`;
  const text = readFileSync(curPath, "utf8");
  const old = readFileSync(oldPath, "utf8");

  const lines = text.split("\n");
  const commentIdx = lines.findIndex((l) => l.startsWith("#"));
  const isChanged = commentIdx !== -1 && CHANGED.test(lines[commentIdx]);
  if (!isChanged) continue; // QUICK REVIEW and the dated four are left alone

  let copiedFortune = false, copiedRorschach = false;

  for (const key of [...FORTUNES, ...RORSCHACHS]) {
    const idx = lines.findIndex((l) => l.startsWith(`${key}:`));
    if (idx === -1) throw new Error(`${file}: no ${key} line`);
    if (lines[idx].slice(key.length + 1).trim() !== "") continue; // already populated

    const value = readField(old, key);
    if (value === null) throw new Error(`${file}: old snapshot has no ${key}`);
    if (value.trim() === "") { unresolved.push(`${file} ${key}`); continue; } // gap in the old file too

    lines[idx] = `${key}: ${value.trim()}`;
    if (key.startsWith("fortune")) { copiedFortune = true; fortuneFields++; }
    else { copiedRorschach = true; rorschachFields++; }
  }

  const todo = ["tidy facets"];
  if (copiedFortune) todo.push("redo fortunes");
  if (copiedRorschach) todo.push("redo rorschachs");
  lines[commentIdx] = `# TODO: ${todo.join(", ")}`;
  commentsWritten++;

  const next = lines.join("\n");
  if (next !== text) { filesTouched++; if (!dry) writeFileSync(curPath, next); }
}

console.log(`${dry ? "[dry run] " : ""}${filesTouched} files changed`);
console.log(`  fortune fields restored:   ${fortuneFields}`);
console.log(`  rorschach fields restored: ${rorschachFields}`);
console.log(`  TODO comments written:     ${commentsWritten}`);
if (unresolved.length) {
  console.log(`\n  left empty (blank in the old snapshot too):`);
  for (const u of unresolved) console.log(`    ${u}`);
}
