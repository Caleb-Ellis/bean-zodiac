// The cold read is the one step in the facet process that no regex can perform and
// that has caught every real defect so far — and the way it fails is never refusal,
// it is sequencing. You cold-read a line, then trim a word off it an hour later, and
// the trim takes an establishing noun with it. Seven of seven breaks found in batch
// 02 were introduced by an edit made *after* the line had been checked.
//
// So the cold read is stamped. Each batch file ends with a hash of the exact facet
// text that was read. `check` recomputes those hashes against what is on disk now,
// and `facet-ledger.mjs commit` refuses a batch whose stamps have drifted. Editing a
// facet after cold-reading it therefore breaks the build until you read it again.
//
//   node scripts/cold-read.mjs check <batch.tsv>   drift since the cold read?
//   node scripts/cold-read.mjs stamp <batch.tsv>   record the text you just read
import { readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ZODIACS = resolve(root, "src/content/zodiacs");
const SLOTS = ["most", "high", "mid", "low", "least"];
const MARK = "# ============ COLD READ STAMPS";
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const hash = (s) => createHash("sha1").update(s.trim()).digest("hex").slice(0, 10);

const facetText = (slug, slot) => {
  const src = readFileSync(resolve(ZODIACS, `${slug}.md`), "utf8");
  const m = src.match(new RegExp(`^facet${cap(slot)}:[ \\t]*(.*)$`, "m"));
  if (!m) throw new Error(`${slug} has no facet${cap(slot)}`);
  return m[1];
};

const parse = (file) => {
  const lines = readFileSync(file, "utf8").split("\n");
  const rows = [];
  const stamps = new Map();
  for (const line of lines) {
    if (line.startsWith("#@")) {
      const [, slug, slot, h] = line.split(/\s+/);
      stamps.set(`${slug}\t${slot}`, h);
    } else if (!line.startsWith("#") && line.trim()) {
      const [slug, slot] = line.split("\t");
      if (SLOTS.includes(slot)) rows.push([slug, slot]);
    }
  }
  return { lines, rows, stamps };
};

const [, , cmd, file] = process.argv;
if (!cmd || !file) {
  console.error("usage: cold-read.mjs <check|stamp> <batch.tsv>");
  process.exit(2);
}

const { lines, rows, stamps } = parse(resolve(root, file));

if (cmd === "stamp") {
  // Strip only the stamp block itself — the marker lines (tagged `#~`) and the `#@`
  // hashes — and keep every other line wherever it sits. Truncating from the marker
  // instead silently ate notes appended after a previous stamp, which is the exact
  // kind of quiet loss this file exists to prevent.
  const kept = lines.filter((l) => !l.startsWith("#@") && !l.startsWith("#~") && !l.startsWith(MARK));
  while (kept.length && !kept[kept.length - 1].trim()) kept.pop();
  kept.push(
    `#~ ${MARK.slice(2)} — regenerate with \`node scripts/cold-read.mjs stamp <file>\` ====`,
    "#~ Each line is the facet text as it stood when it was cold-read. `commit` refuses",
    "#~ the batch if any of them has changed since. Edit a facet, read it again, restamp.",
  );
  for (const [slug, slot] of rows) kept.push(`#@ ${slug} ${slot} ${hash(facetText(slug, slot))}`);
  writeFileSync(resolve(root, file), kept.join("\n") + "\n");
  console.log(`stamped ${rows.length} facets`);
  process.exit(0);
}

if (cmd === "check") {
  const drift = [];
  const missing = [];
  for (const [slug, slot] of rows) {
    const key = `${slug}\t${slot}`;
    if (!stamps.has(key)) missing.push(`${slug} ${slot}`);
    else if (stamps.get(key) !== hash(facetText(slug, slot))) drift.push(`${slug} facet${cap(slot)}`);
  }
  if (missing.length) {
    console.error(`✗ never cold-read (no stamp): ${missing.join(", ")}`);
  }
  if (drift.length) {
    console.error("✗ edited since the cold read — read these again, then restamp:");
    for (const d of drift) console.error(`    ${d}`);
  }
  if (missing.length || drift.length) process.exit(1);
  console.log(`✓ cold read current for all ${rows.length} facets`);
}
