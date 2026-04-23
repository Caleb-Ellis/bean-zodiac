/**
 * Bean Zodiac calculation utilities.
 *
 * The Bean Year switches on 12th March each calendar year.
 * A full cycle is 60 years.
 *
 * Reference Bean Zodiac: 12th March 1993 = Fried Umami Edamame
 */

import type { getCollection } from "astro:content";
import type {
  BeanSchema,
  FlavourSchema,
  FormSchema,
  ZodiacSchema,
} from "../schemas";

export const BEAN_ZODIAC_REFERENCE_YEAR = 1993;
export const BEAN_ZODIAC_REFERENCE_MONTH = 3;
export const BEAN_ZODIAC_REFERENCE_DAY = 12;

export const BeanIds = {
  Adzuki: "adzuki",
  Black: "black",
  Butter: "butter",
  Cannellini: "cannellini",
  Chickpea: "chickpea",
  Edamame: "edamame",
  Fava: "fava",
  Green: "green",
  Kidney: "kidney",
  Mung: "mung",
  Navy: "navy",
  Pinto: "pinto",
} as const;
export const BEAN_ORDER = [
  BeanIds.Edamame,
  BeanIds.Black,
  BeanIds.Fava,
  BeanIds.Green,
  BeanIds.Pinto,
  BeanIds.Mung,
  BeanIds.Cannellini,
  BeanIds.Navy,
  BeanIds.Adzuki,
  BeanIds.Butter,
  BeanIds.Chickpea,
  BeanIds.Kidney,
] as const;

export const FlavourIds = {
  Bitter: "bitter",
  Sour: "sour",
  Spicy: "spicy",
  Sweet: "sweet",
  Umami: "umami",
} as const;
export const FLAVOUR_ORDER = [
  FlavourIds.Umami,
  FlavourIds.Sweet,
  FlavourIds.Sour,
  FlavourIds.Bitter,
  FlavourIds.Spicy,
] as const;
export const FLAVOUR_EMOJI: Record<FlavourId, string> = {
  [FlavourIds.Bitter]: "☕",
  [FlavourIds.Sour]: "🍋",
  [FlavourIds.Spicy]: "🌶️",
  [FlavourIds.Sweet]: "🍭",
  [FlavourIds.Umami]: "🍄",
} as const;

export const FormIds = {
  Boiled: "boiled",
  Dried: "dried",
  Fermented: "fermented",
  Fried: "fried",
  Roasted: "roasted",
  Smoked: "smoked",
} as const;
export const FORM_ORDER = [
  FormIds.Fried,
  FormIds.Roasted,
  FormIds.Fermented,
  FormIds.Boiled,
  FormIds.Smoked,
  FormIds.Dried,
] as const;
// Start month (1-indexed) for each form, matching FORM_ORDER
export const FORM_START_MONTH: Record<FormId, number> = {
  [FormIds.Fried]: 3,
  [FormIds.Boiled]: 5,
  [FormIds.Fermented]: 7,
  [FormIds.Roasted]: 9,
  [FormIds.Smoked]: 11,
  [FormIds.Dried]: 1,
} as const;

export const PREPARATION_NAMES: Record<`${FlavourId}-${FormId}`, string> = {
  "bitter-boiled": "Decocted",
  "bitter-dried": "Desiccated",
  "bitter-fermented": "Tinctured",
  "bitter-fried": "Scorched",
  "bitter-roasted": "Dark-Roasted",
  "bitter-smoked": "Ashen",
  "sour-boiled": "Brined",
  "sour-dried": "Dehydrated",
  "sour-fermented": "Pickled",
  "sour-fried": "Brightened",
  "sour-roasted": "Charred",
  "sour-smoked": "Cold-Smoked",
  "spicy-boiled": "Braised",
  "spicy-dried": "Sichuan",
  "spicy-fermented": "Kimchi",
  "spicy-fried": "Red-Hot",
  "spicy-roasted": "Peri-Peri",
  "spicy-smoked": "Chipotle",
  "sweet-boiled": "Candied",
  "sweet-dried": "Crystallised",
  "sweet-fermented": "Honeyed",
  "sweet-fried": "Caramelised",
  "sweet-roasted": "Glazed",
  "sweet-smoked": "Barbecued",
  "umami-boiled": "Dashi",
  "umami-dried": "Aged",
  "umami-fermented": "Miso",
  "umami-fried": "Tempura",
  "umami-roasted": "Bronzed",
  "umami-smoked": "Burnished",
} as const;

