import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QualityId, ZodiacId } from "../lib/zodiac";

export type FortuneEntry = {
  date: string;
  zodiacId: ZodiacId;
  qualityId: QualityId;
  text: string;
  score: number; // 0 = no vote, +1 = accepted, -1 = resisted
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
  addFortuneEntry: (entry: Omit<FortuneEntry, "seenAt"> & { seenAt?: string | null }) => void;
  updateFortuneScore: (date: string, score: number) => void;
  markFortuneSeen: (date: string) => void;
  addMetBean: (id: ZodiacId) => void;
  setRadarExpanded: (expanded: boolean) => void;
  relinquish: () => void;
};

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const LEGACY_KEYS = {
  claimed: "bean-zodiac-claimed",
  history: "bean-zodiac-fortune-history",
  seen: "bean-zodiac-fortune-seen",
  met: "bean-zodiac-met-beans",
  radarExpanded: "bean-zodiac-radar-expanded",
} as const;

function migrateLegacyStorage() {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem("bean-zodiac")) return;

  const claimedRaw = localStorage.getItem(LEGACY_KEYS.claimed);
  const historyRaw = localStorage.getItem(LEGACY_KEYS.history);
  const seenRaw = localStorage.getItem(LEGACY_KEYS.seen);
  const metRaw = localStorage.getItem(LEGACY_KEYS.met);
  const radarRaw = localStorage.getItem(LEGACY_KEYS.radarExpanded);

  if (!claimedRaw && !historyRaw && !seenRaw && !metRaw && radarRaw === null) return;

  try {
    const today = todayLocal();

    type LegacyEntry = {
      date: string;
      zodiacId: ZodiacId;
      qualityId: QualityId;
      text: string;
      score?: number;
    };
    const legacyHistory: LegacyEntry[] = historyRaw ? JSON.parse(historyRaw) : [];
    const legacyMet: ZodiacId[] = metRaw ? JSON.parse(metRaw) : [];

    const fortuneHistory: FortuneEntry[] = legacyHistory.map((e) => ({
      date: e.date,
      zodiacId: e.zodiacId,
      qualityId: e.qualityId,
      text: e.text,
      score: e.score ?? 0,
      seenAt:
        seenRaw && e.date <= seenRaw ? new Date(`${e.date}T00:00:00.000Z`).toISOString() : null,
    }));

    const dateById = new Map<ZodiacId, string>();
    for (const e of legacyHistory) if (!dateById.has(e.zodiacId)) dateById.set(e.zodiacId, e.date);

    const metBeans: MetBean[] = legacyMet.map((id) => ({ id, on: dateById.get(id) ?? today }));

    const claimed: ClaimedBean | null = claimedRaw ? { id: claimedRaw as ZodiacId, on: today } : null;

    const radarExpanded = radarRaw === null ? true : radarRaw !== "false";

    const persisted = {
      state: { claimed, fortuneHistory, metBeans, radarExpanded },
      version: 1,
    };
    localStorage.setItem("bean-zodiac", JSON.stringify(persisted));

    localStorage.removeItem(LEGACY_KEYS.claimed);
    localStorage.removeItem(LEGACY_KEYS.history);
    localStorage.removeItem(LEGACY_KEYS.seen);
    localStorage.removeItem(LEGACY_KEYS.met);
    localStorage.removeItem(LEGACY_KEYS.radarExpanded);
  } catch (err) {
    console.warn("[bean-zodiac] legacy migration failed", err);
  }
}

migrateLegacyStorage();

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      claimed: null,
      fortuneHistory: [],
      metBeans: [],
      radarExpanded: true,

      setClaimed: (id) => set({ claimed: id ? { id, on: todayLocal() } : null }),

      addFortuneEntry: (entry) => {
        const { fortuneHistory } = get();
        if (fortuneHistory.some((e) => e.date === entry.date)) return;
        set({
          fortuneHistory: [{ seenAt: null, ...entry }, ...fortuneHistory],
        });
      },

      updateFortuneScore: (date, score) =>
        set((s) => ({
          fortuneHistory: s.fortuneHistory.map((e) => (e.date === date ? { ...e, score } : e)),
        })),

      markFortuneSeen: (date) =>
        set((s) => ({
          fortuneHistory: s.fortuneHistory.map((e) =>
            e.date === date && e.seenAt === null ? { ...e, seenAt: new Date().toISOString() } : e,
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
      version: 1,
      partialize: (s) => ({
        claimed: s.claimed,
        fortuneHistory: s.fortuneHistory,
        metBeans: s.metBeans,
        radarExpanded: s.radarExpanded,
      }),
    },
  ),
);
