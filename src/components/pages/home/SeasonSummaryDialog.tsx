import {
  getPreparationName,
  type BeanId,
  type FlavourId,
  type FormId,
} from "../../../lib/zodiac";
import type { AllZodiacData } from "../../../lib/data";
import type { SeasonSummary } from "../../../lib/seasonSummary";
import Divider from "../../ui/Divider";
import ZodiacName from "../../zodiac/ZodiacName";
import RitualCardShell from "./RitualCardShell";
import zodiacTraits from "../../../data/generated/zodiac-traits.json";

const TRAITS = zodiacTraits as Record<string, string>;

interface Props {
  data: AllZodiacData;
  summary: SeasonSummary;
  onClose: () => void;
}

export default function SeasonSummaryDialog({ data, summary, onClose }: Props) {
  const [prevFlavourId, prevFormId, prevBeanId] = summary.prevZodiacId.split(
    "-",
  ) as [FlavourId, FormId, BeanId];
  const [nextFlavourId, nextFormId, nextBeanId] = summary.nextZodiacId.split(
    "-",
  ) as [FlavourId, FormId, BeanId];

  const prevBean = data.beans[prevBeanId];
  const nextBean = data.beans[nextBeanId];
  if (!prevBean || !nextBean) return null;

  const prevPrep = getPreparationName(prevFlavourId, prevFormId);
  const nextPrep = getPreparationName(nextFlavourId, nextFormId);

  return (
    <RitualCardShell
      flavourId={prevFlavourId}
      formId={prevFormId}
      beanId={prevBeanId}
      revealLabel="The Wheel Turns"
    >
      {() => (
        <div
          className="flex flex-col items-center gap-4 animate-fade-up my-2"
          style={{ animationDuration: "500ms" }}
        >
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs tracking-widest uppercase text-zinc-400 text-center text-balance leading-relaxed">
              Thus ends the {TRAITS[summary.prevZodiacId]} season of the{" "}
              <strong>
                <ZodiacName
                  flavourId={prevFlavourId}
                  formId={prevFormId}
                  beanId={prevBeanId}
                  preparation={prevPrep}
                  beanName={prevBean.name}
                  zodiacId={summary.prevZodiacId}
                  asLink={false}
                />
              </strong>
            </p>
          </div>

          <div className="w-4/5">
            <Divider />
          </div>

          <ul className="flex flex-col items-center gap-3">
            {summary.observations.map((line, i) => (
              <li
                key={i}
                className="text-zinc-300 text-sm sm:text-base text-center text-balance italic leading-normal animate-fade-up"
                style={{
                  animationDelay: `${200 + i * 200}ms`,
                  animationDuration: "500ms",
                }}
              >
                {line}
              </li>
            ))}
          </ul>

          <div className="w-4/5">
            <Divider />
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs tracking-widest uppercase text-zinc-400 text-balance text-center leading-relaxed">
              Now we begin the {TRAITS[summary.nextZodiacId]} season of the{" "}
              <strong>
                <ZodiacName
                  flavourId={nextFlavourId}
                  formId={nextFormId}
                  beanId={nextBeanId}
                  preparation={nextPrep}
                  beanName={nextBean.name}
                  zodiacId={summary.nextZodiacId}
                  asLink={false}
                />
              </strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer bg-transparent text-sm"
          >
            Continue <span className="text-xs">→</span>
          </button>
        </div>
      )}
    </RitualCardShell>
  );
}
