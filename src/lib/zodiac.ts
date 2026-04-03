/**
 * Bean Zodiac calculation utilities.
 *
 * The bean year switches on March 12 each calendar year.
 * A full cycle is 60 years (LCM of 12 beans × 5 elements).
 *
 * Reference Bean Zodiac = 2026, Sweet Butter Bean
 */

export const BEAN_ORDER = [
  "butter",
  "kidney",
  "pinto",
  "green",
  "cannellini",
  "navy",
  "adzuki",
  "chickpea",
  "mung",
  "fava",
  "edamame",
  "black",
] as const;

export const FLAVOUR_ORDER = [
  "sweet",
  "umami",
  "spicy",
  "bitter",
  "sour",
] as const;

export type BeanSlug = (typeof BEAN_ORDER)[number];
export type FlavourSlug = (typeof FLAVOUR_ORDER)[number];
export type ZodiacSlug = `${BeanSlug}-${FlavourSlug}`;

export type BeanZodiac = {
  beanYear: number;
  beanSlug: BeanSlug;
  flavourSlug: FlavourSlug;
  slug: ZodiacSlug;
  startDate: string;
  endDate: string;
};

/** The calendar year that serves as the cycle reference (index 0 for both arrays = butter + sweet). */
const REFERENCE_YEAR = 2026;

/**
 * Returns the bean year for a given date.
 * Before March 12: uses the previous calendar year.
 * On/after March 12: uses the current calendar year.
 */
export function getBeanYear(date: Date): number {
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

export function getFlavourSlug(beanYear: number): FlavourSlug {
  const index = ((Math.floor((beanYear - REFERENCE_YEAR) / 2) % 5) + 5) % 5;
  return FLAVOUR_ORDER[index];
}

export function getBeanZodiacForYear(beanYear: number): BeanZodiac {
  const beanSlug = getBeanSlug(beanYear);
  const flavourSlug = getFlavourSlug(beanYear);

  return {
    beanYear,
    beanSlug,
    flavourSlug,
    slug: `${beanSlug}-${flavourSlug}`,
    startDate: `March 12, ${beanYear}`,
    endDate: `March 11, ${beanYear + 1}`,
  };
}

export function getCurrentBeanZodiac() {
  const currentBeanYear = getBeanYear(new Date());
  return getBeanZodiacForYear(currentBeanYear);
}
