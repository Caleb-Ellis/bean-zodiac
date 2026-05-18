import { useEffect, useState } from "react";
import {
  type FlavourId,
  type FormId,
  type BeanId,
  type Zodiac,
  type ZodiacId,
} from "../../../lib/zodiac";
import {
  getDailyFortuneIds,
  getDailyText,
  getFortuneText,
} from "../../../lib/fortune";
import { fetchZodiac } from "../../../lib/data";
import {
  computeSpiritBeanScores,
  getRingAdjustment,
  getSpiritZodiacId,
} from "../../../lib/spiritBean";
import { useStore } from "../../../store";

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildScoredText(
  trait: string,
  score: number,
  qualityId: ReturnType<typeof getDailyFortuneIds>["qualityId"],
): string {
  const a = /^[aeiou]/i.test(trait) ? "an" : "a";
  const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;
  const adj = getRingAdjustment(score, qualityId).chosen;
  if (score === 0) {
    return pick([
      `The ${trait} bean passes you by without a word.`,
      `You and the ${trait} bean regard each other from afar.`,
      `The ${trait} bean notes your silence and moves on.`,
      `The ${trait} bean leaves nothing behind today.`,
    ]);
  }
  if (adj >= 2) {
    return pick([
      `The ${trait} bean knows you well. It says:`,
      `The ${trait} bean finds its full expression in you:`,
      `You are unmistakably ${a} ${trait} bean; it has much to offer:`,
      `The ${trait} bean recognises you wholly, and speaks:`,
    ]);
  }
  if (adj === 1) {
    return pick([
      `The ${trait} bean finds a flicker of itself in you. It says:`,
      `Something of the ${trait} bean stirs — it speaks:`,
      `The ${trait} bean half-recognises you, and offers this:`,
      `A trace of the ${trait} bean speaks to you:`,
    ]);
  }
  return pick([
    `The ${trait} bean finds little in common with you, but speaks regardless:`,
    `You and the ${trait} bean are strangers — it speaks nonetheless:`,
    `You resist the ${trait} bean. It speaks across that distance:`,
    `The ${trait} bean does not recognise you, but offers this:`,
  ]);
}

export interface DailyFortune {
  fortuneZodiacId: ZodiacId;
  fortuneFlavourId: FlavourId;
  fortuneFormId: FormId;
  fortuneBeanId: BeanId;
  fortuneZodiac: Zodiac | null;
  qualityId: ReturnType<typeof getDailyFortuneIds>["qualityId"];
  fortuneText: string | null;
  score: number;
  scored: boolean;
  scoredText: string | null;
  text: string | null;
  dialogOpen: boolean;
  revealed: boolean;
  revealing: boolean;
  scoringOut: boolean;
  showQuality: boolean;
  qualityFading: boolean;
  handleReveal: () => void;
  handleScore: (v: number) => void;
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
  const { zodiacId: fortuneZodiacId, qualityId } = getDailyFortuneIds(
    date,
    spiritSlug,
  );
  const [fortuneFlavourId, fortuneFormId, fortuneBeanId] =
    fortuneZodiacId.split("-") as [FlavourId, FormId, BeanId];

  const initialEntry = useStore
    .getState()
    .fortuneHistory.find((e) => e.date === localDateStr);
  const initialScore = initialEntry?.score ?? 0;
  const initiallyScored = initialScore !== 0;

  const [fortuneZodiac, setFortuneZodiac] = useState<Zodiac | null>(null);
  const [score, setScore] = useState(initialScore);
  const [scored, setScored] = useState(initiallyScored);
  const [dialogOpen, setDialogOpen] = useState(() => !initialEntry?.seenAt);
  const [revealed, setRevealed] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [scoringOut, setScoringOut] = useState(false);
  const [showQuality, setShowQuality] = useState(initiallyScored);
  const [qualityFading, setQualityFading] = useState(false);
  const [scoredText, setScoredText] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(
    initialEntry?.text ?? null,
  );

  useEffect(() => {
    fetchZodiac(fortuneZodiacId).then((fortune) => {
      setFortuneZodiac(fortune);
      if (initiallyScored) {
        setScoredText(buildScoredText(fortune.trait, initialScore, qualityId));
      }
      useStore.getState().addFortuneEntry({
        date: localDateStr,
        zodiacId: fortuneZodiacId,
        qualityId,
        facetText: getFortuneText(fortune, qualityId),
        score: 0,
        text: null,
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

  const applyQuality = () => {
    if (qualityId === "garden") {
      setShowQuality(true);
      return;
    }
    setQualityFading(true);
    setTimeout(() => {
      setShowQuality(true);
      setQualityFading(false);
    }, 400);
  };

  const handleReveal = () => {
    setRevealing(true);
    setTimeout(() => setRevealed(true), 350);
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
        .updateFortuneScore(localDateStr, newScore, newDailyText);
      setScore(newScore);
      setScored(true);
      setText(newDailyText);
      if (fortuneZodiac) {
        setScoredText(
          buildScoredText(fortuneZodiac.trait, newScore, qualityId),
        );
      }
      markSeen();
      applyQuality();
    }, 350);
  };

  const handleIgnore = () => {
    setScoringOut(true);
    setTimeout(() => {
      setScored(true);
      if (fortuneZodiac) {
        setScoredText(buildScoredText(fortuneZodiac.trait, 0, qualityId));
      }
      markSeen();
      applyQuality();
    }, 350);
  };

  const handleClose = () => {
    if (revealed) markSeen();
    setDialogOpen(false);
  };

  const fortuneText = fortuneZodiac
    ? getFortuneText(fortuneZodiac, qualityId)
    : null;

  return {
    fortuneZodiacId,
    fortuneFlavourId,
    fortuneFormId,
    fortuneBeanId,
    fortuneZodiac,
    qualityId,
    fortuneText,
    score,
    scored,
    scoredText,
    text,
    dialogOpen,
    revealed,
    revealing,
    scoringOut,
    showQuality,
    qualityFading,
    handleReveal,
    handleScore,
    handleIgnore,
    handleClose,
  };
}
