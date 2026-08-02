import {
  getZodiacMetadataForDate,
  type QualityId,
  type ZodiacId,
} from "./zodiac";
import {
  computeSpiritBeanScores,
  SPIRIT_BEAN_RING,
  SPIRIT_FLAVOUR_RING,
  SPIRIT_FORM_RING,
} from "./spiritBean";
import type { RitualVariant } from "./fortune";
import { useStore } from "../store";
import zodiacTraits from "../data/generated/zodiac-traits.json";

const TRAITS = zodiacTraits as Record<string, string>;

// A season = the Form period (2 months, 6 per bean-year). Once one closes, an
// engaged user gets a one-time recap; this is the persisted record of it. The
// rendered `observations` are snapshotted so the Beanstalk marker shows exactly
// what the user was told, even if the generators change later.
export type SeasonSummary = {
  seasonKey: string; // closing season startDate "YYYY-MM-DD" — the store key
  prevZodiacId: ZodiacId; // season summarised
  nextZodiacId: ZodiacId; // incoming season
  observations: string[]; // ranked lines, already rendered
  generatedAt: string; // ISO
};

// Entry-count thresholds that decide how rich the recap is. Below LOW it's a
// single flavourless line; below FULL a single observation; at/above FULL the
// whole spread.
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

// Fortune tiers appear at different rates (see qualityFromSlot in lib/fortune:
// heirloom 1, market 2, garden 3, stale 2, rotten 1 of 9), so a rarer tier
// carries more signal when it recurs. Weight = inverse of that frequency,
// scaled by 2 to stay integral. Only the ratios matter downstream.
const TIER_WEIGHT: Record<QualityId, number> = {
  heirloom: 18,
  market: 9,
  garden: 6,
  stale: 9,
  rotten: 18,
};

// --- Copy pools (pick one at random; snapshotted onto the summary) ---

