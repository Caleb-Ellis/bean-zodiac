import { type ZodiacId } from "./zodiac";

export const MET_BEANS_KEY = "bean-zodiac-met-beans";

export const getMetBeans = (): ZodiacId[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MET_BEANS_KEY);
    return raw ? (JSON.parse(raw) as ZodiacId[]) : [];
  } catch {
    return [];
  }
};

export const addMetBean = (zodiacId: ZodiacId): void => {
  if (typeof window === "undefined") return;
  const current = getMetBeans();
  if (current.includes(zodiacId)) return;
  localStorage.setItem(MET_BEANS_KEY, JSON.stringify([zodiacId, ...current]));
};

export const clearMetBeans = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MET_BEANS_KEY);
};
