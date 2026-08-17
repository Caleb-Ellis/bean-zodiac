// Write a batch of facet/question/answer fields into zodiac frontmatter.
// Usage: node scripts/apply-batch.mjs path/to/batch.json [--force]
//
// The batch JSON is { "<slug>": { facetMost, facetHigh, facetMid, facetLow,
// facetLeast, question, answerMost, answerHigh, answerMid, answerLow,
// answerLeast }, ... }. Key order, comments, fortunes, rorschachs and body copy
// are all preserved — only the eleven keys below are touched.
//
// By default it REFUSES to overwrite a field that already has content, so a
// half-applied batch can't silently clobber finished work. Pass --force to
// rewrite populated fields (used when re-running a structural pass).
//
// Pass --keys=a,b,c to narrow the run to some of those eleven — a question-only
// batch is `--keys=question,answerMost,answerHigh,answerMid,answerLow,answerLeast`.
// Keys left out are ignored entirely: not required in the batch, not touched in
// the file.
//
// The five rorschach keys are writable too, but only when named explicitly in
// --keys — they are deliberately outside the default set so a facet or question
// batch behaves exactly as it did before they existed. A rorschach batch is
// `--keys=rorschachMost,rorschachHigh,rorschachMid,rorschachLow,rorschachLeast
// --force`, with --force needed because those fields always already have content.
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dir = resolve(root, "src/content/zodiacs");

const DEFAULT_KEYS = ["facetMost", "facetHigh", "facetMid", "facetLow", "facetLeast", "question",
  "answerMost", "answerHigh", "answerMid", "answerLow", "answerLeast"];
const OPT_IN_KEYS = ["rorschachMost", "rorschachHigh", "rorschachMid", "rorschachLow", "rorschachLeast"];
const ALL_KEYS = [...DEFAULT_KEYS, ...OPT_IN_KEYS];

const keysArg = process.argv.find((a) => a.startsWith("--keys="));
const KEYS = keysArg ? keysArg.slice("--keys=".length).split(",").map((k) => k.trim()) : DEFAULT_KEYS;
const unknown = KEYS.filter((k) => !ALL_KEYS.includes(k));
if (unknown.length) { console.error(`unknown --keys: ${unknown.join(", ")}`); process.exit(1); }

const force = process.argv.includes("--force");
const batchPath = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!batchPath) { console.error("usage: node scripts/apply-batch.mjs <batch.json> [--force] [--keys=a,b]"); process.exit(1); }
const batch = JSON.parse(readFileSync(resolve(root, batchPath), "utf8"));

// gray-matter needs quoting when a value opens with a quote or contains ": "
const quote = (s) => (/^["']|: /.test(s) ? JSON.stringify(s) : s);

let files = 0, fields = 0;
for (const [slug, vals] of Object.entries(batch)) {
  const file = resolve(dir, `${slug}.md`);
  const raw = readFileSync(file, "utf8");
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) throw new Error(`${slug}: no frontmatter close`);
  const fm = raw.slice(0, end), rest = raw.slice(end);

  const missing = KEYS.filter((k) => !new RegExp(`^${k}:`, "m").test(fm));
  if (missing.length) throw new Error(`${slug}: frontmatter missing ${missing.join(", ")}`);

  const out = fm.split("\n").map((line) => {
    const m = line.match(/^([A-Za-z]+):/);
    if (!m || !KEYS.includes(m[1])) return line;
    const key = m[1];
    if (vals[key] === undefined) throw new Error(`${slug}: batch has no value for ${key}`);
    if (!force && line.trim() !== `${key}:`) throw new Error(`${slug}: ${key} already populated — pass --force to overwrite`);
    fields++;
    return `${key}: ${quote(vals[key])}`;
  }).join("\n");

  writeFileSync(file, out + rest);
  files++;
}
console.log(`wrote ${fields} fields across ${files} files`);
