// Overwrite named frontmatter fields in zodiac entries, in place.
// Usage: node scripts/update-fields.mjs path/to/patch.json
//
// The patch JSON is { "<slug>": { "<key>": "<value>", ... }, ... } and may name
// any single-line frontmatter key. Unlike apply-batch.mjs this DOES overwrite
// populated fields — it is for revision passes over finished entries — so every
// key named must already exist in the file, and nothing else is touched.
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dir = resolve(root, "src/content/zodiacs");

const patchPath = process.argv[2];
if (!patchPath) { console.error("usage: node scripts/update-fields.mjs <patch.json>"); process.exit(1); }
const patch = JSON.parse(readFileSync(resolve(root, patchPath), "utf8"));

// gray-matter needs quoting when a value opens with a quote or contains ": "
const quote = (s) => (/^["']|: /.test(s) ? JSON.stringify(s) : s);

let files = 0, fields = 0;
for (const [slug, vals] of Object.entries(patch)) {
  const file = resolve(dir, `${slug}.md`);
  const raw = readFileSync(file, "utf8");
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) throw new Error(`${slug}: no frontmatter close`);
  const fm = raw.slice(0, end), rest = raw.slice(end);

  const seen = new Set();
  const out = fm.split("\n").map((line) => {
    const m = line.match(/^([A-Za-z]+):/);
    if (!m || !(m[1] in vals)) return line;
    seen.add(m[1]);
    fields++;
    return `${m[1]}: ${quote(vals[m[1]])}`;
  }).join("\n");

  const missing = Object.keys(vals).filter((k) => !seen.has(k));
  if (missing.length) throw new Error(`${slug}: no such frontmatter key — ${missing.join(", ")}`);

  writeFileSync(file, out + rest);
  files++;
}
console.log(`updated ${fields} fields across ${files} files`);
