// Structural linter for facet prose. Catches the two ways a batch goes stale —
// one sentence-skeleton repeated, and every line the same length — plus the
// "muddiness" constructions that varied prose degrades into.
//
// Run: node scripts/lint-facets.mjs [--bean=adzuki] [--file=path/to/batch.json]
// With --file it lints a batch JSON before it is applied; otherwise it reads the
// corpus. Exit code 1 if anything fails.
import { readdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

// A place lexicon: generic locations plus anything the settings census knows about.
const PLACE = /\b(gym|ring|rink|pool|baths|hall|room|kitchen|shed|yard|field|farm|barn|wood|woods|forest|hill|fell|beach|shore|river|lake|road|street|lane|station|platform|train|bus|car|van|boat|ferry|shop|counter|desk|office|site|works|factory|floor|studio|stage|theatre|cinema|museum|gallery|library|church|chapel|cathedral|hospital|surgery|pharmacy|ward|school|classroom|pitch|court|track|range|wall|cave|quarry|mine|tunnel|bridge|pier|harbour|dock|market|stall|auction|fete|fair|pub|bar|taproom|brewery|bakery|cafe|restaurant|hotel|cottage|house|flat|garden|allotment|orchard|loft|attic|cellar|garage|forge|workshop|laundrette|hide|lighthouse|observatory|reservoir|moor|ridge|summit|slope|piste|carriage|compartment|aisle|queue|window|door|table|gate|kerb|park|zoo|aquarium|circus|tent|hut|club|centre|home|unit|lock|weir|bank|towpath|building|premises|site|ovens|counter)\b/i;
const PERSON = /\b(lad|bloke|guy|man|woman|boy|girl|kid|fella|chap|one|other)\b/i;

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const FACETS = ["facetMost", "facetHigh", "facetMid", "facetLow", "facetLeast"];

// — length band —
const MIN = 20, MAX = 58, SHORT = 26, LONG = 42, MED_LO = 30, MED_HI = 38;
// — shape caps —
const MAX_SAME_SHAPE_PER_ENTRY = 2, MAX_TWO_SENTENCE_PER_ENTRY = 3;
const MAX_SHAPE_SHARE = 0.3, MAX_OPENER_SHARE = 0.25, MAX_CLOSING_VERB_SHARE = 0.08;

const sentences = (s) => s.split(/(?<=[.!?])\s+/).filter(Boolean);
const words = (s) => s.trim().split(/\s+/).length;

/** Assign one shape label, first match wins. */
function shape(line) {
  const sent = sentences(line);
  const first = sent[0] || "";
  if (sent.length === 1) return "C-single";
  if (sent.length >= 3) return "D-beats";
  if (/^You\b/.test(line)) return "B-act-first";
  if (/^(\w+\s+){0,4}(asks|says|shouts|calls|wants to know)\b/i.test(first)) return "E-speech";
  if (/^\w+ing\b/.test(line) || /^(Halfway|Partway|Two hours|Ten minutes|Six in|Last)\b/.test(line)) return "G-participle";
  const youAt = line.toLowerCase().indexOf("you");
  if (youAt > line.length * 0.6) return "F-late-you";
  if (/\.\s+You\b/.test(line)) return "A-scene-act";
  return "H-other";
}

/** Constructions that read as mush. */
function muddy(line) {
  const out = [];
  for (const s of sentences(line)) {
    // A sentence needs at least one inflected verb form or auxiliary.
    const hasVerb = /\b(is|are|was|were|be|been|has|have|had|does|do|did|will|would|can|could|should|must|let|go|get|put|take|make|come|give|keep|hold|tell|say|see|know|find|leave|stand|sit|walk|run|buy|read|wait|turn|hand|ask|want|need|feel|look|bring|send|write|catch|cut|set|shut|split|hit|beat|quit|meet|pay|lay|lose|win|draw|throw|fall|rise|ring|sing|swim|drive|ride|wear|break|speak|choose|freeze|stick|strike|swear|tear|wake|bear|eat|drink|sleep|spend|build|lend|bend|send|dig|hang|hurt|let|cost|burst)\b|\w+(s|ed|ing)\b/i.test(s);
    if (!hasVerb) out.push(`verbless: "${s.slice(0, 40)}..."`);
    const beforeVerb = s.split(/\b(is|are|was|were|you)\b/i)[0] || "";
    if ((beforeVerb.match(/,/g) || []).length > 2) out.push(`stacked clauses before the main verb`);
  }
  const firstSentence = sentences(line)[0] || "";
  // Jargon nouns that smuggle in a whole location. Fine once the place is on the
  // page ("the corner" after "boxing gym"), unreadable before it.
  const JARGON = /\bthe\s+(corner|ring|rounds|flight|square|mart|pen|lock|hide|shift|pit|bench|rota|paddock|stalls|wicket|crease)\b/i;
  const jargonHit = line.match(JARGON);
  if (jargonHit && !PLACE.test(line))
    out.push(`"${jargonHit[0]}" carries a setting the line never names`);
  const earlyDefinitePerson = firstSentence.match(/\bthe\s+(\w+)\b/i);
  const qualified = new RegExp(`the\\s+${earlyDefinitePerson ? earlyDefinitePerson[1] : "x"}\\s+(who|that|you|at|in|on|with|behind|from|ahead|next|opposite|beside)\\b`, "i");
  if (earlyDefinitePerson && PERSON.test(earlyDefinitePerson[1]) && !qualified.test(firstSentence))
    out.push(`"the ${earlyDefinitePerson[1]}" introduced as though already known`);
  if ((line.match(/\bit\b/gi) || []).length > 2) out.push(`"it" used 3+ times`);
  if ((line.match(/^\w+ing\b|,\s\w+ing\b/g) || []).length > 1) out.push(`two participial phrases`);
  if (!/\b(the|a|an|your|their|his|her|one|two|three|four|five|six|seven|eight|nine|ten|twelve|thirty|forty|ninety|first|last|half|somebody|someone)\b/i.test(line.split(/\s+/).slice(0, 8).join(" ")))
    out.push(`no concrete noun phrase in the first 8 words`);
  return out;
}

// — collect —
let entries = [];
const fileArg = process.argv.find((a) => a.startsWith("--file="));
const beanArg = process.argv.find((a) => a.startsWith("--bean="));
if (fileArg) {
  const batch = JSON.parse(readFileSync(resolve(root, fileArg.split("=")[1]), "utf8"));
  entries = Object.entries(batch).map(([slug, v]) => ({ slug, facets: FACETS.map((k) => v[k]) }));
} else {
  const dir = resolve(root, "src/content/zodiacs");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const raw = readFileSync(resolve(dir, f), "utf8");
    const { data } = matter(raw);
    if (beanArg && data.bean !== beanArg.split("=")[1]) continue;
    const facets = FACETS.map((k) => data[k]).filter(Boolean);
    if (facets.length === 5) entries.push({ slug: data.slug, facets });
  }
}

