import { useEffect, useState } from "react";
import {
  type FlavourId,
  type FormId,
  type BeanId,
  type QualityId,
  type Zodiac,
  type ZodiacId,
} from "../../../lib/zodiac";
import {
  getDailyFortuneIds,
  getDailyText,
  getFacetTitle,
  getSpiritTags,
  getFortuneText,
  getVariantForSlug,
  getAnswerText,
  getRorschachText,
  type RitualVariant,
} from "../../../lib/fortune";
import { fetchZodiac } from "../../../lib/data";
import {
  computeSpiritBeanScores,
  getSpiritZodiacId,
} from "../../../lib/spiritBean";
import { useStore } from "../../../store";

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildScoredText(
  trait: string,
  score: number,
  qualityId: QualityId,
): string {
  const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;
  const phrase =
    qualityId === "heirloom"
      ? `the extremely ${trait} bean`
      : qualityId === "market"
        ? `the very ${trait} bean`
        : qualityId === "garden"
          ? `the ${trait} bean`
          : qualityId === "stale"
            ? `the not-so ${trait} bean`
            : `the not-even-remotely ${trait} bean`;
  const Phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1);
  if (score === 0) {
    return pick([
      `${Phrase} passes you by without a word.`,
      `You and ${phrase} regard each other from afar.`,
      `${Phrase} notes your silence and moves on.`,
      `${Phrase} leaves nothing behind today.`,
    ]);
  }
  if (score > 0) {
    return pick([
      `${Phrase} draws close and says:`,
      `${Phrase} recognises you, and offers this:`,
      `${Phrase} leans in to speak:`,
      `${Phrase} has been waiting for you. It says:`,
    ]);
  }
  return pick([
    `${Phrase} finds little in common with you, but speaks regardless:`,
    `You and ${phrase} are strangers, yet it speaks:`,
    `You turn from ${phrase}. It speaks across that distance:`,
    `${Phrase} does not recognise you, but offers this:`,
  ]);
}

export interface DailyFortune {
  fortuneZodiacId: ZodiacId;
  fortuneFlavourId: FlavourId;
  fortuneFormId: FormId;
  fortuneBeanId: BeanId;
  fortuneZodiac: Zodiac | null;
  qualityId: QualityId;
  variant: RitualVariant;
  question: string | null;
  fortuneTitle: string | null;
  fortuneText: string | null;
  answerText: string | null;
  score: number;
  scored: boolean;
  scoredText: string | null;
  text: string | null;
  dialogOpen: boolean;
  scoringOut: boolean;
  handleScore: (v: number) => void;
  handleAnswer: (q: QualityId) => void;
  handleClose: () => void;
}

