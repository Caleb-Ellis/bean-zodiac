import { type ZodiacId } from "./zodiac";
import { type QualityId } from "./fortune";

const FORTUNE_HISTORY_KEY = "bean-zodiac-fortune-history";

export type FortuneEntry = {
  date: string;
  zodiacId: ZodiacId;
  qualityId: QualityId;
  text: string;
  score: number; // 0 = no vote, +1 = thumbs up, -1 = thumbs down
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

export const updateFortuneScore = (date: string, score: number): void => {
  if (typeof window === "undefined") return;
  const history = getFortuneHistory();
  const updated = history.map((e) => (e.date === date ? { ...e, score } : e));
  localStorage.setItem(FORTUNE_HISTORY_KEY, JSON.stringify(updated));
};

export const clearFortuneHistory = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FORTUNE_HISTORY_KEY);
};
