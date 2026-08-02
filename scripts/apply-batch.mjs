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
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dir = resolve(root, "src/content/zodiacs");

const KEYS = ["facetMost", "facetHigh", "facetMid", "facetLow", "facetLeast", "question",
  "answerMost", "answerHigh", "answerMid", "answerLow", "answerLeast"];

const force = process.argv.includes("--force");
const batchPath = process.argv[2];
if (!batchPath) { console.error("usage: node scripts/apply-batch.mjs <batch.json> [--force]"); process.exit(1); }
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
