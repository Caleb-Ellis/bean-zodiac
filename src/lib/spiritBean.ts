import {
  BEAN_ORDER,
  FLAVOUR_ORDER,
  FORM_ORDER,
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacId,
} from "./zodiac";
import { getFortuneHistory } from "./fortuneHistory";

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

  const flavourScores = Object.fromEntries(FLAVOUR_ORDER.map((id) => [id, 4]));
  const formScores = Object.fromEntries(FORM_ORDER.map((id) => [id, 4]));
  const beanScores = Object.fromEntries(BEAN_ORDER.map((id) => [id, 4]));

  flavourScores[claimedFlavourId] += 4;
  formScores[claimedFormId] += 4;
  beanScores[claimedBeanId] += 4;

  const history = cutoffDateStr
    ? getFortuneHistory().filter((e) => e.date <= cutoffDateStr)
    : getFortuneHistory();
  for (const entry of history) {
    const s = entry.score ?? 0;
    if (s === 0) continue;
    let adjustedS: number;
    if (entry.qualityId === "heirloom") {
      adjustedS = s > 0 ? 2 : -1;
    } else if (entry.qualityId === "rotten") {
      adjustedS = s > 0 ? -2 : 1;
    } else if (entry.qualityId === "stale") {
      adjustedS = -s;
    } else if (entry.qualityId === "garden") {
      adjustedS = s > 0 ? 1 : 0;
    } else {
      adjustedS = s;
    }
    const [f, frm, b] = entry.zodiacId.split("-") as [
      FlavourId,
      FormId,
      BeanId,
    ];
    flavourScores[f] = (flavourScores[f] ?? 5) + adjustedS;
    formScores[frm] = (formScores[frm] ?? 5) + adjustedS;
    beanScores[b] = (beanScores[b] ?? 5) + adjustedS;
  }

  const flavourValues = FLAVOUR_ORDER.map((id) =>
    Math.max(0, flavourScores[id]),
  );
  const formValues = FORM_ORDER.map((id) => Math.max(0, formScores[id]));
  const beanValues = BEAN_ORDER.map((id) => Math.max(0, beanScores[id]));

  const claimedFlavourIdx = FLAVOUR_ORDER.indexOf(claimedFlavourId);
  const claimedFormIdx = FORM_ORDER.indexOf(claimedFormId);
  const claimedBeanIdx = BEAN_ORDER.indexOf(claimedBeanId);

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
  return `${FLAVOUR_ORDER[scores.flavourHighlight]}-${FORM_ORDER[scores.formHighlight]}-${BEAN_ORDER[scores.beanHighlight]}`;
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
  qualityId: import("./fortune").QualityId;
  text: string;
  score: number;
};

export function buildBeanstalkNodes(claimedSlug: ZodiacId): BeanstalkNode[] {
  const history = getFortuneHistory().sort((a, b) =>
    a.date < b.date ? -1 : 1,
  );

  if (history.length === 0) return [];

  const fortuneNodes: BeanstalkNode[] = history.map((entry) => {
    const scores = computeSpiritBeanScores(claimedSlug, entry.date);
    const spiritZodiacId: ZodiacId = `${FLAVOUR_ORDER[scores.flavourHighlight]}-${FORM_ORDER[scores.formHighlight]}-${BEAN_ORDER[scores.beanHighlight]}`;
    return {
      kind: "fortune",
      date: entry.date,
      scores,
      spiritZodiacId,
      fortuneZodiacId: entry.zodiacId,
      qualityId: entry.qualityId,
      text: entry.text,
      score: entry.score || 0,
    };
  });

  return fortuneNodes;
}
