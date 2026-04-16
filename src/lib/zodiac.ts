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
  "bitter-roasted": "Dark Roasted",
  "bitter-smoked": "Ashen",
  "sour-boiled": "Brined",
  "sour-dried": "Dehydrated",
  "sour-fermented": "Pickled",
  "sour-fried": "Brightened",
  "sour-roasted": "Charred",
  "sour-smoked": "Cold-Smoked",
  "spicy-boiled": "Braised",
  "spicy-dried": "Chili-Cured",
  "spicy-fermented": "Kimchi",
  "spicy-fried": "Chili-Crisped",
  "spicy-roasted": "Blackened",
  "spicy-smoked": "Chipotle",
  "sweet-boiled": "Candied",
  "sweet-dried": "Crystallized",
  "sweet-fermented": "Honeyed",
  "sweet-fried": "Caramelized",
  "sweet-roasted": "Glazed",
  "sweet-smoked": "Barbecued",
  "umami-boiled": "Reduced",
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
export type ZodiacMetadata = {
  zodiacId: ZodiacId;
  beanId: BeanId;
  flavourId: FlavourId;
  formId: FormId;
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