export const getPreparationName = (
  flavourId: FlavourId,
  formId: FormId,
): string => PREPARATION_NAMES[`${flavourId}-${formId}`];

export const FORM_EMOJI: Record<FormId, string> = {
  [FormIds.Boiled]: "💧",
  [FormIds.Dried]: "☀️",
  [FormIds.Fermented]: "🌍",
  [FormIds.Fried]: "🔥",
  [FormIds.Roasted]: "♨️",
  [FormIds.Smoked]: "💨",
} as const;

export type BeanId = (typeof BeanIds)[keyof typeof BeanIds];
export type Bean = BeanSchema & { content: string };

export type FlavourId = (typeof FlavourIds)[keyof typeof FlavourIds];
export type Flavour = FlavourSchema & { content: string };

export type FormId = (typeof FormIds)[keyof typeof FormIds];
export type Form = FormSchema & { content: string };

export type ZodiacId = `${FlavourId}-${FormId}-${BeanId}`;
export type Zodiac = ZodiacSchema & { content: string };

const VALID_FLAVOUR_IDS = new Set<string>(Object.values(FlavourIds));
const VALID_FORM_IDS = new Set<string>(Object.values(FormIds));
const VALID_BEAN_IDS = new Set<string>(Object.values(BeanIds));

export const isValidZodiacId = (slug: string): slug is ZodiacId => {
  const parts = slug.split("-");
  if (parts.length !== 3) return false;
  const [flavourId, formId, beanId] = parts;
  return (
    VALID_FLAVOUR_IDS.has(flavourId) &&
    VALID_FORM_IDS.has(formId) &&
    VALID_BEAN_IDS.has(beanId)
  );
};

export const RarityIds = {
  Garden: "garden",
  Market: "market",
  Heirloom: "heirloom",
} as const;
export type RarityId = (typeof RarityIds)[keyof typeof RarityIds];

const ORIGIN_DATE = new Date(
  BEAN_ZODIAC_REFERENCE_YEAR,
  BEAN_ZODIAC_REFERENCE_MONTH - 1,
  BEAN_ZODIAC_REFERENCE_DAY,
);

const daysSinceOrigin = (date: Date): number =>
  Math.floor((date.getTime() - ORIGIN_DATE.getTime()) / 86_400_000);

export const getRarityForDate = (date: Date): RarityId => {
  const r = ((daysSinceOrigin(date) % 10) + 10) % 10;
  if (r === 0) return RarityIds.Heirloom;
  if (r === 3 || r === 7) return RarityIds.Market;
  return RarityIds.Garden;
};

export const getRarityForSlug = (slug: string, date: Date): RarityId => {
  let h = daysSinceOrigin(date);
  for (const c of slug) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  const r = h % 10;
  if (r === 0) return RarityIds.Heirloom;
  if (r === 3 || r === 7) return RarityIds.Market;
  return RarityIds.Garden;
};

export type DailyDimensions = {
  beanId: BeanId;
  flavourId: FlavourId;
  formId: FormId;
};

export const getDailyDimensions = (date: Date): DailyDimensions => {
  const d = daysSinceOrigin(date);
  return {
    formId: FORM_ORDER[((d % 6) + 6) % 6],
    flavourId: FLAVOUR_ORDER[((d % 5) + 5) % 5],
    beanId: BEAN_ORDER[((d % 12) + 12) % 12],
  };
};

export const getFortuneZodiacId = (
  date: Date,
  personal: DailyDimensions,
  seasonal: Pick<ZodiacMetadata, "beanId" | "flavourId" | "formId">,
): ZodiacId => {
  const daily = getDailyDimensions(date);
  const personalIndex =
    BEAN_ORDER.indexOf(personal.beanId) *
      FLAVOUR_ORDER.length *
      FORM_ORDER.length +
    FLAVOUR_ORDER.indexOf(personal.flavourId) * FORM_ORDER.length +
    FORM_ORDER.indexOf(personal.formId);
  const phase = (((daysSinceOrigin(date) + personalIndex) % 6) + 6) % 6;
  console.log({ daily, seasonal, personal });
  if (phase === 0)
    return `${seasonal.flavourId}-${daily.formId}-${personal.beanId}`;
  if (phase === 1)
    return `${seasonal.flavourId}-${personal.formId}-${daily.beanId}`;
  if (phase === 2)
    return `${daily.flavourId}-${seasonal.formId}-${personal.beanId}`;
  if (phase === 3)
    return `${daily.flavourId}-${personal.formId}-${seasonal.beanId}`;
  if (phase === 4)
    return `${personal.flavourId}-${seasonal.formId}-${daily.beanId}`;
  return `${personal.flavourId}-${daily.formId}-${seasonal.beanId}`;
};

