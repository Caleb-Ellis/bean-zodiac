import { useRef, useState } from "react";
import {
  getBeanCompatibility,
  getFlavourCompatibility,
  getFormCompatibility,
  getTotalCompatibility,
} from "../lib/compatibility";
import {
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

const FADE_MS = 300;
const RESULT_MOUNT_DELAY_MS = 150;

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
  const topRef = useRef<HTMLDivElement>(null);

  function handleCompare() {
    if (!inputA || !inputB) return;
    const a = parseDate(inputA);
    const b = parseDate(inputB);
    const url = new URL(window.location.href);
    url.searchParams.set("a", inputA);
    url.searchParams.set("b", inputB);
    window.history.pushState({}, "", url);
    setDateA(a);
    setDateB(b);
    setResultMounted(false);
    setResultVisible(false);
    setTimeout(() => {
      setResultMounted(true);
      setTimeout(
        () => requestAnimationFrame(() => setResultVisible(true)),
        RESULT_MOUNT_DELAY_MS,
      );
    }, FADE_MS);
  }

  function handleReset() {
    setResultVisible(false);
    setTimeout(() => {
      setResultMounted(false);
      const url = new URL(window.location.href);
      url.searchParams.delete("a");
      url.searchParams.delete("b");
      window.history.pushState({}, "", url);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, FADE_MS);
  }

  return (
    <div ref={topRef} className="flex flex-col items-center w-full gap-16">
      <div className="flex flex-col items-center gap-6 w-64">
        <DateField label="First Bean" value={inputA} onChange={setInputA} />
        <DateField label="Second Bean" value={inputB} onChange={setInputB} />
        <button
          onClick={handleCompare}
          className="mt-5 w-full bg-zinc-900/80 border border-zinc-500/60 text-white rounded-xl px-8 py-2.5 text-base font-bold backdrop-blur-sm transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-800/80 cursor-pointer"
        >
          Compare Beans
        </button>
      </div>

      {resultMounted && dateA && dateB && (
        <div
          className={`w-full flex flex-col items-center gap-8 transition-opacity duration-300 ${
            resultVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <CompatibilityResult data={data} dateA={dateA} dateB={dateB} />
          <button
            onClick={handleReset}
            className="bg-zinc-900/80 border border-zinc-500/60 text-white rounded-xl px-8 py-4 text-lg font-bold backdrop-blur-sm transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-800/80 cursor-pointer"
          >
            Compare Different Beans
          </button>
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
        className="w-full bg-zinc-900/80 border border-zinc-700/60 text-white rounded-xl px-4 py-2.5 cursor-pointer backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 hover:border-zinc-600"
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
}: {
  data: ZodiacData;
  dateA: Date;
  dateB: Date;
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
    <div className="flex flex-col items-center gap-16 w-full animate-fade-up">
      {/* Two identity panels */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 justify-center items-center sm:items-start w-full max-w-2xl">
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

      {/* Compatibility breakdown */}
      <div className="w-full max-w-lg flex flex-col gap-3">
        <DimensionRow label="Bean" compat={beanCompat} />
        <DimensionRow label="Flavour" compat={flavourCompat} />
        <DimensionRow label="Form" compat={formCompat} />
      </div>

      {/* Total */}
      <div className="bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-6 py-5 backdrop-blur-sm max-w-lg w-full text-center">
        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">
          Overall
        </p>
        <p
          className={`text-2xl sm:text-3xl font-bold mb-2 ${scoreColor(total.score)}`}
        >
          {total.label}
        </p>
        <p className="text-zinc-300 text-sm">{total.description}</p>
      </div>
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
      <div className="h-56 flex items-center justify-center">
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
}: {
  label: string;
  compat: { score: number; label: string; description: string };
}) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl px-5 py-4 backdrop-blur-sm flex items-center gap-4">
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
        <span className="text-zinc-400 text-sm">{compat.description}</span>
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 2) return "text-emerald-400";
  if (score === 1) return "text-green-500";
  if (score === 0) return "text-zinc-400";
  if (score === -1) return "text-amber-500";
  return "text-red-400";
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
