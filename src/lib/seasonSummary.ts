import { getZodiacMetadataForDate, type ZodiacId } from "./zodiac";
import {
  computeSpiritBeanScores,
  SPIRIT_BEAN_RING,
  SPIRIT_FLAVOUR_RING,
  SPIRIT_FORM_RING,
} from "./spiritBean";
import type { RitualVariant } from "./fortune";
import { useStore } from "../store";
import zodiacTraits from "../data/generated/zodiac-traits.json";

const TRAITS = zodiacTraits as Record<string, { trait: string }>;

// A season = the Form period (2 months, 6 per bean-year). Once one closes, an
// engaged user gets a one-time recap; this is the persisted record of it. The
// rendered `observations` are snapshotted so the Beanstalk marker shows exactly
// what the user was told, even if the generators change later.
export type SeasonSummary = {
  seasonKey: string; // closing season startDate "YYYY-MM-DD" — the store key
  observations: string[]; // ranked lines, already rendered
};

// Entry-count thresholds that decide how rich the recap is. Below LOW it's a
// single flavourless line; below FULL the largest ring movement plus the
// open/closed lean; at/above FULL the whole spread.
const SEASON_LOW_ENTRIES = 7;
const SEASON_FULL_ENTRIES = 14;

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayBefore(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y!, m! - 1, d! - 1);
  return formatDate(date);
}

/**
 * The bean whose season a stored summary covers, and the one that followed it.
 * Both fall out of the calendar, so only the seasonKey needs persisting.
 */
export function seasonZodiacsForKey(seasonKey: string): {
  prevZodiacId: ZodiacId;
  nextZodiacId: ZodiacId;
} {
  const [y, m, d] = seasonKey.split("-").map(Number);
  const prevMeta = getZodiacMetadataForDate(new Date(y!, m! - 1, d!));
  const next = new Date(prevMeta.endDate);
  next.setDate(next.getDate() + 1);
  return {
    prevZodiacId: prevMeta.zodiacId,
    nextZodiacId: getZodiacMetadataForDate(next).zodiacId,
  };
}

// Copy and trait choices are seeded from the season start date so a given season
// always renders the same summary (also the value we persist). FNV-1a hash +
// mulberry32 — a tiny deterministic PRNG.
const hashStr = (s: string): number => {
  let h = 2166136261 >>> 0;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const makeRng = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

type Rng = () => number;

const pick = <T>(rng: Rng, arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)]!;

// --- Copy pools (pick one at random; snapshotted onto the summary) ---

