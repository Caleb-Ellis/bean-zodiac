import {
  type BeanId,
  type FlavourId,
  type FormId,
  type QualityId,
  type ZodiacId,
} from "./zodiac";
import type { RitualVariant } from "./fortune";
import { useStore } from "../store";

// Spirit rings are the radar-chart point orderings, distinct from the calendar
// orderings (FLAVOUR_ORDER, FORM_ORDER, BEAN_ORDER) in lib/zodiac. They drive
// the order attributes appear around each chart; scoring no longer reads
// adjacency, so reordering only changes layout, not the numbers.
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
  "butter",
  "mung",
  "navy",
  "black",
  "cannellini",
  "edamame",
];

// Base score applied to each of the accepted/resisted zodiac's own triple
// (its flavour, form, bean), keyed by the rolled quality / answered tier.
const ACCEPTED_BASE: Record<QualityId, number> = {
  heirloom: +4,
  market: +3,
  garden: +2,
  stale: -1,
  rotten: -2,
};

const RESISTED_BASE: Record<QualityId, number> = {
  heirloom: -2,
  market: -2,
  garden: -1,
  stale: +1,
  rotten: +2,
};

// Question/rorschach picks forgo the soft pass entirely (the bean tags belong
// to the facet vignette, which those variants don't show). They're deliberate
// self-identification rather than a thumbs-up on a rolled tier, so the triple
// is scored on a stronger table to make those picks count as a firmer signal.
const ANSWERED_BASE: Record<QualityId, number> = {
  heirloom: +6,
  market: +4,
  garden: +3,
  stale: -2,
  rotten: -3,
};

// Weaker "soft" score added to the beans a facet tier *embodies* (its tags).
// Unlike the base pass, accepting always lifts these beans regardless of tier:
// a tag means "this vignette behaves like that bean," so you drift toward it.
// Magnitude tracks how vivid the expression is — strongest at the Most/Least
// extremes (Heirloom/Rotten, the Rare qualities), mildest at Mid (Garden).
const ACCEPTED_SOFT: Record<QualityId, number> = {
  heirloom: +2,
  market: +1,
  garden: +1,
  stale: +2,
  rotten: +3,
};

const RESISTED_SOFT: Record<QualityId, number> = {
  heirloom: -1,
  market: -1,
  garden: -1,
  stale: -1,
  rotten: -1,
};

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
    const accepted = s > 0;
    const answered =
      entry.variant === "question" || entry.variant === "rorschach";
    const [f, frm, b] = entry.zodiacId.split("-") as [
      FlavourId,
      FormId,
      BeanId,
    ];

    // Base pass: the zodiac's own triple. Question/rorschach use the stronger
    // table; facet/legacy use the accepted/resisted tables.
    const base = answered
      ? ANSWERED_BASE[entry.qualityId]
      : (accepted ? ACCEPTED_BASE : RESISTED_BASE)[entry.qualityId];
    flavourScores[f] += base;
    formScores[frm] += base;
    beanScores[b] += base;

    // Soft pass: facet variant only. Tags are beans the vignette embodies; the
    // bump lifts them on accept (lowers on resist) independent of the base, so
    // an anti-trait line drives you off your own bean toward the ones it names.
    if (!answered && entry.facetTags?.length) {
      const soft = (accepted ? ACCEPTED_SOFT : RESISTED_SOFT)[entry.qualityId];
      for (const id of entry.facetTags) beanScores[id] += soft;
    }
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
  rorschachImage: string | null;
  rorschachText: string | null;
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
      rorschachImage: entry.rorschachImage ?? null,
      rorschachText: entry.rorschachText ?? null,
    };
  });

  return fortuneNodes;
}
