// Structural linter for the five zodiac rorschach readings. Catches the failures
// the rorschach pass keeps rediscovering — one object dialled five times (five
// ropes, four fireplaces, five water surfaces), readings built on things a black
// silhouette cannot show (speed, temperature, smoke, what's underground), hedge
// nouns doing the work a real object should do, and the long composed phrasing
// that gets rewritten back down to three words every time.
//
// Run: node scripts/lint-rorschachs.mjs [--file=batch.json] [--bean=adzuki]
//                                       [--group=bitter-boiled] [--quiet]
// With --file it lints a batch JSON before it is applied; otherwise it reads the
// corpus. Entries with `lastUpdated` filled in are APPROVED and never linted —
// they are only read as comparison targets for duplicates. Exit code 1 if
// anything fails.
//
// Bands were calibrated against the 320 readings in the 64 approved entries:
// words min 1 / p10 2 / median 3 / p90 5 / max 8; 65% are three words or fewer;
// 4.7% run past five; 13% drop the article; 15% contain an -ing. A reading may
// be reused in another entry — the same noun can be an honest read of two
// different silhouettes — so repeats are only reported within a batch.
//
// The judgement half — does each pole actually reach its word, does every
// reading account for the whole silhouette — no regex can check. The worksheet
// at the end prints each entry's axis beside its five readings so that pass can
// be done by eye.
import { readdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dir = resolve(root, "src/content/zodiacs");
const SLOTS = ["rorschachMost", "rorschachHigh", "rorschachMid", "rorschachLow", "rorschachLeast"];
const tier = (slot) => slot.replace("rorschach", "");

// — bands —
const MAX_WORDS = 8;          // approved max is exactly 8
const SOFT_MAX_WORDS = 5;     // approved p90; 4.7% run past it
const MAX_LONG_SHARE = 0.2;   // batch share allowed past SOFT_MAX_WORDS
const MIN_SHORT_SHARE = 0.6;  // batch share required at <=3 words (approved 65%)
const MAX_FOURPLUS_SHARE = 0.4; // batch share allowed at 4+ words (approved 35%)
const MAX_CAPTION_SHARE = 0.15; // batch share allowed to end on a particle (approved 2%)
const MAX_ING_SHARE = 0.35;   // approved runs 15%

// A reading is a noun somebody blurts at a blot, not a caption for a small event.
// "a key turned first time", "a nod and a wink", "a stamp brought down" are
// captions: they name something happening, not something seen. Structure alone
// can't separate them — approved entries include "a cow lying down" — so this is
// a per-reading note, and a batch that leans on it fails on the share below.
const CAPTION_TAIL =
  /\b(back|down|up|home|clean|shut|open|round|again|off|out|in|through|over|wide|first|time|apart|aside|away|across|together)$/i;

// Hedge nouns name no actual thing. "a form", "two halves", "a mass" read as
// wallpaper across 360 entries. `figure` and `face` are deliberately NOT here —
// RORSCHACH.md allows them, bare or qualified, because they are what people
// genuinely say at an inkblot.
const HEDGE = /\b(forms?|shapes?|masses?|things?|halves|objects?|blobs?|patterns?|structures?|figures? of)\b/i;
// "a lump of coal" is a real object; a bare "a lump" is not.
const BARE_LUMP = /^(a|an|the)\s+(lump|clump|heap|pile|bit|piece)s?$/i;

// Vagueness IS the content at the inverse pole — "nothing", "no idea", "a small
// mess" all work where the tier means indifference or absence. Anywhere above
// Low it is just a missing reading.
const VAGUE = /^(nothing|no idea|not sure|something|anything|a mess|a small mess|some sort of|something being)\b/i;
const VAGUE_OK = new Set(["Low", "Least"]);

// A silhouette has no speed, temperature, sound, history or underground half.
// Strip the invisible word from these and what remains is an undifferentiated
// lump: "a stone gathering pace", "a grate barely warm", "a crater still
// smoking", "a bunker dug well in", "a face refusing to blink".
const INVISIBLE =
  /\b(barely|slowly|quickly|already|still|just|never|once|again|gathering|loosening|sinking|sunk|dug (well )?in|deep(er)?|tepid|lukewarm|warm|cold|hot|smoking|steaming|humming|ringing|tolling|silent|loud|quiet|fresh|stale|rotting|about to|refusing|waiting|remembering)\b/i;

// A reading is a noun phrase. Leading gerunds are fine and used in the approved
// corpus ("surveying birds", "wok-frying rice"); a finite imperative verb is the
// question-answer grammar leaking in.
const VERB_OPENER =
  /^(say|tell|ask|take|keep|give|put|go|leave|get|hand|hold|make|wait|look|see|watch|find|know|feel|think|stand|sit|walk|run|open|shut|turn|pull|push|start|stop|carry|show|point|catch|throw|let|imagine|picture)$/i;

// Objects that read as the same picture with the nouns swapped. Seeded from the
// actual historical failures: sets that were five ropes, four fireplaces, five
// water surfaces, four buried things, three hanging cloths, four face postures.
// Two readings from one cluster in a set is a note, not a failure — a set can
// legitimately hold a bird's nest and a bird — but it is where the collapse
// starts, and every collapsed set in the corpus trips it.
const CLUSTERS = {
  stone: "rock rocks stone stones boulder boulders pebble pebbles cobble cobbles slab flagstone gravel rubble scree",
  rope: "rope ropes cord cords string strings twine knot knots thread threads lace laces",
  water: "water pond ponds pool pools puddle puddles wave waves ripple ripples fountain tide surf foam sea ocean",
  fire: "fire fires bonfire hearth stove grate furnace flame flames ember embers coal coals ash",
  cloth: "shroud sheet sheets coat coats cloth rag rags dishcloth teatowel towel curtain curtains blanket tarpaulin sail veil",
  vessel: "jar jars pot pots jug jugs bucket buckets tin tins box boxes crate sack sacks bag bags purse kettle pan",
  cage: "cage cages aviary perch perches birdcage coop pen hutch",
  facepart: "face faces brow brows mouth mouths lips jaw eye eyes grin frown cheek",
  plant: "hedge hedges bush bushes shrub tree trees branch branches twig twigs bramble brambles fern ferns moss weed weeds ivy",
  bird: "bird birds hawk owl crow raven magpie pelican heron hen flock gull swan sparrow",
  marine: "boat boats ship ships anchor buoy mooring raft sail oar",
  tool: "hammer anvil pliers spanner saw chisel wrench screwdriver drill",
  bread: "loaf loaves bread bun buns crust crusts dough roll rolls toast",
  paper: "paper note notes letter letters receipt receipts postcard page pages book books map maps",
  burial: "grave graves bunker trench pit mound barrow tomb crypt",
};
const CLUSTER_OF = {};
for (const [name, words] of Object.entries(CLUSTERS))
  for (const w of words.split(" ")) CLUSTER_OF[w] = name;

const words = (s) => String(s).trim().split(/\s+/).filter(Boolean);
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const contentWords = (s) =>
  norm(s).split(" ").filter((w) => w.length > 2 && !/^(a|an|the|and|of|in|on|at|to|its|his|her|with|from|over|under|two|one)$/.test(w));
const clustersIn = (s) => new Set(contentWords(s).map((w) => CLUSTER_OF[w]).filter(Boolean));
/** Last content word — the head noun in almost every reading this corpus uses. */
const head = (s) => {
  const c = contentWords(s);
  return c.length ? c[c.length - 1].replace(/s$/, "") : "";
};

// — collect —
const fileArg = process.argv.find((a) => a.startsWith("--file="));
const beanArg = process.argv.find((a) => a.startsWith("--bean="));
const groupArg = process.argv.find((a) => a.startsWith("--group="));
const quiet = process.argv.includes("--quiet");

const corpus = [];
for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const { data } = matter(readFileSync(resolve(dir, f), "utf8"));
  corpus.push({
    slug: data.slug, bean: data.bean, flavour: data.flavour, form: data.form,
    approved: Boolean(data.lastUpdated),
    trait: data.trait, excess: data.excess, inverse: data.inverse,
    readings: SLOTS.map((k) => String(data[k] ?? "")),
  });
}
const byslug = Object.fromEntries(corpus.map((c) => [c.slug, c]));

