import { useMemo } from "react";
import type { QualityId, Zodiac } from "../../../lib/zodiac";
import { ANSWER_TIERS, getAnswerText } from "../../../lib/fortune";

interface Props {
  fortuneZodiac: Zodiac;
  question: string | null;
  landed: boolean;
  handleAnswer: (q: QualityId) => void;
}

export default function QuestionVariant({
  fortuneZodiac,
  question,
  landed,
  handleAnswer,
}: Props) {
  const shuffledTiers = useMemo(() => {
    const arr = [...ANSWER_TIERS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  return (
    <>
      {question ? (
        <p
          className={`text-zinc-200 text-center text-regular ${landed ? "animate-fade-up" : "opacity-0"}`}
          style={
            landed
              ? { animationDelay: "150ms", animationDuration: "500ms" }
              : undefined
          }
        >
          {question}
        </p>
      ) : (
        <div className="h-5 w-56 bg-zinc-800 rounded-full animate-pulse" />
      )}
      <div
        className={`flex flex-col items-stretch gap-1.5 w-full ${landed ? "animate-fade-up" : "opacity-0"}`}
        style={
          landed
            ? { animationDelay: "400ms", animationDuration: "500ms" }
            : undefined
        }
      >
        {shuffledTiers.map((tier) => {
          const txt = getAnswerText(fortuneZodiac, tier);
          if (!txt) return null;
          return (
            <button
              key={tier}
              onClick={() => handleAnswer(tier)}
              className="text-center text-balance text-sm text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 hover:text-zinc-100 hover:bg-zinc-800/40 transition-colors cursor-pointer bg-transparent"
            >
              {txt}
            </button>
          );
        })}
      </div>
    </>
  );
}
