// Regenerates src/content/trait-neighbours.tsv from the sense-family map.
//
// Adjacency cannot be computed — steady and steadfast share a root, staunch and firm do
// not, and all four are the same idea. So the judgement lives in one place, the family
// map, and this script only expands it: your neighbours are the other members of every
// family you belong to. Change the map, re-run, and all 360 rows stay consistent.
//
//   node scripts/build-trait-neighbours.mjs
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = resolve(root, "src/content");
const OUT = resolve(CONTENT, "trait-neighbours.tsv");
const MAP = resolve(CONTENT, "trait-families.tsv");

const field = (s, k) => (s.match(new RegExp(`^${k}: (.*)$`, "m")) || [, ""])[1].trim();
const short = (slug) => {
  const [fl, fo, b] = slug.split("-");
  return fl.slice(0, 2) + fo.slice(0, 2) + b.slice(0, 3);
};

const zodiacs = readdirSync(resolve(CONTENT, "zodiacs"))
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const s = readFileSync(resolve(CONTENT, "zodiacs", f), "utf8");
    return {
      slug: field(s, "slug"),
      trait: field(s, "trait"),
      excess: field(s, "excess"),
      inverse: field(s, "inverse"),
      approved: Boolean(field(s, "lastUpdated")),
    };
  });
const bySlug = new Map(zodiacs.map((z) => [z.slug, z]));
const byShort = new Map(zodiacs.map((z) => [short(z.slug), z]));

const families = [];
for (const line of readFileSync(MAP, "utf8").split("\n")) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [name, rest] = line.split("\t");
  const members = rest
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
    .map((m) => {
      const [trait, sh] = m.split("/");
      const z = byShort.get(sh);
      if (!z) throw new Error(`${name}: unknown short slug "${sh}" (${trait})`);
      if (z.trait !== trait) throw new Error(`${name}: ${sh} is "${z.trait}", map says "${trait}"`);
      return z.slug;
    });
  families.push({ name, members });
}

const placed = new Set(families.flatMap((f) => f.members));
const missing = zodiacs.filter((z) => !placed.has(z.slug));
if (missing.length) {
  throw new Error(`${missing.length} traits are in no family: ${missing.map((z) => `${z.trait}(${z.slug})`).join(", ")}`);
}

const rows = zodiacs
  .map((z) => {
    const mine = families.filter((f) => f.members.includes(z.slug));
    const seen = new Set([z.slug]);
    const neighbours = [];
    for (const f of mine) {
      for (const slug of f.members) {
        if (seen.has(slug)) continue;
        seen.add(slug);
        const n = bySlug.get(slug);
        neighbours.push({ mark: n.approved ? "" : "~", text: `${n.trait}(${slug})`, trait: n.trait });
      }
    }
    // Written entries first — their scenes are spent and must actually be read.
    neighbours.sort((a, b) => a.mark.localeCompare(b.mark) || a.trait.localeCompare(b.trait));
    return [
      z.slug,
      z.trait,
      z.excess,
      z.inverse,
      mine.map((f) => f.name).join("+"),
      neighbours.map((n) => n.mark + n.text).join(" "),
    ].join("\t");
  })
  .sort();

const header = `# TRAIT NEIGHBOURS — the lookup for FACETS.md step 1, and the de-duplication map.
#
# Why this file exists. The near-neighbour collision is the most expensive failure in
# step 4: a scene gets built, then thrown away because it belongs to a trait somebody
# already wrote. It cannot be computed from the axes — hard-line (kidney/bitter/fried)
# and firm (navy/sour/dried) share no bean, no flavour and no form, and mystical sits
# next to otherworldly across a single shared form.
#
# GENERATED — do not hand-edit. The judgement lives in trait-families.tsv, which sorts
# all 360 traits into senses a reader could confuse; this file expands that map, so your
# neighbours are the other members of every family you are in. To change an adjacency,
# move the trait between families and re-run:
#
#   node scripts/build-trait-neighbours.mjs
#
# How to use it. At step 1, look your five up here and READ the entries listed, then
# write the separation prose into the batch file — what each neighbour owns, and what is
# left for yours. This file names the pairs; it does not do the thinking, and it is not a
# substitute for reading beans/, flavours/ and forms/.
#
# Marks:
#   trait(slug)    approved — its scenes are SPENT, go and read them
#   ~trait(slug)   not yet approved — no settled scenes to avoid, but the axes must part
#
# A trait in two families carries both families' members as neighbours; the families
# column names which. 46 families over 360 traits, 18 traits straddling two.
#
# slug\ttrait\texcess\tinverse\tfamilies\tneighbours
`;

writeFileSync(OUT, header + rows.join("\n") + "\n");
console.log(`Wrote ${rows.length} rows from ${families.length} families`);
