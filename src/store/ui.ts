import { create } from "zustand";
import { persist } from "zustand/middleware";

/** localStorage key for UI preferences, kept out of the exportable bean data. */
export const UI_STORE_NAME = "bean-zodiac-ui";

export type RadarTab = "flavour" | "form" | "bean";

type UiState = {
  radarExpanded: boolean;
  setRadarExpanded: (expanded: boolean) => void;
  radarTab: RadarTab;
  setRadarTab: (tab: RadarTab) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      radarExpanded: true,
      setRadarExpanded: (expanded) => set({ radarExpanded: expanded }),
      radarTab: "bean",
      setRadarTab: (tab) => set({ radarTab: tab }),
    }),
    { name: UI_STORE_NAME },
  ),
);