// Spirit drift is keyed to the specific attribute (flavour/form/bean) that moved
// most — each id gets its own self-contained lines, evoking that
// attribute's trait cluster as a vibe/feeling (never naming the bean/flavour/form
// itself). TOWARD = the attribute that rose most; AWAY = the one that receded
// most. ids are unique across all three rings, so one flat map per direction.
const DRIFT_TOWARD_BY_ID: Record<string, readonly string[]> = {
  // Flavours
  bitter: [
    "You grew harder to please, and quietly proud of it.",
    "A cool, discerning eye settled over you; nothing passed unexamined.",
    "You developed a taste for the complicated, and little patience for the simple.",
  ],
  sour: [
    "A sharp clarity took you; you cut to the honest truth of things.",
    "You grew precise and unsparing, unwilling to sweeten what needed saying.",
    "Everything came into focus, edged and exact, and you said what you meant.",
  ],
  spicy: [
    "A restless heat moved through you, quick to remake whatever it touched.",
    "You lived at full intensity, bold and immediate and hard to ignore.",
    "Change came fast in you; you burned through the old and reached for the new.",
  ],
  sweet: [
    "An easy joy settled over you, generous and unhurried.",
    "You gave freely and worried little, and comfort came without effort.",
    "Life felt lighter in your hands; you leaned into pleasure and ease.",
  ],
  umami: [
    "A deep, unhurried warmth grew in you, satisfied with slow and simple things.",
    "You sank into richness, in no rush, wanting for little.",
    "Something warm and full settled in you, deep enough to rest in.",
  ],
  // Forms
  boiled: [
    "You grew patient and steady, a quiet source of care for those around you.",
    "A composed calm held you, nourishing and slow, if touched with melancholy.",
    "You settled into steadiness, tending things gently and asking little.",
  ],
  dried: [
    "You drew inward, austere and self-contained, needing no one.",
    "A stoic, concentrated resolve hardened in you, unyielding and spare.",
    "You pared life down to essentials and bore it alone, without complaint.",
  ],
  fermented: [
    "You turned inward and strange, perceptive in unconventional ways.",
    "A complex, introspective mood took you, at ease with the weird and unresolved.",
    "You saw sideways, finding truth in the odd and the overlooked.",
  ],
  fried: [
    "You moved decisively, passionate and quick, easily lit.",
    "A bold, restless energy drove you, ready to act before the doubt set in.",
    "You ran hot and certain, throwing yourself at things with full force.",
  ],
  roasted: [
    "A radiant warmth drew people to you, generous and glad.",
    "You lived convivially and well, giving freely and savouring the pleasure of it.",
    "You glowed outward, warm company and unashamed of your appetites.",
  ],
  smoked: [
    "You grew harder to read, elusive and oblique, keeping your depths.",
    "An enigmatic quiet settled over you, present but never quite pinned down.",
    "You moved at a slant, inscrutable, leaving others guessing.",
  ],
  // Beans
  adzuki: [
    "A celebratory joy carried you, generous and light on your feet.",
    "You felt lucky and glad, giving freely and sidestepping whatever weighed things down.",
    "You leaned toward festivity, warm and open, quick to smile.",
  ],
  black: [
    "You grew watchful and resilient, determined and slow to trust.",
    "A guarded, perceptive strength settled in you, seeing much and saying little.",
    "You endured quietly, inward and unbroken, keeping your own counsel.",
  ],
  butter: [
    "A deep ease took you, peaceful and content, indulging small pleasures.",
    "You let the current carry you, unbothered and calm, asking nothing of anyone.",
    "You settled into contentment, easygoing to the point of stillness.",
  ],
  cannellini: [
    "You grew refined and exacting, gracious but hard to satisfy.",
    "An elegant, discerning eye settled over you; only the well-made would do.",
    "You held yourself to a fine standard, poised and quietly demanding.",
  ],
  chickpea: [
    "You grew adaptable and warm, easy company wherever you landed.",
    "A sociable, resourceful ease carried you, at home in any room, tied to none.",
    "You bent with the season, sociable and quick, keeping your options open.",
  ],
  edamame: [
    "You grew practical and direct, quick to the point and quicker to move on.",
    "A sharp, no-nonsense clarity took you; you had little time for the roundabout.",
    "You cut straight to what mattered, plain-spoken and fast.",
  ],
  fava: [
    "A daring courage took you, bold enough to go first and ask later.",
    "You pioneered, unafraid, drawn to the untried edge.",
    "You leapt where others hesitated, hungry for the new and the risky.",
  ],
  green: [
    "A fresh, restless energy filled you, enthusiastic and quick to hope.",
    "You bounded through the season optimistic and bright, hungry for what's next.",
    "You crackled with enthusiasm, never quite able to sit still.",
  ],
  kidney: [
    "A fierce, protective passion drove you, tenacious to the point of overreach.",
    "You poured your whole vitality into things, guarding what you loved and letting go of nothing.",
    "You held on hard, unrelenting, stretched thin by caring so much.",
  ],
  mung: [
    "A gentle, healing impulse grew in you, tender toward yourself and others.",
    "You turned nurturing and soft, mending quietly, if unsure of your own worth.",
    "You leaned toward care, kind and regenerative, slow to trust your footing.",
  ],
  navy: [
    "You grew principled and steadfast, loyal and immovable once set.",
    "A dependable, enduring resolve settled in you, holding firm to what you believe.",
    "You stood by your word, reliable to a fault, slow to bend.",
  ],
  pinto: [
    "A creative, spontaneous surge took you, expressive and quick to feel.",
    "You lived imaginatively and openly, wearing every feeling where it could be seen.",
    "You followed inspiration where it led — vivid, unguarded, easily moved.",
  ],
};