// Spirit drift is keyed to the attribute that moved most in each ring. Each id
// gets its own self-contained lines, evoking its traits as a loose,
// horoscope-ish feeling (never naming the bean/flavour/form itself). Every ring
// speaks in its own shape so the three lines never echo one another: a flavour
// is the mood of the season in you, a form is what the season did to you, a
// bean is who you were to other people. TOWARD = the attribute that rose most;
// AWAY = the one that receded most. ids are unique across all three rings, so
// one flat map per direction.
const DRIFT_TOWARD_BY_ID: Record<string, readonly string[]> = {
  // Flavours
  bitter: [
    "A drier humour came over you, amused by more and impressed by less.",
    "Your tastes turned particular, and the obvious lost its charm.",
    "A cool clarity came in with the season, not always kind but rarely fooled.",
    "A wry mood kept you company, and little slipped past it.",
    "A certain coolness crept into your moods, and you didn't mind it.",
  ],
  sour: [
    "An honest, bracing mood came over you, and things got said.",
    "The fog lifted this season, and much that was muddled came clear.",
    "A spirited edge crept into your voice, and not everyone thanked you for it.",
    "A candid mood ran through the season, with little patience for pretence.",
    "Your moods turned brisk and a little tart, and truth came easier than tact.",
  ],
  spicy: [
    "A fire ran through your season, and everything burned a little brighter.",
    "Everything felt urgent and bright, and you felt it all at full strength.",
    "A fervent mood swept you along, sometimes further than you meant to go.",
    "Your feelings ran hot this season, quick to flare and slow to fade.",
    "An intensity came over you that was thrilling, and sometimes too much.",
  ],
  sweet: [
    "A warm, affectionate mood followed you through the season.",
    "Your spirits lifted, and you were glad to be of use.",
    "A soft-heartedness came over you, sometimes a little too eager to please.",
    "A fond, easy mood kept you afloat, perhaps a little too comfortably.",
    "Kindness came naturally this season, and reassurance came with it.",
  ],
  umami: [
    "A mellow mood sank into you, content with what was already there.",
    "Your season ran deep rather than bright, and satisfied you in quiet ways.",
    "A wistful richness came over you, and old things meant more than new ones.",
    "A low, full feeling hummed beneath your days, and you were in no rush to change it.",
    "Your moods grew quiet and rich, with a trace of something like longing.",
  ],
  // Forms
  boiled: [
    "Something in you softened this season, and gave itself over.",
    "The season slowed you, and a quiet composure came with it.",
    "You became more yielding this season, and steadier for it.",
    "The season wore your hard edges soft, though at times it left you heavy.",
    "Something in you went still, and took in whatever the season brought.",
  ],
  dried: [
    "The season drew the excess out of you, leaving something sparer.",
    "Something in you hardened and held, and would not easily bend.",
    "You became more self-contained, and needed less than before.",
    "The season concentrated you, though what hardens can also crack.",
    "Something in you learned to wait, intact, for as long as it took.",
  ],
  fermented: [
    "Something in you changed out of sight, in its own time.",
    "The season turned you inward, toward work no one else could see.",
    "You became stranger this season, in ways only you could follow.",
    "Something was quietly brewing in you, and it wasn't ready to be shared.",
    "The season let you become something of your own making, if a little hard to reach.",
  ],
  fried: [
    "The season sparked something in you, and you acted before thinking twice.",
    "Something in you caught light, and there was no taking it back.",
    "You were changed quickly this season, all at once and for good.",
    "The season made you decisive, sometimes before you were ready.",
    "Something in you went all in, with no way back and no wish for one.",
  ],
  roasted: [
    "The season brought you out, and you became more fully yourself.",
    "Something in you ripened and glowed where anyone could see.",
    "You flourished this season, perhaps a little past the point of done.",
    "The season drew you outward, and you took up more room in the world.",
    "Something in you came into full colour, hard to miss and hard to contain.",
  ],
  smoked: [
    "Something in you went hazy and hard to pin down.",
    "The season changed you in ways no one could quite put a finger on.",
    "You became more of a suggestion than a statement.",
    "Something of you lingered in places long after you had left them.",
    "The season blurred your edges, and you drifted a little from your moorings.",
  ],
  // Beans
  adzuki: [
    "You became the one who gathered people, and gave them a reason to celebrate.",
    "Those around you found a little more luck in your company.",
    "You marked the moments others let slip by, and made them count.",
    "People felt the festive pull of you, generous perhaps to a fault.",
    "You kept the mood light for everyone, even when something heavier waited.",
  ],
  black: [
    "Others found you watchful, and harder to read.",
    "You kept your own counsel, and people wondered what you saw.",
    "You noticed more than you let on, and gave little away.",
    "People sensed a quiet resolve in you, though few got close enough to know it.",
    "You trusted others slowly, and only once they had proven themselves.",
  ],
  butter: [
    "Others found a calm in you that lowered the temperature of any room.",
    "You forgave easily, and asked little of anyone.",
    "People drifted toward your company, and left more at peace.",
    "Little rattled you, and those around you rested easier for it.",
    "You were content to let others be, and perhaps too content to stay put.",
  ],
  cannellini: [
    "You grew choosy about who and what you made room for.",
    "Others sensed your standards rising, and not everyone met them.",
    "You quietly let go of what didn't belong, and kept only what did.",
    "People found you gracious, if a little hard to satisfy.",
    "You brought polish to everything you touched, and noticed every flaw.",
  ],
  chickpea: [
    "You became a bridge between people, at home in almost any company.",
    "Others found you easy to be around, and quick to make room for them.",
    "You brought people together who might never have met halfway.",
    "You fit in wherever you went, though you rarely stayed put for long.",
    "People felt welcome around you, though you may have been a little too eager to be liked.",
  ],
  edamame: [
    "People came to you for what worked, and you had little patience for the rest.",
    "You got to the point with others, and moved on quickly.",
    "Others found you capable and plain-spoken, sometimes a little curt.",
    "You saw what was needed and did it, without much fuss.",
    "People found you unsentimental, and useful in a pinch.",
  ],
  fava: [
    "Others watched you go first, into things they would not have tried.",
    "You were drawn to the hard way, and people admired the nerve of it.",
    "You dared more than most around you, not always wisely.",
    "People found you undaunted, and a little defiant with it.",
    "You reached higher than others expected, and let them know it.",
  ],
  green: [
    "You were first to begin things, often before anyone else was ready.",
    "Others caught your enthusiasm, even after you had moved on to something new.",
    "People found you hopeful and quick, always halfway into the next thing.",
    "You started more than you finished, and brought others along for the beginning.",
    "Those around you felt your eagerness, bright and hard to keep up with.",
  ],
  kidney: [
    "You stood up for the people you loved, fiercely and without being asked.",
    "Others felt your devotion, and knew you would not let go easily.",
    "You championed those around you, sometimes at your own cost.",
    "People found you tenacious in their defence, and a little possessive with it.",
    "You gave everything to the people who mattered, and stretched yourself thin.",
  ],
  mung: [
    "People came to you to mend, and left a little lighter.",
    "You tended to others quietly, and asked for nothing back.",
    "Those around you felt cared for, even when you doubted your own worth.",
    "You gave your care freely, perhaps to some who only took.",
    "Others found you gentle and attentive, and easy to lean on.",
  ],
  navy: [
    "People could count on you this season, whatever came.",
    "You kept your word to others, even when it cost you.",
    "Others found you loyal and upright, if slow to bend.",
    "You did right by people without needing to be asked.",
    "Those around you leaned on your reliability, and sometimes chafed at your rules.",
  ],
  pinto: [
    "People saw every feeling on your face this season.",
    "You shared your inner world freely, and others found it hard to forget.",
    "Others found you imaginative, and unmistakably yourself.",
    "You made your feelings known, perhaps with a little too much flourish.",
    "People were drawn into your imaginings, worries and all.",
  ],
};

