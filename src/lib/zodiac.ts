/**
 * Bean Zodiac calculation utilities.
 *
 * The Bean Year switches on 12th March each calendar year.
 * A full cycle is 60 years (12 beans x 5 elements).
 *
 * Reference Bean Zodiac: 12th March 1993 = Fried Umami Edamame
 */

import type { getCollection } from "astro:content";
import type { BeanSchema, FlavourSchema, FormSchema, ZodiacSchema } from "../schemas";

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
  Spicy: "spicy",
  Sweet: "sweet",
  Sour: "sour",
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
  [FlavourIds.Sweet]: "🍭",
  [FlavourIds.Sour]: "🍋",
  [FlavourIds.Spicy]: "🌶️",
  [FlavourIds.Bitter]: "☕",
  [FlavourIds.Umami]: "🍄",
} as const;

export const FormIds = {
  Boiled: "boiled",
  Fermented: "fermented",
  Fried: "fried",
  Roasted: "roasted",
} as const;
export const FORM_ORDER = [
  FormIds.Fried,
  FormIds.Roasted,
  FormIds.Boiled,
  FormIds.Fermented,
] as const;
// Start month (1-indexed) for each form, matching FORM_ORDER
export const FORM_START_MONTH: Record<FormId, number> = {
  [FormIds.Fried]: 3,
  [FormIds.Roasted]: 6,
  [FormIds.Boiled]: 9,
  [FormIds.Fermented]: 12,
} as const;

export const FORM_EMOJI: Record<FormId, string> = {
  [FormIds.Fried]: "🔥",
  [FormIds.Roasted]: "💨",
  [FormIds.Boiled]: "💧",
  [FormIds.Fermented]: "🌍",
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
  const index = ((Math.floor((beanYear - BEAN_ZODIAC_REFERENCE_YEAR) / 2) % 5) + 5) % 5;
  return FLAVOUR_ORDER[index];
};

export const getFormIdForDate = (date: Date): FormId => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // Shift so Mar 12 = 0, then quarter into FORM_ORDER
  const shiftedMonth = (month - 3 + (day < 12 ? -1 : 0) + 12) % 12;
  return FORM_ORDER[Math.floor(shiftedMonth / 3)];
};

export const getZodiacMetadataForDate = (date: Date): ZodiacMetadata => {
  const beanYear = getBeanYear(date);
  const beanId = getBeanIdForBeanYear(beanYear);
  const flavourId = getFlavourIdForBeanYear(beanYear);
  const formId = getFormIdForDate(date);

  const startMonth = FORM_START_MONTH[formId];
  const year = date.getFullYear();
  // Fermented starts in Dec and may wrap into the next year, so if the
  // start month is after the current month the period began last year.
  const startYear = startMonth > date.getMonth() + 1 ? year - 1 : year;
  const endMonth = startMonth + 3;
  const startDate = new Date(startYear, startMonth - 1, 12);
  const endDate = new Date(endMonth > 12 ? startYear + 1 : startYear, (endMonth - 1) % 12, 11);

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
      beans.map((entry) => [entry.id, { ...entry.data, content: entry.body ?? "" }]),
    ) as Record<BeanId, Bean>,
    flavours: Object.fromEntries(
      flavours.map((entry) => [entry.id, { ...entry.data, content: entry.body ?? "" }]),
    ) as Record<FlavourId, Flavour>,
    forms: Object.fromEntries(
      forms.map((entry) => [entry.id, { ...entry.data, content: entry.body ?? "" }]),
    ) as Record<FormId, Form>,
    zodiacs: Object.fromEntries(
      zodiacs.map((entry) => [entry.id, { ...entry.data, content: entry.body ?? "" }]),
    ) as Record<ZodiacId, Zodiac>,
  };
};
