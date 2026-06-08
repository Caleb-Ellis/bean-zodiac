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
  type SpiritTags,
  type Zodiac,
  type ZodiacId,
  type ZodiacMetadata,
} from "./zodiac";

type DailyDimensions = {
  beanId: BeanId;
  flavourId: FlavourId;
  formId: FormId;
};

const ORIGIN_DATE = new Date(
  BEAN_ZODIAC_REFERENCE_YEAR,
  BEAN_ZODIAC_REFERENCE_MONTH - 1,
  BEAN_ZODIAC_REFERENCE_DAY,
);

const daysSinceOrigin = (date: Date): number =>
  Math.floor((date.getTime() - ORIGIN_DATE.getTime()) / 86_400_000);

// Weights: heirloom=1, market=2, garden=2, stale=2, rotten=1 (total 8)
// → heirloom and rotten are 0.5x as likely as market, garden, stale
const qualityFromSlot = (r: number): QualityId => {
  if (r === 0) return QualityIds.Heirloom;
  if (r <= 2) return QualityIds.Market;
  if (r <= 4) return QualityIds.Garden;
  if (r <= 6) return QualityIds.Stale;
  return QualityIds.Rotten;
};

const getQualityForSlug = (slug: string, date: Date): QualityId => {
  let h = daysSinceOrigin(date);
  for (const c of slug) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return qualityFromSlot(h % 8);
};

export type RitualVariant = "facet" | "question" | "rorschach";

// Weights out of 4: facet 2, question 1, rorschach 1.
// The slug is itself date-derived, so a plain polynomial hash seeded with the
// day correlates with the slug-selection roll and skews the variant mix. Fold
// the slug into one integer, then run it through h32's avalanche mixer with the
// day so the low bits we read for the variant are decorrelated from that roll.
export const getVariantForSlug = (slug: string, date: Date): RitualVariant => {
  let s = 0;
  for (const c of slug) s = (Math.imul(s, 31) + c.charCodeAt(0)) >>> 0;
  const r = h32(daysSinceOrigin(date) ^ 0x5a5a5a5a, s) % 4;
  if (r < 2) return "facet";
  if (r < 3) return "question";
  return "rorschach";
};

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

const makeFallbackDimensions = (index: number, d: number): DailyDimensions => ({
  beanId: BEAN_ORDER[(((d * 13 + index * 7) % 12) + 12) % 12],
  flavourId: FLAVOUR_ORDER[(((d * 11 + index * 3) % 5) + 5) % 5],
  formId: FORM_ORDER[(((d * 7 + index * 5) % 6) + 6) % 6],
});

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

const getFortuneZodiacId = (
  date: Date,
  spirit: DailyDimensions,
  seasonal: Pick<ZodiacMetadata, "beanId" | "flavourId" | "formId">,
): ZodiacId => {
  const daily = getDailyDimensions(date);
  const d = daysSinceOrigin(date);

  const spiritIndex =
    BEAN_ORDER.indexOf(spirit.beanId) *
      FLAVOUR_ORDER.length *
      FORM_ORDER.length +
    FLAVOUR_ORDER.indexOf(spirit.flavourId) * FORM_ORDER.length +
    FORM_ORDER.indexOf(spirit.formId);
  const seasonalIndex =
    BEAN_ORDER.indexOf(seasonal.beanId) *
      FLAVOUR_ORDER.length *
      FORM_ORDER.length +
    FLAVOUR_ORDER.indexOf(seasonal.flavourId) * FORM_ORDER.length +
    FORM_ORDER.indexOf(seasonal.formId);

  const phase = h32(d, spiritIndex ^ (seasonalIndex << 9)) % 6;

  // The spirit seed contributes a fresh, day-varying set of dimensions derived
  // from the spirit slug — never the slug's own static dimensions — so adjacent
  // days don't collide when the spirit slug repeats.
  const P = makeHashedDimensions(spiritIndex, d);
  // The seasonal slug itself surfaces ~1/7 of the time; otherwise a unique
  // day-dependent fallback derived from its index stands in.
  const S =
    h32(d, seasonalIndex ^ (spiritIndex * 0xdeadbeef)) % 7 === 0
      ? seasonal
      : makeFallbackDimensions(seasonalIndex, d);

  if (phase === 0) return `${S.flavourId}-${daily.formId}-${P.beanId}`;
  if (phase === 1) return `${P.flavourId}-${daily.formId}-${S.beanId}`;
  if (phase === 2) return `${S.flavourId}-${P.formId}-${daily.beanId}`;
  if (phase === 3) return `${daily.flavourId}-${S.formId}-${P.beanId}`;
  if (phase === 4) return `${daily.flavourId}-${P.formId}-${S.beanId}`;
  return `${P.flavourId}-${S.formId}-${daily.beanId}`;
};

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

// A zodiac's spirit tags, snapshotted onto the fortune entry so spiritBean can
// replay the soft scoring pass without async zodiac access. These are
// per-zodiac (trait-based), not per-tier: the tier decides at score time which
// set (friendly vs anti) is active. See lib/spiritBean and SPIRIT_TAGS.md.
export const getSpiritTags = (zodiac: Zodiac): SpiritTags => ({
  friendlyBeans: zodiac.friendlyBeans,
  antiBeans: zodiac.antiBeans,
  friendlyForm: zodiac.friendlyForm,
  antiForm: zodiac.antiForm,
});

// Each fortune tier has two written variants (e.g. fortuneMost / fortuneMost2).
// Pick one deterministically per day + zodiac so the fortune stays stable
// through the day but alternates between the pair across days/beans.
const pickFortuneVariant = (
  zodiac: Zodiac,
  date: Date,
  base: keyof Zodiac,
): string => {
  let h = (daysSinceOrigin(date) ^ 0x3c3c3c3c) >>> 0;
  for (const c of zodiac.slug + base)
    h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  const key = h % 2 === 0 ? base : (`${base}2` as keyof Zodiac);
  return zodiac[key] as string;
};

export const getDailyText = (
  zodiac: Zodiac,
  qualityId: QualityId,
  score: number,
  date: Date,
): string | null => {
  const pick = (base: keyof Zodiac) => pickFortuneVariant(zodiac, date, base);
  if (score === 0) return null;
  if (score === 1) {
    if (qualityId === QualityIds.Heirloom) return pick("fortuneMost");
    if (qualityId === QualityIds.Market) return pick("fortuneHigh");
    if (qualityId === QualityIds.Stale) return pick("fortuneLow");
    if (qualityId === QualityIds.Rotten) return pick("fortuneLeast");
    return pick("fortuneMid");
  }
  // resist — inverse
  if (qualityId === QualityIds.Heirloom) return pick("fortuneLow");
  if (qualityId === QualityIds.Market) return pick("fortuneLow");
  if (qualityId === QualityIds.Stale) return pick("fortuneMid");
  if (qualityId === QualityIds.Rotten) return pick("fortuneMid");
  return pick("fortuneLow"); // Garden/facetMid resisted → fortuneLow
};

export const getDailyFortuneIds = (
  date: Date,
  personalSlug: ZodiacId,
): { zodiacId: ZodiacId; qualityId: QualityId } => {
  const [flavourId, formId, beanId] = personalSlug.split("-") as [
    FlavourId,
    FormId,
    BeanId,
  ];
  const seasonal = getZodiacMetadataForDate(date);
  const qualityId = getQualityForSlug(personalSlug, date);
  const zodiacId = getFortuneZodiacId(
    date,
    { beanId, flavourId, formId },
    seasonal,
  );
  return { zodiacId, qualityId };
};
