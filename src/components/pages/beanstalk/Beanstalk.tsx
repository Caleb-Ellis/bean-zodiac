import { useEffect, useMemo, useRef, useState } from "react";
import { getBeanYear, getZodiacMetadataForDate, type ZodiacId } from "../../../lib/zodiac";
import { type AllZodiacData } from "../../../lib/data";
import { useStore } from "../../../store";
import { useUiStore } from "../../../store/ui";
import {
  computeSpiritBeanScores,
  SPIRIT_BEAN_RING,
  SPIRIT_FLAVOUR_RING,
  SPIRIT_FORM_RING,
  type BeanstalkNode,
  type SpiritBeanScores,
} from "../../../lib/spiritBean";
import SpiritPanel, { type DisplayValues } from "./SpiritPanel";
import Timeline from "./Timeline";
import { SeasonFilterBar, SeasonNavButton } from "./YearFilter";
import {
  formatDate,
  getAllSeasonsForBeanYear,
  zodiacParts,
  type SeasonFilter,
} from "./helpers";

function scoresToDisplay(scores: SpiritBeanScores): DisplayValues {
  return {
    flavour: scores.flavourValues,
    form: scores.formValues,
    bean: scores.beanValues,
    flavourHighlight: scores.flavourHighlight,
    formHighlight: scores.formHighlight,
    beanHighlight: scores.beanHighlight,
  };
}

function lerpArr(from: number[], to: number[], t: number): number[] {
  return from.map((v, i) => v + ((to[i] ?? v) - v) * t);
}

function closeEnough(a: number[], b: number[]): boolean {
  return a.every((v, i) => Math.abs(v - (b[i] ?? v)) < 0.05);
}

function spiritZodiacIdFromDisplay(d: DisplayValues): ZodiacId {
  return `${SPIRIT_FLAVOUR_RING[d.flavourHighlight]}-${SPIRIT_FORM_RING[d.formHighlight]}-${SPIRIT_BEAN_RING[d.beanHighlight]}` as ZodiacId;
}

interface Props {
  nodes: BeanstalkNode[];
  currentScores: SpiritBeanScores;
  data: AllZodiacData;
  claimedSlug: ZodiacId;
}

const _currentSeasonKey = formatDate(getZodiacMetadataForDate(new Date()).startDate);