const DRIFT_AWAY_BY_ID: Record<string, readonly string[]> = {
  // Flavours
  bitter: [
    "The dryness went out of your humour, and you were easier to please.",
    "Your cool reserve thawed, and simple things began to charm you again.",
    "You let go of your wry distance, and liked the world better up close.",
    "A kinder mood crept in, slower to weigh and quicker to enjoy.",
    "Your moods lost their cool edge, and delight came more easily.",
  ],
  sour: [
    "Your edge dulled this season, and more went gently unsaid.",
    "The urge to set things straight faded, and you let the muddle be.",
    "A gentler mood took some of the bite from your words.",
    "Your candour softened, and you found comfort in a little tact.",
    "The bracing air of your moods gave way to something milder.",
  ],
  spicy: [
    "The heat went out of your moods, and the season passed at a lower flame.",
    "You felt things more quietly, and fewer of them demanded your attention.",
    "The fire in you cooled to embers, and the days grew gentler for it.",
    "Your moods lost their urgency, and nothing needed doing right this minute.",
    "A cooler temper took hold, less easily stirred and slower to flare.",
  ],
  sweet: [
    "The fondness thinned from your moods, and kind words came more slowly.",
    "Your spirits sat lower, and you stopped smoothing every rough edge.",
    "The easy affection faded, and you kept more of your heart to yourself.",
    "A plainer mood replaced the comfort, less cushioned and more awake.",
    "Your good cheer grew choosier about where it went.",
  ],
  umami: [
    "The mellow mood lifted, and you went looking for something new.",
    "You grew less wistful, and stopped dwelling on what was done.",
    "Your moods ran brighter and shallower, and you rather liked the change.",
    "The old longing loosened its hold, and the days felt lighter.",
    "A quicker, brighter mood took the place of the slow one.",
  ],
  // Forms
  boiled: [
    "The softness in you firmed, and you wanted more motion than rest.",
    "Something that had gone still in you began to stir.",
    "The season lifted a heaviness you had been carrying.",
    "You became less yielding, and your composure gave way to something livelier.",
    "The patience in you thinned, and stillness began to chafe.",
  ],
  dried: [
    "Something hard in you softened, and let a little give back in.",
    "The season loosened your grip on doing it all alone.",
    "You became less unbending, and found the give surprisingly easy.",
    "Something sparse in you filled out, and you let yourself need things.",
    "Whatever had hardened in you began to thaw.",
  ],
  fermented: [
    "The private change in you surfaced, and you rejoined the ordinary.",
    "Something that had been working away in you went quiet.",
    "The season drew you out of yourself and back into the everyday.",
    "You became less singular, more content to arrive where others already stood.",
    "Whatever was turning in you came to rest, and you took the well-worn path.",
  ],
  fried: [
    "The spark in you cooled, and you gave things a second thought.",
    "The season taught you to hesitate, and to keep a way back.",
    "Something in you stopped rushing to commit.",
    "You became slower to act, and more inclined to wait and see.",
    "What had flared in you burned down, leaving room to reconsider.",
  ],
  roasted: [
    "The glow in you dimmed, and you took up less room.",
    "The season drew you back in, away from the spotlight.",
    "Something in you stopped reaching outward, and kept more to itself.",
    "You flourished less visibly this season, and preferred it that way.",
    "Whatever had been expanding in you drew quietly back.",
  ],
  smoked: [
    "The haze around you cleared, and you came into focus.",
    "The season brought you out of the shadows and into plain view.",
    "Something in you stopped hinting and started saying.",
    "You became easier to place, and easier to find.",
    "Whatever had been drifting in you found its footing again.",
  ],
  // Beans
  adzuki: [
    "You gathered people less, and let the occasions pass more quietly.",
    "Those around you found you graver, and more willing to sit with hard things.",
    "The festive spirit you brought to others quieted.",
    "You stopped keeping everyone's spirits up, and let things be as they were.",
    "People found you readier to face what you might once have celebrated past.",
  ],
  black: [
    "You let people a little closer, and showed more of what lay beneath.",
    "Others found you easier to read, and easier to reach.",
    "You kept less to yourself, and trusted a little sooner.",
    "The watchful distance you kept from others began to close.",
    "People saw more of you this season than they had before.",
  ],
  butter: [
    "You were quicker to stir, and people felt the change in you.",
    "Others found you less willing to let things slide.",
    "The calm you offered others gave way to a new sense of purpose.",
    "You asked more of the people around you, and of yourself.",
    "You stopped keeping the peace for everyone, and made a little noise.",
  ],
  cannellini: [
    "You made more allowance for the rough edges in others.",
    "Others found your standards gentler, and easier to meet.",
    "You made room for more people and things, flaws and all.",
    "You stopped waiting for everything to be just right.",
    "People found you readier to accept good enough, and glad of it.",
  ],
  chickpea: [
    "You chose your company more carefully, and stayed where you landed.",
    "Others found you less willing to bend to suit the room.",
    "You connected fewer people, and committed more to a few.",
    "You stopped trying to fit everywhere, and found where you belonged.",
    "People found you more rooted, and less easily swayed by the crowd.",
  ],
  edamame: [
    "You gave people more of your time, and less of your verdict.",
    "Others found you gentler, and slower to wave things away.",
    "You let conversations wander, and found something in them.",
    "You worried less about what was useful, and more about how people felt.",
    "People found you more patient with the long way round.",
  ],
  fava: [
    "You let others go first, and were glad to.",
    "People found you more careful, and less inclined to push your luck.",
    "You chose the safer path, and those around you breathed easier.",
    "The daring others knew in you gave way to caution.",
    "You aimed a little lower, and found it suited you.",
  ],
  green: [
    "You started fewer things, and saw more of them through.",
    "Others found you calmer, and more content to stay put.",
    "You let others lead the way, and followed at your own pace.",
    "People found you less eager for what came next, and more present in what was.",
    "The spark others knew in you quieted.",
  ],
  kidney: [
    "You held the people you love a little more loosely.",
    "Others found you less guarded on their behalf, and more at rest.",
    "You let people fight some of their own battles.",
    "You gave a little less of yourself away, and kept something back for yourself.",
    "People found you less ready to leap to their defence.",
  ],
  mung: [
    "You gave less of yourself away, and noticed who had only been taking.",
    "Others found you surer of yourself, and harder to take for granted.",
    "You tended to your own needs, and let others mind theirs.",
    "People found you less willing to be everyone's comfort.",
    "You stopped doubting your place among others.",
  ],
  navy: [
    "You bent the rules for others more readily.",
    "People found you more flexible, and less certain of what was right.",
    "You let others do things their own way.",
    "Others found you easier to sway, and less set in your ways.",
    "You held people to fewer rules, and yourself to fewer still.",
  ],
  pinto: [
    "You kept more of your feelings to yourself.",
    "Others found you more even, and less swept up in every mood.",
    "You shared less of your inner world, and lived more quietly within it.",
    "People found you less dramatic, and more at ease.",
    "You let fewer feelings show, and kept the rest for yourself.",
  ],
};

