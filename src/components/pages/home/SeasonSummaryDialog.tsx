import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  getPreparationName,
  type BeanId,
  type FlavourId,
  type FormId,
} from "../../../lib/zodiac";
import type { AllZodiacData } from "../../../lib/data";
import {
  seasonZodiacsForKey,
  type SeasonSummary,
} from "../../../lib/seasonSummary";
import Divider from "../../ui/Divider";
import Bean from "../../zodiac/Bean";
import ZodiacName from "../../zodiac/ZodiacName";
import RitualCardShell from "./RitualCardShell";
import zodiacTraits from "../../../data/generated/zodiac-traits.json";

const TRAITS = zodiacTraits as Record<string, { trait: string }>;

// How long the outgoing step takes to fade before the next one mounts. Must
// match the `duration-350` class on the fading wrapper.
const STEP_FADE_MS = 350;

interface Props {
  data: AllZodiacData;
  summary: SeasonSummary;
  onClose: () => void;
}

export default function SeasonSummaryDialog({ data, summary, onClose }: Props) {
  // The reading is delivered one beat at a time: the season that closes, each
  // observation on its own, then the season that opens.
  const [step, setStep] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    },
    [],
  );

  const { prevZodiacId, nextZodiacId } = seasonZodiacsForKey(summary.seasonKey);
  const [prevFlavourId, prevFormId, prevBeanId] = prevZodiacId.split("-") as [
    FlavourId,
    FormId,
    BeanId,
  ];
  const [nextFlavourId, nextFormId, nextBeanId] = nextZodiacId.split("-") as [
    FlavourId,
    FormId,
    BeanId,
  ];

  const prevBean = data.beans[prevBeanId];
  const nextBean = data.beans[nextBeanId];
  if (!prevBean || !nextBean) return null;

  const prevPrep = getPreparationName(prevFlavourId, prevFormId);
  const nextPrep = getPreparationName(nextFlavourId, nextFormId);

  const steps: ReactNode[] = [
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs tracking-widest uppercase text-zinc-400 text-center text-balance leading-relaxed">
        Thus ends the{" "}
        <strong className="font-bold">{TRAITS[prevZodiacId]?.trait}</strong>{" "}
        season of
        the
      </p>
      <Bean
        bean={prevBean}
        flavourId={prevFlavourId}
        formId={prevFormId}
        animateGlow
        maxHeight="7rem"
      />
      <strong>
        <ZodiacName
          flavourId={prevFlavourId}
          formId={prevFormId}
          beanId={prevBeanId}
          preparation={prevPrep}
          beanName={prevBean.name}
          zodiacId={prevZodiacId}
          asLink={false}
        />
      </strong>
    </div>,
    ...summary.observations.map((line) => (
      <p className="text-zinc-300 text-sm sm:text-base text-center text-balance italic leading-normal">
        {line}
      </p>
    )),
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs tracking-widest uppercase text-zinc-400 text-balance text-center leading-relaxed">
        Now we enter the{" "}
        <strong className="font-bold">{TRAITS[nextZodiacId]?.trait}</strong>{" "}
        season of
        the
      </p>
      <Bean
        bean={nextBean}
        flavourId={nextFlavourId}
        formId={nextFormId}
        maxHeight="7rem"
      />
      <strong>
        <ZodiacName
          flavourId={nextFlavourId}
          formId={nextFormId}
          beanId={nextBeanId}
          preparation={nextPrep}
          beanName={nextBean.name}
          zodiacId={nextZodiacId}
          asLink={false}
        />
      </strong>
    </div>,
  ];

  const isLast = step >= steps.length - 1;

  const advance = () => {
    if (isLast) {
      onClose();
      return;
    }
    setFadingOut(true);
    fadeTimer.current = setTimeout(() => {
      setStep((s) => s + 1);
      setFadingOut(false);
    }, STEP_FADE_MS);
  };

  return (
    <RitualCardShell
      flavourId={prevFlavourId}
      formId={prevFormId}
      beanId={prevBeanId}
      revealLabel="The Wheel Turns"
    >
      {() => (
        <div
          className="w-full transition-opacity duration-350 my-2"
          style={{
            opacity: fadingOut ? 0 : 1,
            pointerEvents: fadingOut ? "none" : "auto",
          }}
        >
          <div
            key={step}
            className="flex flex-col items-center gap-4 animate-fade-up"
            style={{ animationDuration: "500ms" }}
          >
            <div className="w-4/5">
              <Divider />
            </div>

            {steps[step]}

            <div className="w-4/5">
              <Divider />
            </div>

            <button
              onClick={advance}
              className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer bg-transparent text-sm"
            >
              {isLast ? "Begin" : "Continue"} <span className="text-xs">→</span>
            </button>
          </div>
        </div>
      )}
    </RitualCardShell>
  );
}
