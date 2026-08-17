// Structural linter for facet prose. Catches the two ways a batch goes stale —
// one sentence-skeleton repeated, and every line the same length — plus the
// "muddiness" constructions that varied prose degrades into.
//
// Run: node scripts/lint-facets.mjs [--bean=adzuki] [--file=path/to/batch.json]
// With --file it lints a batch JSON before it is applied; otherwise it reads the
// corpus. Exit code 1 if anything fails.
import { readdirSync, readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

// A place lexicon: generic locations plus anything the settings census knows about.
const PLACE = /\b(gym|ring|rink|pool|baths|hall|room|kitchen|shed|yard|field|farm|barn|wood|woods|forest|hill|fell|beach|shore|river|lake|road|street|lane|station|platform|train|bus|car|van|boat|ferry|shop|counter|desk|office|site|works|factory|warehouse|depot|floor|studio|stage|theatre|cinema|museum|gallery|library|church|chapel|cathedral|hospital|surgery|pharmacy|ward|school|classroom|pitch|court|track|range|wall|cave|quarry|mine|tunnel|bridge|pier|harbour|dock|market|stall|auction|fete|fair|pub|bar|taproom|brewery|bakery|cafe|restaurant|hotel|cottage|house|flat|garden|allotment|orchard|loft|attic|cellar|garage|forge|workshop|laundrette|hide|lighthouse|observatory|reservoir|moor|ridge|summit|slope|piste|carriage|compartment|aisle|queue|window|door|table|gate|kerb|park|zoo|aquarium|circus|tent|hut|club|centre|home|unit|lock|weir|bank|towpath|building|premises|site|ovens|counter)\b/i;
const PERSON = /\b(lad|bloke|guy|man|woman|boy|girl|kid|fella|chap|one|other)\b/i;

// — ported from lint-questions.mjs, where the same failures show up —

// Regional slang. The corpus is British English, but these read as dialect
// rather than plain speech, and they age the voice.
const UK_CODED =
  /\b(lad|lads|lass|lasses|bloke|blokes|mate|mates|chap|chaps|geezer|bruv|pal|missus|bairn|brolly|naff|chuffed|gutted|knackered|faff|blimey|innit|mardy|nowt|owt|wee|aye|guv)\b/i;

// The reader is in their twenties or thirties. These cast them as somebody's
// grandparent, a retiree, or a fixture of parish life.
const OLD_CODED =
  /\b(your (grand(son|daughter|child|children|kids?))|grandkids?|your retirement|sheltered housing|the parish|parish council|bowls club|bingo|the WI|women's institute|allotment committee|residents' association)\b/i;

// Vague civic-community scenery. It reads as generic English-village set
// dressing, not a place a reader has actually stood in.
const COMMUNITY_SETTING =
  /\b(village (hall|fete|green|show)|church hall|community (hall|centre)|parish hall|scout hut|jumble sale|tombola|raffle table|coffee morning|bring-and-buy|harvest festival|WI meeting|town hall meeting)\b/i;

// Placeholder nouns doing the work a real object should do — the "concrete
// means literal" failure. "the thing you want", "a decision", "something".
const PLACEHOLDER =
  /\b(a thing|the thing you want|a decision|an event|an occasion that matters|it goes wrong)\b/i;

// A quantity of content standing in for the content itself.
const VAGUE_QUANTITY =
  /\b(the whole of it|the whole thing|all of it|the lot|the rest of it|start to finish|end to end|at length|in full|the full story|every bit|the whole lot)\b/i;

// A trailing clause that watches the result instead of stopping on the act.
// This is the pre-resolution failure: the sentence votes before the button can.
const OUTCOME_TAIL =
  /(?<!\bgo|\bcome|\bgone)\s*,?\s+(and|then)\s+(watch|see|find|notice|feel|realise|realize|lose|win|gain|regret|wonder|discover|end up|have them|leave them|let them see)\b/i;

// The reflexive intensifier: a trailing clause bolted on AFTER the act has landed,
// which only cranks a dial — how fast, how completely, how little it touched you.
// It adds nothing the verb didn't carry, and it editorialises the reader (usually
// into somebody colder than the pole needs). Position is what makes it a fault:
// "you've already topped the tank" is a perfectly good act, "…and you're already
// onto the next one" bolted after one is not. So this only fires on a ", and …"
// clause in the final sentence whose whole content is manner.
const INTENSIFIER_TAIL =
  /,\s+and\b[^.]*\b(already|barely|hardly|not even|so much as|without looking|in about a (?:minute|second)|inside a minute)\b[^.]*$/i;

// Definite references to things a scene cannot imply. "the call" is fine when
// somebody rang; "your conversation" is not, unless the line said you were in one.
// Restricted to nouns that must be put on the page explicitly — 0 of 320 approved
// facets trip this, 31 drafts do.
const UNESTABLISHED_REFERENT =
  /\b(?:the|your|their|his|her)\s+(conversation|argument|row|discussion|plan|list|meeting|arrangement|invitation|topic|issue)\b/i;

// The act belongs to the reader. A passive closing clause ("your notice goes in",
// "the family have been messaged") hands it to nobody in particular and drains the
// vote. 3 of 320 approved facets close passive; 67 drafts do.
const PASSIVE_CLOSE =
  /\b(is|are|was|were|been|be|gets|got|goes|went)\s+(\w+ed|done|made|sent|told|given|taken|written|paid|booked|left|put|held|seen|known|hired|printed|organised)\b/i;

// A trailing relative or participial clause that comments on the act instead of
// being one — "…, which nobody else at the table will understand". The act stops
// happening and the sentence turns into an explanation of why it mattered. The
// vote is the act, so the act has to be the last thing on the page.
const COMMENT_TAIL =
  /,\s+(which|who|whom|whose|meaning|knowing|leaving|making it|so that)\b[^,]*[.!?]?$/i;

// A tail measuring the act against what other people had not yet done.
const MANNER_TAIL =
  /,?\s+before\s+(anybody|anyone|either|any of them|the others?|they|he|she)\b[^,]{0,20}\b(has|have|had|could|can|is|are|gets?|said|spoke|spoken|answered|finished)\b/i;

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const FACETS = ["facetMost", "facetHigh", "facetMid", "facetLow", "facetLeast"];
const FORTUNES = ["fortuneMost", "fortuneHigh", "fortuneMid", "fortuneLow", "fortuneLeast", "seasonalFortune"];
// Overlap with the entry's own question/answers is fine — they share a trait, so they
// share vocabulary. Overlap with its fortunes is the cardinal-rule failure.
const RARE_DF = 10;
const STOP = new Set("about after again against along already also always another anything around because been before being below beside between could does doing done down during each either enough every everyone from have having here into itself just least less like made make many might more most much must never next nothing only other over same should since some such than that their them then there these they thing think this those three through under until very were what when where which while will with without would your yours".split(" "));

// — length band, measured off the approved entries —
// per-facet words: min 14, p5 22, median 36, p95 53, max 67
// per-entry median: 24-48 covers 57/64; spread (longest minus shortest) has p10 of 8
const MIN = 14, MAX = 70, MED_LO = 24, MED_HI = 48, MIN_SPREAD = 8;
// — shape caps —
// also retuned: approved entries routinely run three facets on one shape, and four
// of five as two-sentence lines. Five of five is still monotony worth flagging.
const MAX_SAME_SHAPE_PER_ENTRY = 3, MAX_TWO_SENTENCE_PER_ENTRY = 4;
const MAX_SHAPE_SHARE = 0.3, MAX_OPENER_SHARE = 0.25, MAX_CLOSING_VERB_SHARE = 0.08;

// Quote-aware: "We did it! Nine locks!" is one sentence, not three. Naive
// splitting here also mis-scored shape and mis-read the closing act.
const sentences = (s) => {
  const out = [];
  let buf = "", inQuote = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    buf += ch;
    if (ch === '"' || ch === "\u201c" || ch === "\u201d") inQuote = !inQuote;
    if (!inQuote && ".!?".includes(ch)) {
      let j = i + 1;
      while (j < s.length && '"\u201d)'.includes(s[j])) buf += s[j++];
      if (j >= s.length || (s[j] === " " && /[A-Z]/.test(s[j + 1] ?? ""))) {
        out.push(buf.trim());
        buf = "";
        while (j < s.length && s[j] === " ") j++;
      }
      i = j - 1;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
};
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
// — the blank —
// The failure this catches is NOT a broken reference. It is a reference that
// resolves perfectly to another empty phrase: "the hours" pointing back at
// "eleven months of this", each licensing the other, neither containing a fact.
// The cold read cannot see it, because ON THE PAGE / THE ACT NEEDS test whether a
// phrase resolves, and a blank resolves fine.
const CONTENT_NOUN =
  "reason|thing|work|job|situation|course|hours|stuff|business|matter|story|subject|issue|game|trial|impression|order|news|routine|arrangement|condition|problem|qualification|tickets";
const DETERMINER = /^(the|that|this|these|those|your|his|her|their|its|our|a|an|one|some|any|no|every)$/i;

function unnamed(line) {
  const out = [];
  const stand_in =
    /\b(?:months?|years?|weeks?|days?|hours?|nights?)\s+of\s+this\b|\bthe\s+same\s+reason\b|\bfor\s+the\s+same\s+\w+\s+(?:you|she|he|they)\b/i;
  const d = line.match(stand_in);
  if (d) out.push(`"${d[0]}" stands in for the fact instead of stating it`);

  const bare = new RegExp(
    `\\b(?:the|that|this|your|his|her|their)\\s+(${CONTENT_NOUN})\\b`,
    "gi",
  );
  const flagged = new Set();
  for (const m of line.matchAll(bare)) {
    const noun = m[1].toLowerCase();
    if (flagged.has(noun)) continue;
    // Qualified AFTER: "the impression of his boss", "the game about holidays".
    // Qualified AFTER, including the relative clause with the relativiser dropped:
    // "the reason they stopped", "the business you were sure would take off". A
    // human reads those as identified; without this they read as blanks.
    const after = new RegExp(
      `\\b${noun}\\s+(of|for|with|that|who|which|about|on|at|in|from|\\w+ing` +
        `|you|he|she|they|it|we|i|somebody|someone|nobody|everyone|his|her|your|their|the|a|an)\\b`,
      "i",
    );
    // Qualified BEFORE by a modifier that is not a determiner: "judo trial",
    // "surveying diploma", "milk round", "electrician's tickets".
    let before = false;
    const re = new RegExp(`(\\S+)\\s+${noun}\\b`, "gi");
    for (const b of line.matchAll(re)) {
      const w = b[1].replace(/[^\w']/g, "");
      if (w && !DETERMINER.test(w)) before = true;
    }
    if (!after.test(line) && !before) {
      flagged.add(noun);
      out.push(`"${noun}" names a category, never which one`);
    }
  }
  return out;
}

function muddy(line) {
  const out = [];
  for (const s of sentences(line)) {
    // A sentence needs at least one inflected verb form or auxiliary.
    const hasVerb = /\b(is|are|was|were|be|been|has|have|had|does|do|did|will|would|can|could|should|must|let|go|get|put|take|make|come|give|keep|hold|tell|say|see|know|find|leave|stand|sit|walk|run|buy|read|wait|turn|hand|ask|want|need|feel|look|bring|send|write|catch|cut|set|shut|split|hit|beat|quit|meet|pay|lay|lose|win|draw|throw|fall|rise|ring|sing|swim|drive|ride|wear|break|speak|choose|freeze|stick|strike|swear|tear|wake|bear|eat|drink|sleep|spend|build|lend|bend|send|dig|hang|hurt|let|cost|burst|open|start|stop|close|stay|delete|fell|pick|pin|tie|call|push|pull|sign|book|ring|text|carry|point|move|watch|order|book|swap|join|fill|lock|press|apologise|decide|explain|offer|promise|refuse|agree|continue|arrive|post|vote|email|sign|ring|text|book|park|film|phone|queue|claim|count|mark|note|list|name|price|date|time|place|face|hand|head|back|front|stack|trade|swap|split|share|cover|clear|check)\b|\w+(s|ed|ing)\b|'(s|re|ve|d|ll|m)\b|n't\b/i.test(s);
    if (!hasVerb) out.push(`verbless: "${s.slice(0, 40)}..."`);
    const beforeVerb = s.split(/\b(is|are|was|were|you)\b/i)[0] || "";
    if ((beforeVerb.match(/,/g) || []).length > 2) out.push(`stacked clauses before the main verb`);
  }
  // Mechanics: no dating anchors. Day names and seasons pin the scene to a
  // calendar the reader isn't in; clock times and "at the weekend" are fine.
  // Only the anchoring construction on day names: "by Tuesday", "next Friday".
  // Seasons are fine to name, and approved facets use day names as recurrences
  // ("those Saturday lessons", "every Sunday"), which read as fact not date.
  const DATING = /\b(until|till|by|next|last|this)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i;
  const dateHit = line.match(DATING);
  if (dateHit) out.push(`"${dateHit[0]}" pins the scene to a calendar date`);
  const firstSentence = sentences(line)[0] || "";
  // Jargon nouns that smuggle in a whole location. Fine once the place is on the
  // page ("the corner" after "boxing gym"), unreadable before it.
  const JARGON = /\bthe\s+(corner|ring|rounds|flight|square|mart|pen|lock|hide|shift|pit|bench|rota|paddock|stalls|wicket|crease)\b/i;
  const jargonHit = line.match(JARGON);
  // A line that introduces the noun itself has already done the work — "somebody
  // drew up a rota... you put it back the way the rota has it" needs no place name.
  const jargonNoun = jargonHit?.[1];
  const introduced = jargonNoun && new RegExp(`\\b(a|an|one|some|another)\\s+${jargonNoun}\\b`, "i").test(line);
  const flightIsAircraft = jargonNoun === "flight" && /\b(plane|aircraft|airport|fly|flying|flown|departure)\b/i.test(line);
  if (jargonHit && !introduced && !PLACE.test(line) && !flightIsAircraft)
    out.push(`"${jargonHit[0]}" carries a setting the line never names`);
  const earlyDefinitePerson = firstSentence.match(/\bthe\s+(\w+)\b/i);
  // A defining clause after the noun does the identifying work, so "the woman who
  // runs the shop" and "the man behind the glass" both pass. A defining PARTICIPLE
  // does the same job — "the man playing the lead", "the woman doing the forms" —
  // and used to trip this check for want of a relative pronoun.
  const qualified = new RegExp(`the\\s+${earlyDefinitePerson ? earlyDefinitePerson[1] : "x"}\\s+(who|that|you|at|in|on|with|behind|from|ahead|next|opposite|beside|\\w+ing)\\b`, "i");
  const idiomaticOne = /\bthe one (about|where|with|when)\b/i.test(firstSentence);
  if (earlyDefinitePerson && PERSON.test(earlyDefinitePerson[1]) && !qualified.test(firstSentence) && !idiomaticOne)
    out.push(`"the ${earlyDefinitePerson[1]}" introduced as though already known`);
  if ((line.match(/\bit\b/gi) || []).length > 3) out.push(`"it" used 4+ times`);
  if ((line.match(/^\w+ing\b|,\s\w+ing\b/g) || []).length > 1) out.push(`two participial phrases`);
  if (!/\b(the|a|an|your|yours|their|his|her|its|our|this|that|these|those|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|sixty|ninety|hundred|first|second|third|last|half|somebody|someone|nobody|everybody)\b/i.test(line.split(/\s+/).slice(0, 8).join(" ")))
    out.push(`no concrete noun phrase in the first 8 words`);
  return out;
}

// — collect —
let entries = [];
const fileArg = process.argv.find((a) => a.startsWith("--file="));
const beanArg = process.argv.find((a) => a.startsWith("--bean="));
const writtenOnly = process.argv.includes("--written");
if (fileArg) {
  const batch = JSON.parse(readFileSync(resolve(root, fileArg.split("=")[1]), "utf8"));
  entries = Object.entries(batch).map(([slug, v]) => ({
    slug,
    facets: FACETS.map((k) => v[k]),
    fortunes: FORTUNES.map((k) => v[k]).filter(Boolean),
    written: true,
  }));
} else {
  const dir = resolve(root, "src/content/zodiacs");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const raw = readFileSync(resolve(dir, f), "utf8");
    const { data } = matter(raw);
    if (beanArg && data.bean !== beanArg.split("=")[1]) continue;
    const facets = FACETS.map((k) => data[k]).filter(Boolean);
    const fortunes = FORTUNES.map((k) => data[k]).filter(Boolean);
    const written = Boolean(data.lastUpdated);
    if (writtenOnly && !written) continue;
    const actions = FACETS.map((k) => data[`${k}Action`]);
    if (facets.length === 5) entries.push({ slug: data.slug, facets, fortunes, written, actions });
  }
}

// — corpus document frequency, so "shares the word paint with its own fortune" can be
// told apart from "shares the word house with everything ever written".
const contentWords = (line) =>
  new Set(
    (line.toLowerCase().match(/[a-z']+/g) || []).filter((w) => w.length > 3 && !STOP.has(w))
  );
const docFreq = new Map();
{
  const dir = resolve(root, "src/content/zodiacs");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const { data } = matter(readFileSync(resolve(dir, f), "utf8"));
    const seen = new Set();
    for (const k of [...FACETS, ...FORTUNES]) {
      if (data[k]) for (const w of contentWords(data[k])) seen.add(w);
    }
    for (const w of seen) docFreq.set(w, (docFreq.get(w) ?? 0) + 1);
  }
}

// — the ledger has to keep up with what's been written —
const ledgerPath = resolve(root, "src/content/facet-ledger.tsv");
const ledgerSlugs = new Set(
  existsSync(ledgerPath)
    ? readFileSync(ledgerPath, "utf8").split("\n").slice(1).filter(Boolean).map((l) => l.split("\t")[0])
    : []
);

// — check —
const problems = [];
const warnings = [];
// ADVISORIES — shape heuristics with no taste. NEVER edit prose to clear one.
//
// These two are here because they caused real damage. `bitter-fried-green` facetHigh
// was a 35-word scene until the spread flag fired; it got cut to 26 purely to
// manufacture length variance, and came out as verbless telegraphese with no person in
// it — the worst line in the corpus. `share shape D-beats` fires on any facet of three
// or more sentences, which is what detailed setup plus a blunt act produces; it trips
// 48 entries including approved ones.
//
// They still print, because an entry where all five really are the same length and
// cadence is worth looking at. But they are a prompt to reconsider the SCENES, never a
// reason to touch a sentence. FACETS.md, step 8: the instrument has no taste, and
// contorting a good line to satisfy a heuristic is how the worst sentence in that
// document got written.
const advisories = [];
const shapeCount = {}, openerCount = {}, closingVerb = {};
let all = [];
for (const { slug, facets, fortunes, written, actions } of entries) {
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
  const spread = Math.max(...lens) - Math.min(...lens);
  if (spread < MIN_SPREAD)
    advisories.push(`${slug}: all five within ${spread} words of each other (want >= ${MIN_SPREAD})`);
  const med = [...lens].sort((a, b) => a - b)[2];
  if (med < MED_LO || med > MED_HI) problems.push(`${slug}: median ${med}, outside ${MED_LO}-${MED_HI}`);

  for (const [s, c] of Object.entries(shapes.reduce((a, s) => ((a[s] = (a[s] || 0) + 1), a), {})))
    if (c > MAX_SAME_SHAPE_PER_ENTRY) advisories.push(`${slug}: ${c} facets share shape ${s}`);

  // Two facets in one entry ending on the same gesture reads as one probe asked
  // twice, and it is invisible while writing them a few minutes apart — two of
  // sweet-boiled-butter's five closed on making tea.
  {
    const gestures = facets.map((line) => {
      // Only the closing gesture — the last handful of words — not the whole
      // sentence, or a prop merely mentioned in the setup counts as a repeat.
      const last = sentences(line).at(-1).toLowerCase().split(/\s+/).slice(-8).join(" ");
      const verbs = (last.match(/\b(kettle|tea|coat|phone|drink|glass|door|bag|keys|table|chair|hand|coffee)\b/g) || []);
      return verbs.length ? verbs.join("+") : null;
    });
    const counts = {};
    gestures.forEach((g) => g && (counts[g] = (counts[g] || 0) + 1));
    for (const [g, c] of Object.entries(counts))
      if (c > 1) problems.push(`${slug}: ${c} facets close on the same object (${g.replace(/\+/g, ", ")})`);
  }

  // facet*Action duplicates the facet's closing sentence, for the front end to style
  // separately. It is written by hand, so it drifts the moment a facet is edited.
  facets.forEach((line, i) => {
    const want = sentences(line).at(-1);
    const got = actions?.[i];
    // Only entries that have been through the rewrite carry the field; the
    // unfinished ones will get it when they are written. Once present, it must match.
    if (!got) {
      if (written) problems.push(`${slug} ${FACETS[i]}Action: missing`);
    } else if (got.trim() !== want.trim())
      problems.push(`${slug} ${FACETS[i]}Action: out of sync — should be "${want.slice(0, 50)}..."`);
  });
  const two = facets.filter((l) => sentences(l).length === 2).length;
  if (two > MAX_TWO_SENTENCE_PER_ENTRY) problems.push(`${slug}: ${two} two-sentence facets (max ${MAX_TWO_SENTENCE_PER_ENTRY})`);

  facets.forEach((l, i) => muddy(l).forEach((m) => problems.push(`${slug} ${FACETS[i]}: ${m}`)));
  facets.forEach((l, i) => unnamed(l).forEach((m) => warnings.push(`${slug} ${FACETS[i]}: ${m}`)));

  facets.forEach((line, i) => {
    const field = `${slug} ${FACETS[i]}`;

    // YAML hazards — both break the frontmatter parse outright.
    if (/^"/.test(line)) problems.push(`${field}: opens with a quotation mark (breaks YAML)`);
    if (/: /.test(line)) problems.push(`${field}: contains ": " (breaks YAML)`);

    const uk = line.match(UK_CODED);
    if (uk) problems.push(`${field}: "${uk[0]}" is regional slang — use plain speech`);
    const civic = line.match(COMMUNITY_SETTING);
    if (civic) problems.push(`${field}: "${civic[0]}" is vague community scenery`);
    const old = line.match(OLD_CODED);
    if (old) warnings.push(`${field}: "${old[0]}" casts the reader older than their twenties or thirties`);
    const ph = line.match(PLACEHOLDER);
    if (ph) warnings.push(`${field}: "${ph[0]}" is a placeholder where a real object should be`);
    const last = sentences(line).at(-1) ?? "";

    const vq = line.match(VAGUE_QUANTITY);
    if (vq) warnings.push(`${field}: "${vq[0]}" names a quantity of content, not the content`);
    const ot = line.match(OUTCOME_TAIL);
    if (ot) warnings.push(`${field}: "${ot[0].trim()}" watches the result instead of stopping on the act`);
    const it = last.replace(/[.!?]+$/, "").match(INTENSIFIER_TAIL);
    if (it) warnings.push(`${field}: "${it[0].trim()}" is a manner tail after the act — cut it, or make it an act`);
    const ref = last.match(UNESTABLISHED_REFERENT);
    if (ref && !sentences(line).slice(0, -1).join(" ").toLowerCase().includes(ref[1].toLowerCase()))
      problems.push(`${field}: "${ref[0]}" refers to something the line never put on the page`);
    const closingClause = last.split(/,\s+(?:and|so|then|but|which)\s+|,\s+/).at(-1) ?? last;
    const pc = closingClause.match(PASSIVE_CLOSE);
    if (pc) warnings.push(`${field}: closing sentence goes passive ("${pc[0]}") — put the act back on the reader`);
    const mt = line.match(MANNER_TAIL);
    if (mt) warnings.push(`${field}: "${mt[0].trim()}" measures the act against what others hadn't done`);

    // The habit-summary foil describes a character instead of a moment. Scene-specific
    // foils ("You weren't planning to, but…") are deliberate and must not be caught.
    const habit = line.match(/\byou(?:'d| would)? (?:normally|usually|always)\b/i);
    if (habit) problems.push(`${field}: "${habit[0]}" summarises a habit instead of staying in the moment`);

    // A facet whose whole text is one sentence has no setup, so the closing sentence
    // lifted into facet*Action carries the entire scene. Scoped to entries carrying
    // facet*Action but not yet approved: thirteen APPROVED facets are single-sentence,
    // and they predate the Action field, so this is not a universal rule.
    if (sentences(line).length === 1 && actions[i] !== undefined && !written)
      problems.push(`${field}: whole facet is one sentence — no setup, so the act is the entire scene`);

    // The act lands last: 95% of approved facets close on a sentence with "you" in it.
    if (!/\byou\b/i.test(last)) warnings.push(`${field}: last sentence has no "you" — does the act land last?`);
    if (/\brather than\b|\binstead of\b|\bwithout \w+ing\b/i.test(last))
      warnings.push(`${field}: closing act is framed as not-doing — leave that to Resist`);
    // "You leave them where they are" is a not-doing wearing an active verb: the reader
    // performs no act, and the vote has nothing to attach to. Slipped past the clause
    // above twice in one pass because it contains neither "rather than" nor "without".
    if (/\bleaves?\s+(it|them|him|her|the\s+\w+)\s+(where|as|exactly where)\b/i.test(last))
      warnings.push(`${field}: closing act is a not-doing in an active verb — nothing happens`);
    const pastAct = last.match(/\bYou\s+(\w+ed)\b/);
    if (pastAct) warnings.push(`${field}: closing act "${pastAct[0]}" reads past tense`);

    // Cardinal rule: a facet must not reuse its own entry's fortune imagery.
    const fc = contentWords(line);
    fortunes.forEach((f, fi) => {
      const shared = [...contentWords(f)].filter((w) => fc.has(w) && (docFreq.get(w) ?? 0) <= RARE_DF);
      if (shared.length)
        warnings.push(`${field}: shares "${shared.join('", "')}" with ${FORTUNES[fi]}`);
    });
  });

  if (written && !ledgerSlugs.has(slug) && !fileArg)
    problems.push(`${slug}: written (lastUpdated set) but absent from facet-ledger.tsv`);
}

const n = all.length;
for (const [s, c] of Object.entries(shapeCount))
  if (c / n > MAX_SHAPE_SHARE) advisories.push(`BATCH: shape ${s} is ${Math.round((c / n) * 100)}% (max ${MAX_SHAPE_SHARE * 100}%)`);
for (const [o, c] of Object.entries(openerCount))
  if (c / n > MAX_OPENER_SHARE) problems.push(`BATCH: opener "${o}" is ${Math.round((c / n) * 100)}% (max ${MAX_OPENER_SHARE * 100}%)`);
for (const [v, c] of Object.entries(closingVerb))
  if (c / n > MAX_CLOSING_VERB_SHARE) problems.push(`BATCH: "You ${v}" is ${Math.round((c / n) * 100)}% of facets (max ${MAX_CLOSING_VERB_SHARE * 100}%)`);

const sorted = [...all].sort((a, b) => a - b);
console.log(`${entries.length} entries, ${n} facets`);
console.log(`length  min ${sorted[0]}  p25 ${sorted[Math.floor(n * 0.25)]}  median ${sorted[Math.floor(n / 2)]}  p75 ${sorted[Math.floor(n * 0.75)]}  max ${sorted[n - 1]}`);
console.log(`shapes  ${Object.entries(shapeCount).sort((a, b) => b[1] - a[1]).map(([s, c]) => `${s}:${c}`).join("  ")}`);
console.log(`openers ${Object.entries(openerCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([o, c]) => `${o}:${c}`).join("  ")}\n`);
if (warnings.length) console.log(`${warnings.length} warnings (review, not failures):\n` + warnings.join("\n") + "\n");
if (advisories.length)
  console.log(
    `${advisories.length} advisories — SHAPE HEURISTICS, NEVER EDIT PROSE TO CLEAR THESE.\n` +
      `Reconsider a scene if you like; do not touch a sentence to move a number.\n` +
      advisories.join("\n") + "\n"
  );
if (!problems.length) console.log("PASS — no structural problems");
else { console.log(`${problems.length} problems:\n` + problems.join("\n")); process.exitCode = 1; }
