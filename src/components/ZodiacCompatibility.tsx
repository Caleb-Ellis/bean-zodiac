import { useRef, useState } from "react";
import {
  getBeanCompatibility,
  getFlavourCompatibility,
  getFormCompatibility,
  getSpecialCompatibilityDetail,
  getTotalCompatibility,
  type SpecialCompatDetail,
} from "../lib/compatibility";
import {
  getPreparationName,
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacId,
} from "../lib/zodiac";
import { type AllZodiacData } from "../lib/data";
import BeanBadge from "./BeanBadge";
import FlavourBadge from "./FlavourBadge";
import FormBadge from "./FormBadge";
import MiniIdentity from "./MiniIdentity";
import { getClaimedBeanSlug } from "../lib/claimedBean";

type MetaSlice = { beanId: BeanId; flavourId: FlavourId; formId: FormId };

type Props = {
  data: AllZodiacData;
};

const REVEAL_STEP_MS = 320;

const CALC_VISIBLE_MS = 1600;
const CALC_FADE_MS = 400;
const CALC_CYCLE_MS = CALC_VISIBLE_MS + CALC_FADE_MS;
const CALC_NUM_TEXTS = 2;

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
  const [inputA, setInputA] = useState("2001-01-01");
  const [inputB, setInputB] = useState(() => {
    if (typeof window !== "undefined") {
      const b = new URLSearchParams(window.location.search).get("b");
      if (b) return b;
    }
    return "2001-01-01";
  });

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

function CompatibilityResult({
  data,
  metaA,
  metaB,
  revealedCount,
  calculatingText,
  calculatingVisible,
}: {
  data: AllZodiacData;
  metaA: MetaSlice;
  metaB: MetaSlice;
  revealedCount: number;
  calculatingText: string | null;
  calculatingVisible: boolean;
}) {
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
  const specialDetail = getSpecialCompatibilityDetail(metaA, metaB);
  const total = getTotalCompatibility(metaA, metaB);

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-fade-up">
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center sm:items-start w-full max-w-2xl">
        <MiniIdentity
          beanId={metaA.beanId}
          beanName={beanA.name}
          preparation={prepA}
          bean={beanA}
          flavourId={metaA.flavourId}
          formId={metaA.formId}
        />
        <div className="flex items-center self-center text-zinc-600 text-3xl font-thin">
          ×
        </div>
        <MiniIdentity
          beanId={metaB.beanId}
          beanName={beanB.name}
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
              badgeA={
                <FlavourBadge small id={metaA.flavourId} name={flavourA.name} />
              }
              badgeB={
                <FlavourBadge small id={metaB.flavourId} name={flavourB.name} />
              }
            />
          </div>
          {revealedCount >= 2 && (
            <div className="animate-fade-up">
              <DimensionRow
                label="Form"
                compat={formCompat}
                badgeA={<FormBadge small id={metaA.formId} name={formA.name} />}
                badgeB={<FormBadge small id={metaB.formId} name={formB.name} />}
              />
            </div>
          )}
          {revealedCount >= 3 && (
            <div className="animate-fade-up">
              <DimensionRow
                label="Bean"
                compat={beanCompat}
                badgeA={<BeanBadge small id={metaA.beanId} name={beanA.name} />}
                badgeB={<BeanBadge small id={metaB.beanId} name={beanB.name} />}
              />
            </div>
          )}
          {revealedCount >= 4 && specialDetail && (
            <div className="animate-fade-up">
              <DimensionRow
                label="Special"
                compat={specialDetail.entry}
                badgeA={attrBadge(
                  specialDetail.attrA,
                  metaA,
                  beanA,
                  flavourA,
                  formA,
                )}
                badgeB={attrBadge(
                  specialDetail.attrB,
                  metaB,
                  beanB,
                  flavourB,
                  formB,
                )}
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

function DimensionRow({
  label,
  compat,
  badgeA,
  badgeB,
}: {
  label: string;
  compat: { score: number; label: string; description: string };
  badgeA: React.ReactNode;
  badgeB: React.ReactNode;
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
          {badgeA}
          <span className="text-zinc-600">×</span>
          {badgeB}
        </span>
        <span className="text-zinc-400 text-sm">{compat.description}</span>
      </div>
    </div>
  );
}

function attrBadge(
  attr: "bean" | "flavour" | "form",
  meta: MetaSlice,
  bean: { name: string },
  flavour: { name: string },
  form: { name: string },
) {
  if (attr === "bean")
    return <BeanBadge small id={meta.beanId} name={bean.name} />;
  if (attr === "flavour")
    return <FlavourBadge small id={meta.flavourId} name={flavour.name} />;
  return <FormBadge small id={meta.formId} name={form.name} />;
}

function scoreColor(score: number): string {
  if (score >= 4) return "text-effect-gold";
  if (score === 3) return "text-effect-emerald";
  if (score === 2) return "text-emerald-400";
  if (score === 1) return "text-green-500";
  if (score === 0) return "text-zinc-400";
  if (score === -1) return "text-red-400";
  if (score === -2) return "text-effect-bruise";
  return "text-effect-rot";
}

function parseDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
