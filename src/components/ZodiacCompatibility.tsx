import { useRef, useState } from "react";
import { getZodiacMetadataForDate } from "../lib/zodiac";
import { type AllZodiacData } from "../lib/data";
import {
  CompatibilityResult,
  CALCULATING_TEXTS,
  CALC_CYCLE_MS,
  CALC_FADE_MS,
  CALC_NUM_TEXTS,
  REVEAL_STEP_MS,
  type MetaSlice,
} from "./CompatibilityResult";

type Props = {
  data: AllZodiacData;
};

export default function ZodiacCompatibility({ data }: Props) {
  const [inputA, setInputA] = useState("2001-01-01");
  const [inputB, setInputB] = useState("2001-01-01");

  const [metaA, setMetaA] = useState<MetaSlice | null>(null);
  const [metaB, setMetaB] = useState<MetaSlice | null>(null);

  const [resultMounted, setResultMounted] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultKey, setResultKey] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [calculatingText, setCalculatingText] = useState<string | null>(null);
  const [calculatingVisible, setCalculatingVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(true);
  const generationRef = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);

  function handleCompare() {
    const inputForB = inputB;
    const inputForA = inputA;
    if (!inputForB) return;
    if (!inputForA) return;

    const generation = ++generationRef.current;
    const guard = (fn: () => void) => () => {
      if (generationRef.current === generation) fn();
    };

    const resolvedMetaA: MetaSlice = getZodiacMetadataForDate(
      parseDate(inputForA),
    );
    const resolvedMetaB: MetaSlice = getZodiacMetadataForDate(
      parseDate(inputForB),
    );

    setFormVisible(false);
    setRevealedCount(0);
    setCalculatingVisible(false);

    const mount = guard(() => {
      setMetaA(resolvedMetaA);
      setMetaB(resolvedMetaB);
      setResultKey((k) => k + 1);
      setResultMounted(true);
      setResultVisible(true);

      const shuffled = [...CALCULATING_TEXTS].sort(() => Math.random() - 0.5);
      const texts = shuffled.slice(0, CALC_NUM_TEXTS);

      setCalculatingText(texts[0]);
      requestAnimationFrame(guard(() => setCalculatingVisible(true)));

      for (let i = 1; i < CALC_NUM_TEXTS; i++) {
        setTimeout(
          guard(() => setCalculatingVisible(false)),
          i * CALC_CYCLE_MS - CALC_FADE_MS,
        );
        setTimeout(
          guard(() => {
            setCalculatingText(texts[i]);
            requestAnimationFrame(guard(() => setCalculatingVisible(true)));
          }),
          i * CALC_CYCLE_MS,
        );
      }

      const revealAt = CALC_NUM_TEXTS * CALC_CYCLE_MS;
      setTimeout(
        guard(() => setCalculatingVisible(false)),
        revealAt - CALC_FADE_MS,
      );
      setTimeout(
        guard(() => {
          setCalculatingText(null);
          for (let i = 1; i <= 4; i++) {
            setTimeout(
              guard(() => setRevealedCount(i)),
              i * REVEAL_STEP_MS,
            );
          }
        }),
        revealAt,
      );
    });

    if (resultMounted) {
      setResultVisible(false);
      setCalculatingText(null);
    }
    setTimeout(mount, 500);
  }

  function handleReset() {
    generationRef.current++;
    setCalculatingText(null);
    setCalculatingVisible(false);
    setResultVisible(false);
    setTimeout(() => {
      setResultMounted(false);
      setRevealedCount(0);
      setFormVisible(true);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }

  return (
    <div ref={topRef} className="flex flex-col items-center w-full">
      <div
        className={`grid transition-all duration-500 w-full max-w-xs ${
          formVisible
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col items-center gap-6 pb-16">
            <DateField label="First Bean" value={inputA} onChange={setInputA} />
            <DateField
              label="Second Bean"
              value={inputB}
              onChange={setInputB}
            />
            <button
              onClick={handleCompare}
              className="mt-5 w-full bg-zinc-900/80 border-2 border-zinc-500/60 text-white rounded-xl px-8 py-2.5 text-base font-bold backdrop-blur-sm transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-800/80 cursor-pointer"
            >
              Match Beans
            </button>
          </div>
        </div>
      </div>

      {resultMounted && metaA && metaB && (
        <div
          className={`w-full flex flex-col items-center gap-8 transition-opacity duration-300 ${
            resultVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <CompatibilityResult
            key={resultKey}
            data={data}
            metaA={metaA}
            metaB={metaB}
            revealedCount={revealedCount}
            calculatingText={calculatingText}
            calculatingVisible={calculatingVisible}
          />
          {revealedCount >= 4 && (
            <button
              onClick={handleReset}
              className="animate-fade-up bg-zinc-900/80 border-2 border-zinc-500/60 text-white rounded-xl px-8 py-4 text-lg font-bold transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-800/80 cursor-pointer"
            >
              Match More Beans
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline-block ml-1.5 w-4 h-4 align-[-0.125em]"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs uppercase tracking-widest text-zinc-400">
        {label}
      </label>
      <input
        type="date"
        className="w-full bg-zinc-900/80 border-2 border-zinc-700/60 text-white rounded-xl px-4 py-2.5 cursor-pointer backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 hover:border-zinc-600 [&::-webkit-calendar-picker-indicator]:hidden"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function parseDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
