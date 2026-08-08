import {
  BEAN_ORDER,
  BEAN_ZODIAC_REFERENCE_DAY,
  BEAN_ZODIAC_REFERENCE_MONTH,
  BEAN_ZODIAC_REFERENCE_YEAR,
  FLAVOUR_ORDER,
  FORM_ORDER,
  QualityIds,
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type QualityId,
  type Zodiac,
  type ZodiacId,
  type ZodiacMetadata,
} from "./zodiac";

type DailyDimensions = {
  beanId: BeanId;
  flavourId: FlavourId;
  formId: FormId;
};

const ORIGIN_UTC = Date.UTC(
  BEAN_ZODIAC_REFERENCE_YEAR,
  BEAN_ZODIAC_REFERENCE_MONTH - 1,
  BEAN_ZODIAC_REFERENCE_DAY,
);

// Index the local calendar day, counting from the reference day. We must NOT
// subtract raw getTime() millisecond values: across a DST transition a local
// day is 23h or 25h long, so floor()ing elapsed-ms/86.4M makes two adjacent
// calendar dates collide on the same index (spring forward) — which made every
// dimension, quality and variant identical, i.e. the literal same fortune two
// days running. Re-projecting the date's Y/M/D through Date.UTC gives a clean
// integer per calendar day, DST-proof, so consecutive days always differ.
const daysSinceOrigin = (date: Date): number =>
  Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      ORIGIN_UTC) /
      86_400_000,
  );

// Weights: heirloom=1, market=2, garden=3, stale=2, rotten=1 (total 9)
// → a symmetric bell: garden is the common middle, heirloom and rotten are the
// rare poles at a third of garden's odds.
const qualityFromSlot = (r: number): QualityId => {
  if (r === 0) return QualityIds.Heirloom;
  if (r <= 2) return QualityIds.Market;
  if (r <= 5) return QualityIds.Garden;
  if (r <= 7) return QualityIds.Stale;
  return QualityIds.Rotten;
};

// Fold a slug into one integer (a plain polynomial hash) so it can be avalanched
// with the day. Shared by the quality and variant rolls.
const dayFold = (slug: string): number => {
  let s = 0;
  for (const c of slug) s = (Math.imul(s, 31) + c.charCodeAt(0)) >>> 0;
  return s;
};

// Run the folded slug through h32's avalanche mixer with a day-seed. Seeding a
// plain polynomial hash with the day directly (as this once did) makes h an
// affine function of the day, so `h % 9` walks a deterministic sawtooth
// (…6,5,4,3,2,1,0,8,7…) — the long-run ratios are right but the tier is fully
// predictable and repeats day to day. Avalanching decorrelates adjacent days
// while preserving the slot weights. `daySeed` is the plain day index on the
// base roll, or a perturbed seed on a re-roll (see getDailyRitual), so a
// re-roll varies the tier alongside the slug. Mirrors variantFromSeed.
const qualityFromSeed = (daySeed: number, s: number): QualityId =>
  qualityFromSlot(h32((daySeed ^ 0x39393939) >>> 0, s) % 9);

export type RitualVariant = "facet" | "question" | "rorschach";

// Weights out of 14: facet 9, question 3, rorschach 2.
// Keyed on the claimed (personal) slug, not the fortune slug: the fortune roll
// collapses onto a small, daily-anchored set of outcomes, so deriving the
// variant from it clustered the whole user base onto the same variant each day.
// The personal slug is fixed per user, so the day must drive the variation —
// avalanche the folded slug with a day-seed through h32 so the same person sees
// a different variant from one day to the next. `daySeed` is perturbed on a
// re-roll (see getDailyRitual) so the variant varies alongside the slug/tier.
const variantFromSeed = (daySeed: number, s: number): RitualVariant => {
  const r = h32((daySeed ^ 0x5a5a5a5a) >>> 0, s) % 14;
  if (r < 10) return "facet";
  if (r < 13) return "question";
  return "rorschach";
};

// Thin wrapper over the base (un-perturbed) variant roll for a given day.
export const getVariantForSlug = (slug: string, date: Date): RitualVariant =>
  variantFromSeed(daysSinceOrigin(date), dayFold(slug));

// Most→Least, the order answer buttons render in.
export const ANSWER_TIERS: readonly QualityId[] = [
  QualityIds.Heirloom,
  QualityIds.Market,
  QualityIds.Garden,
  QualityIds.Stale,
  QualityIds.Rotten,
] as const;

export const getAnswerText = (zodiac: Zodiac, qualityId: QualityId): string => {
  if (qualityId === QualityIds.Heirloom) return zodiac.answerMost;
  if (qualityId === QualityIds.Market) return zodiac.answerHigh;
  if (qualityId === QualityIds.Garden) return zodiac.answerMid;
  if (qualityId === QualityIds.Stale) return zodiac.answerLow;
  return zodiac.answerLeast;
};

