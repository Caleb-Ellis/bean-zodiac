/**
 * Bean Zodiac calendar math.
 *
 * The Bean Year switches on 12th March each calendar year.
 * A full cycle is 60 years.
 *
 * Reference Bean Zodiac: 12th March 1993 = Fried Umami Edamame
 */

import { BEAN_ORDER, FLAVOUR_ORDER, FORM_ORDER } from "./constants";
import { FormIds, type BeanId, type FlavourId, type FormId, type ZodiacMetadata } from "./types";

export const BEAN_ZODIAC_REFERENCE_YEAR = 1993;
export const BEAN_ZODIAC_REFERENCE_MONTH = 3;
export const BEAN_ZODIAC_REFERENCE_DAY = 12;

// Start month (1-indexed) for each form, matching FORM_ORDER
const FORM_START_MONTH: Record<FormId, number> = {
  [FormIds.Fried]: 3,
  [FormIds.Roasted]: 5,
  [FormIds.Fermented]: 7,
  [FormIds.Boiled]: 9,
  [FormIds.Smoked]: 11,
  [FormIds.Dried]: 1,
} as const;

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

const getBeanIdForBeanYear = (beanYear: number): BeanId => {
  const index = (((beanYear - BEAN_ZODIAC_REFERENCE_YEAR) % 12) + 12) % 12;
  return BEAN_ORDER[index];
};

const getFlavourIdForBeanYear = (beanYear: number): FlavourId => {
  const index = ((Math.floor((beanYear - BEAN_ZODIAC_REFERENCE_YEAR) / 2) % 5) + 5) % 5;
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
    23,
    59,
    59,
    999,
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
