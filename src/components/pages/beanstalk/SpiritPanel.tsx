import { useRef, useState } from "react";
import type { BeanId, FlavourId, FormId, ZodiacId } from "../../../lib/zodiac";
import { getPreparationName } from "../../../lib/zodiac";
import type { AllZodiacData } from "../../../lib/data";
import MorphingRadar from "../../zodiac/MorphingRadar";
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
  const [activeRadarTab, setActiveRadarTab] = useState<"flavour" | "form" | "bean">("bean");
  const radarKeys = ["bean", "flavour", "form"] as const;
  const touchStartXRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(dx) < 40) return;
    const idx = radarKeys.indexOf(activeRadarTab);
    const n = radarKeys.length;
    if (dx < 0) setActiveRadarTab(radarKeys[(idx - 1 + n) % n]);
    else setActiveRadarTab(radarKeys[(idx + 1) % n]);
  };

  const [spiritFlavourId, spiritFormId, spiritBeanId] = zodiacParts(spiritId);
  const spiritBean = data.beans[spiritBeanId];
  const spiritPreparation = getPreparationName(spiritFlavourId, spiritFormId);

  const tabDefs = [
    { key: "bean" as const, label: "Bean", color: `var(--bean-${spiritBeanId ?? claimedBeanId})` },
    { key: "flavour" as const, label: "Flavour", color: `var(--flavour-${spiritFlavourId ?? claimedFlavourId})` },
    { key: "form" as const, label: "Form", color: `var(--form-${spiritFormId ?? claimedFormId})` },
  ];

  const radarProps = {
    data,
    activeTab: activeRadarTab,
    claimedFlavourId,
    claimedFormId,
    claimedBeanId,
    flavourValues: display.flavour,
    formValues: display.form,
    beanValues: display.bean,
    flavourHighlight: display.flavourHighlight,
    formHighlight: display.formHighlight,
    beanHighlight: display.beanHighlight,
  };

  return (
    <div className="max-lg:-mx-4 max-lg:w-screen lg:w-80 shrink-0 sticky top-0 z-20 lg:h-svh flex flex-col lg:justify-center lg:bg-transparent lg:border-none max-lg:pt-2 lg:py-6">
      <div className="max-lg:relative max-lg:mx-auto max-lg:w-[95%] max-lg:bg-zinc-900 max-lg:border max-lg:border-zinc-700 max-lg:rounded-xl max-lg:shadow-[0_0_24px_rgba(0,0,0,0.6)] max-lg:px-4 max-lg:pt-3 max-lg:pb-4 lg:contents">
        {spiritBean && (
          <div className="text-center shrink-0">
            <p className="max-lg:hidden text-xs text-zinc-400 uppercase tracking-widest mb-1">Spirit Bean</p>
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
            {tabDefs.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setActiveRadarTab(key)}
                className="flex-1 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
                style={
                  activeRadarTab === key
                    ? { background: color + "22", color, border: `1px solid ${color}` }
                    : { background: "transparent", color: "#71717a", border: "1px solid #71717a" }
                }
              >
                {label}
              </button>
            ))}
          </div>
          <div
            className="w-[75%] mx-auto aspect-square"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <MorphingRadar {...radarProps} />
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:w-full">
        <div className="flex gap-1">
          {tabDefs.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setActiveRadarTab(key)}
              className="flex-1 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
              style={
                activeRadarTab === key
                  ? { background: color + "22", color, border: `1px solid ${color}` }
                  : { background: "transparent", color: "#71717a", border: "1px solid #71717a" }
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="w-full aspect-square">
          <MorphingRadar {...radarProps} />
        </div>
      </div>
    </div>
  );
}

export type { DisplayValues };