// Facet rituals leaned toward Accept — an open season.
const LEAN_OPEN: readonly string[] = [
  "You led with an open heart, taking things as they came.",
  "You were quick to say yes, and slow to turn anything away.",
  "You welcomed most of what the season offered, arms unfolded.",
  "The season found you receptive, willing to be moved.",
];

// Facet rituals leaned toward Resist — a guarded season.
const LEAN_CLOSED: readonly string[] = [
  "You held the season at arm's length, quick to refuse.",
  "You were more likely to say no, and to mean it.",
  "You met the season with a wary eye, letting little in.",
  "The season found you closed, guarding your own ground.",
];

// Facet rituals split evenly — neither open nor closed.
const LEAN_BALANCED: readonly string[] = [
  "You met the season evenly, neither opening nor guarding.",
  "You held the middle, as quick to welcome as to refuse.",
  "The season found you poised, letting some in and turning some away.",
  "You kept an even hand, neither arms folded nor flung wide.",
];

// A handful of entries — not enough to read a trend, just faint signal.
const LOW_TEXTS: readonly string[] = [
  "There were only murmurs of Bean Wisdom this season.",
  "The Beans spoke to you but rarely this season.",
  "A few faint signs reached you, and no more.",
  "The Beans reached you only in passing this season.",
  "You caught only scattered whispers of Bean Wisdom this season.",
];