let entries;
if (fileArg) {
  const batch = JSON.parse(readFileSync(resolve(root, fileArg.slice("--file=".length)), "utf8"));
  entries = Object.entries(batch).map(([slug, vals]) => {
    const meta = byslug[slug];
    if (!meta) throw new Error(`${slug}: not in corpus`);
    return { ...meta, readings: SLOTS.map((k) => String(vals[k] ?? "")) };
  });
} else {
  entries = corpus.filter((c) => !c.approved);
}
if (beanArg) entries = entries.filter((e) => e.bean === beanArg.split("=")[1]);
if (groupArg) {
  const [fl, fm] = groupArg.split("=")[1].split("-");
  entries = entries.filter((e) => e.flavour === fl && e.form === fm);
}

const problems = [], notes = [], worksheet = [];
let lengths = [], ings = 0, noArticle = 0, total = 0, captions = 0;
const batchHeads = {}, batchClusters = {};

for (const e of entries) {
  const P = (m) => problems.push(`  ${e.slug}: ${m}`);
  const N = (m) => notes.push(`  ${e.slug}: ${m}`);
  const r = e.readings;

  r.forEach((v, i) => {
    const t = tier(SLOTS[i]);
    if (!v.trim()) { P(`${t} is empty`); return; }
    total++;
    const w = words(v);
    lengths.push(w.length);
    if (/\w+ing\b/.test(v)) ings++;
    if (!/^(a|an|the)\b/i.test(v)) noArticle++;

    if (/[.!?]$/.test(v.trim())) P(`${t} ends in punctuation — "${v}"`);
    if (/^you\b/i.test(v)) P(`${t} opens "You" — the reader describes what they see, not what they'd do`);
    if (VERB_OPENER.test(w[0].toLowerCase().replace(/[^a-z]/g, ""))) P(`${t} opens with a verb — "${v}"`);
    if (w.length > MAX_WORDS) P(`${t} is ${w.length} words (max ${MAX_WORDS}) — "${v}"`);
    else if (w.length > SOFT_MAX_WORDS) N(`${t} is ${w.length} words (approved p90 is ${SOFT_MAX_WORDS}) — "${v}"`);

    if (HEDGE.test(v) || BARE_LUMP.test(v.trim())) P(`${t} is a hedge noun — "${v}" names no actual thing (figure/face are allowed, these aren't)`);
    if (VAGUE.test(v.trim()) && !VAGUE_OK.has(t)) P(`${t} is a vague reading — "${v}" only works at Low/Least, where absence is the content`);
    const inv = v.match(INVISIBLE);
    if (inv) N(`${t} leans on "${inv[0]}" — invisible in a silhouette; check the object still reads without it: "${v}"`);
    if (CAPTION_TAIL.test(v.trim())) { captions++; N(`${t} reads as a caption, not a noun — "${v}" names something happening; say what is seen`); }

    for (const h of [head(v)]) if (h) (batchHeads[h] = batchHeads[h] || []).push(`${e.slug}/${t}`);
    for (const c of clustersIn(v)) (batchClusters[c] = batchClusters[c] || []).push(`${e.slug}/${t}`);
  });

  // — within the set: the collapse this whole pass exists to fix —
  for (let i = 0; i < 5; i++)
    for (let j = i + 1; j < 5; j++) {
      if (!r[i].trim() || !r[j].trim()) continue;
      if (norm(r[i]) === norm(r[j])) P(`${tier(SLOTS[i])} and ${tier(SLOTS[j])} are identical — "${r[i]}"`);
      else if (head(r[i]) && head(r[i]) === head(r[j]))
        P(`${tier(SLOTS[i])} and ${tier(SLOTS[j])} share the head noun "${head(r[i])}" — one object dialled twice, not two readings`);
      else {
        const shared = [...clustersIn(r[i])].filter((c) => clustersIn(r[j]).has(c));
        if (shared.length)
          N(`${tier(SLOTS[i])} "${r[i]}" and ${tier(SLOTS[j])} "${r[j]}" are both ${shared[0]} — check they're two different pictures`);
      }
    }

  // — duplicates inside this batch —
  // A reading may be reused elsewhere in the corpus: the same noun can be honest for
  // two different silhouettes. What must not repeat is a reading inside one batch.
  for (const other of entries) {
    if (other.slug === e.slug) continue;
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 5; j++)
        if (norm(r[i]) && norm(r[i]) === norm(other.readings[j]))
          N(`${tier(SLOTS[i])} "${r[i]}" repeats ${other.slug} ${tier(SLOTS[j])} — same batch`);
  }

  worksheet.push(
    `  ${e.slug}\n    axis   ${e.excess}  ←  ${e.trait}  →  ${e.inverse}\n` +
    SLOTS.map((s, i) => `    ${tier(s).padEnd(5)}  ${r[i]}`).join("\n"),
  );
}