export const getFortuneText = (zodiac: Zodiac, rarityId: RarityId): string => {
  if (rarityId === RarityIds.Heirloom && zodiac.dailyRare)
    return zodiac.dailyRare;
  if (rarityId === RarityIds.Market && zodiac.dailyUncommon)
    return zodiac.dailyUncommon;
  return zodiac.dailyCommon ?? zodiac.seasonalFortune;
};

export type ZodiacMetadata = {
  zodiacId: ZodiacId;
  beanId: BeanId;
  flavourId: FlavourId;
  formId: FormId;
  rarityId: RarityId;
  startDate: Date;
  endDate: Date;
};

export type ZodiacData = {
  beans: Record<BeanId, Bean>;
  flavours: Record<FlavourId, Flavour>;
  forms: Record<FormId, Form>;
  zodiacs: Record<ZodiacId, Zodiac>;
};

export const getBeanYear = (date: Date): number => {
  const month = date.getMonth() + 1; // 1-indexed
  const day = date.getDate();
  const year = date.getFullYear();

  if (
    month < BEAN_ZODIAC_REFERENCE_MONTH ||
    (month === BEAN_ZODIAC_REFERENCE_MONTH && day < BEAN_ZODIAC_REFERENCE_DAY)
  ) {
    return year - 1;
  }
  return year;
};

export const getBeanIdForBeanYear = (beanYear: number): BeanId => {
  const index = (((beanYear - BEAN_ZODIAC_REFERENCE_YEAR) % 12) + 12) % 12;
  return BEAN_ORDER[index];
};

export const getFlavourIdForBeanYear = (beanYear: number): FlavourId => {
  const index =
    ((Math.floor((beanYear - BEAN_ZODIAC_REFERENCE_YEAR) / 2) % 5) + 5) % 5;
  return FLAVOUR_ORDER[index];
};

export const getFormIdForDate = (date: Date): FormId => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const shiftedMonth = (month - 3 + (day < 12 ? -1 : 0) + 12) % 12;
  return FORM_ORDER[Math.floor(shiftedMonth / 2)];
};

export const getZodiacMetadataForDate = (date: Date): ZodiacMetadata => {
  const beanYear = getBeanYear(date);
  const beanId = getBeanIdForBeanYear(beanYear);
  const flavourId = getFlavourIdForBeanYear(beanYear);
  const formId = getFormIdForDate(date);

  const startMonth = FORM_START_MONTH[formId];
  const year = date.getFullYear();
  const startYear = startMonth > date.getMonth() + 1 ? year - 1 : year;
  const endMonth = startMonth + 2;
  const startDate = new Date(startYear, startMonth - 1, 12);
  const endDate = new Date(
    endMonth > 12 ? startYear + 1 : startYear,
    (endMonth - 1) % 12,
    11,
  );

  return {
    zodiacId: `${flavourId}-${formId}-${beanId}`,
    beanId,
    flavourId,
    formId,
    rarityId: getRarityForDate(date),
    startDate,
    endDate,
  };
};

export const formatZodiacDate = (date: Date): string =>
  date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const buildZodiacData = (
  beans: Awaited<ReturnType<typeof getCollection<"beans">>>,
  flavours: Awaited<ReturnType<typeof getCollection<"flavours">>>,
  forms: Awaited<ReturnType<typeof getCollection<"forms">>>,
  zodiacs: Awaited<ReturnType<typeof getCollection<"zodiacs">>>,
): ZodiacData => {
  return {
    beans: Object.fromEntries(
      beans.map((entry) => [
        entry.id,
        { ...entry.data, content: entry.body ?? "" },
      ]),
    ) as Record<BeanId, Bean>,
    flavours: Object.fromEntries(
      flavours.map((entry) => [
        entry.id,
        { ...entry.data, content: entry.body ?? "" },
      ]),
    ) as Record<FlavourId, Flavour>,
    forms: Object.fromEntries(
      forms.map((entry) => [
        entry.id,
        { ...entry.data, content: entry.body ?? "" },
      ]),
    ) as Record<FormId, Form>,
    zodiacs: Object.fromEntries(
      zodiacs.map((entry) => [
        entry.id,
        { ...entry.data, content: entry.body ?? "" },
      ]),
    ) as Record<ZodiacId, Zodiac>,
  };
};
