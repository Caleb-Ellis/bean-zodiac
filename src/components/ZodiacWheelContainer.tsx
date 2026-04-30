import { useEffect, useRef, useState } from "react";
import {
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type Zodiac,
  type ZodiacId,
} from "../lib/zodiac";
import { fetchZodiac, type AllZodiacData } from "../lib/data";
import { getClaimedBeanSlug, setClaimedBeanSlug } from "../lib/claimedBean";
import { addMetBean } from "../lib/metBeans";
import ZodiacWheel, { BEANS_LETTERS } from "./ZodiacWheel";
import ZodiacIdentity from "./ZodiacIdentity";
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

const SPIN_DURATION_MS = 3700;
const FADE_MS = 300;
const RESULT_MOUNT_DELAY_MS = 150;

const LETTER_INTERVAL = Math.floor(2000 / BEANS_LETTERS.length);

const MORE_BEANS_LABELS = [
  "I Require More Beans",
  "Give Me More Beans",
  "Please Sir, May I Have Another Bean",
  "This Bean is Not Enough",
  "More Beans, Immediately",
  "The Beans Must Flow",
  "Unacceptable. More Beans.",
  "One Bean Was Never Going to Be Enough",
  "Return Me to the Beans",
  "I Am Still Hungry for Beans",
  "I Have a Need. A Need for Beans",
];

function parseClaimedSlug(slug: ZodiacId): MetaSlice {
  const [flavourId, formId, beanId] = slug.split("-") as [
    FlavourId,
    FormId,
    BeanId,
  ];
  return { flavourId, formId, beanId };
}