// --- Season bridge (pinned last): what you leave, against what's incoming ---
// The framing depends on how far the season's drift carried you from your
// claimed self. Tokens: {claimed}, {drift} (the most-drifted-toward trait).

// Beyond this many season-end score points between your claimed self and the
// self the season drifted toward, the drift reads as a real transformation
// rather than a lean.
const SEASON_DRIFT_THRESHOLD = 20;

// The season only deepened who you already are (drift landed on your own zodiac).
const BRIDGE_SAME: readonly string[] = [
  "You leave the season as you came — {claimed} through and through.",
  "The season only deepened your {claimed} nature.",
  "You end the season the same {claimed} self that started it.",
];

// A mild drift: pulled toward another self, but the claimed one still holds.
const BRIDGE_NEAR: readonly string[] = [
  "You leave the season a little more {drift} than before.",
  "The season lent you a {drift} streak.",
  "You became more {drift} this past season.",
];

// A strong drift: you became something the claimed self would barely recognise.
const BRIDGE_FAR: readonly string[] = [
  "You drifted far from your natural {claimed} self, toward a {drift} life.",
  "You end the season a {drift} version of yourself your {claimed} nature would scarcely know.",
  "This season you rejected your {claimed} nature, and adopted a {drift} one.",
];

// Traits are authored content, so a template can't know whether the word landing
// in its slot takes "a" or "an". Any indefinite article immediately before a
// token is absorbed into the substitution and re-chosen from the trait itself.
// Safe as a plain vowel test: no trait is multi-word or starts with a silent h.
function fillTraits(template: string, values: Record<string, string>): string {
  return template.replace(
    /(\b[Aa] )?\{(claimed|drift)\}/g,
    (_match, article: string | undefined, key: string) => {
      const value = values[key]!;
      if (!article) return value;
      const an = /^[aeiou]/i.test(value);
      return `${article.startsWith("A") ? (an ? "An" : "A") : an ? "an" : "a"} ${value}`;
    },
  );
}

