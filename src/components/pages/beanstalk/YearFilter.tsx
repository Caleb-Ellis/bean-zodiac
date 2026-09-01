import type { AllZodiacData } from "../../../lib/data";
import { getPreparationName } from "../../../lib/zodiac";
import BeanIcon from "../../zodiac/BeanIcon";
import ZodiacName from "../../zodiac/ZodiacName";
import type { SeasonFilter } from "./helpers";

function getBeanName(season: SeasonFilter, data: AllZodiacData): string {
  return data.beans[season.beanId]?.name ?? season.beanId;
}

interface FilterBarProps {
  seasons: SeasonFilter[];
  selectedKey: string;
  data: AllZodiacData;
  onSelect: (key: string) => void;
}

export function SeasonFilterBar({
  seasons,
  selectedKey,
  data,
  onSelect,
}: FilterBarProps) {
  const seasonsByYear = new Map<number, SeasonFilter[]>();
  for (const season of seasons) {
    seasonsByYear.set(season.beanYear, [
      ...(seasonsByYear.get(season.beanYear) ?? []),
      season,
    ]);
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full mb-8">
      {Array.from(seasonsByYear, ([year, yearSeasons]) => (
        <div key={year} className="flex flex-col items-center gap-3">
          <p className="inline-flex items-center gap-2 text-base font-semibold text-zinc-300">
            <BeanIcon id={yearSeasons[0]!.beanId} size={16} />
            {getBeanName(yearSeasons[0]!, data)}
            <span className="text-zinc-500 text-base font-normal">{year}</span>
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {yearSeasons.map((season) => {
              const isSelected = season.key === selectedKey;
              return (
                <button
                  key={season.key}
                  onClick={() => {
                    if (!isSelected) onSelect(season.key);
                  }}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-950 cursor-default"
                      : "border-zinc-700 bg-zinc-800 hover:border-zinc-500 cursor-pointer"
                  }`}
                >
                  <ZodiacName
                    flavourId={season.flavourId}
                    formId={season.formId}
                    beanId={season.beanId}
                    preparation={getPreparationName(
                      season.flavourId,
                      season.formId,
                    )}
                    beanName={getBeanName(season, data)}
                    zodiacId={season.zodiacId}
                    asLink={false}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

interface NavButtonProps {
  season: SeasonFilter;
  direction: "prev" | "next";
  data: AllZodiacData;
  onSelect: (key: string) => void;
}

export function SeasonNavButton({
  season,
  direction,
  data,
  onSelect,
}: NavButtonProps) {
  const isPrev = direction === "prev";
  return (
    <button
      onClick={() => onSelect(season.key)}
      className={`flex flex-col px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:border-zinc-500 transition-colors text-sm cursor-pointer ${isPrev ? "items-start" : "items-end"}`}
    >
      <span className="text-zinc-500 text-xs mb-1">
        {isPrev ? "← Previous season" : "Next season →"}
      </span>
      <span className="inline-flex items-center gap-1 font-medium">
        <ZodiacName
          flavourId={season.flavourId}
          formId={season.formId}
          beanId={season.beanId}
          preparation={getPreparationName(season.flavourId, season.formId)}
          beanName={getBeanName(season, data)}
          zodiacId={season.zodiacId}
          asLink={false}
        />
        <span className="text-zinc-500">{season.beanYear}</span>
      </span>
    </button>
  );
}
