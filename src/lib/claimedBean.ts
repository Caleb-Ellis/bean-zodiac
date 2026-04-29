import { isValidZodiacId, type ZodiacId } from "./zodiac";

const CLAIMED_BEAN_KEY = "bean-zodiac-claimed";

export const getClaimedBeanSlug = (): ZodiacId | null => {
  if (typeof window === "undefined") return null;
  const slug = localStorage.getItem(CLAIMED_BEAN_KEY);
  if (!slug) return null;
  if (!isValidZodiacId(slug)) {
    localStorage.removeItem(CLAIMED_BEAN_KEY);
    return null;
  }
  return slug;
};

export const setClaimedBeanSlug = (slug: ZodiacId): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLAIMED_BEAN_KEY, slug);
};

export const clearClaimedBeanSlug = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLAIMED_BEAN_KEY);
};
