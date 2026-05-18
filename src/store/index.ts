import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QualityId, ZodiacId } from "../lib/zodiac";

export type FortuneEntry = {
  date: string;
  zodiacId: ZodiacId;
  qualityId: QualityId;
  facetText: string;
  score: number; // 0 = no vote, +1 = accepted, -1 = resisted
  text: string | null;
  seenAt: string | null; // ISO timestamp the user dismissed the fortune dialog
};

export type ClaimedBean = {
  id: ZodiacId;
  on: string; // YYYY-MM-DD
};

export type MetBean = {
  id: ZodiacId;
  on: string; // YYYY-MM-DD
};

type State = {
  claimed: ClaimedBean | null;
  fortuneHistory: FortuneEntry[];
  metBeans: MetBean[];
  radarExpanded: boolean;

  setClaimed: (id: ZodiacId | null) => void;
  addFortuneEntry: (
    entry: Omit<FortuneEntry, "seenAt"> & { seenAt?: string | null },
  ) => void;
  updateFortuneScore: (
    date: string,
    score: number,
    text?: string | null,
  ) => void;
  markFortuneSeen: (date: string) => void;
  addMetBean: (id: ZodiacId) => void;
  setRadarExpanded: (expanded: boolean) => void;
  relinquish: () => void;
};

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      claimed: null,
      fortuneHistory: [],
      metBeans: [],
      radarExpanded: true,

      setClaimed: (id) =>
        set({ claimed: id ? { id, on: todayLocal() } : null }),

      addFortuneEntry: (entry) => {
        const { fortuneHistory } = get();
        if (fortuneHistory.some((e) => e.date === entry.date)) return;
        set({
          fortuneHistory: [{ seenAt: null, ...entry }, ...fortuneHistory],
        });
      },

      updateFortuneScore: (date, score, text = null) =>
        set((s) => ({
          fortuneHistory: s.fortuneHistory.map((e) =>
            e.date === date ? { ...e, score, text } : e,
          ),
        })),

      markFortuneSeen: (date) =>
        set((s) => ({
          fortuneHistory: s.fortuneHistory.map((e) =>
            e.date === date && e.seenAt === null
              ? { ...e, seenAt: new Date().toISOString() }
              : e,
          ),
        })),

      addMetBean: (id) => {
        const { metBeans } = get();
        if (metBeans.some((m) => m.id === id)) return;
        set({ metBeans: [{ id, on: todayLocal() }, ...metBeans] });
      },

      setRadarExpanded: (expanded) => set({ radarExpanded: expanded }),

      relinquish: () =>
        set({
          claimed: null,
          fortuneHistory: [],
          metBeans: [],
        }),
    }),
    {
      name: "bean-zodiac",
      version: 2,
      migrate: (state: any, version: number) => {
        if (version < 2) {
          state.fortuneHistory = (state.fortuneHistory ?? []).map((e: any) => ({
            ...e,
            facetText: "",
            text: e.text,
          }));
        }
        return state;
      },
      partialize: (s) => ({
        claimed: s.claimed,
        fortuneHistory: s.fortuneHistory,
        metBeans: s.metBeans,
        radarExpanded: s.radarExpanded,
      }),
    },
  ),
);
