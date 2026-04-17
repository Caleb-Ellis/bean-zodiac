import { useRef, useState } from "react";
import { type ZodiacData } from "../lib/zodiac";
import ZodiacWheel from "./ZodiacWheel";
import ZodiacIdentity from "./ZodiacIdentity";

type Props = {
  data: ZodiacData;
};

const SPIN_DURATION_MS = 3700;
const FADE_MS = 300;
const RESULT_MOUNT_DELAY_MS = 150;

const BEANS_LETTERS = [
  "B",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "A",
  "N",
  "S",
  "!",
];
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

export default function ZodiacCalendar({ data }: Props) {
  const [inputDate, setInputDate] = useState<string>(() => {
    const param = getDateParam();
    return param ?? "2001-01-01";
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const param = getDateParam();
    return param ? parseDateInputValue(param) : null;
  });
  const topRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(false);
  // resultMounted: whether the result is in the DOM at all
  const [resultMounted, setResultMounted] = useState<boolean>(
    () => !!getDateParam(),
  );
  // resultVisible: drives the opacity transition (mount first, then set true)
  const [resultVisible, setResultVisible] = useState<boolean>(
    () => !!getDateParam(),
  );

  const [moreBeanLabel, setMoreBeanLabel] = useState(
    () =>
      MORE_BEANS_LABELS[Math.floor(Math.random() * MORE_BEANS_LABELS.length)],
  );

  const [beansMounted, setBeansMounted] = useState(false);
  const [beansVisible, setBeansVisible] = useState(false);
  const [beansLetterCount, setBeansLetterCount] = useState(0);

  // Controls are hidden while wheel is spinning or result is mounted (even pre-fade-in)
  const controlsHidden = spinning || resultMounted;

  function handleReveal() {
    if (!inputDate) return;
    const parsed = parseDateInputValue(inputDate);
    if (parsed) {
      setSpinning(true);
      setResultMounted(false);
      setResultVisible(false);
      setSelectedDate(parsed);
      const url = new URL(window.location.href);
      url.searchParams.set("date", inputDate);
      window.history.pushState({}, "", url);

      // Stream in BEANS letters
      setBeansMounted(true);
      setBeansLetterCount(0);
      setBeansVisible(false);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setBeansVisible(true)),
      );
      let count = 0;
      const letterTimer = setInterval(() => {
        count++;
        setBeansLetterCount(count);
        if (count >= BEANS_LETTERS.length) clearInterval(letterTimer);
      }, LETTER_INTERVAL);

      setTimeout(() => setBeansVisible(false), SPIN_DURATION_MS - 500);
      setTimeout(
        () => setBeansMounted(false),
        SPIN_DURATION_MS - 500 + FADE_MS,
      );

      setTimeout(() => {
        setSpinning(false);
        setResultMounted(true);
        // Delay so the browser paints opacity-0 before transitioning to opacity-100
        setTimeout(
          () => requestAnimationFrame(() => setResultVisible(true)),
          RESULT_MOUNT_DELAY_MS,
        );
      }, SPIN_DURATION_MS);
    }
  }

  function handleReset() {
    setSpinning(true); // keep controls hidden while result fades out
    setResultVisible(false);
    setTimeout(() => {
      setResultMounted(false);
      setSpinning(false);
      setMoreBeanLabel(
        MORE_BEANS_LABELS[Math.floor(Math.random() * MORE_BEANS_LABELS.length)],
      );
      const url = new URL(window.location.href);
      url.searchParams.delete("date");
      window.history.pushState({}, "", url);
      // Scroll after unmount so the page height is settled — no bounce
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, FADE_MS);
  }

  return (
    <div ref={topRef} className="flex flex-col items-center text-center w-full">
      <ZodiacWheel
        date={selectedDate ?? new Date(1933, 2, 12)}
        highlight={selectedDate !== null}
      />
      {/* Fixed-height slot — controls and BEANS text both live here so layout never shifts */}
      <div
        className={`relative w-full flex items-center justify-center overflow-hidden transition-all duration-300 ${resultMounted ? "h-0" : "h-36"}`}
      >
        <section
          className={`absolute flex flex-col items-center gap-3 transition-opacity duration-300 ${
            controlsHidden
              ? "opacity-0 pointer-events-none select-none"
              : "opacity-100"
          }`}
        >
          <input
            type="date"
            className="bg-zinc-900/80 border border-zinc-700/60 text-white rounded-xl px-4 py-2.5 cursor-pointer backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 hover:border-zinc-600"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
          />
          <button
            onClick={handleReveal}
            className="bg-zinc-900/80 border border-zinc-500/60 text-white rounded-xl px-8 py-4 text-lg font-bold backdrop-blur-sm transition-all duration-200 hover:border-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer"
          >
            Discover the Bean Within
          </button>
        </section>
        {beansMounted && (
          <div
            className={`absolute transition-opacity duration-300 ${
              beansVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-3xl sm:text-5xl font-bold text-white flex gap-[0.1em]">
              {BEANS_LETTERS.map((letter, i) => (
                <span
                  key={i}
                  className={`transition-all duration-300 ${i < beansLetterCount ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                >
                  {letter}
                </span>
              ))}
            </p>
          </div>
        )}
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
            date={selectedDate}
          />
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleReset}
              className="bg-zinc-900/80 border border-zinc-500/60 text-white rounded-xl px-8 py-4 text-lg font-bold backdrop-blur-sm transition-all duration-200 hover:border-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer"
            >
              {moreBeanLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Returns the `date` query param value (YYYY-MM-DD) if present and valid.
function getDateParam(): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("date");
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function parseDateInputValue(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
