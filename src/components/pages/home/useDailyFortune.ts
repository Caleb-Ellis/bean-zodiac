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
  FORTUNE_REPEAT_WINDOW,
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
import { useStore } from "../../../store";

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildScoredText(
  trait: string,
  inverse: string,
  excess: string,
  score: number,
  qualityId: QualityId,
): string {
  const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;
  const phrase =
    qualityId === "heirloom"
      ? `the ${excess} bean`
      : qualityId === "market"
        ? `the very ${trait} bean`
        : qualityId === "garden"
          ? `the ${trait} bean`
          : qualityId === "stale"
            ? `the not-very ${trait} bean`
            : `the ${inverse} bean`;
  const Phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1);
  if (score === 0) {
    return pick([
      `${Phrase} passes you by without a word.`,
      `You and ${phrase} regard each other from afar.`,
      `${Phrase} notes your silence and moves on.`,
      `${Phrase} leaves nothing behind today.`,
      `${Phrase} waits a moment, then turns away.`,
      `Neither you nor ${phrase} finds anything to say.`,
      `${Phrase} keeps its counsel and lets you keep yours.`,
      `${Phrase} lingers at the edge of the day, then is gone.`,
      `You watch ${phrase} go without calling after it.`,
      `${Phrase} offers no sign, and asks none of you.`,
      `The day holds ${phrase} at arm's length.`,
      `${Phrase} settles, unread, and dims.`,
    ]);
  }
  if (score > 0) {
    return pick([
      `${Phrase} draws close and says:`,
      `${Phrase} recognises you, and offers this:`,
      `${Phrase} leans in to speak:`,
      `${Phrase} has been waiting for you. It says:`,
      `${Phrase} warms to you and confides:`,
      `${Phrase} finds a kindred shape in you, and says:`,
      `${Phrase} unfolds itself for you:`,
      `${Phrase} turns to face you and speaks plainly:`,
      `${Phrase} opens, and this is what spills out:`,
    ]);
  }
  return pick([
    `${Phrase} finds little in common with you, but speaks regardless:`,
    `You and ${phrase} are strangers, yet it speaks:`,
    `You turn from ${phrase}. It speaks across that distance:`,
    `${Phrase} does not recognise you, but offers this:`,
    `${Phrase} owes you nothing, and still says:`,
    `You and ${phrase} pull opposite ways. It says anyway:`,
    `Across the gap between you, ${phrase} says:`,
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
  dat: Date,
  claimedSlug: ZodiacId,
): DailyFortune {
  const date = new Date(dat);
  date.setDate(date.getDate());
  const localDateStr = formatLocalDate(date);

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  // Slugs shown in the FORTUNE_REPEAT_WINDOW days before today, so the roll can
  // avoid repeating any of them. Past entries are immutable, so this set is
  // stable and today's fortune stays deterministic.
  const windowStart = new Date(date);
  windowStart.setDate(windowStart.getDate() - FORTUNE_REPEAT_WINDOW);
  const windowStartStr = formatLocalDate(windowStart);
  const recentSlugs = useStore
    .getState()
    .fortuneHistory.filter(
      (e) => e.date < localDateStr && e.date >= windowStartStr,
    )
    .map((e) => e.zodiacId);
  const { zodiacId: fortuneZodiacId, qualityId: rolledQualityId } =
    getDailyFortuneIds(date, claimedSlug, recentSlugs);
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
    initialEntry?.variant ?? getVariantForSlug(claimedSlug, date);

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
        setScoredText(
          buildScoredText(
            fortune.trait,
            fortune.inverse,
            fortune.excess,
            initialScore,
            qualityId,
          ),
        );
      }
    });
  }, [fortuneZodiacId]);

  // Page scroll-lock and hiding the layout behind the card is owned by
  // RitualCardShell (mounted by both the fortune and season-summary dialogs), so
  // it isn't managed here — doing so from this always-running hook fought the
  // shell when a summary showed on a day the fortune was already taken.

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
          ? `/images/rorschach/${fortuneZodiacId}.png`
          : null,
      ...patch,
    });
  };

  const handleScore = (v: number) => {
    if (!fortuneZodiac) return;
    setScoringOut(true);
    setTimeout(() => {
      const newScore = score === v ? 0 : v;
      const newDailyText = getDailyText(fortuneZodiac, qualityId, newScore);
      persistFortune(fortuneZodiac, {
        qualityId,
        score: newScore,
        text: newDailyText,
      });
      setScore(newScore);
      setScored(true);
      setText(newDailyText);
      setScoredText(
        buildScoredText(
          fortuneZodiac.trait,
          fortuneZodiac.inverse,
          fortuneZodiac.excess,
          newScore,
          qualityId,
        ),
      );
      setScoringOut(false);
    }, 700);
  };

  const handleAnswer = (answerQuality: QualityId) => {
    if (!fortuneZodiac) return;
    setScoringOut(true);
    setTimeout(() => {
      const newDailyText = getDailyText(fortuneZodiac, answerQuality, 1);
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
      setScoredText(
        buildScoredText(
          fortuneZodiac.trait,
          fortuneZodiac.inverse,
          fortuneZodiac.excess,
          1,
          answerQuality,
        ),
      );
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
