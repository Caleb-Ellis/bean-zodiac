import { useMemo } from "react";
import type { QualityId, Zodiac, ZodiacId } from "../../../lib/zodiac";
import { ANSWER_TIERS, getRorschachText } from "../../../lib/fortune";

interface Props {
  fortuneZodiac: Zodiac;
  zodiacId: ZodiacId;
  landed: boolean;
  handleAnswer: (q: QualityId) => void;
}

export default function RorschachVariant({
  fortuneZodiac,
  zodiacId,
  landed,
  handleAnswer,
}: Props) {
  const blotUrl = `url(/images/rorschach/${zodiacId}.svg)`;
  const flavour = `var(--flavour-${fortuneZodiac.flavour})`;
  const form = `var(--form-${fortuneZodiac.form})`;
  const bean = `var(--bean-${fortuneZodiac.bean})`;
  // Three radial blooms of ink, one per colour, bleeding over a flat base.
  const gradient = [
    `radial-gradient(circle at 30% 26%, ${flavour}, transparent 60%)`,
    `radial-gradient(circle at 72% 34%, ${form}, transparent 60%)`,
    `radial-gradient(circle at 50% 78%, ${bean}, transparent 65%)`,
    `linear-gradient(${bean}, ${bean})`,
  ].join(", ");

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
      <p
        className={`text-xs tracking-widest uppercase text-zinc-500 text-center ${landed ? "animate-fade-up" : "opacity-0"}`}
        style={
          landed
            ? { animationDelay: "150ms", animationDuration: "500ms" }
            : undefined
        }
      >
        What do you see?
      </p>
      <div
        aria-hidden
        className={landed ? "animate-fade-up" : "opacity-0"}
        style={
          landed
            ? { animationDelay: "300ms", animationDuration: "500ms" }
            : undefined
        }
      >
        <div
          className="w-36 h-36"
          style={{
            backgroundImage: gradient,
            maskImage: blotUrl,
            WebkitMaskImage: blotUrl,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
      </div>
      <div
        className={`flex flex-col items-stretch gap-1.5 w-full ${landed ? "animate-fade-up" : "opacity-0"}`}
        style={
          landed
            ? { animationDelay: "550ms", animationDuration: "500ms" }
            : undefined
        }
      >
        {shuffledTiers.map((tier) => {
          const txt = getRorschachText(fortuneZodiac, tier);
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