export function useDailyFortune(
  date: Date,
  claimedSlug: ZodiacId,
): DailyFortune {
  const localDateStr = formatLocalDate(date);

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const spiritScores = computeSpiritBeanScores(
    claimedSlug,
    formatLocalDate(yesterday),
  );
  const spiritSlug = getSpiritZodiacId(spiritScores);
  const { zodiacId: fortuneZodiacId, qualityId: rolledQualityId } =
    getDailyFortuneIds(date, spiritSlug);
  const [fortuneFlavourId, fortuneFormId, fortuneBeanId] =
    fortuneZodiacId.split("-") as [FlavourId, FormId, BeanId];

  const initialEntry = useStore
    .getState()
    .fortuneHistory.find((e) => e.date === localDateStr);
  const initialScore = initialEntry?.score ?? 0;
  const initiallyScored = initialScore !== 0;
  // For question/rorschach entries the answered tier overrides the rolled tier.
  const initialQualityId: QualityId =
    (initialEntry?.variant === "question" ||
      initialEntry?.variant === "rorschach") &&
    initialEntry.answeredQuality
      ? initialEntry.answeredQuality
      : rolledQualityId;
  const initialVariant: RitualVariant =
    initialEntry?.variant ?? getVariantForSlug(fortuneZodiacId, date);

  const [fortuneZodiac, setFortuneZodiac] = useState<Zodiac | null>(null);
  const [score, setScore] = useState(initialScore);
  const [scored, setScored] = useState(initiallyScored);
  const [qualityId, setQualityId] = useState<QualityId>(initialQualityId);
  const [variant, setVariant] = useState<RitualVariant>(initialVariant);
  const [dialogOpen, setDialogOpen] = useState(() => !initialEntry);
  const [scoringOut, setScoringOut] = useState(false);
  const [scoredText, setScoredText] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(initialEntry?.text ?? null);
  const [answerText, setAnswerText] = useState<string | null>(
    initialEntry?.answerText ?? null,
  );

  useEffect(() => {
    fetchZodiac(fortuneZodiacId).then((fortune) => {
      setFortuneZodiac(fortune);

      const effectiveVariant: RitualVariant = initialVariant;
      if (effectiveVariant !== variant) setVariant(effectiveVariant);

      if (initiallyScored) {
        setScoredText(buildScoredText(fortune.trait, initialScore, qualityId));
      }
    });
  }, [fortuneZodiacId]);

  useEffect(() => {
    document.body.style.overflow = dialogOpen ? "hidden" : "";
    const layoutContent = document.getElementById("layout-content");
    if (layoutContent) {
      layoutContent.style.visibility = dialogOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
      if (layoutContent) layoutContent.style.visibility = "";
    };
  }, [dialogOpen]);

  const markSeen = () => {
    useStore.getState().markFortuneSeen(localDateStr);
  };

  // Persist (or, on a rare re-score within an open dialog, update) the day's
  // entry. The entry only ever exists once the user has scored — until then the
  // fortune is recomputed each load — so the scored fields below are the first
  // and only write for the day. facetTitle/facetText snapshot the rolled tier;
  // the stored qualityId is the answered tier for question/rorschach variants.
  const persistFortune = (
    fortune: Zodiac,
    scoredFields: {
      qualityId: QualityId;
      score: number;
      text: string | null;
      answeredQuality?: QualityId | null;
      answerText?: string | null;
      rorschachText?: string | null;
    },
  ) => {
    const store = useStore.getState();
    const patch = {
      qualityId: scoredFields.qualityId,
      score: scoredFields.score,
      text: scoredFields.text,
      answeredQuality: scoredFields.answeredQuality ?? null,
      answerText: scoredFields.answerText ?? null,
      rorschachText: scoredFields.rorschachText ?? null,
      seenAt: new Date().toISOString(),
    };
    if (store.fortuneHistory.some((e) => e.date === localDateStr)) {
      store.updateFortuneEntry(localDateStr, patch);
      return;
    }
    store.addFortuneEntry({
      date: localDateStr,
      zodiacId: fortuneZodiacId,
      facetTitle: getFacetTitle(fortune, rolledQualityId),
      facetText: getFortuneText(fortune, rolledQualityId),
      spiritTags: getSpiritTags(fortune),
      variant,
      question: variant === "question" ? fortune.question : null,
      rorschachImage:
        variant === "rorschach"
          ? `/images/rorschach/${fortuneZodiacId}.svg`
          : null,
      ...patch,
    });
  };

  const handleScore = (v: number) => {
    if (!fortuneZodiac) return;
    setScoringOut(true);
    setTimeout(() => {
      const newScore = score === v ? 0 : v;
      const newDailyText = getDailyText(fortuneZodiac, qualityId, newScore, date);
      persistFortune(fortuneZodiac, {
        qualityId,
        score: newScore,
        text: newDailyText,
      });
      setScore(newScore);
      setScored(true);
      setText(newDailyText);
      setScoredText(buildScoredText(fortuneZodiac.trait, newScore, qualityId));
      setScoringOut(false);
    }, 700);
  };

  const handleAnswer = (answerQuality: QualityId) => {
    if (!fortuneZodiac) return;
    setScoringOut(true);
    setTimeout(() => {
      const newDailyText = getDailyText(fortuneZodiac, answerQuality, 1, date);
      const isRorschach = variant === "rorschach";
      const newAnswerText = isRorschach
        ? null
        : (getAnswerText(fortuneZodiac, answerQuality) ?? null);
      const newRorschachText = isRorschach
        ? (getRorschachText(fortuneZodiac, answerQuality) ?? null)
        : null;
      persistFortune(fortuneZodiac, {
        qualityId: answerQuality,
        score: 1,
        text: newDailyText,
        answeredQuality: answerQuality,
        answerText: newAnswerText,
        rorschachText: newRorschachText,
      });
      setQualityId(answerQuality);
      setScore(1);
      setScored(true);
      setText(newDailyText);
      setAnswerText(newAnswerText ?? newRorschachText);
      setScoredText(buildScoredText(fortuneZodiac.trait, 1, answerQuality));
      setScoringOut(false);
    }, 700);
  };

  const handleClose = () => {
    markSeen();
    setDialogOpen(false);
  };

  const fortuneTitle = fortuneZodiac
    ? getFacetTitle(fortuneZodiac, qualityId)
    : null;
  const fortuneText = fortuneZodiac
    ? getFortuneText(fortuneZodiac, qualityId)
    : null;
  const question =
    variant === "question" ? (fortuneZodiac?.question ?? null) : null;

  return {
    fortuneZodiacId,
    fortuneFlavourId,
    fortuneFormId,
    fortuneBeanId,
    fortuneZodiac,
    qualityId,
    variant,
    question,
    fortuneTitle,
    fortuneText,
    answerText,
    score,
    scored,
    scoredText,
    text,
    dialogOpen,
    scoringOut,
    handleScore,
    handleAnswer,
    handleClose,
  };
}
