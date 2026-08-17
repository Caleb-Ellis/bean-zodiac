// Running tally of what every written facet is *about*, so the corpus stays varied.
// The census script infers settings from the text with regexes; this one records
// them at write time, when the writer already knows the answer.
//
//   node scripts/facet-ledger.mjs report [--top=12]   what's spent, what's thin
//   node scripts/facet-ledger.mjs check              gaps and duplicates
//   node scripts/facet-ledger.mjs add <slug> <slot> <setting> <scenario> <cast> <pitch>
//   node scripts/facet-ledger.mjs plan <batch.tsv>   validate 25 rows before any prose
//   node scripts/facet-ledger.mjs commit <batch.tsv> append a validated batch
//
// Columns: setting (where), scenario (what structurally happens), cast (who else is
// there), pitch (grounded/elevated/fantastical, 2/2/1 per entry). Scenario is the one that catches
// repetition the setting column misses — five different rooms can all be the same
// probe. Device is the one that catches it in the fantastical slot.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { spawnSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const LEDGER = resolve(root, "src/content/facet-ledger.tsv");
const ZODIACS = resolve(root, "src/content/zodiacs");
const SLOTS = ["most", "high", "mid", "low", "least"];
const HEADER = "slug\tslot\tsetting\tscenario\tcast\tpitch";

// How far back a setting has to stay clear. Within-entry
// checks never caught the real failure, which is corpus-level: one pass produced
// five boats and six mountain huts, and six of nine fantasticals were the same
// trick (an invisible quantity made countable).
const SETTING_WINDOW = 10;   // entries
const MAX_CAST_PER_ENTRY = 2;

// Every entry runs exactly 3 grounded, 2 elevated. Grounded is somewhere anyone
// could stand; elevated is a scene with a film in it — a search party after dark,
// a ship in weather, a jury on its third day.
//
// There was a third pitch, `fantastical`, requiring one impossible premise per
// entry. It was dropped: across 32 entries it produced 32 variations of "Here X
// is true", the premise almost always just literalised the trait, and the vote
// collapsed into obeying the rule. Legacy rows in approved entries still carry it.
const PITCHES = ["grounded", "elevated"];
const COMPOSITION = { grounded: 3, elevated: 2 };

