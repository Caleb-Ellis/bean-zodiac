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
import { dayBefore, formatDate, getAllSeasonsForBeanYear, zodiacParts } from "./helpers";

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
const _initialYearSeasons = getAllSeasonsForBeanYear(_currentBeanYear);
const _initialYearStart = _initialYearSeasons[0]?.startDateStr;

export default function Beanstalk({ nodes, currentScores, data, claimedSlug }: Props) {
  const [claimedFlavourId, claimedFormId, claimedBeanId] = zodiacParts(claimedSlug);

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

  const fortuneNodesInYear = useMemo(() => {
    if (yearSeasons.length === 0) return [];
    const yearStart = yearSeasons[0]!.startDateStr;
    const yearEnd = yearSeasons[yearSeasons.length - 1]!.endDateStr;
    return nodes.filter((n) => n.date >= yearStart && n.date <= yearEnd);
  }, [nodes, yearSeasons]);

  const today = formatDate(new Date());

  const yearSections = useMemo(() => {
    let idx = 0;
    return yearSeasons
      .filter((season) => season.startDateStr <= today)
      .map((season) => {
        const sectionNodes = fortuneNodesInYear.filter(
          (n) => n.date >= season.startDateStr && n.date <= season.endDateStr,
        );
        const startIdx = idx;
        idx += sectionNodes.length;
        return { season, nodes: sectionNodes, startIdx };
      });
  }, [yearSeasons, fortuneNodesInYear]);

  // ---------- spirit display lerping ----------

  const computeInitialDisplay = (): DisplayValues => {
    if (_initialYearStart) {
      return scoresToDisplay(computeSpiritBeanScores(claimedSlug, dayBefore(_initialYearStart)));
    }
    return scoresToDisplay(currentScores);
  };

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const radarExpanded = useStore((s) => s.radarExpanded);
  const setRadarExpanded = useStore((s) => s.setRadarExpanded);

  const initialDisplay = computeInitialDisplay();
  const [display, setDisplay] = useState<DisplayValues>(initialDisplay);
  const [preYearSpiritId, setPreYearSpiritId] = useState<ZodiacId>(() =>
    spiritZodiacIdFromDisplay(initialDisplay),
  );

  const displayRef = useRef<DisplayValues>(initialDisplay);
  const targetRef = useRef<DisplayValues>(initialDisplay);
  const preYearDisplayRef = useRef<DisplayValues>(initialDisplay);
  const rafRef = useRef<number>(0);
  const topRef = useRef<HTMLDivElement>(null);

  // reset + snap radar to start-of-year scores when year changes
  useEffect(() => {
    setActiveIdx(null);
    const seasons = getAllSeasonsForBeanYear(selectedBeanYear);
    const yearStart = seasons[0]?.startDateStr;
    if (!yearStart) return;
    const startScores = computeSpiritBeanScores(claimedSlug, dayBefore(yearStart));
    const snap = scoresToDisplay(startScores);
    preYearDisplayRef.current = snap;
    setPreYearSpiritId(spiritZodiacIdFromDisplay(snap));
    displayRef.current = snap;
    targetRef.current = snap;
    setDisplay(snap);
  }, [selectedBeanYear]);

  const activeFortuneNode = activeIdx !== null ? (fortuneNodesInYear[activeIdx] ?? null) : null;

  // animate display values toward target when activeIdx changes
  useEffect(() => {
    targetRef.current = activeFortuneNode
      ? scoresToDisplay(activeFortuneNode.scores)
      : preYearDisplayRef.current;

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

  const spiritId = activeFortuneNode?.spiritZodiacId ?? preYearSpiritId;

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
