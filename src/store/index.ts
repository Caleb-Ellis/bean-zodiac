import { create } from "zustand";
import { persist } from "zustand/middleware";
import { QualityIds, type QualityId, type ZodiacId } from "../lib/zodiac";
import type { RitualVariant } from "../lib/fortune";
import type { SeasonSummary } from "../lib/seasonSummary";
import { useUiStore } from "./ui";

/** localStorage key for the persisted bean data. Also used by lib/backup. */
export const STORE_NAME = "bean-zodiac";

export const STORE_VERSION = 7;

/**
 * A day's ritual, stored in one shape for all three ritual types rather than a
 * set of per-type keys. What the ritual put to the user goes in `ritualPrompt`,
 * what they gave back in `ritualResponse`:
 *
 * | ritualType | ritualTitle | ritualPrompt  | ritualResponse       |
 * | ---------- | ----------- | ------------- | -------------------- |
 * | facet      | facet title | the facet     | — (the score is it)  |
 * | question   | —           | the question  | the chosen answer    |
 * | rorschach  | —           | — (the blot)  | the chosen reading   |
 *
 * The blot itself needs no field: it is `/images/rorschach/{zodiacId}.png`.
 */
export type FortuneEntry = {
  date: string;
  zodiacId: ZodiacId;
  // The tier the ritual resolved to: the rolled one for facet entries, the one
  // the user picked for question/rorschach entries.
  qualityId: QualityId;
  ritualType: RitualVariant;
  ritualTitle: string | null; // facet only, for now
  ritualPrompt: string | null;
  ritualResponse: string | null;
  score: number; // 0 = no vote, +1 = accepted, -1 = resisted
  fortuneText: string | null;
};

export type ClaimedBean = {
  id: ZodiacId;
  on: string; // YYYY-MM-DD
};

/**
 * Which zodiacs the user has encountered, and at which tiers. A bean met by any
 * means other than a scored fortune (claimed, seasonal, browsed on the wheel,
 * the spirit bean) records the neutral Garden tier; a fortune records the tier
 * it resolved to, so the tiers accumulate as the user keeps meeting a bean.
 */
export type MetBeans = Partial<Record<ZodiacId, Partial<Record<QualityId, true>>>>;

type PersistedState = {
  claimed: ClaimedBean | null;
  fortuneHistory: FortuneEntry[];
  metBeans: MetBeans;
  lastSeasonSeen: string | null; // season key (startDate YYYY-MM-DD) last acknowledged
  seasonSummaries: SeasonSummary[]; // persisted season recaps, newest first
};

type State = PersistedState & {
  setClaimed: (id: ZodiacId | null) => void;
  addFortuneEntry: (entry: FortuneEntry) => void;
  updateFortuneEntry: (date: string, patch: Partial<FortuneEntry>) => void;
  addMetBean: (id: ZodiacId, qualityId?: QualityId) => void;
  setLastSeasonSeen: (key: string) => void;
  addSeasonSummary: (summary: SeasonSummary) => void;
  relinquish: () => void;
};