// Setting is a controlled vocabulary, not a description. "street on the way to a
// station" and "street outside the pub" are the same setting; if every row is
// unique the column tallies nothing. No possessives ("kitchen", not "your
// kitchen"), no scene detail.
//
// Every setting belongs to a register BUCKET, because distinct settings were not
// catching sameness of *register*: kitchen / party / car / pub / phone is five
// different places and one narrow world. Two thirds of the corpus sat in
// domestic + nightlife + street before this existed. The rules `add` enforces:
//
//   - the five settings in an entry must come from five DIFFERENT buckets
//   - at least one of the five must come from a currently thin bucket
//
// Add a term with --new-setting=<bucket> when a genuinely new place turns up.
const BUCKETS = {
  domestic: ["house", "kitchen", "living room", "bedroom", "doorstep", "stairwell", "garden", "balcony", "loft", "shed"],
  nightlife: ["pub", "club", "gig", "party", "karaoke bar", "comedy club", "casino", "betting shop"],
  eating: ["cafe", "restaurant", "barbecue", "takeaway", "canteen", "bakery", "food stall"],
  retail: ["shop", "supermarket", "market", "charity shop", "chemist", "bookshop", "record shop", "garden centre", "butcher", "hardware shop"],
  services: ["bike shop", "laundrette", "hairdresser", "barbers", "post office", "bank", "petrol station", "vets", "repair shop", "phone shop", "dry cleaners"],
  transit: ["bus", "train", "station", "plane", "airport", "taxi", "car", "car park", "lift", "ferry", "coach", "motorway services"],
  street: ["street", "footpath", "alley", "bridge", "high street", "bus stop", "roadworks", "underpass"],
  nature: ["river", "sea", "forest", "hills", "park", "farm", "beach", "canal", "moor", "reservoir", "allotment", "orchard", "cliff"],
  leisure: ["lido", "swimming pool", "bowling alley", "arcade", "fairground", "zoo", "aquarium", "ice rink", "escape room", "photobooth", "pier"],
  sport: ["sports club", "dojo", "gym", "running track", "football ground", "tennis court", "snooker hall", "climbing wall"],
  medical: ["hospital", "doctors", "dentist", "waiting room", "clinic", "blood donor centre", "a and e", "walk-in centre", "opticians", "physio", "maternity ward", "ambulance", "pharmacy counter"],
  civic: ["court", "solicitors", "prison", "police station", "job centre", "registry office", "polling station", "coroners court", "tribunal", "council offices", "citizens advice", "passport office", "jury room"],
  learning: ["school", "library", "evening class", "lecture hall", "driving lesson", "study room", "exam hall", "swimming lesson", "music lesson", "careers fair", "training room", "seminar room", "open day"],
  culture: ["auction house", "gallery", "cinema", "stage", "theatre", "museum", "concert hall", "rehearsal room"],
  work: ["workplace", "professional kitchen", "warehouse", "building site", "factory", "depot", "loading bay", "site office"],
  ceremony: ["wedding", "churchyard", "church", "cemetery", "funeral", "christening", "graduation"],
  away: ["hotel", "campsite", "hostel", "expedition", "boat", "caravan", "holiday let", "airbnb"],
  care: ["food bank", "care home", "animal shelter", "hospice", "nursery", "shelter", "soup kitchen", "day centre", "drop-in centre", "youth club", "baby bank", "animal sanctuary", "respite home"],
  remote: ["phone", "video call", "radio", "letter", "intercom", "voicemail", "tannoy", "livestream", "walkie-talkie", "postcard", "doorbell camera", "answerphone"],
  strange: ["uncanny", "hot air balloon", "tattoo studio", "seance", "observatory", "catacombs", "planetarium", "waxworks", "hypnotist show", "ghost walk", "psychic fair", "show cave", "float tank", "camera obscura", "hedge maze", "taxidermist", "nuclear bunker", "anatomy museum", "magic show", "mine tour", "stone circle", "clairvoyant", "wind tunnel"],
};

const SETTINGS = Object.values(BUCKETS).flat().sort();
const BUCKET_OF = Object.fromEntries(Object.entries(BUCKETS).flatMap(([b, ss]) => ss.map((s) => [s, b])));
const BUCKET_NAMES = Object.keys(BUCKETS);

/** Rows per bucket, ascending — the tail is where the next facet should go. */
const bucketTally = (rows) => {
  const counts = Object.fromEntries(BUCKET_NAMES.map((b) => [b, 0]));
  for (const r of rows) {
    const b = BUCKET_OF[r.setting];
    if (b) counts[b] += 1;
  }
  return Object.entries(counts).sort((a, b) => a[1] - b[1]);
};

/**
 * Buckets holding less than 60% of an even share — an entry must use at least one.
 * Deliberately not the median: a median marks exactly half the buckets thin no
 * matter how even the corpus is, so the set flips on every commit and a batch can
 * pass `plan` and then fail `check` on the rows it just added.
 */
const thinBuckets = (rows) => {
  const t = bucketTally(rows);
  const even = rows.length / t.length;
  return t.filter(([, n]) => n < even * 0.6).map(([b]) => b);
};

const read = () => {
  if (!existsSync(LEDGER)) return [];
  return readFileSync(LEDGER, "utf8")
    .split("\n")
    .slice(1)
    .filter((l) => l.trim())
    .map((l) => {
      const [slug, slot, setting, scenario, cast, pitch] = l.split("\t");
      return { slug, slot, setting, scenario, cast, pitch };
    });
};