// A single attribute's net movement, keyed by its id.
type Mover = { delta: number; id: string };

// One ring's most-risen and most-receded attributes. Ties break at random
// (season-seeded): an accept-only season leaves many ids on the same delta, and
// a first-index tiebreak would always name the first id in the ring.
function ringMovers(
  rng: Rng,
  ring: readonly string[],
  before: number[],
  after: number[],
): { top: Mover; bottom: Mover } {
  const movers = shuffle(
    rng,
    ring.map((id, i) => ({ id, delta: (after[i] ?? 0) - (before[i] ?? 0) })),
  );
  let top = movers[0]!;
  let bottom = movers[0]!;
  for (const m of movers) {
    if (m.delta > top.delta) top = m;
    if (m.delta < bottom.delta) bottom = m;
  }
  return { top, bottom };
}

// The zodiac the season drifted *toward*: in each ring, the attribute that rose
// most over the season (before → after). Its `divergence` is how far that self
// sits above the claimed self at season end, summed across the three rings — the
// score-point gap that separates who you became from who you claimed to be.
function seasonalDriftZodiac(
  before: ReturnType<typeof computeSpiritBeanScores>,
  after: ReturnType<typeof computeSpiritBeanScores>,
): { id: ZodiacId; divergence: number } {
  const rings = [
    {
      ring: SPIRIT_FLAVOUR_RING,
      b: before.flavourValues,
      a: after.flavourValues,
      claimedIdx: after.claimedFlavourIdx,
    },
    {
      ring: SPIRIT_FORM_RING,
      b: before.formValues,
      a: after.formValues,
      claimedIdx: after.claimedFormIdx,
    },
    {
      ring: SPIRIT_BEAN_RING,
      b: before.beanValues,
      a: after.beanValues,
      claimedIdx: after.claimedBeanIdx,
    },
  ];

  const parts: string[] = [];
  let divergence = 0;
  for (const { ring, b, a, claimedIdx } of rings) {
    let maxIdx = 0;
    let maxDelta = -Infinity;
    ring.forEach((_, i) => {
      const delta = (a[i] ?? 0) - (b[i] ?? 0);
      if (delta > maxDelta) {
        maxDelta = delta;
        maxIdx = i;
      }
    });
    parts.push(ring[maxIdx]!);
    divergence += (a[maxIdx] ?? 0) - (a[claimedIdx] ?? 0);
  }
  return { id: parts.join("-") as ZodiacId, divergence };
}

/**
 * Build a season summary if one is due, else null. Reads fortuneHistory and the
 * claimed bean from the store (as computeSpiritBeanScores already does).
 *
 * `lastSeasonSeen` is the season key the user last acknowledged; when it already
 * equals the current season there is nothing to recap.
 */
export function getSeasonSummary(
  date: Date,
  lastSeasonSeen: string | null,
): SeasonSummary | null {
  const claimedSlug = useStore.getState().claimed?.id ?? null;
  if (!claimedSlug) return null;

  const meta = getZodiacMetadataForDate(date);
  const currentKey = formatDate(meta.startDate);
  if (lastSeasonSeen === currentKey) return null;

  // Step back one day into the previous season and re-derive its window.
  const probe = new Date(meta.startDate);
  probe.setDate(probe.getDate() - 1);
  const prevMeta = getZodiacMetadataForDate(probe);
  const prevStart = formatDate(prevMeta.startDate);
  const prevEnd = formatDate(prevMeta.endDate);

  const history = useStore.getState().fortuneHistory;
  const windowEntries = history.filter(
    (e) => e.date >= prevStart && e.date <= prevEnd && (e.score ?? 0) !== 0,
  );

  // Need at least one interaction to recap — otherwise a freshly-claimed user
  // would get an empty summary for the season they just joined.
  if (windowEntries.length < 1) return null;

  // The summary shows whenever a season turns; only its richness scales with how
  // much the user engaged.
  const observations = buildObservations(
    claimedSlug,
    prevStart,
    prevEnd,
    windowEntries,
  );

  return { seasonKey: prevStart, observations };
}