export default function Beanstalk({ nodes, currentScores, data, claimedSlug }: Props) {
  const [claimedFlavourId, claimedFormId, claimedBeanId] = zodiacParts(claimedSlug);
  const claimedOn = useStore((s) => s.claimed?.on ?? null);

  const today = formatDate(new Date());

  // Seasons with history, plus the current one, oldest first.
  const seasons = useMemo<SeasonFilter[]>(() => {
    const yearSet = new Set<number>([getBeanYear(new Date())]);
    for (const node of nodes) {
      const [y, m, d] = node.date.split("-").map(Number);
      yearSet.add(getBeanYear(new Date(y, m - 1, d)));
    }
    return Array.from(yearSet)
      .sort((a, b) => a - b)
      .flatMap((year) => getAllSeasonsForBeanYear(year))
      .filter(
        (season) =>
          season.startDateStr <= today &&
          (season.key === _currentSeasonKey ||
            nodes.some((n) => n.date >= season.startDateStr && n.date <= season.endDateStr)),
      );
  }, [nodes, today]);

  const [selectedSeasonKey, setSelectedSeasonKey] = useState<string>(_currentSeasonKey);

  const selectedSeason =
    seasons.find((s) => s.key === selectedSeasonKey) ?? seasons[seasons.length - 1];

  const sections = useMemo(() => {
    if (!selectedSeason) return [];
    const sectionNodes = nodes
      .filter((n) => n.date >= selectedSeason.startDateStr && n.date <= selectedSeason.endDateStr)
      .reverse();
    return [{ season: selectedSeason, nodes: sectionNodes, startIdx: 0 }];
  }, [selectedSeason, nodes]);

  const fortuneNodes = useMemo(() => sections.flatMap((s) => s.nodes), [sections]);

  // ---------- spirit display lerping ----------

  // Resting scores: as of the selected season's end, or today for the current season.
  const seasonScores = useMemo(
    () =>
      !selectedSeason || selectedSeason.key === _currentSeasonKey
        ? currentScores
        : computeSpiritBeanScores(claimedSlug, selectedSeason.endDateStr),
    [selectedSeason, currentScores, claimedSlug],
  );
  const seasonDisplay = useMemo(() => scoresToDisplay(seasonScores), [seasonScores]);
  const seasonSpiritId = useMemo(
    () => spiritZodiacIdFromDisplay(seasonDisplay),
    [seasonDisplay],
  );

  const bornDisplay = useMemo(
    () => scoresToDisplay(computeSpiritBeanScores(claimedSlug, "0000-01-01")),
    [claimedSlug],
  );
  const bornSpiritId = useMemo(
    () => spiritZodiacIdFromDisplay(bornDisplay),
    [bornDisplay],
  );

  const showBorn = selectedSeason !== undefined && selectedSeason === seasons[0];
  const bornIdx = fortuneNodes.length;

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const radarExpanded = useUiStore((s) => s.radarExpanded);
  const setRadarExpanded = useUiStore((s) => s.setRadarExpanded);

  const [display, setDisplay] = useState<DisplayValues>(seasonDisplay);

  const displayRef = useRef<DisplayValues>(seasonDisplay);
  const targetRef = useRef<DisplayValues>(seasonDisplay);
  const rafRef = useRef<number>(0);
  const topRef = useRef<HTMLDivElement>(null);

  // reset highlight when season changes
  useEffect(() => {
    setActiveIdx(null);
  }, [selectedSeasonKey]);

  const bornActive = showBorn && activeIdx === bornIdx;
  const activeFortuneNode =
    activeIdx !== null && activeIdx < bornIdx
      ? (fortuneNodes[activeIdx] ?? null)
      : null;

  // animate display values toward target when activeIdx or the season's scores change
  useEffect(() => {
    targetRef.current = bornActive
      ? bornDisplay
      : activeFortuneNode
        ? scoresToDisplay(activeFortuneNode.scores)
        : seasonDisplay;

    cancelAnimationFrame(rafRef.current);
    const step = () => {
      const next: DisplayValues = {
        flavour: lerpArr(displayRef.current.flavour, targetRef.current.flavour, 0.07),
        form: lerpArr(displayRef.current.form, targetRef.current.form, 0.07),
        bean: lerpArr(displayRef.current.bean, targetRef.current.bean, 0.07),
        flavourHighlight: targetRef.current.flavourHighlight,
        formHighlight: targetRef.current.formHighlight,
        beanHighlight: targetRef.current.beanHighlight,
      };
      displayRef.current = next;
      setDisplay({ ...next });
      if (
        !closeEnough(next.flavour, targetRef.current.flavour) ||
        !closeEnough(next.form, targetRef.current.form) ||
        !closeEnough(next.bean, targetRef.current.bean)
      ) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeIdx, seasonDisplay]);

  if (nodes.length === 0) {
    return (
      <p className="text-zinc-500 text-sm text-center py-8">
        Your Beanstalk will grow as the seasons pass.
      </p>
    );
  }

  const handleSeasonSelect = (key: string) => {
    setSelectedSeasonKey(key);
    topRef.current?.scrollIntoView({ behavior: "instant" });
  };

  const toggleRadar = () => setRadarExpanded(!radarExpanded);

  const selectedIdx = selectedSeason ? seasons.indexOf(selectedSeason) : -1;
  const prevSeason = seasons[selectedIdx - 1] ?? null;
  const nextSeason = seasons[selectedIdx + 1] ?? null;

  const spiritId = bornActive
    ? bornSpiritId
    : (activeFortuneNode?.spiritZodiacId ?? seasonSpiritId);

  return (
    <div className="w-full flex flex-col sm:gap-4" ref={topRef}>
      <h2 className="text-2xl sm:text-4xl text-center font-bold mb-4">Timeline</h2>
      <SeasonFilterBar
        seasons={seasons}
        selectedKey={selectedSeason?.key ?? selectedSeasonKey}
        data={data}
        onSelect={handleSeasonSelect}
      />
      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        <SpiritPanel
          data={data}
          spiritId={spiritId}
          display={display}
          claimedFlavourId={claimedFlavourId}
          claimedFormId={claimedFormId}
          claimedBeanId={claimedBeanId}
          radarExpanded={radarExpanded}
          onToggleRadar={toggleRadar}
        />
        <div className="flex-1 min-w-0 flex flex-col">
          <Timeline
            data={data}
            yearSections={sections}
            fortuneNodesInYear={fortuneNodes}
            activeIdx={activeIdx}
            onActiveIdxChange={setActiveIdx}
            radarExpanded={radarExpanded}
            showBorn={showBorn}
            claimedBeanId={claimedBeanId}
            claimedFlavourId={claimedFlavourId}
            claimedFormId={claimedFormId}
            claimedSlug={claimedSlug}
            claimedOn={claimedOn}
          />
          <div className="flex justify-between gap-4 mt-8">
            {prevSeason !== null ? (
              <SeasonNavButton
                season={prevSeason}
                direction="prev"
                data={data}
                onSelect={handleSeasonSelect}
              />
            ) : (
              <div />
            )}
            {nextSeason !== null ? (
              <SeasonNavButton
                season={nextSeason}
                direction="next"
                data={data}
                onSelect={handleSeasonSelect}
              />
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
