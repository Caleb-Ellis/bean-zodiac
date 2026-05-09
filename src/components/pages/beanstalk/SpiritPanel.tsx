import { useState } from "react";
import type { BeanId, FlavourId, FormId, ZodiacId } from "../../../lib/zodiac";
import { getPreparationName } from "../../../lib/zodiac";
import type { AllZodiacData } from "../../../lib/data";
import { FlavourRadar, FormRadar, BeanRadar } from "../../zodiac/SpiritBeanRadars";
import ZodiacName from "../../zodiac/ZodiacName";
import { zodiacParts } from "./helpers";

interface DisplayValues {
  flavour: number[];
  form: number[];
  bean: number[];
  flavourHighlight: number;
  formHighlight: number;
  beanHighlight: number;
}

interface Props {
  data: AllZodiacData;
  spiritId: ZodiacId;
  display: DisplayValues;
  claimedFlavourId: FlavourId;
  claimedFormId: FormId;
  claimedBeanId: BeanId;
  radarExpanded: boolean;
  onToggleRadar: () => void;
}

export default function SpiritPanel({
  data,
  spiritId,
  display,
  claimedFlavourId,
  claimedFormId,
  claimedBeanId,
  radarExpanded,
  onToggleRadar,
}: Props) {
  const [activeRadarTab, setActiveRadarTab] = useState<"flavour" | "form" | "bean">("flavour");

  const [spiritFlavourId, spiritFormId, spiritBeanId] = zodiacParts(spiritId);
  const spiritBean = data.beans[spiritBeanId];
  const spiritPreparation = getPreparationName(spiritFlavourId, spiritFormId);

  return (
    <div className="max-lg:-mx-4 max-lg:w-screen lg:w-80 shrink-0 sticky top-0 z-20 lg:h-svh flex flex-col lg:bg-transparent lg:border-none max-lg:pt-2 lg:pt-6 sm:pb-6">
      <div className="max-lg:relative max-lg:mx-auto max-lg:w-[95%] max-lg:bg-zinc-900 max-lg:border max-lg:border-zinc-700 max-lg:rounded-xl max-lg:shadow-[0_0_24px_rgba(0,0,0,0.6)] max-lg:px-4 max-lg:pt-3 max-lg:pb-4 lg:contents">
        {spiritBean && (
          <div className="text-center shrink-0">
            <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Spirit Bean</p>
            <p className="text-lg font-bold leading-tight mb-2">
              <ZodiacName
                flavourId={spiritFlavourId}
                formId={spiritFormId}
                beanId={spiritBeanId}
                preparation={spiritPreparation}
                beanName={spiritBean.name}
                zodiacId={spiritId}
                asLink={false}
              />
            </p>
          </div>
        )}
        <button
          onClick={onToggleRadar}
          className="lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full bg-zinc-800 border border-zinc-400 text-zinc-400 text-xs cursor-pointer z-10"
        >
          {radarExpanded ? "Hide evolution ▲" : "See evolution ▼"}
        </button>

        <div className={`flex-col lg:hidden ${radarExpanded ? "flex" : "hidden"}`}>
          <div className="flex gap-1 mb-2">
            {(
              [
                {
                  key: "flavour",
                  label: "Flavour",
                  color: `var(--flavour-${spiritFlavourId ?? claimedFlavourId})`,
                },
                {
                  key: "form",
                  label: "Form",
                  color: `var(--form-${spiritFormId ?? claimedFormId})`,
                },
                {
                  key: "bean",
                  label: "Bean",
                  color: `var(--bean-${spiritBeanId ?? claimedBeanId})`,
                },
              ] as const
            ).map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setActiveRadarTab(key)}
                className="flex-1 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
                style={
                  activeRadarTab === key
                    ? {
                        background: color + "22",
                        color,
                        border: `1px solid ${color}`,
                      }
                    : {
                        background: "transparent",
                        color: "#71717a",
                        border: "1px solid #71717a",
                      }
                }
              >
                {label}
              </button>
            ))}
          </div>
          <div className="w-[70%] aspect-square mx-auto">
            {activeRadarTab === "flavour" && (
              <FlavourRadar
                data={data}
                claimedId={claimedFlavourId}
                values={display.flavour}
                highlightIndex={display.flavourHighlight}
              />
            )}
            {activeRadarTab === "form" && (
              <FormRadar
                data={data}
                claimedId={claimedFormId}
                values={display.form}
                highlightIndex={display.formHighlight}
              />
            )}
            {activeRadarTab === "bean" && (
              <BeanRadar
                data={data}
                claimedId={claimedBeanId}
                values={display.bean}
                highlightIndex={display.beanHighlight}
              />
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
        <div className="flex-1 min-w-0 lg:min-h-0">
          <FlavourRadar
            data={data}
            claimedId={claimedFlavourId}
            values={display.flavour}
            highlightIndex={display.flavourHighlight}
          />
        </div>
        <div className="flex-1 min-w-0 lg:min-h-0">
          <FormRadar
            data={data}
            claimedId={claimedFormId}
            values={display.form}
            highlightIndex={display.formHighlight}
          />
        </div>
        <div className="flex-1 min-w-0 lg:min-h-0">
          <BeanRadar
            data={data}
            claimedId={claimedBeanId}
            values={display.bean}
            highlightIndex={display.beanHighlight}
          />
        </div>
      </div>
    </div>
  );
}

export type { DisplayValues };
