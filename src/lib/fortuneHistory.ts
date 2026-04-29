import { type ZodiacId } from "./zodiac";
import { type QualityId } from "./fortune";

const FORTUNE_HISTORY_KEY = "bean-zodiac-fortune-history";

export type FortuneEntry = {
  date: string;
  zodiacId: ZodiacId;
  qualityId: QualityId;
  text: string;
};

export const getFortuneHistory = (): FortuneEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FORTUNE_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as FortuneEntry[]) : [];
  } catch {
    return [];
  }
};

export const addFortuneToHistory = (entry: FortuneEntry): void => {
  if (typeof window === "undefined") return;
  const history = getFortuneHistory();
  if (history.some((e) => e.date === entry.date)) return;
  localStorage.setItem(FORTUNE_HISTORY_KEY, JSON.stringify([entry, ...history]));
};

export const clearFortuneHistory = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FORTUNE_HISTORY_KEY);
};