type WindowEntry = {
  score: number;
  variant?: RitualVariant;
};

// In-place Fisher-Yates using the season-seeded rng, so a given season always
// renders its observations in the same (but non-fixed) order.
function shuffle<T>(rng: Rng, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function buildObservations(
  claimedSlug: ZodiacId,
  prevStart: string,
  prevEnd: string,
  windowEntries: WindowEntry[],
): string[] {
  // Seed all copy/trait choices from the season start date — a given season
  // always renders the same lines (and it's what we persist).
  const rng = makeRng(hashStr(prevStart));

  // Too little engagement to read a trend: a single flavourless line, no
  // observations computed at all.
  const count = windowEntries.length;
  if (count < SEASON_LOW_ENTRIES) return [pick(rng, LOW_TEXTS)];

  // --- Spirit drift: one line per ring ---
  // Net movement = cumulative scores at its end minus those the day before it
  // began. Two rings speak for what rose most; one, chosen at random, for what
  // receded most.
  const before = computeSpiritBeanScores(claimedSlug, dayBefore(prevStart));
  const after = computeSpiritBeanScores(claimedSlug, prevEnd);
  const rings = [
    ringMovers(
      rng,
      SPIRIT_FLAVOUR_RING,
      before.flavourValues,
      after.flavourValues,
    ),
    ringMovers(rng, SPIRIT_FORM_RING, before.formValues, after.formValues),
    ringMovers(rng, SPIRIT_BEAN_RING, before.beanValues, after.beanValues),
  ];
  const recedingRing = Math.floor(rng() * rings.length);
  const movements = rings.map(({ top, bottom }, i) =>
    i === recedingRing
      ? { text: pick(rng, DRIFT_AWAY_BY_ID[bottom.id]!), delta: bottom.delta }
      : { text: pick(rng, DRIFT_TOWARD_BY_ID[top.id]!), delta: top.delta },
  );

  // --- Open vs closed: facet Accept/Resist balance (facet rituals only) ---
  const facet = windowEntries.filter(
    (e) => e.variant === "facet" || e.variant == null,
  );
  const accepts = facet.filter((e) => e.score > 0).length;
  const resists = facet.filter((e) => e.score < 0).length;
  const facetTotal = accepts + resists;
  let lean: string | null = null;
  if (facetTotal > 0) {
    const balance = (accepts - resists) / facetTotal;
    lean = pick(
      rng,
      balance > 0.2 ? LEAN_OPEN : balance < -0.2 ? LEAN_CLOSED : LEAN_BALANCED,
    );
  }

  // Below the full threshold, only the ring that moved furthest speaks. Deltas
  // share one score scale across rings, so they compare directly.
  const full = count >= SEASON_FULL_ENTRIES;
  const shown = full
    ? movements
    : [
        movements.reduce((a, b) =>
          Math.abs(b.delta) > Math.abs(a.delta) ? b : a,
        ),
      ];
  const lines = shown.map((m) => m.text);
  if (lean) lines.push(lean);

  // Randomise the order so successive seasons don't share a fixed silhouette.
  const observations = shuffle(rng, lines);
  if (!full) return observations;

  // --- Season bridge (pinned last): how far the season carried you from your
  // claimed self ---
  const drift = seasonalDriftZodiac(before, after);
  const claimedTrait = TRAITS[claimedSlug]?.trait;
  const driftTrait = TRAITS[drift.id]?.trait;
  if (claimedTrait && driftTrait) {
    // Three framings: the drift landed on your own zodiac (same), pulled you a
    // little (near), or carried you into a plainly different self (far).
    const pool =
      drift.id === claimedSlug
        ? BRIDGE_SAME
        : drift.divergence >= SEASON_DRIFT_THRESHOLD
          ? BRIDGE_FAR
          : BRIDGE_NEAR;
    const line = fillTraits(pick(rng, pool), {
      claimed: claimedTrait,
      drift: driftTrait,
    });
    observations.push(line);
  }

  return observations;
}
