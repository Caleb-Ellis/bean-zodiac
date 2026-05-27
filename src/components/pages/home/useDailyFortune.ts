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
  getFortuneText,
  getVariantForSlug,
  getAnswerText,
  hasQuestion,
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
  handleIgnore: () => void;
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
  // For question entries the answered tier overrides the rolled tier.
  const initialQualityId: QualityId =
    initialEntry?.variant === "question" && initialEntry.answeredQuality
      ? initialEntry.answeredQuality
      : rolledQualityId;
  const initialVariant: RitualVariant =
    initialEntry?.variant ?? getVariantForSlug(spiritSlug, date);

  const [fortuneZodiac, setFortuneZodiac] = useState<Zodiac | null>(null);
  const [score, setScore] = useState(initialScore);
  const [scored, setScored] = useState(initiallyScored);
  const [qualityId, setQualityId] = useState<QualityId>(initialQualityId);
  const [variant, setVariant] = useState<RitualVariant>(initialVariant);
  const [dialogOpen, setDialogOpen] = useState(() => !initialEntry?.seenAt);
  const [scoringOut, setScoringOut] = useState(false);
  const [scoredText, setScoredText] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(initialEntry?.text ?? null);
  const [answerText, setAnswerText] = useState<string | null>(
    initialEntry?.answerText ?? null,
  );

  useEffect(() => {
    fetchZodiac(fortuneZodiacId).then((fortune) => {
      setFortuneZodiac(fortune);

      // Downgrade question variant to facet when this zodiac has no authored
      // question. Locks in once persisted on the entry.
      const effectiveVariant: RitualVariant =
        initialVariant === "question" && !hasQuestion(fortune)
          ? "facet"
          : initialVariant;
      if (effectiveVariant !== variant) setVariant(effectiveVariant);

      if (initiallyScored) {
        setScoredText(buildScoredText(fortune.trait, initialScore, qualityId));
      }
      useStore.getState().addFortuneEntry({
        date: localDateStr,
        zodiacId: fortuneZodiacId,
        qualityId: rolledQualityId,
        facetTitle: getFacetTitle(fortune, rolledQualityId),
        facetText: getFortuneText(fortune, rolledQualityId),
        score: 0,
        text: null,
        variant: effectiveVariant,
        question: effectiveVariant === "question" ? fortune.question : null,
        answeredQuality: null,
        answerText: null,
      });
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

  const handleScore = (v: number) => {
    setScoringOut(true);
    setTimeout(() => {
      const newScore = score === v ? 0 : v;
      const newDailyText = fortuneZodiac
        ? getDailyText(fortuneZodiac, qualityId, newScore)
        : null;
      useStore
        .getState()
        .updateFortuneEntry(localDateStr, {
          score: newScore,
          text: newDailyText,
        });
      setScore(newScore);
      setScored(true);
      setText(newDailyText);
      if (fortuneZodiac) {
        setScoredText(buildScoredText(fortuneZodiac.trait, newScore, qualityId));
      }
      markSeen();
      setScoringOut(false);
    }, 700);
  };

  const handleAnswer = (answerQuality: QualityId) => {
    if (!fortuneZodiac) return;
    setScoringOut(true);
    setTimeout(() => {
      const newDailyText = getDailyText(fortuneZodiac, answerQuality, 1);
      const newAnswerText = getAnswerText(fortuneZodiac, answerQuality) ?? null;
      useStore.getState().updateFortuneEntry(localDateStr, {
        qualityId: answerQuality,
        score: 1,
        text: newDailyText,
        answeredQuality: answerQuality,
        answerText: newAnswerText,
      });
      setQualityId(answerQuality);
      setScore(1);
      setScored(true);
      setText(newDailyText);
      setAnswerText(newAnswerText);
      setScoredText(buildScoredText(fortuneZodiac.trait, 1, answerQuality));
      markSeen();
      setScoringOut(false);
    }, 700);
  };

  const handleIgnore = () => {
    setScoringOut(true);
    setTimeout(() => {
      setScored(true);
      if (fortuneZodiac) {
        setScoredText(buildScoredText(fortuneZodiac.trait, 0, qualityId));
      }
      markSeen();
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
    variant === "question" && fortuneZodiac?.question
      ? fortuneZodiac.question
      : null;

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
    handleIgnore,
    handleClose,
  };
}
