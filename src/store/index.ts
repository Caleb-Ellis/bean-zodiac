import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QualityId, SpiritTags, ZodiacId } from "../lib/zodiac";
import type { RitualVariant } from "../lib/fortune";
import type { SeasonSummary } from "../lib/seasonSummary";

export type FortuneEntry = {
  date: string;
  zodiacId: ZodiacId;
  qualityId: QualityId;
  facetTitle: string;
  facetText: string;
  spiritTags?: SpiritTags | null; // snapshot of the zodiac's spirit tags; legacy entries omit it
  score: number; // 0 = no vote, +1 = accepted, -1 = resisted
  text: string | null;
  seenAt: string | null; // ISO timestamp the user dismissed the fortune dialog
  variant?: RitualVariant; // undefined ↔ legacy facet entry
  question?: string | null; // snapshot, question variant only
  answeredQuality?: QualityId | null; // tier the user picked, question/rorschach variants
  answerText?: string | null; // snapshot, question variant only
  rorschachImage?: string | null; // /images/rorschach/{slug}.png, rorschach variant only
  rorschachText?: string | null; // chosen interpretation, rorschach variant only
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
  lastSeasonSeen: string | null; // season key (startDate YYYY-MM-DD) last acknowledged
  seasonSummaries: SeasonSummary[]; // persisted season recaps, newest first

  setClaimed: (id: ZodiacId | null) => void;
  addFortuneEntry: (
    entry: Omit<FortuneEntry, "seenAt"> & { seenAt?: string | null },
  ) => void;
  updateFortuneEntry: (date: string, patch: Partial<FortuneEntry>) => void;
  markFortuneSeen: (date: string) => void;
  addMetBean: (id: ZodiacId) => void;
  setRadarExpanded: (expanded: boolean) => void;
  setLastSeasonSeen: (key: string) => void;
  addSeasonSummary: (summary: SeasonSummary) => void;
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
      lastSeasonSeen: null,
      seasonSummaries: [],

      setClaimed: (id) =>
        set({ claimed: id ? { id, on: todayLocal() } : null }),

      addFortuneEntry: (entry) => {
        const { fortuneHistory } = get();
        if (fortuneHistory.some((e) => e.date === entry.date)) return;
        set({
          fortuneHistory: [{ seenAt: null, ...entry }, ...fortuneHistory],
        });
      },

      updateFortuneEntry: (date, patch) =>
        set((s) => ({
          fortuneHistory: s.fortuneHistory.map((e) =>
            e.date === date ? { ...e, ...patch } : e,
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

      setLastSeasonSeen: (key) => set({ lastSeasonSeen: key }),

      addSeasonSummary: (summary) => {
        const { seasonSummaries } = get();
        if (seasonSummaries.some((s) => s.seasonKey === summary.seasonKey))
          return;
        set({ seasonSummaries: [summary, ...seasonSummaries] });
      },

      relinquish: () =>
        set({
          claimed: null,
          fortuneHistory: [],
          metBeans: [],
          lastSeasonSeen: null,
          seasonSummaries: [],
        }),
    }),
    {
      name: "bean-zodiac",
      version: 6,
      migrate: (state: any, version: number) => {
        if (version < 2) {
          state.fortuneHistory = (state.fortuneHistory ?? []).map((e: any) => ({
            ...e,
            facetText: "",
            text: e.text,
          }));
        }
        if (version < 3) {
          state.fortuneHistory = (state.fortuneHistory ?? []).map((e: any) => ({
            ...e,
            facetText: e.facetText || "",
            facetTitle: e.facetTitle || "",
            text: e.text || "",
          }));
        }
        if (version < 4) {
          // Spirit tags moved from per-tier bean lists (facetTags) to a
          // per-zodiac friendly/anti snapshot. Old entries can't be rebuilt
          // (the old tags don't carry the new structure), so drop them — those
          // entries simply forgo the soft pass on replay.
          state.fortuneHistory = (state.fortuneHistory ?? []).map((e: any) => {
            const { facetTags: _drop, ...rest } = e;
            return rest;
          });
        }
        if (version < 5) {
          // Rorschach masks moved from live-filter SVGs to high-res baked PNGs
          // (the SVG filter collapsed to a blob at mobile mask sizes). Rewrite
          // the extension on persisted snapshots so old entries don't 404.
          state.fortuneHistory = (state.fortuneHistory ?? []).map((e: any) =>
            typeof e.rorschachImage === "string"
              ? { ...e, rorschachImage: e.rorschachImage.replace(/\.svg$/, ".png") }
              : e,
          );
        }
        if (version < 6) {
          // Season summaries are new. Leave lastSeasonSeen null so an
          // already-engaged user gets one recap on their next post-tick visit;
          // seed it to the current season key here instead to suppress that
          // retroactive first summary.
          state.lastSeasonSeen = state.lastSeasonSeen ?? null;
          state.seasonSummaries = state.seasonSummaries ?? [];
        }
        return state;
      },
      partialize: (s) => ({
        claimed: s.claimed,
        fortuneHistory: s.fortuneHistory,
        metBeans: s.metBeans,
        radarExpanded: s.radarExpanded,
        lastSeasonSeen: s.lastSeasonSeen,
        seasonSummaries: s.seasonSummaries,
      }),
    },
  ),
);
