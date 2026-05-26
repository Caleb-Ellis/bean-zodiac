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
  getFacetTitle,
  getFortuneText,
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
  qualityId: ReturnType<typeof getDailyFortuneIds>["qualityId"],
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
            ? `the formerly ${trait} bean`
            : `the not-at-all ${trait} bean`;
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
  qualityId: ReturnType<typeof getDailyFortuneIds>["qualityId"];
  fortuneTitle: string | null;
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
  const [text, setText] = useState<string | null>(initialEntry?.text ?? null);

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
        facetTitle: getFacetTitle(fortune, qualityId),
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

  const fortuneTitle = fortuneZodiac
    ? getFacetTitle(fortuneZodiac, qualityId)
    : null;
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
    fortuneTitle,
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
