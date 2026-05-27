import {
  type BeanId,
  type FlavourId,
  type FormId,
  type QualityId,
  type ZodiacId,
} from "./zodiac";
import type { RitualVariant } from "./fortune";
import { useStore } from "../store";

// Spirit rings are radar-chart neighbour orderings, distinct from the calendar
// orderings (FLAVOUR_ORDER, FORM_ORDER, BEAN_ORDER) in lib/zodiac. Adjacency
// here drives the +/- neighbour adjustments in applyRingAdjustment, so changing
// these arrays will shift which attributes influence each other on the chart.
export const SPIRIT_FLAVOUR_RING: FlavourId[] = [
  "bitter",
  "sour",
  "spicy",
  "sweet",
  "umami",
];

export const SPIRIT_FORM_RING: FormId[] = [
  "boiled",
  "dried",
  "fermented",
  "smoked",
  "roasted",
  "fried",
];

export const SPIRIT_BEAN_RING: BeanId[] = [
  "green",
  "fava",
  "kidney",
  "pinto",
  "adzuki",
  "chickpea",
  "mung",
  "butter",
  "navy",
  "cannellini",
  "edamame",
  "black",
];

interface RingAdjustment {
  chosen: number;
  neighbours: number;
}

const ACCEPTED_ADJ: Record<QualityId, RingAdjustment> = {
  heirloom: { chosen: +6, neighbours: +2 },
  market: { chosen: +4, neighbours: +1 },
  garden: { chosen: +2, neighbours: 0 },
  stale: { chosen: -1, neighbours: 0 },
  rotten: { chosen: -2, neighbours: -1 },
};

const RESISTED_ADJ: Record<QualityId, RingAdjustment> = {
  heirloom: { chosen: -2, neighbours: -1 },
  market: { chosen: -2, neighbours: 0 },
  garden: { chosen: -1, neighbours: 0 },
  stale: { chosen: +2, neighbours: 0 },
  rotten: { chosen: +3, neighbours: +1 },
};

export function getRingAdjustment(
  rawScore: number,
  qualityId: QualityId,
): RingAdjustment {
  return rawScore > 0 ? ACCEPTED_ADJ[qualityId] : RESISTED_ADJ[qualityId];
}

function applyRingAdjustment<T extends string>(
  ring: readonly T[],
  scores: Record<string, number>,
  id: T,
  adj: RingAdjustment,
): void {
  const i = ring.indexOf(id);
  const n = ring.length;
  scores[id] += adj.chosen;
  if (adj.neighbours !== 0) {
    scores[ring[(i - 1 + n) % n]] += adj.neighbours;
    scores[ring[(i + 1) % n]] += adj.neighbours;
  }
}

export const SPIRIT_DIFF_THRESHOLD = 10;

export interface SpiritBeanScores {
  flavourValues: number[];
  formValues: number[];
  beanValues: number[];
  flavourHighlight: number;
  formHighlight: number;
  beanHighlight: number;
  claimedFlavourIdx: number;
  claimedFormIdx: number;
  claimedBeanIdx: number;
}

export function computeSpiritBeanScores(
  claimedSlug: ZodiacId,
  cutoffDateStr?: string,
): SpiritBeanScores {
  const [claimedFlavourId, claimedFormId, claimedBeanId] = claimedSlug.split(
    "-",
  ) as [FlavourId, FormId, BeanId];

  const flavourScores = Object.fromEntries(
    SPIRIT_FLAVOUR_RING.map((id) => [id, 10]),
  );
  const formScores = Object.fromEntries(SPIRIT_FORM_RING.map((id) => [id, 10]));
  const beanScores = Object.fromEntries(SPIRIT_BEAN_RING.map((id) => [id, 10]));

  flavourScores[claimedFlavourId] += 10;
  formScores[claimedFormId] += 10;
  beanScores[claimedBeanId] += 10;

  const history = cutoffDateStr
    ? useStore.getState().fortuneHistory.filter((e) => e.date <= cutoffDateStr)
    : useStore.getState().fortuneHistory;
  for (const entry of history) {
    const s = entry.score ?? 0;
    if (s === 0) continue;
    const [f, frm, b] = entry.zodiacId.split("-") as [
      FlavourId,
      FormId,
      BeanId,
    ];
    const adj = getRingAdjustment(s, entry.qualityId);
    applyRingAdjustment(SPIRIT_FLAVOUR_RING, flavourScores, f, adj);
    applyRingAdjustment(SPIRIT_FORM_RING, formScores, frm, adj);
    applyRingAdjustment(SPIRIT_BEAN_RING, beanScores, b, adj);
  }

  const flavourValues = SPIRIT_FLAVOUR_RING.map((id) =>
    Math.max(0, flavourScores[id]),
  );
  const formValues = SPIRIT_FORM_RING.map((id) => Math.max(0, formScores[id]));
  const beanValues = SPIRIT_BEAN_RING.map((id) => Math.max(0, beanScores[id]));

  const claimedFlavourIdx = SPIRIT_FLAVOUR_RING.indexOf(claimedFlavourId);
  const claimedFormIdx = SPIRIT_FORM_RING.indexOf(claimedFormId);
  const claimedBeanIdx = SPIRIT_BEAN_RING.indexOf(claimedBeanId);

  const pickHighlight = (values: number[], claimedIdx: number) => {
    const max = Math.max(...values);
    return values[claimedIdx] === max ? claimedIdx : values.indexOf(max);
  };

  return {
    flavourValues,
    formValues,
    beanValues,
    flavourHighlight: pickHighlight(flavourValues, claimedFlavourIdx),
    formHighlight: pickHighlight(formValues, claimedFormIdx),
    beanHighlight: pickHighlight(beanValues, claimedBeanIdx),
    claimedFlavourIdx,
    claimedFormIdx,
    claimedBeanIdx,
  };
}

