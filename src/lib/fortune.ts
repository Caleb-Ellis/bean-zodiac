import {
  BEAN_ORDER,
  BEAN_ZODIAC_REFERENCE_DAY,
  BEAN_ZODIAC_REFERENCE_MONTH,
  BEAN_ZODIAC_REFERENCE_YEAR,
  FLAVOUR_ORDER,
  FORM_ORDER,
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type Zodiac,
  type ZodiacId,
  type ZodiacMetadata,
} from "./zodiac";

const QualityIds = {
  Rotten: "rotten",
  Stale: "stale",
  Garden: "garden",
  Market: "market",
  Heirloom: "heirloom",
} as const;
export type QualityId = (typeof QualityIds)[keyof typeof QualityIds];

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

const qualityFromSlot = (r: number): QualityId => {
  if (r < 2) return QualityIds.Heirloom; // 2/20
  if (r < 6) return QualityIds.Market; // 4/20
  if (r < 16) return QualityIds.Garden; // 10/20
  if (r < 19) return QualityIds.Stale; // 3/20
  return QualityIds.Rotten; // 1/20
};

const getQualityForSlug = (slug: string, date: Date): QualityId => {
  let h = daysSinceOrigin(date);
  for (const c of slug) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return qualityFromSlot(h % 20);
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

  // Personal and seasonal participate ~50% and ~33% of the time respectively.
  // When inactive, a unique fallback is derived from their index so each bean
  // gets its own deterministic substitute rather than the shared daily bean.
  const P =
    h32(d, personalIndex) % 2 === 0
      ? personal
      : makeFallbackDimensions(personalIndex, d);
  const S =
    h32(d, seasonalIndex ^ (personalIndex * 0xdeadbeef)) % 3 !== 0
      ? seasonal
      : makeFallbackDimensions(seasonalIndex, d);

  if (phase === 0) return `${S.flavourId}-${daily.formId}-${P.beanId}`;
  if (phase === 1) return `${P.flavourId}-${daily.formId}-${S.beanId}`;
  if (phase === 2) return `${S.flavourId}-${P.formId}-${daily.beanId}`;
  if (phase === 3) return `${daily.flavourId}-${S.formId}-${P.beanId}`;
  if (phase === 4) return `${daily.flavourId}-${P.formId}-${S.beanId}`;
  return `${P.flavourId}-${S.formId}-${daily.beanId}`;
};

export const getQualityLabel = (
  qualityId: QualityId,
  date: Date,
): { text: string; className: string } | undefined => {
  const d = daysSinceOrigin(date);
  const pick = (texts: string[]) =>
    texts[((d % texts.length) + texts.length) % texts.length];
  switch (qualityId) {
    case QualityIds.Heirloom:
      return {
        text: pick(["Heirloom", "Gourmet", "Heritage", "Artisanal", "Prized"]),
        className: "text-effect-gold",
      };
    case QualityIds.Market:
      return {
        text: pick(["Fresh", "Select", "Quality", "Reserve", "Handpicked"]),
        className: "text-effect-emerald",
      };
    case QualityIds.Stale:
      return {
        text: pick(["Stale", "Old", "Faded", "Mushy", "Wilted"]),
        className: "text-effect-bruise",
      };
    case QualityIds.Rotten:
      return {
        text: pick(["Rotten", "Spoiled", "Putrid", "Foul", "Mouldy"]),
        className: "text-effect-rot",
      };
    default:
      return undefined;
  }
};

export const getFortuneText = (
  zodiac: Zodiac,
  qualityId: QualityId,
): string => {
  if (qualityId === QualityIds.Heirloom && zodiac.dailyBest)
    return zodiac.dailyBest;
  if (qualityId === QualityIds.Market && zodiac.dailyGood)
    return zodiac.dailyGood;
  if (qualityId === QualityIds.Stale && zodiac.dailyBad) return zodiac.dailyBad;
  if (qualityId === QualityIds.Rotten && zodiac.dailyWorst)
    return zodiac.dailyWorst;
  return zodiac.dailyNeutral ?? zodiac.seasonalFortune;
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
