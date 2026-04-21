import { useRef, useState } from "react";
import {
  getBeanCompatibility,
  getFlavourCompatibility,
  getFormCompatibility,
  getTotalCompatibility,
} from "../lib/compatibility";
import {
  FLAVOUR_EMOJI,
  FORM_EMOJI,
  getPreparationName,
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacData,
} from "../lib/zodiac";
import Bean from "./Bean";

type Props = {
  data: ZodiacData;
};

const REVEAL_STEP_MS = 320;

const CALC_VISIBLE_MS = 1600;
const CALC_FADE_MS = 400;
const CALC_CYCLE_MS = CALC_VISIBLE_MS + CALC_FADE_MS; // 2000ms
const CALC_NUM_TEXTS = 3; // total 6000ms

const CALCULATING_TEXTS = [
  "Consulting Bean astrologers...",
  "Divining broth...",
  "Reading pod lines...",
  "Steeping results...",
  "Consulting ancient legume scrolls...",
  "Referencing harvest charts...",
  "Asking elders of the pod...",
];

export default function ZodiacCompatibility({ data }: Props) {
  const [inputA, setInputA] = useState<string>(
    () => getParam("a") ?? "2001-01-01",
  );
  const [inputB, setInputB] = useState<string>(
    () => getParam("b") ?? "2001-01-01",
  );
  const [dateA, setDateA] = useState<Date | null>(() => {
    const p = getParam("a");
    return p ? parseDate(p) : null;
  });
  const [dateB, setDateB] = useState<Date | null>(() => {
    const p = getParam("b");
    return p ? parseDate(p) : null;
  });
  const [resultMounted, setResultMounted] = useState(
    () => !!(getParam("a") && getParam("b")),
  );
  const [resultVisible, setResultVisible] = useState(
    () => !!(getParam("a") && getParam("b")),
  );
  const [resultKey, setResultKey] = useState(0);
  const [revealedCount, setRevealedCount] = useState(() =>
    getParam("a") && getParam("b") ? 4 : 0,
  );
  const [calculatingText, setCalculatingText] = useState<string | null>(null);
  const [calculatingVisible, setCalculatingVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(
    () => !(getParam("a") && getParam("b")),
  );
  const generationRef = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);

  function handleCompare() {
    if (!inputA || !inputB) return;
    const generation = ++generationRef.current;
    const guard = (fn: () => void) => () => {
      if (generationRef.current === generation) fn();
    };

    const a = parseDate(inputA);
    const b = parseDate(inputB);
    const url = new URL(window.location.href);
    url.searchParams.set("a", inputA);
    url.searchParams.set("b", inputB);
    window.history.pushState({}, "", url);

    setFormVisible(false);
    setRevealedCount(0);
    setCalculatingVisible(false);

    const mount = guard(() => {
      setDateA(a);
      setDateB(b);
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
      const url = new URL(window.location.href);
      url.searchParams.delete("a");
      url.searchParams.delete("b");
      window.history.pushState({}, "", url);
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

      {resultMounted && dateA && dateB && (
        <div
          className={`w-full flex flex-col items-center gap-8 transition-opacity duration-300 ${
            resultVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <CompatibilityResult
            key={resultKey}
            data={data}
            dateA={dateA}
            dateB={dateB}
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

function CompatibilityResult({
  data,
  dateA,
  dateB,
  revealedCount,
  calculatingText,
  calculatingVisible,
}: {
  data: ZodiacData;
  dateA: Date;
  dateB: Date;
  revealedCount: number;
  calculatingText: string | null;
  calculatingVisible: boolean;
}) {
  const metaA = getZodiacMetadataForDate(dateA);
  const metaB = getZodiacMetadataForDate(dateB);

  const beanA = data.beans[metaA.beanId];
  const flavourA = data.flavours[metaA.flavourId];
  const formA = data.forms[metaA.formId];

  const beanB = data.beans[metaB.beanId];
  const flavourB = data.flavours[metaB.flavourId];
  const formB = data.forms[metaB.formId];

  const prepA = getPreparationName(metaA.flavourId, metaA.formId);
  const prepB = getPreparationName(metaB.flavourId, metaB.formId);

  const beanCompat = getBeanCompatibility(metaA.beanId, metaB.beanId);
  const flavourCompat = getFlavourCompatibility(
    metaA.flavourId,
    metaB.flavourId,
  );
  const formCompat = getFormCompatibility(metaA.formId, metaB.formId);
  const total = getTotalCompatibility(metaA, metaB);

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-fade-up">
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center sm:items-start w-full max-w-2xl">
        <MiniIdentity
          beanSlug={beanA.slug}
          beanName={beanA.name}
          flavourSlug={flavourA.slug}
          formSlug={formA.slug}
          preparation={prepA}
          bean={beanA}
          flavourId={metaA.flavourId}
          formId={metaA.formId}
        />
        <div className="flex items-center self-center text-zinc-600 text-3xl font-thin">
          ×
        </div>
        <MiniIdentity
          beanSlug={beanB.slug}
          beanName={beanB.name}
          flavourSlug={flavourB.slug}
          formSlug={formB.slug}
          preparation={prepB}
          bean={beanB}
          flavourId={metaB.flavourId}
          formId={metaB.formId}
        />
      </div>

      <div className="relative h-0 w-full mt-4">
        {calculatingText && (
          <p
            className={`absolute inset-x-0 text-center text-zinc-300 text-lg italic transition-opacity duration-400 ${
              calculatingVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {calculatingText}
          </p>
        )}
      </div>

      {revealedCount >= 1 && (
        <div className="w-full max-w-lg flex flex-col gap-3">
          <div className="animate-fade-up">
            <DimensionRow
              label="Flavour"
              compat={flavourCompat}
              pairA={{ name: flavourA.name, colorClass: `flavour-${flavourA.slug}`, emoji: FLAVOUR_EMOJI[metaA.flavourId], href: `/flavours/${flavourA.slug}` }}
              pairB={{ name: flavourB.name, colorClass: `flavour-${flavourB.slug}`, emoji: FLAVOUR_EMOJI[metaB.flavourId], href: `/flavours/${flavourB.slug}` }}
            />
          </div>
          {revealedCount >= 2 && (
            <div className="animate-fade-up">
              <DimensionRow
                label="Form"
                compat={formCompat}
                pairA={{ name: formA.name, colorClass: `form-${formA.slug}`, emoji: FORM_EMOJI[metaA.formId], href: `/forms/${formA.slug}` }}
                pairB={{ name: formB.name, colorClass: `form-${formB.slug}`, emoji: FORM_EMOJI[metaB.formId], href: `/forms/${formB.slug}` }}
              />
            </div>
          )}
          {revealedCount >= 3 && (
            <div className="animate-fade-up">
              <DimensionRow
                label="Bean"
                compat={beanCompat}
                pairA={{ name: beanA.name, colorClass: `bean-${beanA.slug}`, emoji: "🫘", href: `/beans/${beanA.slug}` }}
                pairB={{ name: beanB.name, colorClass: `bean-${beanB.slug}`, emoji: "🫘", href: `/beans/${beanB.slug}` }}
              />
            </div>
          )}
        </div>
      )}

      {revealedCount >= 4 && (
        <div className="animate-fade-up bg-zinc-900/80 border-2 border-zinc-700/60 rounded-xl px-6 py-5 my-4 max-w-lg w-full text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Overall
          </p>
          <p className="text-2xl sm:text-3xl font-bold mb-2">
            <span className={scoreColor(total.score)}>{total.label}</span>
          </p>
          <p className="text-zinc-300 text-sm">{total.description}</p>
        </div>
      )}
    </div>
  );
}

function MiniIdentity({
  beanSlug,
  beanName,
  flavourSlug,
  formSlug,
  preparation,
  bean,
  flavourId,
  formId,
}: {
  beanSlug: string;
  beanName: string;
  flavourSlug: string;
  formSlug: string;
  preparation: string;
  bean: ZodiacData["beans"][BeanId];
  flavourId: FlavourId;
  formId: FormId;
}) {
  return (
    <div className="flex flex-col items-center gap-7 flex-1 text-center">
      <div className="h-48 flex items-center justify-center">
        <Bean bean={bean} flavourId={flavourId} formId={formId} />
      </div>
      <p className="font-bold text-lg leading-tight">
        <span
          style={{
            background: `linear-gradient(135deg, var(--flavour-${flavourSlug}) 60%, var(--form-${formSlug}) 75%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: `url(#form-${formSlug}-filter) saturate(1.8) brightness(1.2)`,
          }}
        >
          {preparation}
        </span>{" "}
        <span className={`bean-${beanSlug}`}>{beanName}</span>
      </p>
    </div>
  );
}

function DimensionRow({
  label,
  compat,
  pairA,
  pairB,
}: {
  label: string;
  compat: { score: number; label: string; description: string };
  pairA: { name: string; colorClass: string; emoji: string; href: string };
  pairB: { name: string; colorClass: string; emoji: string; href: string };
}) {
  return (
    <div className="bg-zinc-900/80 border-2 border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="flex flex-col items-center gap-1 w-20 shrink-0">
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          {label}
        </span>
        <span className={`text-lg font-bold ${scoreColor(compat.score)}`}>
          {compat.score > 0 ? `+${compat.score}` : compat.score}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-white text-sm">{compat.label}</span>
        <span className="flex items-center gap-1 text-xs my-1.5 flex-wrap">
          <a href={pairA.href} className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors no-underline ${pairA.colorClass}`}>
            <span>{pairA.emoji}</span>{pairA.name}
          </a>
          <span className="text-zinc-600">×</span>
          <a href={pairB.href} className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors no-underline ${pairB.colorClass}`}>
            <span>{pairB.emoji}</span>{pairB.name}
          </a>
        </span>
        <span className="text-zinc-400 text-sm">{compat.description}</span>
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 4) return "score-gold";
  if (score === 3) return "score-gleam";
  if (score === 2) return "text-emerald-400";
  if (score === 1) return "text-green-500";
  if (score === 0) return "text-zinc-400";
  if (score === -1) return "text-amber-500";
  if (score === -2) return "text-red-400";
  if (score === -3) return "score-smolder";
  return "score-rot";
}

function getParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(key);
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function parseDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
