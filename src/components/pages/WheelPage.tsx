import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import DateInput from "../ui/DateInput";
import {
  getZodiacMetadataForDate,
  type Zodiac,
  type ZodiacId,
} from "../../lib/zodiac";
import { fetchZodiac, type AllZodiacData } from "../../lib/data";
import { useStore } from "../../store";
import ZodiacWheel, { BEANS_LETTERS } from "./wheel/ZodiacWheel";
import ZodiacResultCard from "./wheel/ZodiacResultCard";

type Props = {
  data: AllZodiacData;
};

const SPIN_DURATION_MS = 4930;
const FADE_MS = 300;
const RESULT_MOUNT_DELAY_MS = 150;

const LETTER_INTERVAL = Math.floor(2670 / BEANS_LETTERS.length);

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

export default function WheelPage({ data }: Props) {
  const [inputDate, setInputDate] = useState<string>(() => {
    const param = getDateParam();
    return param ?? "2001-01-01";
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const param = getDateParam();
    return param ? parseDateInputValue(param) : null;
  });
  const [claimedSlug, setClaimedSlug] = useState<ZodiacId | null>(
    () => useStore.getState().claimed?.id ?? null,
  );
  const [zodiac, setZodiac] = useState<Zodiac | null>(null);
  const [justClaimed, setJustClaimed] = useState(false);
  const navigate = useNavigate();
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

  useEffect(() => {
    if (selectedDate && !zodiac) {
      const zodiacId = getZodiacMetadataForDate(selectedDate).zodiacId;
      fetchZodiac(zodiacId).then(setZodiac);
    }
  }, []);

  const controlsHidden = spinning || resultMounted;

  function handleReveal() {
    if (!inputDate) return;
    const parsed = parseDateInputValue(inputDate);
    if (parsed) {
      setZodiac(null);
      const discoveredZodiacId = getZodiacMetadataForDate(parsed).zodiacId;
      fetchZodiac(discoveredZodiacId).then(setZodiac);
      useStore.getState().addMetBean(discoveredZodiacId);
      setHighlighted(true);
      setSpinning(true);
      setResultMounted(false);
      setResultVisible(false);
      setSelectedDate(parsed);
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

      setTimeout(() => setBeansVisible(false), SPIN_DURATION_MS - 670);
      if (wheelRef.current) smoothScrollToCenter(wheelRef.current, 800);

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
    useStore.getState().setClaimed(slug);
    setClaimedSlug(slug);
    setJustClaimed(true);
  }

  function handleContinue() {
    setResultVisible(false);
    // ClaimedHome opens the first ritual by itself.
    setTimeout(() => navigate({ to: "/" }), FADE_MS);
  }

  function handleReset() {
    setHighlighted(false);
    setSpinning(true);
    setResultVisible(false);
    setTimeout(() => {
      setResultMounted(false);
      setSpinning(false);
      setMoreBeanLabel(
        MORE_BEANS_LABELS[Math.floor(Math.random() * MORE_BEANS_LABELS.length)],
      );
      // Through the router rather than pushState: the router sees a raw pushState
      // too, and treats it as a navigation that resets scroll to the top.
      navigate({ to: "/wheel", search: {}, resetScroll: false });
    }, FADE_MS);
  }

  return (
    <div className="flex flex-col items-center text-center w-full">
      <div ref={wheelRef} className="relative w-full flex justify-center">
        <ZodiacWheel
          date={
            selectedDate ??
            new Date(
              new Date().getFullYear() - 60,
              new Date().getMonth(),
              new Date().getDate(),
            )
          }
          highlight={selectedDate !== null && highlighted}
          idle={selectedDate === null}
          beansLetterCount={beansLetterCount}
          beansVisible={beansVisible}
        />
      </div>
      <div className="relative w-full flex items-center justify-center overflow-hidden h-40">
        <section
          className={`absolute w-full px-6 flex flex-col items-center gap-3 transition-opacity duration-300 ${
            controlsHidden
              ? "opacity-0 pointer-events-none select-none"
              : "opacity-100"
          }`}
        >
          <label className="text-xs uppercase tracking-widest text-zinc-400">
            {claimedSlug
              ? "What date interests you?"
              : "What date is special to you?"}
          </label>
          <DateInput value={inputDate} onChange={setInputDate} />
          <button
            onClick={handleReveal}
            className="bg-zinc-900/80 border-2 border-zinc-500/60 text-white rounded-xl px-8 py-4 text-lg font-bold backdrop-blur-sm transition-[border-color,background-color,color] duration-200 hover:border-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer"
          >
            {claimedSlug
              ? "Discover the Bean inside"
              : "Uncover the Bean within"}
          </button>
        </section>
      </div>
      {resultMounted && selectedDate && (
        <ZodiacResultCard
          key={selectedDate.getTime()}
          data={data}
          zodiac={zodiac}
          date={selectedDate}
          visible={resultVisible}
          hasClaimed={!!claimedSlug && !justClaimed}
          justClaimed={justClaimed}
          respinLabel={moreBeanLabel}
          onClaim={handleClaim}
          onRespin={handleReset}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}

function getDateParam(): string | null {
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
