/**
 * Bean Zodiac calculation utilities.
 *
 * The bean year switches on March 12 each calendar year.
 * A full cycle is 60 years (LCM of 12 beans × 5 elements).
 *
 * Reference point: Bean year 2024 = Black Bean + Wood.
 */

export const BEAN_ORDER = [
  "black-bean",
  "garbanzo",
  "butter-bean",
  "kidney-bean",
  "pinto-bean",
  "navy-bean",
  "lentil",
  "edamame",
  "cannellini",
  "adzuki",
  "mung-bean",
  "fava-bean",
] as const;

export const ELEMENT_ORDER = [
  "bitter",
  "spicy",
  "umami",
  "sour",
  "sweet",
] as const;

export type BeanSlug = (typeof BEAN_ORDER)[number];
export type ElementSlug = (typeof ELEMENT_ORDER)[number];

/** The calendar year that serves as the cycle reference (index 0 for both arrays). */
const REFERENCE_YEAR = 1988;

/**
 * Returns the bean year for a given date.
 * Before March 12: uses the previous calendar year.
 * On/after March 12: uses the current calendar year.
 */
export function getBeanYear(date: Date = new Date()): number {
  const month = date.getMonth() + 1; // 1-indexed
  const day = date.getDate();
  const year = date.getFullYear();
  if (month < 3 || (month === 3 && day < 12)) {
    return year - 1;
  }
  return year;
}

export function getBeanSlug(beanYear: number): BeanSlug {
  const index = (((beanYear - REFERENCE_YEAR) % 12) + 12) % 12;
  return BEAN_ORDER[index];
}

export function getElementSlug(beanYear: number): ElementSlug {
  const index = ((Math.floor((beanYear - REFERENCE_YEAR) / 2) % 5) + 5) % 5;
  return ELEMENT_ORDER[index];
}

export function getZodiacForYear(beanYear: number) {
  return {
    beanYear,
    bean: getBeanSlug(beanYear),
    element: getElementSlug(beanYear),
    startDate: `March 12, ${beanYear}`,
    endDate: `March 11, ${beanYear + 1}`,
  };
}

export function getCurrentZodiac(date: Date = new Date()) {
  return getZodiacForYear(getBeanYear(date));
}
