import type { AllZodiacData } from "../../../lib/data";
import BeanIcon from "../../zodiac/BeanIcon";
import { getAllSeasonsForBeanYear } from "./helpers";

interface YearLabel {
  beanId: ReturnType<typeof getAllSeasonsForBeanYear>[number]["beanId"] | undefined;
  beanName: string;
  flavourId: ReturnType<typeof getAllSeasonsForBeanYear>[number]["flavourId"] | undefined;
  flavourName: string;
}

function getYearLabel(year: number, data: AllZodiacData): YearLabel {
  const seasons = getAllSeasonsForBeanYear(year);
  const beanId = seasons[0]?.beanId;
  const flavourId = seasons[0]?.flavourId;
  return {
    beanId,
    beanName: beanId ? (data.beans[beanId]?.name ?? beanId) : String(year),
    flavourId,
    flavourName: flavourId ? (data.flavours[flavourId]?.name ?? flavourId) : "",
  };
}

interface FilterBarProps {
  beanYears: number[];
  selectedBeanYear: number;
  data: AllZodiacData;
  onSelect: (year: number) => void;
}

export function YearFilterBar({ beanYears, selectedBeanYear, data, onSelect }: FilterBarProps) {
  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {beanYears.map((year) => {
          const { beanId, beanName, flavourId, flavourName } = getYearLabel(year, data);
          const isSelected = year === selectedBeanYear;
          return (
            <button
              key={year}
              onClick={() => {
                if (!isSelected) onSelect(year);
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-950 cursor-default"
                  : "border-zinc-700 bg-zinc-800 hover:border-zinc-500 cursor-pointer"
              }`}
            >
              {beanId && <BeanIcon id={beanId} size={14} />}
              <span
                style={
                  isSelected
                    ? {}
                    : {
                        background: `linear-gradient(135deg, var(--flavour-${flavourId}) 60%, var(--bean-${beanId}) 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }
                }
              >
                {flavourName} {beanName}
              </span>
              <span className="text-zinc-500 text-xs">{year}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface NavButtonProps {
  year: number;
  direction: "prev" | "next";
  data: AllZodiacData;
  onSelect: (year: number) => void;
}

export function YearNavButton({ year, direction, data, onSelect }: NavButtonProps) {
  const { beanName, flavourName } = getYearLabel(year, data);
  const isPrev = direction === "prev";
  return (
    <button
      onClick={() => onSelect(year)}
      className={`flex flex-col px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:border-zinc-500 transition-colors text-sm cursor-pointer ${isPrev ? "items-start" : "items-end"}`}
    >
      <span className="text-zinc-500 text-xs mb-1">
        {isPrev ? "← Previous year" : "Next year →"}
      </span>
      <span className="text-zinc-200 font-medium">
        {flavourName} {beanName} <span className="text-zinc-500">{year}</span>
      </span>
    </button>
  );
}