export const getRorschachText = (
  zodiac: Zodiac,
  qualityId: QualityId,
): string | undefined => {
  if (qualityId === QualityIds.Heirloom) return zodiac.rorschachMost;
  if (qualityId === QualityIds.Market) return zodiac.rorschachHigh;
  if (qualityId === QualityIds.Garden) return zodiac.rorschachMid;
  if (qualityId === QualityIds.Stale) return zodiac.rorschachLow;
  return zodiac.rorschachLeast;
};

const getDailyDimensions = (date: Date): DailyDimensions => {
  const d = daysSinceOrigin(date);
  return {
    formId: FORM_ORDER[((d % 6) + 6) % 6],
    flavourId: FLAVOUR_ORDER[((d % 5) + 5) % 5],
    beanId: BEAN_ORDER[((d % 12) + 12) % 12],
  };
};

// The seasonal stand-in used when the real seasonal slug doesn't surface.
// Blend the seasonal index with the spirit (personal) index before avalanching,
// so the stand-in varies per person rather than being identical for everyone on
// a given day. Without the spirit index, only the single per-phase P component
// varied between people, collapsing all 360 daily fortunes onto ~12 distinct
// outcomes; folding it in roughly tenfolds the spread. The spirit index here is
// purely a deterministic stand-in for randomness, not a seasonal signal.
const makeFallbackDimensions = (
  seasonalIndex: number,
  spiritIndex: number,
  seed: number,
): DailyDimensions => {
  const k = (seasonalIndex * 131 + spiritIndex) >>> 0;
  return {
    beanId: BEAN_ORDER[h32(seed, k) % 12],
    flavourId: FLAVOUR_ORDER[h32(seed, (k ^ 0x1f1f1f1f) >>> 0) % 5],
    formId: FORM_ORDER[h32(seed, (k ^ 0x2e2e2e2e) >>> 0) % 6],
  };
};

