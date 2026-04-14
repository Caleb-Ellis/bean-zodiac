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
  FormIds.Boiled,
  FormIds.Fermented,
  FormIds.Roasted,
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
  const index = (beanYear - BEAN_ZODIAC_REFERENCE_YEAR) % BEAN_ORDER.length;
  return BEAN_ORDER[index];
};

export const getFlavourIdForBeanYear = (beanYear: number): FlavourId => {
  const index =
    Math.floor((beanYear - BEAN_ZODIAC_REFERENCE_YEAR) / 2) %
    FLAVOUR_ORDER.length;
  return FLAVOUR_ORDER[index];
};

export const getFormIdForDate = (date: Date): FormId => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const onOrAfter = (startMonth: number) =>
    month > startMonth || (month === startMonth && day >= 12);

  if (onOrAfter(FORM_START_MONTH[FormIds.Smoked])) return FormIds.Smoked; // Nov 12 – Jan 11
  if (onOrAfter(FORM_START_MONTH[FormIds.Roasted])) return FormIds.Roasted; // Sep 12 – Nov 11
  if (onOrAfter(FORM_START_MONTH[FormIds.Fermented])) return FormIds.Fermented; // Jul 12 – Sep 11
  if (onOrAfter(FORM_START_MONTH[FormIds.Boiled])) return FormIds.Boiled; // May 12 – Jul 11
  if (onOrAfter(FORM_START_MONTH[FormIds.Fried])) return FormIds.Fried; // Mar 12 – May 11
  if (onOrAfter(FORM_START_MONTH[FormIds.Dried])) return FormIds.Dried; // Jan 12 – Mar 11
  return FormIds.Smoked; // Jan 1–11: wraps to previous Smoked period
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