// — batch level —
if (total >= 15) {
  const long = lengths.filter((l) => l > SOFT_MAX_WORDS).length / total;
  const short = lengths.filter((l) => l <= 3).length / total;
  if (long > MAX_LONG_SHARE)
    problems.push(`  BATCH: ${Math.round(long * 100)}% of readings run past ${SOFT_MAX_WORDS} words (max ${MAX_LONG_SHARE * 100}%, approved runs 5%) — strip the tails`);
  // The drift these three catch: readings quietly stop being nouns and become
  // little scenes. Each batch passed the old thresholds while the share of
  // 4+-word captions climbed from 13% to 53% across the pass.
  const fourPlus = lengths.filter((l) => l >= 4).length / total;
  if (short < MIN_SHORT_SHARE)
    problems.push(`  BATCH: only ${Math.round(short * 100)}% of readings are three words or fewer (need ${MIN_SHORT_SHARE * 100}%, approved runs 65%)`);
  if (fourPlus > MAX_FOURPLUS_SHARE)
    problems.push(`  BATCH: ${Math.round(fourPlus * 100)}% of readings run to four words or more (max ${MAX_FOURPLUS_SHARE * 100}%, approved runs 35%) — name the object, drop the scene`);
  if (captions / total > MAX_CAPTION_SHARE)
    problems.push(`  BATCH: ${Math.round((captions / total) * 100)}% of readings end on a particle (max ${MAX_CAPTION_SHARE * 100}%, approved runs 2%) — these are captions for events, not things seen`);
  if (ings / total > MAX_ING_SHARE)
    notes.push(`  BATCH: ${Math.round((ings / total) * 100)}% of readings contain an -ing (approved runs 15%) — prefer a state to an action`);
  for (const [h, where] of Object.entries(batchHeads))
    if (where.length > 1) notes.push(`  BATCH: "${h}" is the head noun ${where.length} times — ${where.join(", ")}`);
  for (const [c, where] of Object.entries(batchClusters))
    if (where.length / total > 0.25) notes.push(`  BATCH: ${Math.round((where.length / total) * 100)}% of readings are ${c} — ${where.slice(0, 6).join(", ")}`);
}

// — report —
const pct = (x) => (total ? `${Math.round((x / total) * 100)}%` : "0%");
console.log(`${entries.length} entries linted${fileArg ? " from batch" : ""}${beanArg ? ` (${beanArg.split("=")[1]})` : ""}${groupArg ? ` (${groupArg.split("=")[1]})` : ""}, ${corpus.length} in corpus`);
if (total) {
  const sorted = [...lengths].sort((a, b) => a - b);
  console.log(`words   median ${sorted[Math.floor(sorted.length / 2)]}  max ${sorted[sorted.length - 1]}  |  <=3 words ${pct(lengths.filter((l) => l <= 3).length)}  -ing ${pct(ings)}  no article ${pct(noArticle)}`);
}
if (!quiet && worksheet.length)
  console.log(`\nWORKSHEET — read each set against its axis: does Most reach the excess, does Least reach the inverse, does every reading describe the whole blot?\n${worksheet.join("\n")}\n`);
if (notes.length) console.log(`${notes.length} notes (judgement, not failures):\n${notes.join("\n")}\n`);
if (!problems.length) console.log("PASS — no structural problems");
else { console.log(`${problems.length} problems:\n${problems.join("\n")}`); process.exitCode = 1; }