const writtenEntries = () =>
  readdirSync(ZODIACS)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => /^lastUpdated: \d/m.test(readFileSync(resolve(ZODIACS, f), "utf8")))
    .map((f) => f.replace(/\.md$/, ""));

const tally = (rows, key) => {
  const counts = new Map();
  for (const r of rows) counts.set(r[key], (counts.get(r[key]) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};


/** Slugs in the order they were logged, most recent last. */
const slugOrder = (rows) => [...new Set(rows.map((r) => r.slug))];

/** Settings used in the last N logged entries. */
const recentSettings = (rows, n = SETTING_WINDOW) => {
  const recent = new Set(slugOrder(rows).slice(-n));
  const m = new Map();
  for (const r of rows) if (recent.has(r.slug)) m.set(r.setting, r.slug);
  return m;
};


/**
 * Every rule that applies to a finished set of five, checked in one place so the
 * batch planner and the incremental `add` cannot drift apart.
 */
const checkEntry = (slug, five, history) => {
  const errs = [];
  const buckets = five.map((r) => BUCKET_OF[r.setting]);
  const settings = five.map((r) => r.setting);
  const casts = five.map((r) => r.cast);

  if (new Set(settings).size !== 5) errs.push(`repeats a setting: ${settings.join(", ")}`);
  const distinct = new Set(buckets).size;
  if (distinct < 4) errs.push(`only ${distinct} register buckets (min 4): ${buckets.join(", ")}`);
  // An empty THIN set means no bucket is under-served, so the requirement is vacuous.
  // Without this guard the check fails against an empty list once a batch's own rows
  // have filled the last thin bucket partway through its own validation.
  const THIN = thinBuckets(history);
  if (THIN.length && !buckets.some((b) => THIN.includes(b)))
    errs.push(`no thin bucket — needs one of ${THIN.join(", ")}`);
  for (const k of PITCHES) {
    const n = five.filter((r) => r.pitch === k).length;
    if (n !== COMPOSITION[k]) errs.push(`${n} ${k} (want ${COMPOSITION[k]})`);
  }
  for (const c of new Set(casts)) {
    const n = casts.filter((x) => x === c).length;
    if (n > MAX_CAST_PER_ENTRY) errs.push(`cast "${c}" used ${n} times (max ${MAX_CAST_PER_ENTRY})`);
  }
  // The window would make small buckets unusable — `care` holds six places, and
  // the thin-bucket rule pushes you into exactly those. Small buckets get a
  // warning instead, so the pressure lands on the fat ones where it belongs.
  const recentSet = recentSettings(history);
  for (const r of five) {
    const seen = recentSet.get(r.setting);
    if (!seen) continue;
    const msg = `setting "${r.setting}" used within ${SETTING_WINDOW} entries (${seen})`;
    if (THIN.includes(BUCKET_OF[r.setting])) console.warn(`    ! ${msg} — thin bucket, allowed`);
    else errs.push(msg);
  }
  for (const r of five) {
    const clash = history.filter((h) => h.scenario === r.scenario && h.slug !== slug);
    if (clash.length) errs.push(`scenario "${r.scenario}" already used (${clash[0].slug} ${clash[0].slot})`);
  }
  return errs;
};

const cmd = process.argv[2] ?? "report";
const rows = read();

if (cmd === "report") {
  const topArg = process.argv.find((a) => a.startsWith("--top="));
  const top = topArg ? Number(topArg.slice(6)) : 12;
  console.log(`${rows.length} facets logged across ${new Set(rows.map((r) => r.slug)).size} entries\n`);
  for (const key of ["setting", "scenario", "cast"]) {
    const counts = tally(rows, key);
    console.log(`— ${key} — most used (${counts.length} distinct)`);
    for (const [value, n] of counts.slice(0, top)) console.log(`  ${String(n).padStart(3)}  ${value}`);
    const once = counts.filter(([, n]) => n === 1).length;
    console.log(`  ...${once} used exactly once\n`);
  }
  const bt = bucketTally(rows);
  const classified = bt.reduce((a, [, n]) => a + n, 0);
  console.log(`— register bucket — (${bt.length} buckets, ${rows.length - classified} rows unclassified)`);
  for (const [b, n] of [...bt].reverse())
    console.log(`  ${String(n).padStart(3)}  ${String(Math.round((n / rows.length) * 100)).padStart(2)}%  ${b}`);
  console.log(`  thin — every entry needs one of: ${thinBuckets(rows).join(", ")}\n`);

  console.log(`— pitch — ${PITCHES.map((k) => `${k} ${rows.filter((r) => r.pitch === k).length}`).join("   ")}\n`);
}

if (cmd === "check") {
  const APPROVED = new Set(writtenEntries());
  const THIN = thinBuckets(rows);
  const logged = new Set(rows.map((r) => r.slug));
  const unlogged = writtenEntries().filter((s) => !logged.has(s));
  if (unlogged.length) console.log(`Written but not logged (${unlogged.length}): ${unlogged.join(", ")}`);

  for (const slug of logged) {
    const mine = rows.filter((r) => r.slug === slug);
    const missingSlots = SLOTS.filter((s) => !mine.some((r) => r.slot === s));
    if (missingSlots.length) console.log(`${slug}: missing slots ${missingSlots.join(", ")}`);
    const settings = mine.map((r) => r.setting);
    const dupSetting = settings.filter((s, i) => settings.indexOf(s) !== i);
    if (dupSetting.length) console.log(`${slug}: repeats setting within entry — ${[...new Set(dupSetting)].join(", ")}`);
    const bs = settings.map((s) => BUCKET_OF[s]).filter(Boolean);
    const distinct = new Set(bs).size;
    if (bs.length === 5 && distinct < 4) console.log(`${slug}: only ${distinct} register buckets (min 4) — ${bs.join(", ")}`);
    // An empty THIN set means no bucket is under-served, so the requirement is vacuous —
    // the same guard `plan` carries. Without it every entry in the corpus is reported.
    if (THIN.length && mine.length === 5 && !bs.some((b) => THIN.includes(b)))
      console.log(`${slug}: no facet in a thin bucket (${bs.join(", ")})`);
    // A gradient is *meant* to run one axis at five pitches, so a scenario appearing
    // twice is normal (the two trait poles, the two inverse poles). Three or more
    // means the five have collapsed into one probe asked repeatedly.
    const scenarios = mine.map((r) => r.scenario);
    const dup = scenarios.filter((s, i) => scenarios.indexOf(s) !== i);
    if (dup.length) console.log(`${slug}: repeats scenario within the entry — ${[...new Set(dup)].join(", ")}`);
    if (mine.length === 5 && !APPROVED.has(slug)) {
      const bad = PITCHES.filter((k) => {
        const n = mine.filter((r) => r.pitch === k).length;
        return n !== COMPOSITION[k];
      });
      if (bad.length)
        console.log(`${slug}: pitch mix ${PITCHES.map((k) => `${mine.filter((r) => r.pitch === k).length}${k[0]}`).join("/")} — off on ${bad.join(", ")}`);
    }
  }


  const byScenario = new Map();
  for (const r of rows) byScenario.set(r.scenario, [...(byScenario.get(r.scenario) ?? []), `${r.slug} ${r.slot}`]);
  const repeats = [...byScenario].filter(([, v]) => v.length > 1).sort((a, b) => b[1].length - a[1].length);
  if (repeats.length) {
    console.log(`\nScenarios used more than once (${repeats.length}) — each facet should do something different:`);
    for (const [k, v] of repeats) console.log(`  ${v.length}x ${k} — ${v.join(", ")}`);
  }
}

if (cmd === "add") {
  const [slug, slot, setting, scenario, cast, pitch = "grounded"] = process.argv.slice(3);
  if (!slug || !slot || !setting || !scenario || !cast) {
    console.error("usage: add <slug> <slot> <setting> <scenario> <cast> <pitch>");
    process.exit(1);
  }
  if (!SLOTS.includes(slot)) {
    console.error(`slot must be one of ${SLOTS.join(", ")}`);
    process.exit(1);
  }
  if (rows.some((r) => r.slug === slug && r.slot === slot)) {
    console.error(`${slug} ${slot} is already logged — edit the row instead`);
    process.exit(1);
  }
  // Scenario is exactly two hyphenated words, and should be unique across all 1800
  // facets — it names what structurally happens, and no two facets should be doing
  // the same thing. An exact match is a prompt to make this one specific to its trait.
  if (!/^[a-z]+-[a-z]+$/.test(scenario)) {
    console.error(`scenario "${scenario}" must be exactly two hyphenated lowercase words, e.g. favour-asked`);
    process.exit(1);
  }
  const clash = rows.filter((r) => r.scenario === scenario);
  if (clash.length) {
    console.warn(`\n${"=".repeat(72)}`);
    console.warn(`SCENARIO ALREADY USED: "${scenario}"`);
    console.warn(`  in ${clash.map((r) => `${r.slug} ${r.slot}`).join(", ")}`);
    console.warn(`  Every facet should do something structurally different. Consider a`);
    console.warn(`  scenario specific to this trait rather than the generic shape.`);
    console.warn(`${"=".repeat(72)}\n`);
  }

  // A new setting has to declare its register bucket, or the bucket rules below
  // silently stop applying to it.
  const newSettingArg = process.argv.find((a) => a.startsWith("--new-setting"));
  if (!SETTINGS.includes(setting)) {
    const bucket = newSettingArg?.split("=")[1];
    if (!bucket || !BUCKET_NAMES.includes(bucket)) {
      const near = SETTINGS.filter((v) => v.includes(setting) || setting.includes(v) || v.split(" ").some((w) => setting.includes(w)));
      console.error(`"${setting}" is not in the setting vocabulary.`);
      if (near.length) console.error(`did you mean: ${near.join(", ")}`);
      console.error(`otherwise pass --new-setting=<bucket> and add it to BUCKETS in this script.`);
      console.error(`buckets: ${BUCKET_NAMES.join(", ")}`);
      process.exit(1);
    }
    BUCKET_OF[setting] = bucket;
    console.warn(`! "${setting}" is new — add it to BUCKETS.${bucket} in this script`);
  }

  const sameEntryRows = rows.filter((r) => r.slug === slug);
  const myBucket = BUCKET_OF[setting];
  // Five distinct settings was not enough: kitchen / party / car / pub / phone is
  // five places and one register. The five must span at least four buckets — one
  // repeat is allowed, a second means the entry has collapsed into one world.
  const entryBuckets = [...sameEntryRows.map((r) => BUCKET_OF[r.setting]), myBucket];
  const repeats = entryBuckets.length - new Set(entryBuckets).size;
  const bucketClash = sameEntryRows.find((r) => BUCKET_OF[r.setting] === myBucket);
  if (repeats > 1) {
    console.error(`\n${"=".repeat(72)}`);
    console.error(`ONLY ${new Set(entryBuckets).size} REGISTER BUCKETS IN THIS ENTRY (minimum 4)`);
    console.error(`  ${entryBuckets.join(", ")}`);
    console.error(`  One repeated bucket is allowed; this would be the second.`);
    console.error(`  Unused here: ${BUCKET_NAMES.filter((b) => !entryBuckets.includes(b)).join(", ")}`);
    console.error(`${"=".repeat(72)}\n`);
    process.exit(1);
  }
  if (bucketClash)
    console.warn(`! bucket "${myBucket}" repeats ${bucketClash.slot} (${bucketClash.setting}) — that's the one repeat this entry gets`);
  // On the fifth and last facet, at least one of the entry's settings has to have
  // come from a thin bucket — otherwise the corpus keeps deepening the same ruts.
  if (!PITCHES.includes(pitch)) {
    console.error(`pitch must be one of ${PITCHES.join(", ")}`);
    process.exit(1);
  }
  // 2 grounded, 2 elevated, 1 fantastical, always. Checked on the fifth row,
  // so decide the mix when you pick the five scenarios, not after four are written.
  if (sameEntryRows.length === 4) {
    const mix = [...sameEntryRows.map((r) => r.pitch), pitch];
    const bad = PITCHES.filter((k) => {
      const n = mix.filter((m) => m === k).length;
      return n !== COMPOSITION[k];
    });
    if (bad.length) {
      console.error(`\n${"=".repeat(72)}`);
      console.error(`WRONG PITCH MIX: ${PITCHES.map((k) => `${mix.filter((m) => m === k).length} ${k}`).join(", ")}`);
      console.error(`  wanted exactly 2 grounded, 2 elevated, 1 fantastical`);
      console.error(`  off: ${bad.join(", ")}`);
      console.error(`${"=".repeat(72)}\n`);
      process.exit(1);
    }
  }

  const THIN = thinBuckets(rows);
  if (sameEntryRows.length === 4 && ![...sameEntryRows.map((r) => BUCKET_OF[r.setting]), myBucket].some((b) => THIN.includes(b))) {
    console.error(`\n${"=".repeat(72)}`);
    console.error(`NO THIN BUCKET IN THIS ENTRY`);
    console.error(`  logged: ${sameEntryRows.map((r) => `${r.slot} ${r.setting} (${BUCKET_OF[r.setting]})`).join(", ")}, ${slot} ${setting} (${myBucket})`);
    console.error(`  At least one of the five must sit in a thin bucket — currently:`);
    console.error(`  ${THIN.join(", ")}`);
    console.error(`  Move one facet to a thinner register and re-log it.`);
    console.error(`${"=".repeat(72)}\n`);
    process.exit(1);
  }
  const sameEntry = rows.filter((r) => r.slug === slug);
  if (sameEntry.some((r) => r.setting === setting)) console.warn(`! ${slug} already uses setting "${setting}"`);
  if (sameEntry.some((r) => r.scenario === scenario)) console.warn(`! ${slug} already uses scenario "${scenario}"`);
  const elsewhere = rows.filter((r) => r.setting === setting && r.scenario === scenario);
  if (elsewhere.length) console.warn(`! "${setting} + ${scenario}" already used in ${elsewhere.map((r) => r.slug).join(", ")}`);
  const body = existsSync(LEDGER) ? readFileSync(LEDGER, "utf8").replace(/\n*$/, "\n") : `${HEADER}\n`;
  writeFileSync(LEDGER, `${body}${slug}\t${slot}\t${setting}\t${scenario}\t${cast}\t${pitch}\n`);
  console.log(`logged ${slug} ${slot}`);
}

// `plan` validates a whole batch before a word of prose exists. The incremental
// `add` only fails on the fifth row, by which point the writing is done and the
// pull is to keep it — this moves every constraint to the cheapest moment.
//
//   node scripts/facet-ledger.mjs plan batch-03.tsv
//
// The file is headerless TSV: slug, slot, setting, scenario, cast, pitch
// Settings that are not blocked by the 10-entry window, grouped by bucket. The
// window was only ever reported as a refusal, so picking a setting meant guessing
// and being told no — this is the same information handed over the other way round.
const freeSettings = (history, alsoBlocked = []) => {
  const blocked = recentSettings(history);
  const out = [];
  for (const [bucket, places] of Object.entries(BUCKETS)) {
    const free = places.filter((s) => !blocked.has(s) && !alsoBlocked.includes(s));
    out.push([bucket, free, places.length - free.length]);
  }
  return out;
};

const printFree = (history, alsoBlocked = []) => {
  const THIN = thinBuckets(history);
  console.log(`settings free right now — ${SETTING_WINDOW}-entry window applied\n`);
  for (const [bucket, free, nBlocked] of freeSettings(history, alsoBlocked)) {
    const tag = THIN.includes(bucket) ? " (THIN — an entry needs one of these)" : "";
    const tail = nBlocked ? `   [${nBlocked} blocked]` : "";
    console.log(`  ${bucket}${tag}`);
    console.log(`    ${free.length ? free.join(", ") : "— nothing free"}${tail}`);
  }
  if (!THIN.length) console.log(`\nno thin buckets at present — the thin-bucket rule is inert this pass`);
};

if (cmd === "free") {
  printFree(rows);
  process.exit(0);
}

if (cmd === "plan") {
  const file = process.argv[3];
  if (!file) {
    printFree(rows);
    console.log(`\nusage: plan <file.tsv>`);
    process.exit(1);
  }
  const proposed = readFileSync(resolve(root, file), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("slug\t"))
    .map((l) => {
      const [slug, slot, setting, scenario, cast, pitch] = l.split("\t").map((x) => x.trim());
      return { slug, slot, setting, scenario, cast, pitch };
    });

  let bad = 0;

  // Every row must carry a stated stakes clause, as a `# STAKES:` comment under it.
  //
  // This is FACETS.md step 4 — "state the stakes in a clause: if it comes out 'nothing
  // much', throw that scene away now rather than after it is written" — made into a
  // gate, because the rule on its own does not hold. A whole session went through
  // without the clause ever being written, and `plan` waved the scenes past: it checks
  // buckets, settings, casts and pitch, none of which can see that a scene is empty.
  // What came out was a sofa with a fourteen-week lead time, a man counting change at a
  // bank, and a free head massage declined — three probes with nothing at risk in any
  // of them. Writing the clause is what forces the judgement, so the batch is refused
  // until it exists.
  {
    const raw = readFileSync(resolve(root, file), "utf8").split("\n");
    let current = null;
    let seen = false;
    const missing = [];
    const close = () => { if (current && !seen) missing.push(current); };
    for (const l of raw) {
      if (!l.trim()) continue;
      if (l.startsWith("#")) {
        if (/^#\s*STAKES:\s*\S/i.test(l)) seen = true;
        continue;
      }
      if (l.startsWith("slug\t")) continue;
      close();
      const [slug, slot] = l.split("\t").map((x) => x.trim());
      current = `${slug} ${slot}`;
      seen = false;
    }
    close();
    if (missing.length) {
      console.error(`✗ ${missing.length} rows with no stated stakes:`);
      for (const m of missing) console.error(`    ${m}`);
      console.error(`  Put "# STAKES: <what it costs, in a clause>" under each row.`);
      console.error(`  If a clause comes out as "nothing much", the scene is admin — replace it.`);
      bad += missing.length;
    }
  }

  const bySlug = new Map();
  for (const r of proposed) bySlug.set(r.slug, [...(bySlug.get(r.slug) ?? []), r]);

  // Unknown settings and duplicate scenarios inside the batch itself.
  for (const r of proposed) {
    if (!SETTINGS.includes(r.setting)) {
      console.error(`✗ ${r.slug} ${r.slot}: "${r.setting}" is not in the vocabulary`);
      bad++;
    }
    if (!SLOTS.includes(r.slot)) { console.error(`✗ ${r.slug}: bad slot "${r.slot}"`); bad++; }
    if (!/^[a-z]+-[a-z]+$/.test(r.scenario)) {
      console.error(`✗ ${r.slug} ${r.slot}: scenario "${r.scenario}" must be two hyphenated words`);
      bad++;
    }
  }
  const seenScenario = new Map();
  for (const r of proposed) {
    if (seenScenario.has(r.scenario)) {
      console.error(`✗ scenario "${r.scenario}" appears twice in this batch (${seenScenario.get(r.scenario)}, ${r.slug})`);
      bad++;
    }
    seenScenario.set(r.scenario, r.slug);
  }
  // A setting may not repeat across the batch either — five entries in one sitting
  // is exactly where the same place gets reached for twice.
  const seenSetting = new Map();
  for (const r of proposed) {
    if (seenSetting.has(r.setting) && seenSetting.get(r.setting) !== r.slug) {
      console.error(`✗ setting "${r.setting}" used by two entries in this batch (${seenSetting.get(r.setting)}, ${r.slug})`);
      bad++;
    }
    seenSetting.set(r.setting, r.slug);
  }

  // Then each entry against the whole ledger, with the batch's own earlier rows
  // treated as history so entry 5 is checked against entry 1.
  const history = [...rows];
  for (const [slug, five] of bySlug) {
    if (five.length !== 5) {
      console.error(`✗ ${slug}: ${five.length} rows, want 5`);
      bad++;
      continue;
    }
    if (rows.some((r) => r.slug === slug)) console.warn(`! ${slug} is already logged — plan replaces it`);
    const errs = checkEntry(slug, five, history);
    if (errs.length) {
      console.error(`✗ ${slug}`);
      for (const e of errs) console.error(`    ${e}`);
      // Refusing a setting without naming a replacement is what makes this loop
      // slow: you re-guess, and get refused again.
      const stuck = errs.filter((e) => e.startsWith(`setting "`)).map((e) => e.split(`"`)[1]);
      if (stuck.length) {
        const blocked = recentSettings(history);
        for (const st of stuck) {
          const free = (BUCKETS[BUCKET_OF[st]] ?? []).filter((x) => !blocked.has(x));
          console.error(`      free in ${BUCKET_OF[st]}: ${free.length ? free.join(", ") : "nothing — use another bucket"}`);
        }
      }
      bad += errs.length;
    } else {
      console.log(`✓ ${slug}  ${five.map((r) => `${r.slot}:${r.setting}`).join("  ")}`);
    }
    history.push(...five);
  }

  console.log(`\n${bySlug.size} entries, ${proposed.length} facets, ${bad} problem${bad === 1 ? "" : "s"}`);
  if (bad) {
    console.error("\nFix the plan before writing any prose.");
    process.exit(1);
  }
  console.log("Plan is clean. Write the prose, then `commit` this file.");
}

// Append a validated plan file to the ledger in one go.
if (cmd === "commit") {
  const file = process.argv[3];
  // The cold read goes last, always. `commit` is the gate that makes that true: it
  // refuses a batch whose facets have been edited since they were read. Nothing else
  // in this pipeline can catch a missing referent, and the way the cold read fails is
  // never refusal — it is a tidying pass made after the reading was done.
  const cold = spawnSync(process.execPath, [resolve(root, "scripts/cold-read.mjs"), "check", file], {
    encoding: "utf8",
  });
  process.stderr.write(cold.stderr || "");
  if (cold.status !== 0) {
    console.error("\nrefusing to commit. Cold-read the lines above on their FINAL text —");
    console.error("ON THE PAGE / THE ACT NEEDS, in writing, into the batch file — then");
    console.error("`node scripts/cold-read.mjs stamp " + file + "` and commit again.");
    process.exit(1);
  }
  const proposed = readFileSync(resolve(root, file), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("slug\t"));
  const slugs = new Set(proposed.map((l) => l.split("\t")[0].trim()));
  const kept = readFileSync(LEDGER, "utf8").split("\n").filter((l) => l.trim() && !slugs.has(l.split("\t")[0]));
  const body = proposed.map((l) => l.split("\t").map((x) => x.trim()).join("\t"));
  writeFileSync(LEDGER, [...kept, ...body].join("\n") + "\n");
  console.log(`committed ${body.length} rows for ${slugs.size} entries`);
}