// — check —
const problems = [];
const shapeCount = {}, openerCount = {}, closingVerb = {};
let all = [];
for (const { slug, facets } of entries) {
  const lens = facets.map(words);
  const shapes = facets.map(shape);
  all.push(...lens);
  shapes.forEach((s) => (shapeCount[s] = (shapeCount[s] || 0) + 1));
  facets.forEach((l) => {
    const o = l.split(/\s+/)[0].replace(/[^A-Za-z]/g, "");
    openerCount[o] = (openerCount[o] || 0) + 1;
    const m = l.match(/\bYou\s+(\w+)/);
    if (m) closingVerb[m[1]] = (closingVerb[m[1]] || 0) + 1;
  });

  lens.forEach((n, i) => {
    if (n < MIN || n > MAX) problems.push(`${slug} ${FACETS[i]}: ${n} words, outside ${MIN}-${MAX}`);
  });
  if (!lens.some((n) => n <= SHORT)) problems.push(`${slug}: no facet <= ${SHORT} words (shortest ${Math.min(...lens)})`);
  if (!lens.some((n) => n >= LONG)) problems.push(`${slug}: no facet >= ${LONG} words (longest ${Math.max(...lens)})`);
  const med = [...lens].sort((a, b) => a - b)[2];
  if (med < MED_LO || med > MED_HI) problems.push(`${slug}: median ${med}, outside ${MED_LO}-${MED_HI}`);

  for (const [s, c] of Object.entries(shapes.reduce((a, s) => ((a[s] = (a[s] || 0) + 1), a), {})))
    if (c > MAX_SAME_SHAPE_PER_ENTRY) problems.push(`${slug}: ${c} facets share shape ${s}`);
  const two = facets.filter((l) => sentences(l).length === 2).length;
  if (two > MAX_TWO_SENTENCE_PER_ENTRY) problems.push(`${slug}: ${two} two-sentence facets (max ${MAX_TWO_SENTENCE_PER_ENTRY})`);

  facets.forEach((l, i) => muddy(l).forEach((m) => problems.push(`${slug} ${FACETS[i]}: ${m}`)));
}

const n = all.length;
for (const [s, c] of Object.entries(shapeCount))
  if (c / n > MAX_SHAPE_SHARE) problems.push(`BATCH: shape ${s} is ${Math.round((c / n) * 100)}% (max ${MAX_SHAPE_SHARE * 100}%)`);
for (const [o, c] of Object.entries(openerCount))
  if (c / n > MAX_OPENER_SHARE) problems.push(`BATCH: opener "${o}" is ${Math.round((c / n) * 100)}% (max ${MAX_OPENER_SHARE * 100}%)`);
for (const [v, c] of Object.entries(closingVerb))
  if (c / n > MAX_CLOSING_VERB_SHARE) problems.push(`BATCH: "You ${v}" is ${Math.round((c / n) * 100)}% of facets (max ${MAX_CLOSING_VERB_SHARE * 100}%)`);

const sorted = [...all].sort((a, b) => a - b);
console.log(`${entries.length} entries, ${n} facets`);
console.log(`length  min ${sorted[0]}  p25 ${sorted[Math.floor(n * 0.25)]}  median ${sorted[Math.floor(n / 2)]}  p75 ${sorted[Math.floor(n * 0.75)]}  max ${sorted[n - 1]}`);
console.log(`shapes  ${Object.entries(shapeCount).sort((a, b) => b[1] - a[1]).map(([s, c]) => `${s}:${c}`).join("  ")}`);
console.log(`openers ${Object.entries(openerCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([o, c]) => `${o}:${c}`).join("  ")}\n`);
if (!problems.length) console.log("PASS — no structural problems");
else { console.log(`${problems.length} problems:\n` + problems.join("\n")); process.exitCode = 1; }
