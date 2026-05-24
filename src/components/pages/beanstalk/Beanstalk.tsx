import { useEffect, useMemo, useRef, useState } from "react";
import { getBeanYear, type ZodiacId } from "../../../lib/zodiac";
import { type AllZodiacData } from "../../../lib/data";
import { useStore } from "../../../store";
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
import { YearFilterBar, YearNavButton } from "./YearFilter";
import { formatDate, getAllSeasonsForBeanYear, zodiacParts } from "./helpers";

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

const _currentBeanYear = getBeanYear(new Date());

export default function Beanstalk({ nodes, currentScores, data, claimedSlug }: Props) {
  const [claimedFlavourId, claimedFormId, claimedBeanId] = zodiacParts(claimedSlug);
  const claimedOn = useStore((s) => s.claimed?.on ?? null);

  const beanYears = useMemo<number[]>(() => {
    const yearSet = new Set<number>([getBeanYear(new Date())]);
    for (const node of nodes) {
      const [y, m, d] = node.date.split("-").map(Number);
      yearSet.add(getBeanYear(new Date(y, m - 1, d)));
    }
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [nodes]);

  const [selectedBeanYear, setSelectedBeanYear] = useState<number>(_currentBeanYear);

  const yearSeasons = useMemo(() => getAllSeasonsForBeanYear(selectedBeanYear), [selectedBeanYear]);

  const today = formatDate(new Date());

  const yearSections = useMemo(() => {
    if (yearSeasons.length === 0) return [];
    const yearStart = yearSeasons[0]!.startDateStr;
    const yearEnd = yearSeasons[yearSeasons.length - 1]!.endDateStr;
    const nodesInYear = nodes.filter((n) => n.date >= yearStart && n.date <= yearEnd);
    const visibleSeasons = yearSeasons.filter((season) => season.startDateStr <= today);
    let idx = 0;
    return [...visibleSeasons].reverse().map((season) => {
      const sectionNodes = nodesInYear
        .filter((n) => n.date >= season.startDateStr && n.date <= season.endDateStr)
        .slice()
        .reverse();
      const startIdx = idx;
      idx += sectionNodes.length;
      return { season, nodes: sectionNodes, startIdx };
    });
  }, [yearSeasons, nodes, today]);

  const fortuneNodesInYear = useMemo(
    () => yearSections.flatMap((s) => s.nodes),
    [yearSections],
  );

  // ---------- spirit display lerping ----------

  const currentDisplay = useMemo(() => scoresToDisplay(currentScores), [currentScores]);
  const currentSpiritId = useMemo(
    () => spiritZodiacIdFromDisplay(currentDisplay),
    [currentDisplay],
  );

  const bornDisplay = useMemo(
    () => scoresToDisplay(computeSpiritBeanScores(claimedSlug, "0000-01-01")),
    [claimedSlug],
  );
  const bornSpiritId = useMemo(
    () => spiritZodiacIdFromDisplay(bornDisplay),
    [bornDisplay],
  );

  const showBorn = selectedBeanYear === beanYears[0];
  const bornIdx = fortuneNodesInYear.length;

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const radarExpanded = useStore((s) => s.radarExpanded);
  const setRadarExpanded = useStore((s) => s.setRadarExpanded);

  const [display, setDisplay] = useState<DisplayValues>(currentDisplay);

  const displayRef = useRef<DisplayValues>(currentDisplay);
  const targetRef = useRef<DisplayValues>(currentDisplay);
  const rafRef = useRef<number>(0);
  const topRef = useRef<HTMLDivElement>(null);

  // reset highlight when year changes
  useEffect(() => {
    setActiveIdx(null);
  }, [selectedBeanYear]);

  const bornActive = showBorn && activeIdx === bornIdx;
  const activeFortuneNode =
    activeIdx !== null && activeIdx < bornIdx
      ? (fortuneNodesInYear[activeIdx] ?? null)
      : null;

  // animate display values toward target when activeIdx or current scores change
  useEffect(() => {
    targetRef.current = bornActive
      ? bornDisplay
      : activeFortuneNode
        ? scoresToDisplay(activeFortuneNode.scores)
        : currentDisplay;

    cancelAnimationFrame(rafRef.current);
    const step = () => {
      const next: DisplayValues = {
        flavour: lerpArr(displayRef.current.flavour, targetRef.current.flavour, 0.15),
        form: lerpArr(displayRef.current.form, targetRef.current.form, 0.15),
        bean: lerpArr(displayRef.current.bean, targetRef.current.bean, 0.15),
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
  }, [activeIdx]);

  if (nodes.length === 0) {
    return (
      <p className="text-zinc-500 text-sm text-center py-8">
        Your Beanstalk will grow as the seasons pass.
      </p>
    );
  }

  const handleYearSelect = (year: number) => {
    setSelectedBeanYear(year);
    topRef.current?.scrollIntoView({ behavior: "instant" });
  };

  const toggleRadar = () => setRadarExpanded(!radarExpanded);

  const selectedYearIdx = beanYears.indexOf(selectedBeanYear);
  const prevYear = beanYears[selectedYearIdx - 1] ?? null;
  const nextYear = beanYears[selectedYearIdx + 1] ?? null;

  const spiritId = bornActive
    ? bornSpiritId
    : (activeFortuneNode?.spiritZodiacId ?? currentSpiritId);

  return (
    <div className="w-full flex flex-col sm:gap-4" ref={topRef}>
      <h2 className="text-2xl sm:text-4xl text-center font-bold mb-4">Timeline</h2>
      <YearFilterBar
        beanYears={beanYears}
        selectedBeanYear={selectedBeanYear}
        data={data}
        onSelect={handleYearSelect}
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
            yearSections={yearSections}
            fortuneNodesInYear={fortuneNodesInYear}
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
            {prevYear !== null ? (
              <YearNavButton
                year={prevYear}
                direction="prev"
                data={data}
                onSelect={handleYearSelect}
              />
            ) : (
              <div />
            )}
            {nextYear !== null ? (
              <YearNavButton
                year={nextYear}
                direction="next"
                data={data}
                onSelect={handleYearSelect}
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