const INITIAL_STATE: PersistedState = {
  claimed: null,
  fortuneHistory: [],
  metBeans: {},
  lastSeasonSeen: null,
  seasonSummaries: [],
};

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setClaimed: (id) =>
        set({ claimed: id ? { id, on: todayLocal() } : null }),

      addFortuneEntry: (entry) => {
        const { fortuneHistory } = get();
        if (fortuneHistory.some((e) => e.date === entry.date)) return;
        set({ fortuneHistory: [entry, ...fortuneHistory] });
      },

      updateFortuneEntry: (date, patch) =>
        set((s) => ({
          fortuneHistory: s.fortuneHistory.map((e) =>
            e.date === date ? { ...e, ...patch } : e,
          ),
        })),

      addMetBean: (id, qualityId = QualityIds.Garden) => {
        const { metBeans } = get();
        if (metBeans[id]?.[qualityId]) return;
        set({
          metBeans: { ...metBeans, [id]: { ...metBeans[id], [qualityId]: true } },
        });
      },

      setLastSeasonSeen: (key) => set({ lastSeasonSeen: key }),

      addSeasonSummary: (summary) => {
        const { seasonSummaries } = get();
        if (seasonSummaries.some((s) => s.seasonKey === summary.seasonKey))
          return;
        set({ seasonSummaries: [summary, ...seasonSummaries] });
      },

      relinquish: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: STORE_NAME,
      version: STORE_VERSION,
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
        if (version < 6) {
          // Season summaries are new. Leave lastSeasonSeen null so an
          // already-engaged user gets one recap on their next post-tick visit;
          // seed it to the current season key here instead to suppress that
          // retroactive first summary.
          state.lastSeasonSeen = state.lastSeasonSeen ?? null;
          state.seasonSummaries = state.seasonSummaries ?? [];
        }
        if (version < 7) {
          // Entries are rebuilt into one shape for all three ritual types,
          // replacing the per-type keys (facetTitle/facetText/question/
          // answerText/rorschachText/text). Rebuilding rather than patching also
          // drops everything that was snapshotted but never read (spiritTags,
          // seenAt, and the facet copy that question/rorschach entries carried
          // for their rolled tier) or that merely restates another field
          // (rorschachImage, answeredQuality) — all now derived at the read
          // sites. It subsumes the old v4 (drop facetTags) and v5 (.svg → .png)
          // rewrites too, since both only touched keys this discards.
          state.fortuneHistory = (state.fortuneHistory ?? []).map((e: any) => {
            const ritualType = e.variant ?? "facet";
            const isFacet = ritualType === "facet";
            return {
              date: e.date,
              zodiacId: e.zodiacId,
              qualityId: e.qualityId,
              ritualType,
              ritualTitle: isFacet ? (e.facetTitle ?? null) : null,
              ritualPrompt: isFacet
                ? (e.facetText ?? null)
                : ritualType === "question"
                  ? (e.question ?? null)
                  : null,
              ritualResponse:
                ritualType === "question"
                  ? (e.answerText ?? null)
                  : ritualType === "rorschach"
                    ? (e.rorschachText ?? null)
                    : null,
              score: e.score ?? 0,
              fortuneText: e.text ?? null,
            };
          });

          // Summaries keep only the season key; the closing/incoming bean ids
          // fall out of the calendar (seasonZodiacsForKey).
          state.seasonSummaries = (state.seasonSummaries ?? []).map(
            (s: any) => ({
              seasonKey: s.seasonKey,
              observations: s.observations ?? [],
            }),
          );

          // metBeans went from a flat `{id, on}[]` to id → tier → true. The old
          // list recorded no tier, so every entry in it becomes a plain Garden
          // encounter; fortuneHistory then supplies the tiers actually drawn.
          // The `on` dates are dropped — nothing ever read them.
          const met: Record<string, Record<string, true>> = {};
          const mark = (id: string, qualityId: string) => {
            met[id] = { ...met[id], [qualityId]: true };
          };
          for (const m of state.metBeans ?? []) {
            if (m?.id) mark(m.id, QualityIds.Garden);
          }
          // Parity with the old BeaniaryPage backfill, which seeded the list
          // from history + the claimed bean whenever metBeans was empty.
          if (state.claimed?.id) mark(state.claimed.id, QualityIds.Garden);
          for (const e of state.fortuneHistory) {
            if (e.zodiacId && e.qualityId) mark(e.zodiacId, e.qualityId);
          }
          state.metBeans = met;

          // radarExpanded is a UI preference, not bean data — it now lives in
          // its own key so exports carry only the latter. Set it through the UI
          // store rather than writing that key directly: useUiStore has already
          // hydrated (it is imported above) and would otherwise keep its default.
          if (typeof state.radarExpanded === "boolean") {
            useUiStore.getState().setRadarExpanded(state.radarExpanded);
          }
          delete state.radarExpanded;
        }
        return state;
      },
      partialize: (s) => ({
        claimed: s.claimed,
        fortuneHistory: s.fortuneHistory,
        metBeans: s.metBeans,
        lastSeasonSeen: s.lastSeasonSeen,
        seasonSummaries: s.seasonSummaries,
      }),
    },
  ),
);