export default function ZodiacWheelContainer({ data }: Props) {
  const [inputDate, setInputDate] = useState<string>(() => {
    const param = getDateParam();
    return param ?? "2001-01-01";
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const param = getDateParam();
    return param ? parseDateInputValue(param) : null;
  });
  const [claimedSlug, setClaimedSlug] = useState<ZodiacId | null>(
    getClaimedBeanSlug,
  );
  const [zodiac, setZodiac] = useState<Zodiac | null>(null);
  const [justClaimed, setJustClaimed] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [resultMounted, setResultMounted] = useState<boolean>(
    () => !!getDateParam(),
  );
  const [resultVisible, setResultVisible] = useState<boolean>(
    () => !!getDateParam(),
  );

  const [moreBeanLabel, setMoreBeanLabel] = useState(
    () =>
      MORE_BEANS_LABELS[Math.floor(Math.random() * MORE_BEANS_LABELS.length)],
  );

  const [highlighted, setHighlighted] = useState(() => !!getDateParam());

  const [beansVisible, setBeansVisible] = useState(false);
  const [beansLetterCount, setBeansLetterCount] = useState(0);

  // Compatibility state
  const compatGenerationRef = useRef(0);
  const [compatMounted, setCompatMounted] = useState(false);
  const [compatVisible, setCompatVisible] = useState(false);
  const [compatKey, setCompatKey] = useState(0);
  const [compatMetaA, setCompatMetaA] = useState<MetaSlice | null>(null);
  const [compatMetaB, setCompatMetaB] = useState<MetaSlice | null>(null);
  const [compatRevealedCount, setCompatRevealedCount] = useState(0);
  const [compatCalculatingText, setCompatCalculatingText] = useState<
    string | null
  >(null);
  const [compatCalculatingVisible, setCompatCalculatingVisible] =
    useState(false);

  useEffect(() => {
    if (selectedDate && !zodiac) {
      const zodiacId = getZodiacMetadataForDate(selectedDate).zodiacId;
      fetchZodiac(zodiacId).then(setZodiac);
    }
  }, []);

  const controlsHidden = spinning || resultMounted;

  // Whether to show the compat button: claimed bean exists and result is for a different zodiac
  const showCompatButton =
    claimedSlug &&
    selectedDate &&
    resultVisible &&
    !compatMounted &&
    getZodiacMetadataForDate(selectedDate).zodiacId !== claimedSlug;

  function handleReveal() {
    if (!inputDate) return;
    const parsed = parseDateInputValue(inputDate);
    if (parsed) {
      setZodiac(null);
      const discoveredZodiacId = getZodiacMetadataForDate(parsed).zodiacId;
      fetchZodiac(discoveredZodiacId).then(setZodiac);
      addMetBean(discoveredZodiacId);
      setHighlighted(true);
      setSpinning(true);
      setResultMounted(false);
      setResultVisible(false);
      setSelectedDate(parsed);
      // Reset compat when spinning to a new date
      setCompatMounted(false);
      setCompatVisible(false);
      compatGenerationRef.current++;
      const url = new URL(window.location.href);
      url.searchParams.set("date", inputDate);
      window.history.pushState({}, "", url);

      setBeansLetterCount(0);
      setBeansVisible(true);
      let count = 0;
      const letterTimer = setInterval(() => {
        count++;
        setBeansLetterCount(count);
        if (count >= BEANS_LETTERS.length) clearInterval(letterTimer);
      }, LETTER_INTERVAL);

      setTimeout(() => setBeansVisible(false), SPIN_DURATION_MS - 500);
      if (wheelRef.current) smoothScrollToCenter(wheelRef.current, 600);

      setTimeout(() => {
        setSpinning(false);
        setResultMounted(true);
        setTimeout(
          () => requestAnimationFrame(() => setResultVisible(true)),
          RESULT_MOUNT_DELAY_MS,
        );
      }, SPIN_DURATION_MS);
    }
  }

  function handleClaim() {
    if (!selectedDate) return;
    const { flavourId, formId, beanId } =
      getZodiacMetadataForDate(selectedDate);
    const slug: ZodiacId = `${flavourId}-${formId}-${beanId}`;
    setClaimedBeanSlug(slug);
    setClaimedSlug(slug);
    setJustClaimed(true);
  }

  function handleReset() {
    setHighlighted(false);
    setJustClaimed(false);
    setSpinning(true);
    setResultVisible(false);
    setCompatMounted(false);
    setCompatVisible(false);
    compatGenerationRef.current++;
    setTimeout(() => {
      setResultMounted(false);
      setSpinning(false);
      setMoreBeanLabel(
        MORE_BEANS_LABELS[Math.floor(Math.random() * MORE_BEANS_LABELS.length)],
      );
      const url = new URL(window.location.href);
      url.searchParams.delete("date");
      window.history.pushState({}, "", url);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, FADE_MS);
  }

  function handleCheckCompatibility() {
    if (!claimedSlug || !selectedDate) return;

    const generation = ++compatGenerationRef.current;
    const guard = (fn: () => void) => () => {
      if (compatGenerationRef.current === generation) fn();
    };

    const resolvedMetaA = parseClaimedSlug(claimedSlug);
    const resolvedMetaB: MetaSlice = getZodiacMetadataForDate(selectedDate);

    setCompatRevealedCount(0);
    setCompatCalculatingVisible(false);

    setCompatMetaA(resolvedMetaA);
    setCompatMetaB(resolvedMetaB);
    setCompatKey((k) => k + 1);
    setCompatMounted(true);
    setCompatVisible(true);

    const shuffled = [...CALCULATING_TEXTS].sort(() => Math.random() - 0.5);
    const texts = shuffled.slice(0, CALC_NUM_TEXTS);

    setCompatCalculatingText(texts[0]);
    requestAnimationFrame(guard(() => setCompatCalculatingVisible(true)));

    for (let i = 1; i < CALC_NUM_TEXTS; i++) {
      setTimeout(
        guard(() => setCompatCalculatingVisible(false)),
        i * CALC_CYCLE_MS - CALC_FADE_MS,
      );
      setTimeout(
        guard(() => {
          setCompatCalculatingText(texts[i]);
          requestAnimationFrame(guard(() => setCompatCalculatingVisible(true)));
        }),
        i * CALC_CYCLE_MS,
      );
    }

    const revealAt = CALC_NUM_TEXTS * CALC_CYCLE_MS;
    setTimeout(
      guard(() => setCompatCalculatingVisible(false)),
      revealAt - CALC_FADE_MS,
    );
    setTimeout(
      guard(() => {
        setCompatCalculatingText(null);
        for (let i = 1; i <= 4; i++) {
          setTimeout(
            guard(() => setCompatRevealedCount(i)),
            i * REVEAL_STEP_MS,
          );
        }
      }),
      revealAt,
    );
  }

  return (
    <div ref={topRef} className="flex flex-col items-center text-center w-full">
      <div ref={wheelRef} className="relative w-full flex justify-center">
        <ZodiacWheel
          date={selectedDate ?? new Date(1933, 2, 12)}
          highlight={selectedDate !== null && highlighted}
          beansLetterCount={beansLetterCount}
          beansVisible={beansVisible}
        />
        <div
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${resultVisible ? "opacity-100" : "opacity-0"}`}
          style={{ filter: "drop-shadow(0 0 8px rgba(161,161,170,0.7))" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a1a1aa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 animate-bounce"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
      <div
        className={`relative w-full flex items-center justify-center overflow-hidden transition-[height,opacity] duration-300 ${resultMounted ? "h-0" : "h-36"}`}
      >
        <section
          className={`absolute w-full px-6 flex flex-col items-center gap-3 transition-opacity duration-300 ${
            controlsHidden
              ? "opacity-0 pointer-events-none select-none"
              : "opacity-100"
          }`}
        >
          <input
            type="date"
            className="bg-zinc-900/80 border-2 border-zinc-700/60 text-white rounded-xl px-4 py-2.5 cursor-pointer backdrop-blur-sm transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 hover:border-zinc-600 [&::-webkit-calendar-picker-indicator]:hidden"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
          />
          <button
            onClick={handleReveal}
            className="bg-zinc-900/80 border-2 border-zinc-500/60 text-white rounded-xl px-8 py-4 text-lg font-bold backdrop-blur-sm transition-[border-color,background-color,color] duration-200 hover:border-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer"
          >
            Discover the Bean Within
          </button>
        </section>
      </div>
      {resultMounted && selectedDate && (
        <div
          className={`my-4 sm:my-6 w-full transition-opacity duration-300 ${
            resultVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <ZodiacIdentity
            key={selectedDate.getTime()}
            data={data}
            zodiac={zodiac}
            date={selectedDate}
            onClaim={handleClaim}
            claimed={justClaimed}
            hasClaimed={!!claimedSlug && !justClaimed}
          />

          {showCompatButton && (
            <div className="mt-8 animate-fade-up">
              <button
                onClick={handleCheckCompatibility}
                className="link text-base text-zinc-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                Check Compatibility →
              </button>
            </div>
          )}

          {compatMounted && compatMetaA && compatMetaB && (
            <div
              className={`mt-10 px-4 py-6 w-full flex flex-col items-center gap-8 transition-opacity duration-300 ${
                compatVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <CompatibilityResult
                key={compatKey}
                data={data}
                metaA={compatMetaA}
                metaB={compatMetaB}
                revealedCount={compatRevealedCount}
                calculatingText={compatCalculatingText}
                calculatingVisible={compatCalculatingVisible}
              />
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-6">
            <button
              onClick={handleReset}
              className="link text-base text-zinc-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              {moreBeanLabel}{" "}
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
          </div>
        </div>
      )}
    </div>
  );
}

function getDateParam(): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("date");
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function smoothScrollToCenter(el: HTMLElement, duration = 1200) {
  const rect = el.getBoundingClientRect();
  const targetY =
    window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
  const startY = window.scrollY;
  const diff = targetY - startY;
  const start = performance.now();
  function step(now: number) {
    const t = Math.min((now - start) / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    window.scrollTo(0, startY + diff * ease);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function parseDateInputValue(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
