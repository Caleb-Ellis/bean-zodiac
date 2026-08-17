// Structural linter for zodiac questions and their five answers. Catches the
// failures a question pass keeps rediscovering — answers that collapse into one
// act at five volumes, a question that names no object, answers that invent
// facts the question never established, and the openers that drone once you are
// twenty entries deep.
//
// Run: node scripts/lint-questions.mjs [--file=batch.json] [--bean=adzuki]
// With --file it lints a batch JSON before it is applied; otherwise it reads the
// corpus. Entries with `lastUpdated` filled in are APPROVED and never linted —
// they are only ever read as comparison targets for duplicates and prop
// collisions. Exit code 1 if anything fails.
//
// Thresholds were calibrated against those 64 approved entries: answer length
// p10 5 / median 9 / p90 12, question median 26 words, per-entry answer spread
// never below 2. Repeated answer-opening words are NOT an automatic failure —
// 27 of 64 approved entries repeat one — so collapse is reported for judgement
// rather than failed outright.
import { readdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dir = resolve(root, "src/content/zodiacs");
const SLOTS = ["answerMost", "answerHigh", "answerMid", "answerLow", "answerLeast"];

// — bands —
const ANS_MIN = 2, ANS_MAX = 18, ANS_SOFT_LO = 3, ANS_SOFT_HI = 14;
const MIN_SPREAD = 2;                 // longest answer minus shortest
const Q_MAX_WORDS = 45;
const MAX_ARTICLE_OPENER_SHARE = 0.4; // questions opening "A " / "The "
const MAX_ANSWER_VERB_SHARE = 0.08;   // one opening verb across the batch
const Q_SHAPE_TARGET = [0.2, 0.3];    // share of standalone questions

// Placeholder nouns doing the work a real object should do. `someone` and
// `somebody` are deliberately NOT here: QUESTIONS.md allows them when the asking
// itself is the concrete event ("someone asks you what time you'll be there").
// They are reported as a note instead.
const PLACEHOLDER =
  /\b(something|a thing|anything|somewhere|a decision|an occasion that matters|an event|it goes wrong)\b/i;
const SOFT_PLACEHOLDER = /\b(someone|somebody|properly|the right thing)\b/i;

// Beats QUESTIONS.md retires outright, plus the clusters the post-pass census found.
const RETIRED = [
  [/group chat.*(eat|dinner|where)|where to eat/i, "group chat about where to eat"],
  [/\b(gets?|got|states?) (a |the )?(fact|date|number|quote) wrong|nods along/i, "wrong fact, table nods along"],
  [/(draft|poem|manuscript|deck|painting|demo).{0,40}\b(what you think|your honest|honest opinion)/i, "bad draft, honest read"],
  [/(vents?|pours? it out|shares?).{0,40}(over coffee|long pause).{0,40}looks up/i, "friend vents over coffee"],
  [/(slide deck|slides|the brief).{0,30}(quick look|before the meeting)/i, "colleague's deck before a meeting"],
  [/meeting.{0,40}(nobody will call|circling|no one will decide)/i, "meeting nobody will call"],
  [/\bdinner party\b/i, "generic dinner party"],
  [/(night|last|late) bus\b/i, "the late/night bus"],
  [/(storm|sleet|blizzard|fog).{0,60}(ridge|summit|trail|group looks|turn back)/i, "storm on the trail"],
  [/landlord.{0,40}deposit|deposit.{0,40}landlord/i, "landlord and the deposit"],
  [/(padded|inflated) (quote|invoice)|\bscam(mer|ming)?\b/i, "padded quote / scam"],
];

// Heavily UK-coded vocabulary. The corpus is written in British English, but
// these read as regional slang rather than plain speech and date the voice.
// Applies to questions and answers alike.
const UK_CODED =
  /\b(lad|lads|lass|lasses|bloke|blokes|mate|mates|chap|chaps|geezer|bruv|pal|missus|bairn|quid|tenner|fiver|brolly|naff|chuffed|gutted|knackered|faff|blimey|innit|mardy|nowt|owt|wee|aye|guv)\b/i;

// An answer ends on the act. A trailing clause that watches the result — "and
// lose the room", "and watch the room adjust", "and take the present badly" —
// narrates the future instead of stopping, and steals the outcome from the
// reader's choice.
const OUTCOME_TAIL =
  /(?<!\bgo|\bcome|\bgone)\s*,?\s+(and|then)\s+(watch|see|find|notice|feel|realise|realize|lose|win|gain|regret|wonder|discover|end up|take it (?:badly|well|hard|personally)|have them|leave them|let them see)\b/i;

// Phrases that name a quantity of content instead of the content. "give them the
// whole of it, start to finish" says nothing about what is actually said, and
// cannot be told apart from the answer below it. 2 of 64 approved entries use
// one; 11 of mine did. Name the words, the objects, the moves.
const VAGUE_QUANTITY =
  /\b(the whole of it|the whole thing|all of it|the lot|the rest of it|start to finish|end to end|at length|in full|the full story|the details|every bit|the whole lot)\b/i;

// A trailing clause that measures the act by what other people had not yet done
// — "before either of them has spoken", "before anyone could answer". It implies
// haste instead of showing it, and it narrates the room rather than the reader.
const MANNER_TAIL =
  /,?\s+before\s+(anybody|anyone|either|any of them|the others?|they|he|she|it)\b[^,]{0,20}\b(has|have|had|could|can|is|are|gets?|said|spoke|spoken|answered|finished)\b/i;

// A number attached to a past duration or a tally is a FACT, not a choice. "tell
// her what the two years have cost her" invents a two-year affair out of a
// question that never dated it; "he's been treasurer for twenty years" invents a
// tenure. Reader-chosen quantities are fine and common ("give it ten minutes",
// "take three") — this catches only the historical form. 0 of 64 approved
// entries trip it; 3 of mine did before it existed.
const INVENTED_HISTORY =
  /\b(?:the|for|his|her|their)\s+(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty)\s+(?:years?|months?|weeks?|decades?)\b|\bthe\s+(second|third|fourth|fifth|sixth)\s+(?:time|go|attempt|asking)\b|\b(two|three|four|five|six|seven|eight|nine|ten)\s+\w+\s+out of\s+(two|three|four|five|six|seven|eight|nine|ten)\b/i;
const NUM_WORD = { second: "two", third: "three", fourth: "four", fifth: "five", sixth: "six" };
const NUM_BEFORE = { two: "one", three: "two", four: "three", five: "four", six: "five", seven: "six", eight: "seven", nine: "eight", ten: "nine", eleven: "ten", twelve: "eleven" };

// Comparatives and definite references with nothing in the question to measure
// against — "something tidier" (than what?), "the better one" (than which?).
const DANGLING_REF =
  /\b(tidier|better|worse|bigger|smaller|longer|shorter|sharper|softer|neater|simpler|nicer|safer|cheaper|more \w+|less \w+)\b/i;

// Pro-forms need an antecedent. "start one up and hold the whole room" under a
// question that never mentions a story or a room is unparseable — the reader
// cannot substitute a noun for "one". An answer using any of these must name at
// least one thing the question also names.
// Split in two. COUNT_PRO stands in for a countable noun and cannot be resolved
// from context — "start one up" is unreadable unless the question named a thing
// to start. That's a hard failure. The softer pro-forms below resolve from the
// scene often enough (a wasp nest → "it", the fortune-teller → "her") that they
// are printed as a worksheet to resolve by hand instead: 40% of the approved
// corpus would fail on a lexical-overlap rule.
const COUNT_PRO = /\b(?:another|the others?|else)\b|(?<!the (?:real|right|same|wrong|other|good|bad|first|last|next|only) )\bones?\b(?!\s+(?:of|that|which|who)\b)(?!\s+[a-z])/i;
const PRO_FORM =
  /\b(it|its|them|they|their|there|one|ones|him|his|her|hers|that|those|these|this|else|another)\b/i;

// Words that carry no referent, so sharing them with the question proves nothing.
const NOT_A_REFERENT = new Set(`you your yours the a an and or but so if then than that this
these those there here of to in on at by for from with without into onto over under about
after before while as is are was were be been being am do does did have has had will would
can could should must not no yes any all one two three four five first last next other same
just only still even also too very much more most less least back down up out off away again
never always sometimes because when where what who how why which it its they them their
he she his her him hers we us our i me my`.split(/\s+/).filter(Boolean));

// An answer may not assert something that happened to the reader which the
// question never established. "the good thing that happened, because there was
// one" invents a good thing; "an ordinary evening" said nothing of the sort. The
// scene supplies the facts; the answer supplies only the act.
const PRESUMPTION =
  /\b(there was|there were|happened|turned out|went well|went badly|you'd already|you knew|as usual|again this|like last time)\b/i;

// Standalone questions that ask the reader to theorise rather than remember.
const SELF_THEORY =
  /^(how do you know|what'?s your relationship|how would you describe|what are you like|what sort of person|how do you feel about yourself)/i;

// Openers that mean a noun phrase, not the verb an S-shape answer needs.
const NON_VERB_OPENER =
  /^(a|an|the|it|its|they|their|he|she|his|her|you|your|i|my|we|our|this|that|these|those|there|nothing|everything|nobody|somebody|someone|something|half|most|all|one|two|three|four|five|both|either|neither|it's|he's|she's|they're|you're|that's|there's|nothing's)$/i;

// Verbs that mean S-shape grammar, wrong under a standalone question.
const IMPERATIVE_OPENER =
  /^(say|tell|ask|take|keep|give|put|go|leave|get|hand|buy|make|wait|ring|message|text|call|walk|sit|stand|pay|hold|send|show|turn|start|stop|carry|pull|push|open|shut|write|read|drive|drop|pick|let|agree|refuse|apologise|explain)$/i;

const VERBISH =
  /\b(is|are|was|were|be|been|am|has|have|had|does|do|did|will|would|can|could|should|must|let|go|goes|get|gets|put|take|takes|make|makes|come|comes|give|gives|keep|keeps|hold|holds|tell|tells|say|says|see|sees|know|knows|find|finds|leave|leaves|stand|sit|sits|walk|walks|run|runs|buy|buys|read|reads|wait|waits|turn|turns|hand|hands|ask|asks|want|wants|need|needs|feel|feels|look|looks|bring|brings|send|sends|write|writes|catch|cut|set|sets|shut|split|hit|beat|quit|meet|meets|pay|pays|lay|lose|loses|win|wins|draw|throw|throws|fall|falls|rise|ring|rings|sing|sings|swim|drive|drives|ride|wear|wears|break|breaks|speak|speaks|choose|freeze|stick|sticks|strike|swear|tear|wake|bear|eat|eats|drink|drinks|sleep|sleeps|spend|spends|build|lend|bend|dig|digs|hang|hangs|hurt|cost|costs|burst|agree|agrees|refuse|refuses|apologise|explain|explains|carry|carries|pull|pulls|push|pushes|open|opens|start|starts|stop|stops|pick|picks|drop|drops|show|shows|call|calls|text|texts|message|messages|film|films|shoot|shoots|record|records|post|posts|upload|edit|edits|trim|trims|swim|swims|kneel|kneels|hand|hands|book|books|invite|invites|join|joins|skip|skips|play|plays|sign|signs|praise|praises|laugh|laughs|hunt|hunts|add|adds|word|words|follow|follows|copy|copies|raise|raises|name|names|stand|stands|check|checks|rehang|rehangs|knock|knocks|hang|hangs|lay|lays|insist|insists|point|points|shrug|shrugs|work|works|fill|fills|answer|answers|use|uses|spread|spreads|clock|clocks|steer|steers|forget|forgets|enjoy|enjoys|hope|hopes|believe|believes|pause|pauses|judge|judges|stay|stays|talk|talks|grant|grants|collect|collects|rope|ropes|nod|nods|smile|smiles|wave|waves|offer|offers|mention|mentions|thank|thanks|hunt|manage|sketch|sketches|clap|claps|delete|deletes|bin|bins|admit|admits|claim|claims|round|rounds|state|states|describe|describes|try|tries|remind|reminds|warn|warns|lean|leans|hear|hears|doubt|doubts|treat|treats|light|lights|clear|clears|watch|watches|shelve|shelves|paint|paints|dress|dresses|match|matches|mark|marks|apply|applies|move|moves|settle|settles|serve|serves|reply|replies|notice|notices|learn|learns)\b|\w+(ed|ing)\b/i;

// Words too common to count as a smuggled-in new fact.
const COMMON = new Set(`a an the and or but so if then than that this these those there here
it its it's they them their theirs he him his she her hers you your yours i me my we us our
of to in on at by for from with without into onto over under about after before while as
is are was were be been being am do does did done doing have has had having will would can
could should must let go going gone get got put take took taken make made come came give
gave keep kept hold held tell told say said see saw know knew find found leave left stand
sit walk run buy bought read wait turn hand ask want need feel look bring send write catch
cut set shut hit meet pay lose win throw fall ring sing swim drive ride wear break speak
choose stick strike wake eat drink sleep spend build dig hang hurt cost not no yes any all
one two three four five six seven eight nine ten first last next other another same own
just only still even also too very much more most less least own back down up out off away
again once twice never always sometimes anyway though because when where what who how why
which whose whom yourself yourselves themselves himself herself myself ourselves anyone
everyone nobody somebody something anything nothing everything someone
say says saying tell tells telling ask asks asking thing things bit bits lot lots way ways
time times day days night nights week weeks month months year years morning evening
people person man woman friend friends mate mates them`.split(/\s+/).filter(Boolean));

// "the good one", "the worst of it" — a determiner in front of an adjective is
// not a smuggled-in object, so these don't count as new context.
const ADJ = new Set(`good bad best worst better worse true false right wrong real whole full
empty long short quiet loud plain honest pleasant nice awful lovely proper usual same other
main only last first next big small large little old new young hard easy soft rough clean
useful useless obvious odd strange funny serious kind cruel safe entire rest few many most`
  .split(/\s+/).filter(Boolean));

const words = (s) => String(s).trim().split(/\s+/).filter(Boolean);
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const firstWord = (s) => (words(s)[0] || "").toLowerCase().replace(/[^a-z']/g, "");

/** S = scene ending `You...`, Q = standalone question, X = neither. */
function shapeOf(q) {
  const t = String(q).trim().replace(/^["']|["']$/g, "");
  if (/You\.\.\.$/.test(t)) return "S";
  if (/\?$/.test(t)) return "Q";
  return "X";
}

// — collect entries —
const fileArg = process.argv.find((a) => a.startsWith("--file="));
const beanArg = process.argv.find((a) => a.startsWith("--bean="));

/** Every entry on disk, for duplicate and collision comparison. */
const corpus = [];
for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const { data } = matter(readFileSync(resolve(dir, f), "utf8"));
  corpus.push({
    slug: data.slug, bean: data.bean, approved: Boolean(data.lastUpdated),
    trait: data.trait, question: data.question || "",
    answers: SLOTS.map((k) => data[k] || ""),
  });
}

let entries;
if (fileArg) {
  const batch = JSON.parse(readFileSync(resolve(root, fileArg.split("=")[1]), "utf8"));
  entries = Object.entries(batch).map(([slug, v]) => ({
    slug, question: v.question || "", answers: SLOTS.map((k) => v[k] || ""),
    bean: corpus.find((c) => c.slug === slug)?.bean,
    trait: corpus.find((c) => c.slug === slug)?.trait,
  }));
} else {
  entries = corpus.filter((c) => !c.approved && (!beanArg || c.bean === beanArg.split("=")[1]));
}
const linting = new Set(entries.map((e) => e.slug));

// — check —
const problems = [], notes = [], worksheet = [];
const shapeCount = { S: 0, Q: 0, X: 0 };
let articleOpeners = 0;
const answerVerbs = {};
let answerCount = 0;
let commaAnd = 0;              // "do X, and do Y" rhythm across the batch

for (const e of entries) {
  const q = String(e.question).trim().replace(/^["']|["']$/g, "");
  const shape = shapeOf(q);
  shapeCount[shape]++;
  const P = (m) => problems.push(`${e.slug} — ${m}`);
  const N = (m) => notes.push(`${e.slug} — ${m}`);

  // question
  if (shape === "X") P(`question ends with neither "You..." nor "?"`);
  if (words(q).length > Q_MAX_WORDS) P(`question ${words(q).length} words (max ${Q_MAX_WORDS})`);
  const ph = q.match(PLACEHOLDER);
  if (ph) P(`placeholder noun "${ph[0]}" — name the object`);
  const soft = q.match(SOFT_PLACEHOLDER);
  if (soft && !ph) N(`vague word "${soft[0]}" — fine if the act around it is concrete`);
  for (const [re, label] of RETIRED) if (re.test(q)) P(`retired beat: ${label}`);
  const ukq = q.match(UK_CODED);
  if (ukq) P(`UK-coded slang "${ukq[0]}" in the question`);
  if (shape === "Q" && SELF_THEORY.test(q)) P(`self-theorising question — ask for a memory, not a theory`);
  if (/^(A|The)\b/.test(q)) articleOpeners++;
  if (!/\b(the|a|an|your|their|his|her|its|one|two|three|four|five|six|seven|eight|nine|ten|somebody|someone|every)\b/i.test(words(q).slice(0, 12).join(" ")))
    N(`no concrete noun phrase in the first 12 words`);

  // answers
  const ans = e.answers.map((a) => String(a).trim());
  if (ans.some((a) => !a)) { P(`missing answer(s)`); continue; }
  const lens = ans.map((a) => words(a).length);
  const firsts = ans.map(firstWord);
  answerCount += 5;

  ans.forEach((a, i) => {
    const slot = SLOTS[i].replace("answer", "");
    if (/^[A-Z]/.test(a) && !/^I\b/.test(a)) P(`${slot}: starts with a capital`);
    if (/\.$/.test(a) && !/\.\.\.$/.test(a)) P(`${slot}: trailing full stop`);
    if (/\b(I|I'd|I'm|I've|my)\b/.test(a)) P(`${slot}: first person`);
    const uk = a.match(UK_CODED);
    if (uk) P(`${slot}: UK-coded slang "${uk[0]}"`);
    const pres = a.match(PRESUMPTION);
    if (pres && !new RegExp(pres[0].replace(/\s+/g, "\\s+"), "i").test(q))
      P(`${slot}: presumes "${pres[0]}" — the question never established it`);
    const tail = a.match(OUTCOME_TAIL);
    if (tail) P(`${slot}: outcome tail "${tail[0].trim()}" — end on the act, don't narrate the result`);
    const vague = a.match(VAGUE_QUANTITY);
    if (vague) P(`${slot}: "${vague[0]}" names a quantity, not content — say what is actually said or done`);
    const hist = a.match(INVENTED_HISTORY);
    if (hist) {
      const num = (hist[1] || hist[2] || hist[3] || "").toLowerCase();
      const ql = q.toLowerCase();
      const spelled = NUM_WORD[num] || num;
      // The scene may have supplied the count directly, as an ordinal, or as the
      // step before it — "asked four times ... asking again" entails a fifth.
      const supplied = ql.includes(num) || ql.includes(spelled) ||
        (NUM_BEFORE[spelled] && ql.includes(NUM_BEFORE[spelled])) ||
        Object.entries(NUM_WORD).some(([o, n]) => n === spelled && ql.includes(o));
      if (!supplied)
        P(`${slot}: "${hist[0]}" invents a history — the question never gives that duration or tally`);
    }
    const manner = a.match(MANNER_TAIL);
    if (manner) P(`${slot}: manner tail "${manner[0].trim()}" — show the act, don't measure it against what others hadn't done yet`);
    // Referent check. A countable pro-form with nothing shared with the question
    // is unparseable; softer pro-forms go to the worksheet below.
    const qNouns = new Set(norm(q).split(" ").filter((w) => w.length > 2 && !NOT_A_REFERENT.has(w)));
    const shared = norm(a).split(" ").filter((w) =>
      w.length > 2 && !NOT_A_REFERENT.has(w) &&
      (qNouns.has(w) || qNouns.has(w.replace(/s$/, "")) || qNouns.has(w + "s") ||
       qNouns.has(w.replace(/ing$/, "")) || qNouns.has(w.replace(/ed$/, ""))));
    // "every one of them", "nothing else", "everybody else" are idioms, not
    // stand-ins for a noun, so they are stripped before the check.
    const cpro = a.replace(/\b(every|nothing|anything|everybody|somebody|someone|everyone|no)\s+(one|else)\b/gi, "").match(COUNT_PRO);
    if (cpro && !shared.length)
      P(`${slot}: "${cpro[0]}" stands for a noun the question never names`);
    else if (PRO_FORM.test(a) && !shared.length)
      worksheet.push(`${e.slug} ${slot}: "${a}"\n      question offers: ${[...qNouns].slice(0, 12).join(", ") || "(nothing)"}`);
    const ref = a.match(DANGLING_REF);
    if (ref && !new RegExp(`\\b${ref[0].replace(/\s+/g, "\\s+")}\\b`, "i").test(q))
      N(`${slot}: comparative "${ref[0]}" — check the question says what it is being compared to`);
    if (lens[i] < ANS_MIN || lens[i] > ANS_MAX) P(`${slot}: ${lens[i]} words, outside ${ANS_MIN}-${ANS_MAX}`);
    else if (lens[i] < ANS_SOFT_LO || lens[i] > ANS_SOFT_HI) N(`${slot}: ${lens[i]} words (soft band ${ANS_SOFT_LO}-${ANS_SOFT_HI})`);
    if (!VERBISH.test(a) && shape === "S") P(`${slot}: no verb — an S answer must continue "You..."`);
    if (shape === "S" && NON_VERB_OPENER.test(firsts[i]))
      P(`${slot}: opens "${firsts[i]}" — noun phrase under a "You..." question`);
    if (shape === "Q" && IMPERATIVE_OPENER.test(firsts[i]))
      N(`${slot}: opens with the imperative "${firsts[i]}" under a standalone question`);
    // Only verbs count toward the drone cap. Articles and pronouns opening an
    // answer are grammar, not a tic — under a standalone question most answers
    // legitimately start "the", "he", "you", and capping those bends the writing
    // to satisfy the linter.
    if (!NON_VERB_OPENER.test(firsts[i]))
      answerVerbs[firsts[i]] = (answerVerbs[firsts[i]] || 0) + 1;
  });

  // Two answers that name the same act and differ only in how much of it gets
  // done are one answer written twice. "tell them all of it" against "tell them
  // the whole of it, start to finish" is not a gradient — the reader cannot vote
  // on a quantity of the same move. Five answers means five different moves:
  // different verb, different object, different content named.
  const QUANTITY = new Set(`all whole lot rest more less most least much many everything anything
  nothing some any full complete entire twice once again half both every each part bit detail
  details thing things start finish end length properly really actually quite very just only
  and or but then so with without about of to in on at for from it its them their they`.split(/\s+/).filter(Boolean));
  const contentOf = (a) => new Set(norm(a).split(" ").filter((w) => w.length > 2 && !QUANTITY.has(w) && !NOT_A_REFERENT.has(w)));
  for (let i = 0; i < 5; i++)
    for (let j = i + 1; j < 5; j++) {
      const A = contentOf(ans[i]), B = contentOf(ans[j]);
      if (!A.size || !B.size) continue;
      const shared = [...A].filter((w) => B.has(w)).length;
      const smaller = Math.min(A.size, B.size);
      if (shared === smaller && shared >= Math.max(A.size, B.size) - 1)
        P(`${SLOTS[i].replace("answer", "")} and ${SLOTS[j].replace("answer", "")} are the same act at two volumes — name a different move, not a different amount`);
    }

  // Rhythm. Left alone, every answer becomes "do X, and do Y" — a compound
  // sentence with the content welded on after a comma. The approved corpus runs
  // 11% comma-and and a median of 3 single-clause answers per entry; a bulk pass
  // drifts to 42% and 0-1 without something counting it. 97% of approved entries
  // have at least one single-clause answer, so one is the floor and two the aim.
  const singles = ans.filter((a) => !/\b(and|then|with)\b|,/.test(a)).length;
  if (singles === 0) P(`no single-clause answer — five compound sentences in a row is the drone, not the gradient`);
  else if (singles === 1) N(`only 1 single-clause answer (approved median is 3) — let one or two land in a single beat`);
  commaAnd += ans.filter((a) => /, and \b/.test(a)).length;

  // spread and collapse
  const spread = Math.max(...lens) - Math.min(...lens);
  if (spread < MIN_SPREAD) P(`answers all one length (spread ${spread}, min ${MIN_SPREAD})`);
  const rep = firsts.reduce((a, w) => ((a[w] = (a[w] || 0) + 1), a), {});
  for (const [w, c] of Object.entries(rep))
    if (c >= 3) N(`COLLAPSE WATCH: ${c} answers open "${w}" — check they are five different acts, not one at five volumes`);

  // New context: an answer naming a definite object the question never put on
  // the table — "room in the car", "the two who ring after him". Only determiner
  // + noun is checked, because that is the signature of a smuggled-in fact;
  // bare verbs and adverbs are how answers are supposed to differ.
  const qWords = new Set(norm(q).split(" "));
  const known = (w) => qWords.has(w) || qWords.has(w.replace(/s$/, "")) || qWords.has(w + "s");
  const invented = new Set();
  for (const a of ans)
    for (const [, det, noun] of a.matchAll(/\b(the|a|an|their|his|her|another|his|its|whose)\s+([a-z][a-z'-]{2,})\b/gi)) {
      const w = noun.toLowerCase();
      if (!COMMON.has(w) && !known(w) && !VERBISH.test(` ${w} `) && !ADJ.has(w))
        invented.add(`${det.toLowerCase()} ${w}`);
    }
  if (invented.size) N(`NEW CONTEXT? names "${[...invented].join('", "')}" — not established by the question`);

  // A definite article presumes the thing already exists — "keep the story
  // going" when no story has been mentioned. An indefinite one introduces it
  // ("start a story"), which is fine. Whether a definite noun is entailed by the
  // scene ("the lifejackets" on a ferry) is a judgement call no regex makes —
  // 28% of approved answers use one legitimately — so these go on the worksheet
  // to be resolved by hand, never passed over as a note.
  const introduced = new Set();
  for (const a of ans)
    for (const [, , w] of a.matchAll(/\b(a|an)\s+([a-z][a-z'-]{2,})\b/gi)) introduced.add(w.toLowerCase());
  for (let i = 0; i < 5; i++)
    for (const [, w] of ans[i].matchAll(/\bthe\s+([a-z][a-z'-]{2,})\b/gi)) {
      const n2 = w.toLowerCase();
      if (!known(n2) && !introduced.has(n2) && !COMMON.has(n2) && !ADJ.has(n2))
        worksheet.push(`${e.slug} ${SLOTS[i].replace("answer", "")}: "the ${n2}" — is it entailed by the scene, or presumed?\n      ${ans[i]}`);
    }

  // duplicates and prop collisions against the whole corpus
  for (const c of corpus) {
    if (c.slug === e.slug) continue;
    if (norm(c.question) && norm(c.question) === norm(q))
      P(`question duplicates ${c.slug}${c.approved ? " (approved)" : ""}`);
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 5; j++)
        if (norm(ans[i]) && norm(ans[i]) === norm(c.answers[j]) && words(ans[i]).length >= 4)
          N(`${SLOTS[i].replace("answer", "")} duplicates ${c.slug} ${SLOTS[j].replace("answer", "")}`);
  }
}

// — prop collision: distinctive question nouns shared with another entry's question —
const propIndex = {};
for (const c of corpus) {
  for (const w of new Set(norm(c.question).split(" ")))
    if (w.length > 4 && !COMMON.has(w)) (propIndex[w] = propIndex[w] || []).push(c.slug);
}
for (const e of entries) {
  const hits = [];
  for (const w of new Set(norm(e.question).split(" "))) {
    const owners = (propIndex[w] || []).filter((s) => s !== e.slug);
    // rare word: used by at most two other questions in the entire corpus
    if (owners.length && owners.length <= 2 && w.length > 5) hits.push(`${w} (${owners.join(", ")})`);
  }
  if (hits.length >= 2) notes.push(`${e.slug} — prop overlap: ${hits.join(" · ")}`);
}

// — batch level —
const n = entries.length;
if (n) {
  // Shape share is only meaningful bean-sized. A five-entry flavour group can
  // only ever be 0%, 20%, 40%… so checking it there just cries wolf.
  // It is also a per-BEAN property. A corrective batch pulling entries from six
  // beans has no share of its own worth checking; the bean-level run is the test.
  const beans = new Set(entries.map((e) => e.bean));
  const qShare = shapeCount.Q / n;
  if (n >= 12 && beans.size === 1 && (qShare < Q_SHAPE_TARGET[0] || qShare > Q_SHAPE_TARGET[1]))
    problems.push(`BATCH: standalone questions ${Math.round(qShare * 100)}% (target ${Q_SHAPE_TARGET[0] * 100}-${Q_SHAPE_TARGET[1] * 100}%)`);
  if (articleOpeners / n > MAX_ARTICLE_OPENER_SHARE)
    problems.push(`BATCH: ${Math.round((articleOpeners / n) * 100)}% of questions open "A"/"The" (max ${MAX_ARTICLE_OPENER_SHARE * 100}%)`);
  // "do X, and do Y" runs at 11% across the approved corpus and drifted to 42%
  // over four beans of this pass. The cap sits at 35% rather than near the
  // approved rate because the five-moves rule deliberately adds a clause naming
  // the content — "give them the date you start, and nothing about the job" is
  // two beats doing two jobs, and cutting it back would trade distinctness for
  // rhythm. 35% catches the drone; it does not demand content be thrown away.
  if (answerCount >= 20 && commaAnd / answerCount > 0.35)
    problems.push(`BATCH: ${Math.round((commaAnd / answerCount) * 100)}% of answers are "X, and Y" (max 35%, approved corpus runs 11%)`);
  // Opener share needs a real sample: in a five-answer batch every verb is 20%.
  // Bean-scoped too — the drone this catches is a drafting-session habit, and a
  // corrective batch spanning six beans is mostly lines nobody is redrafting.
  for (const [v, c] of Object.entries(answerVerbs))
    if (n >= 5 && beans.size === 1 && c / answerCount > MAX_ANSWER_VERB_SHARE)
      problems.push(`BATCH: answers opening "${v}" are ${Math.round((c / answerCount) * 100)}% (max ${MAX_ANSWER_VERB_SHARE * 100}%)`);
}

// — axis check: the neighbours a question might accidentally be testing —
// The failure this catches: a scene that would serve four other traits equally
// well is testing a genus, not this species. Prints each entry's own axis beside
// the traits it sits closest to — same bean, and same flavour+form across beans
// — so the comparison is made against real neighbours rather than from memory.
if (process.argv.includes("--axis")) {
  const meta = (slug) => corpus.find((c) => c.slug === slug);
  const full = readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => matter(readFileSync(resolve(dir, f), "utf8")).data);
  console.log("AXIS CHECK — would this question work for any of these instead?\n");
  for (const e of entries) {
    const me = full.find((d) => d.slug === e.slug);
    if (!me) continue;
    const sameBean = full.filter((d) => d.bean === me.bean && d.slug !== me.slug).map((d) => d.trait);
    const samePrep = full.filter((d) => d.flavour === me.flavour && d.form === me.form && d.slug !== me.slug).map((d) => d.trait);
    console.log(`  ${e.slug}`);
    console.log(`    axis      ${me.excess}  ←  ${me.trait}  →  ${me.inverse}`);
    console.log(`    same bean ${sameBean.join(", ")}`);
    console.log(`    same prep ${samePrep.join(", ")}\n`);
  }
}

// — report —
console.log(`${n} entries linted${beanArg ? ` (${beanArg.split("=")[1]})` : ""}${fileArg ? " from batch" : ""}, ${corpus.length} in corpus`);
console.log(`shapes  S:${shapeCount.S}  Q:${shapeCount.Q}${shapeCount.X ? `  malformed:${shapeCount.X}` : ""}`);
console.log(`openers "A"/"The" ${articleOpeners}/${n}`);
console.log(`answer openers  ${Object.entries(answerVerbs).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([v, c]) => `${v}:${c}`).join("  ")}\n`);
if (worksheet.length) console.log(`REFERENT WORKSHEET — substitute a question noun for each pro-form and check it reads:\n  ` + worksheet.join("\n  ") + "\n");
if (notes.length) console.log(`${notes.length} notes (judgement, not failures):\n` + notes.join("\n") + "\n");
if (!problems.length) console.log("PASS — no structural problems");
else { console.log(`${problems.length} problems:\n` + problems.join("\n")); process.exitCode = 1; }
