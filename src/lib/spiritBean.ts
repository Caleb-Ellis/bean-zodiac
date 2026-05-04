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
    const magnitude =
      entry.qualityId === "heirloom" || entry.qualityId === "rotten" ? 2 : 1;
    const sign =
      entry.qualityId === "stale" || entry.qualityId === "rotten" ? -1 : 1;
    const adjustedS = sign * magnitude * s;
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
  "Your body and spirit align.",
  "A faint divergence — barely worth naming.",
  "Something stirs beneath the surface.",
  "The spirit is restless.",
  "A quiet gap opens between your birth and your bearing.",
  "The distance is unmistakable now.",
  "Body and spirit no longer speak the same language.",
  "The gap has widened further than your birth bean expected.",
  "The gap widens — the beans are watching closely.",
  "Your spirit has wandered far from where it started.",
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