export function getSpiritZodiacId(scores: SpiritBeanScores): ZodiacId {
  return `${SPIRIT_FLAVOUR_RING[scores.flavourHighlight]}-${SPIRIT_FORM_RING[scores.formHighlight]}-${SPIRIT_BEAN_RING[scores.beanHighlight]}` as ZodiacId;
}

export function getSpiritDiff(scores: SpiritBeanScores): number {
  return (
    Math.max(...scores.flavourValues) -
    scores.flavourValues[scores.claimedFlavourIdx] +
    (Math.max(...scores.formValues) -
      scores.formValues[scores.claimedFormIdx]) +
    (Math.max(...scores.beanValues) - scores.beanValues[scores.claimedBeanIdx])
  );
}

const ALIGNMENT_TEXTS = [
  // 0–9: mild
  "Your body and spirit align.",
  "A seed contains everything — including its opposite.",
  "Something beneath the surface has begun to want.",
  "The self is not entirely still.",
  "Change asks quietly before it enters.",
  "A small door has opened.",
  "What you are and what you are becoming have not yet met.",
  "The self leans — barely, but leaning is how it starts.",
  "A pull exists in you that has no name yet.",
  "You are faithful to your nature, though it has begun to wander.",
  // 10–19: moderate
  "Change has stopped asking.",
  "What you were and what you are no longer agree.",
  "You have grown in directions your origin did not anticipate.",
  "The self you were given and the self you made are in negotiation.",
  "You are becoming something your beginning did not plan for.",
  "The original self persists — but quietly.",
  "Two truths live in you now, and both are real.",
  "What shaped you first no longer shapes you most.",
  "You have been unmade and remade — not all at once, but steadily.",
  "The origin remains, but it no longer governs.",
  // 20–29: extreme
  "You have outgrown the self you were handed.",
  "What you were is now a reference point, not a home.",
  "Nothing anchors you to the beginning anymore.",
  "The self that was born and the self that lives have parted ways.",
  "You are no longer what you were — and what you were knows it.",
  "Change does not always return what it borrows.",
  "What you've become cannot be traced back to where you began.",
  "The beginning would not recognize the end.",
  "The river has forgotten it was ever rain.",
  "Your origin is no longer behind you — it is simply gone.",
];

export function getAlignmentText(spiritDiff: number): string {
  return ALIGNMENT_TEXTS[Math.min(spiritDiff, ALIGNMENT_TEXTS.length - 1)];
}

export type BeanstalkNode = {
  kind: "fortune";
  date: string;
  scores: SpiritBeanScores;
  spiritZodiacId: ZodiacId;
  fortuneZodiacId: ZodiacId;
  qualityId: QualityId;
  facetTitle: string;
  facetText: string;
  score: number;
  text: string | null;
  variant: RitualVariant;
  question: string | null;
  answeredQuality: QualityId | null;
  answerText: string | null;
};

export function buildBeanstalkNodes(claimedSlug: ZodiacId): BeanstalkNode[] {
  const history = useStore
    .getState()
    .fortuneHistory.sort((a, b) => (a.date < b.date ? -1 : 1));

  if (history.length === 0) return [];

  const fortuneNodes: BeanstalkNode[] = history.map((entry) => {
    const scores = computeSpiritBeanScores(claimedSlug, entry.date);
    const spiritZodiacId = getSpiritZodiacId(scores);
    return {
      kind: "fortune",
      date: entry.date,
      scores,
      spiritZodiacId,
      fortuneZodiacId: entry.zodiacId,
      qualityId: entry.qualityId,
      facetTitle: entry.facetTitle,
      facetText: entry.facetText,
      score: entry.score || 0,
      text: entry.text ?? null,
      variant: entry.variant ?? "facet",
      question: entry.question ?? null,
      answeredQuality: entry.answeredQuality ?? null,
      answerText: entry.answerText ?? null,
    };
  });

  return fortuneNodes;
}
