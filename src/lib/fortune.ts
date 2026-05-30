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
// XOR mask keeps this hash independent from getQualityForSlug
export const getVariantForSlug = (slug: string, date: Date): RitualVariant => {
  let h = (daysSinceOrigin(date) ^ 0x5a5a5a5a) >>> 0;
  for (const c of slug) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  const r = h % 4;
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

const getFortuneZodiacId = (
  date: Date,
  personal: DailyDimensions,
  seasonal: Pick<ZodiacMetadata, "beanId" | "flavourId" | "formId">,
): ZodiacId => {
  const daily = getDailyDimensions(date);
  const d = daysSinceOrigin(date);

  const personalIndex =
    BEAN_ORDER.indexOf(personal.beanId) *
      FLAVOUR_ORDER.length *
      FORM_ORDER.length +
    FLAVOUR_ORDER.indexOf(personal.flavourId) * FORM_ORDER.length +
    FORM_ORDER.indexOf(personal.formId);
  const seasonalIndex =
    BEAN_ORDER.indexOf(seasonal.beanId) *
      FLAVOUR_ORDER.length *
      FORM_ORDER.length +
    FLAVOUR_ORDER.indexOf(seasonal.flavourId) * FORM_ORDER.length +
    FORM_ORDER.indexOf(seasonal.formId);

  const phase = h32(d, personalIndex ^ (seasonalIndex << 9)) % 6;

  // Personal and seasonal participate ~14% of the time.
  // When inactive, a unique fallback is derived from their index so each bean
  // gets its own deterministic substitute rather than the shared daily bean.
  const P =
    h32(d, personalIndex) % 7 === 0
      ? personal
      : makeFallbackDimensions(personalIndex, d);
  const S =
    h32(d, seasonalIndex ^ (personalIndex * 0xdeadbeef)) % 7 === 0
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

export const getDailyText = (
  zodiac: Zodiac,
  qualityId: QualityId,
  score: number,
): string | null => {
  if (score === 0) return null;
  if (score === 1) {
    if (qualityId === QualityIds.Heirloom) return zodiac.fortuneMost;
    if (qualityId === QualityIds.Market) return zodiac.fortuneHigh;
    if (qualityId === QualityIds.Stale) return zodiac.fortuneLow;
    if (qualityId === QualityIds.Rotten) return zodiac.fortuneLeast;
    return zodiac.fortuneMid;
  }
  // resist — inverse
  if (qualityId === QualityIds.Heirloom) return zodiac.fortuneLow;
  if (qualityId === QualityIds.Market) return zodiac.fortuneLow;
  if (qualityId === QualityIds.Stale) return zodiac.fortuneMid;
  if (qualityId === QualityIds.Rotten) return zodiac.fortuneMid;
  return zodiac.fortuneLow; // Garden/facetMid resisted → fortuneLow
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