const DRIFT_AWAY_BY_ID: Record<string, readonly string[]> = {
  // Flavours
  bitter: [
    "You softened, less quick to judge and readier to be pleased.",
    "The cool distance in you thawed; you stopped weighing everything so finely.",
    "You let go of needing it all refined, and took things as they came.",
  ],
  sour: [
    "You dulled your edge, less need to name every hard truth.",
    "The sharpness in you eased; you let some things stay comfortably unsaid.",
    "You traded precision for gentleness, and stopped cutting so close to the bone.",
  ],
  spicy: [
    "The heat in you banked low; you let things keep their shape.",
    "You cooled from the intense to the calm, in no hurry to transform anything.",
    "The urge to remake everything left you, and you sat easier with what was.",
  ],
  sweet: [
    "The easy sweetness left you; you took things more seriously.",
    "You grew less content to coast, and traded comfort for effort.",
    "The unhurried joy in you sharpened into something more deliberate.",
  ],
  umami: [
    "The slow warmth in you cooled; you grew restless for something brighter.",
    "You lost your taste for the deep and lingering, and quickened your pace.",
    "The rich contentment thinned, and you reached past comfort for edge.",
  ],
  // Forms
  boiled: [
    "The patient calm in you gave way to something quicker and less settled.",
    "You grew restless with steadiness, less content to simply tend and wait.",
    "The quiet, nourishing composure loosened; you wanted motion, not stillness.",
  ],
  dried: [
    "The austere solitude in you softened; you opened back toward company.",
    "You loosened your stoic grip, less unyielding, more willing to lean on others.",
    "The spare, self-contained hardness thawed into something warmer.",
  ],
  fermented: [
    "The strange introspection lifted; you rejoined the ordinary and plain.",
    "You grew less inward and less peculiar, content with the straightforward.",
    "The taste for the unconventional faded, and you sought simpler ground.",
  ],
  fried: [
    "The restless fire in you settled; you grew slower to act and quicker to weigh.",
    "You cooled from bold to measured, less easily provoked, more considered.",
    "The urgent energy banked, and you stopped rushing headlong at everything.",
  ],
  roasted: [
    "The radiant warmth in you dimmed; you turned quieter and more inward.",
    "You grew less convivial, less hungry for pleasure, content with less.",
    "The generous glow banked low, and you kept more of yourself to yourself.",
  ],
  smoked: [
    "The enigmatic haze around you cleared; you became easier to read.",
    "You grew less elusive and more direct, no longer keeping to the shadows.",
    "The oblique mystery in you faded into something plain and open.",
  ],
  // Beans
  adzuki: [
    "The festive lightness left you; you grew steadier, readier to sit with the hard.",
    "You stopped sidestepping the difficult, trading celebration for something graver.",
    "The easy, lucky joy in you quieted into something more grounded.",
  ],
  black: [
    "The guarded watchfulness in you eased; you let others closer.",
    "You grew less braced and more open, no longer keeping so much to yourself.",
    "The wary resilience softened into something more trusting.",
  ],
  butter: [
    "The easy stillness in you stirred; you grew restless for something to do.",
    "You traded contentment for drive, less willing to simply drift.",
    "The peaceful inertia lifted, and you reached for motion and purpose.",
  ],
  cannellini: [
    "The exacting polish in you relaxed; you forgave the flawed and the rough.",
    "You grew less perfectionist, content with good enough and glad of it.",
    "The refined demand softened into ease and acceptance.",
  ],
  chickpea: [
    "The easy adaptability in you settled; you committed where before you'd have drifted.",
    "You grew less restless and more rooted, ready to stay rather than move on.",
    "The open-ended sociability narrowed into something steadier and chosen.",
  ],
  edamame: [
    "The blunt efficiency in you softened; you slowed down and lingered longer.",
    "You grew less dismissive and more patient, willing to sit with the roundabout.",
    "The sharp practicality eased into something gentler and less hurried.",
  ],
  fava: [
    "The reckless daring in you steadied; you grew careful where you'd have charged.",
    "You traded boldness for caution, content to let others go first.",
    "The pioneering fire banked, and you found comfort in the known.",
  ],
  green: [
    "The restless energy in you settled; you grew calmer and content to stay put.",
    "You cooled from eager to steady, less hurried toward the next bright thing.",
    "The fresh optimism mellowed into something quieter and more grounded.",
  ],
  kidney: [
    "The fierce grip in you loosened; you learned to let some things go.",
    "You grew less overextended, guarding less and resting more.",
    "The relentless passion eased into something calmer and better paced.",
  ],
  mung: [
    "The tender uncertainty in you firmed; you grew surer and less easily shaken.",
    "You needed less mending, steadier in yourself and quicker to trust it.",
    "The gentle insecurity gave way to something more confident and rooted.",
  ],
  navy: [
    "The rigid resolve in you softened; you grew willing to bend where you'd have held.",
    "You loosened your grip on the rules, less unyielding, more forgiving.",
    "The immovable steadfastness eased into something more flexible.",
  ],
  pinto: [
    "The vivid feeling in you settled; you grew steadier and less easily swept up.",
    "You reined in the spontaneous, more composed, less at the mercy of a mood.",
    "The unguarded expressiveness quieted into something more measured.",
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

// Accepted tiers cluster on the honest middle (market + garden).
const QUALITY_POSITIVE: readonly string[] = [
  "You felt level-headed, taking things at their honest weight.",
  "You favoured the steady and the true, wary of the extremes.",
  "You were drawn to what sat right, plain and well-set.",
];

// Accepted tiers cluster on the off-tiers (stale + rotten).
const QUALITY_INVERSE: readonly string[] = [
  "You felt off-kilter, drawn to what ran against the grain.",
  "You favoured the contrary — the faded, the spoiled, the sharp.",
  "You were drawn to turbulence, to what unsettled more than it soothed.",
];

// Accepted tiers cluster on the excess (heirloom).
const QUALITY_EXCESS: readonly string[] = [
  "You felt intense, reaching for everything at full pitch.",
  "You favoured the over-the-top, nothing done by halves.",
  "You were drawn to excess, to the brimming and the extreme.",
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
  "You became more {drift} this season.",
];

// A strong drift: you became something the claimed self would barely recognise.
const BRIDGE_FAR: readonly string[] = [
  "You drifted far from your natural {claimed} self, toward a {drift} life.",
  "You end the season a {drift} version of yourself your {claimed} nature would scarcely know.",
  "This season you rejected your {claimed} nature, and adopted a {drift} one.",
];

// A single attribute's net movement, keyed by its id.
type Mover = { delta: number; id: string };

// The attributes (across all three rings) that rose most and receded most.
function extremeMovers(
  before: ReturnType<typeof computeSpiritBeanScores>,
  after: ReturnType<typeof computeSpiritBeanScores>,
): { top: Mover; bottom: Mover } {
  const rings: {
    ring: readonly string[];
    before: number[];
    after: number[];
  }[] = [
    {
      ring: SPIRIT_FLAVOUR_RING,
      before: before.flavourValues,
      after: after.flavourValues,
    },
    {
      ring: SPIRIT_FORM_RING,
      before: before.formValues,
      after: after.formValues,
    },
    {
      ring: SPIRIT_BEAN_RING,
      before: before.beanValues,
      after: after.beanValues,
    },
  ];

  let top: Mover | null = null;
  let bottom: Mover | null = null;
  for (const { ring, before: b, after: a } of rings) {
    ring.forEach((id, i) => {
      const delta = (a[i] ?? 0) - (b[i] ?? 0);
      if (!top || delta > top.delta) top = { delta, id };
      if (!bottom || delta < bottom.delta) bottom = { delta, id };
    });
  }
  return { top: top!, bottom: bottom! };
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

  return {
    seasonKey: prevStart,
    prevZodiacId: prevMeta.zodiacId,
    nextZodiacId: meta.zodiacId,
    observations,
    generatedAt: new Date().toISOString(),
  };
}

type WindowEntry = {
  qualityId: QualityId;
  score: number;
  variant?: RitualVariant;
};

// A candidate observation carries its salience so the most extreme signals can
// be favoured when only one can show (mid tier). Salience is normalised to
// roughly 0..1 across the heterogeneous signals so they're comparable.
type Candidate = { text: string; salience: number };

// Spirit-drift deltas accrue a few points per accepted entry; ~20 over a full
// season is already a pronounced swing, so normalise magnitude against it.
const DRIFT_NORM = 20;

// A balanced open/closed season is the *absence* of a lean, so it carries only
// faint signal — low enough to lose to any real drift/lean when they compete.
const BALANCED_SALIENCE = 0.15;

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

  // --- Spirit drift: the most- and least-moved attributes ---
  // Net movement = cumulative scores at its end minus those the day
  // before it began.
  const before = computeSpiritBeanScores(claimedSlug, dayBefore(prevStart));
  const after = computeSpiritBeanScores(claimedSlug, prevEnd);
  const { top, bottom } = extremeMovers(before, after);

  const towardPool = DRIFT_TOWARD_BY_ID[top.id];
  const toward: Candidate | null = towardPool
    ? {
        text: pick(rng, towardPool),
        salience: Math.min(1, top.delta / DRIFT_NORM),
      }
    : null;

  const awayPool = DRIFT_AWAY_BY_ID[bottom.id];
  const away: Candidate | null = awayPool
    ? {
        text: pick(rng, awayPool),
        salience: Math.min(1, -bottom.delta / DRIFT_NORM),
      }
    : null;

  // Below the full threshold, just the single most extreme drift observation.
  if (count < SEASON_FULL_ENTRIES) {
    const best = [toward, away]
      .filter((c): c is Candidate => c != null)
      .sort((a, b) => b.salience - a.salience)[0];
    return best ? [best.text] : [];
  }

  const candidates: Candidate[] = [];
  if (toward) candidates.push(toward);
  if (away) candidates.push(away);

  // --- Open vs closed: facet Accept/Resist balance (facet rituals only) ---
  const facet = windowEntries.filter(
    (e) => e.variant === "facet" || e.variant == null,
  );
  const accepts = facet.filter((e) => e.score > 0).length;
  const resists = facet.filter((e) => e.score < 0).length;
  const facetTotal = accepts + resists;
  if (facetTotal > 0) {
    const lean = (accepts - resists) / facetTotal;
    if (lean > 0.2)
      candidates.push({ text: pick(rng, LEAN_OPEN), salience: Math.abs(lean) });
    else if (lean < -0.2)
      candidates.push({
        text: pick(rng, LEAN_CLOSED),
        salience: Math.abs(lean),
      });
    else
      candidates.push({
        text: pick(rng, LEAN_BALANCED),
        salience: BALANCED_SALIENCE,
      });
  }

  // --- Quality lean: where the accepted tiers cluster (rarity-weighted) ---
  // "Accepted" = facet Accepts plus every question/rorschach pick (those always
  // count as +1 and carry the answered tier as qualityId).
  const accepted = windowEntries.filter((e) => e.score > 0);
  if (accepted.length > 0) {
    let positive = 0;
    let inverse = 0;
    let excess = 0;
    for (const e of accepted) {
      const w = TIER_WEIGHT[e.qualityId];
      if (e.qualityId === "heirloom") excess += w;
      else if (e.qualityId === "market" || e.qualityId === "garden")
        positive += w;
      else inverse += w; // stale, rotten
    }
    const total = positive + inverse + excess;
    const sorted = [excess, inverse, positive].sort((a, b) => b - a);
    // How decisively the winning cluster leads the runner-up (0..1).
    const salience = total > 0 ? (sorted[0]! - sorted[1]!) / total : 0;
    const max = sorted[0];
    if (max === excess)
      candidates.push({ text: pick(rng, QUALITY_EXCESS), salience });
    else if (max === inverse)
      candidates.push({ text: pick(rng, QUALITY_INVERSE), salience });
    else candidates.push({ text: pick(rng, QUALITY_POSITIVE), salience });
  }

  // Keep the three most salient signals, then randomise their order so
  // successive seasons don't share a fixed silhouette.
  const top3 = [...candidates].sort((a, b) => b.salience - a.salience).slice(0, 3);
  const observations = shuffle(rng, top3).map((c) => c.text);

  // --- Season bridge (pinned last): how far the season carried you from your
  // claimed self ---
  const drift = seasonalDriftZodiac(before, after);
  const claimedTrait = TRAITS[claimedSlug];
  const driftTrait = TRAITS[drift.id];
  if (claimedTrait && driftTrait) {
    // Three framings: the drift landed on your own zodiac (same), pulled you a
    // little (near), or carried you into a plainly different self (far).
    const pool =
      drift.id === claimedSlug
        ? BRIDGE_SAME
        : drift.divergence >= SEASON_DRIFT_THRESHOLD
          ? BRIDGE_FAR
          : BRIDGE_NEAR;
    const line = pick(rng, pool)
      .replaceAll("{claimed}", claimedTrait)
      .replaceAll("{drift}", driftTrait);
    observations.push(line);
  }

  return observations;
}