// Deterministic hash mixing two integers — breaks the periodic patterns that
// simple modulo arithmetic creates when one operand is constant within a season.
const h32 = (a: number, b: number): number => {
  let h = Math.imul(a ^ (b * 0x9e3779b9), 0x85ebca6b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  h = Math.imul(h, 0x45d9f3b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h;
};

// Dimensions derived by hashing a slug-index together with the day, so the
// result varies day to day. Used for the spirit seed: rather than reusing the
// spirit slug's own (static) dimensions — which made adjacent days collide when
// the spirit slug repeated — we mint a fresh, day-dependent set from it.
const makeHashedDimensions = (index: number, d: number): DailyDimensions => ({
  beanId: BEAN_ORDER[h32(d, index) % 12],
  flavourId: FLAVOUR_ORDER[h32(d, index ^ 0x1f1f1f1f) % 5],
  formId: FORM_ORDER[h32(d, index ^ 0x2e2e2e2e) % 6],
});

// Number of recent days a fortune slug must clear before it may recur. The
// guard in getDailyRitual re-rolls until the candidate slug isn't among the
// slugs shown in this many days — a secondary variety constraint layered on top
// of the lifetime ritual-uniqueness guarantee.
export const FORTUNE_REPEAT_WINDOW = 21;

// One roll of the fortune zodiac from a given seed. `seed` perturbs only the
// hashed components (phase / spirit seed / seasonal seed); the calendar `daily`
// dimensions are passed in unchanged so the day-to-day rotation is preserved.
// Re-rolls feed a fresh seed to escape a collision (see getFortuneZodiacId).
const rollFortuneZodiacId = (
  daily: DailyDimensions,
  spiritIndex: number,
  seasonalIndex: number,
  seasonal: Pick<ZodiacMetadata, "beanId" | "flavourId" | "formId">,
  seed: number,
): ZodiacId => {
  const phase = h32(seed, spiritIndex ^ (seasonalIndex << 9)) % 6;

  // The spirit seed contributes a fresh, day-varying set of dimensions derived
  // from the spirit slug — never the slug's own static dimensions — so adjacent
  // days don't collide when the spirit slug repeats.
  const P = makeHashedDimensions(spiritIndex, seed);
  // The seasonal slug itself surfaces ~1/7 of the time; otherwise a unique
  // day-dependent fallback derived from its index stands in.
  const S =
    h32(seed, seasonalIndex ^ (spiritIndex * 0xdeadbeef)) % 7 === 0
      ? seasonal
      : makeFallbackDimensions(seasonalIndex, spiritIndex, seed);

  if (phase === 0) return `${S.flavourId}-${daily.formId}-${P.beanId}`;
  if (phase === 1) return `${P.flavourId}-${daily.formId}-${S.beanId}`;
  if (phase === 2) return `${S.flavourId}-${P.formId}-${daily.beanId}`;
  if (phase === 3) return `${daily.flavourId}-${S.formId}-${P.beanId}`;
  if (phase === 4) return `${daily.flavourId}-${P.formId}-${S.beanId}`;
  return `${P.flavourId}-${S.formId}-${daily.beanId}`;
};

const slugIndex = (
  dims: Pick<ZodiacMetadata, "beanId" | "flavourId" | "formId">,
): number =>
  BEAN_ORDER.indexOf(dims.beanId) * FLAVOUR_ORDER.length * FORM_ORDER.length +
  FLAVOUR_ORDER.indexOf(dims.flavourId) * FORM_ORDER.length +
  FORM_ORDER.indexOf(dims.formId);

// The lifetime-unique identity of a ritual: a fortune slug plus its variant,
// and — for the facet variant only — the rolled tier (question/rorschach tiers
// are the user's answer, not part of the ritual's identity). getDailyRitual
// re-rolls until this key hasn't been produced before.
export const ritualKey = (
  zodiacId: ZodiacId,
  variant: RitualVariant,
  qualityId: QualityId,
): string =>
  variant === "facet"
    ? `${zodiacId}:facet:${qualityId}`
    : `${zodiacId}:${variant}`;

export const getFacetTitle = (zodiac: Zodiac, qualityId: QualityId): string => {
  if (qualityId === QualityIds.Heirloom) return zodiac.facetMostTitle;
  if (qualityId === QualityIds.Market) return zodiac.facetHighTitle;
  if (qualityId === QualityIds.Stale) return zodiac.facetLowTitle;
  if (qualityId === QualityIds.Rotten) return zodiac.facetLeastTitle;
  return zodiac.facetMidTitle;
};

export const getFortuneText = (
  zodiac: Zodiac,
  qualityId: QualityId,
): string => {
  if (qualityId === QualityIds.Heirloom) return zodiac.facetMost;
  if (qualityId === QualityIds.Market) return zodiac.facetHigh;
  if (qualityId === QualityIds.Stale) return zodiac.facetLow;
  if (qualityId === QualityIds.Rotten) return zodiac.facetLeast;
  return zodiac.facetMid;
};

export const getDailyText = (
  zodiac: Zodiac,
  qualityId: QualityId,
  score: number,
): string | null => {
  const pick = (base: keyof Zodiac) => zodiac[base] as string;
  if (score === 0) return null;
  if (qualityId === QualityIds.Heirloom) return pick("fortuneMost");
  if (qualityId === QualityIds.Market) return pick("fortuneHigh");
  if (qualityId === QualityIds.Stale) return pick("fortuneLow");
  if (qualityId === QualityIds.Rotten) return pick("fortuneLeast");
  return pick("fortuneMid");
};

export type DailyRitual = {
  zodiacId: ZodiacId;
  qualityId: QualityId;
  variant: RitualVariant;
};

// The single roll entry point. It rolls the fortune slug, tier and variant
// together from one day-seed, then re-rolls the whole triple until the
// resulting ritual key hasn't been produced before (`seenRituals`, the lifetime
// set the caller builds from history) AND the slug isn't among the last
// FORTUNE_REPEAT_WINDOW days' slugs (`recentSlugs`, a softer variety guard).
//
// attempt 0 uses the unperturbed day seed, so a day with no collision produces
// byte-for-byte the same slug/tier/variant as the pre-uniqueness roll. On a
// collision we fold the attempt counter through h32 for a fresh day-seed, which
// perturbs the slug, the tier and the variant in lockstep. Since the seen set
// is drawn only from immutable past entries, today's result stays deterministic
// across reloads.
export const getDailyRitual = (
  date: Date,
  personalSlug: ZodiacId,
  seenRituals: ReadonlySet<string> = new Set(),
  recentSlugs: readonly ZodiacId[] = [],
): DailyRitual => {
  const [flavourId, formId, beanId] = personalSlug.split("-") as [
    FlavourId,
    FormId,
    BeanId,
  ];
  const seasonal = getZodiacMetadataForDate(date);
  const daily = getDailyDimensions(date);
  const d = daysSinceOrigin(date);
  const s = dayFold(personalSlug);
  const spiritIndex = slugIndex({ beanId, flavourId, formId });
  const seasonalIndex = slugIndex(seasonal);
  const avoidSlug = new Set(recentSlugs);

  const roll = (seed: number): DailyRitual => {
    const variant = variantFromSeed(seed, s);
    const qualityId = qualityFromSeed(seed, s);
    const zodiacId = rollFortuneZodiacId(
      daily,
      spiritIndex,
      seasonalIndex,
      seasonal,
      seed,
    );
    return { zodiacId, qualityId, variant };
  };

  // Cap the retries generously: as history grows toward the full ritual space
  // (2,520) a given day's reachable subset thins out relative to the avoidance
  // set, so escaping a collision can take many re-rolls late in a long streak.
  // A high cap keeps the guarantee holding until genuine saturation; termination
  // is still assured. attempt 0 keeps the unperturbed roll so non-colliding days
  // are unchanged.
  for (let attempt = 0; attempt <= 512; attempt++) {
    const seed = attempt === 0 ? d : (d ^ h32(d, attempt + 1)) >>> 0;
    const candidate = roll(seed);
    if (
      !seenRituals.has(
        ritualKey(candidate.zodiacId, candidate.variant, candidate.qualityId),
      ) &&
      !avoidSlug.has(candidate.zodiacId)
    ) {
      return candidate;
    }
  }
  // Pathological saturation — fall back to the base roll rather than loop.
  return roll(d);
};
