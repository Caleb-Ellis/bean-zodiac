import { useEffect, useMemo, useRef, useState } from "react";
import {
  FORM_ORDER,
  getBeanYear,
  getPreparationName,
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacId,
} from "../lib/zodiac";
import { fetchZodiac, type AllZodiacData } from "../lib/data";
import type { Zodiac } from "../lib/zodiac";
import {
  computeSpiritBeanScores,
  getSpiritZodiacId,
  SPIRIT_BEAN_RING,
  SPIRIT_FLAVOUR_RING,
  SPIRIT_FORM_RING,
  type BeanstalkNode,
  type SpiritBeanScores,
} from "../lib/spiritBean";
import { FlavourRadar, FormRadar, BeanRadar } from "./SpiritBeanRadars";
import FlavourBadge from "./FlavourBadge";
import FormBadge from "./FormBadge";
import BeanBadge from "./BeanBadge";
import ZodiacName from "./ZodiacName";
import Bean from "./Bean";

// ---------- lerp helpers ----------

interface DisplayValues {
  flavour: number[];
  form: number[];
  bean: number[];
  flavourHighlight: number;
  formHighlight: number;
  beanHighlight: number;
}

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

// ---------- helpers ----------

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


function zodiacParts(id: ZodiacId): [FlavourId, FormId, BeanId] {
  return id.split("-") as [FlavourId, FormId, BeanId];
}

function dayBefore(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

// ---------- season filter ----------

interface SeasonFilter {
  key: string;
  zodiacId: ZodiacId;
  flavourId: FlavourId;
  formId: FormId;
  beanId: BeanId;
  startDateStr: string;
  endDateStr: string;
  beanYear: number;
}

// Sample dates per form (15th of the start month, relative to bean year start)
const FORM_SAMPLE: Record<string, [relYear: 0 | 1, month: number]> = {
  fried: [0, 3],
  roasted: [0, 5],
  fermented: [0, 7],
  boiled: [0, 9],
  smoked: [0, 11],
  dried: [1, 1],
};

function getAllSeasonsForBeanYear(beanYear: number): SeasonFilter[] {
  return FORM_ORDER.map((formId) => {
    const [relYear, month] = FORM_SAMPLE[formId]!;
    const sampleDate = new Date(beanYear + relYear, month - 1, 15);
    const meta = getZodiacMetadataForDate(sampleDate);
    return {
      key: formatDate(meta.startDate),
      zodiacId: meta.zodiacId,
      flavourId: meta.flavourId,
      formId: meta.formId,
      beanId: meta.beanId,
      startDateStr: formatDate(meta.startDate),
      endDateStr: formatDate(meta.endDate),
      beanYear,
    };
  });
}

// ---------- props ----------

interface Props {
  nodes: BeanstalkNode[];
  currentScores: SpiritBeanScores;
  data: AllZodiacData;
  claimedSlug: ZodiacId;
}

// ---------- initial year display computation (outside hooks) ----------

const _currentBeanYear = getBeanYear(new Date());
const _initialYearSeasons = getAllSeasonsForBeanYear(_currentBeanYear);
const _initialYearStart = _initialYearSeasons[0]?.startDateStr;

export default function Beanstalk({
  nodes,
  currentScores,
  data,
  claimedSlug,
}: Props) {
  const [claimedFlavourId, claimedFormId, claimedBeanId] =
    zodiacParts(claimedSlug);

  // ---------- year filter ----------

  const beanYears = useMemo<number[]>(() => {
    const yearSet = new Set<number>([getBeanYear(new Date())]);
    for (const node of nodes) {
      const [y, m, d] = node.date.split("-").map(Number);
      yearSet.add(getBeanYear(new Date(y, m - 1, d)));
    }
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [nodes]);

  const [selectedBeanYear, setSelectedBeanYear] =
    useState<number>(_currentBeanYear);

  const yearSeasons = useMemo<SeasonFilter[]>(
    () => getAllSeasonsForBeanYear(selectedBeanYear),
    [selectedBeanYear],
  );

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

  const [sectionZodiacs, setSectionZodiacs] = useState<Map<string, Zodiac>>(
    new Map(),
  );
  const [loadingZodiacs, setLoadingZodiacs] = useState(false);
  const pendingFetches = useRef(0);

  useEffect(() => {
    setSectionZodiacs(new Map());
    const count = yearSections.length;
    pendingFetches.current = count;
    if (count === 0) return;
    setLoadingZodiacs(true);
    for (const { season } of yearSections) {
      fetchZodiac(season.zodiacId).then((z) => {
        setSectionZodiacs((prev) => new Map(prev).set(season.zodiacId, z));
        pendingFetches.current -= 1;
        if (pendingFetches.current === 0) setLoadingZodiacs(false);
      });
    }
  }, [yearSections]);

  // ---------- initial display ----------

  const computeInitialDisplay = (): DisplayValues => {
    if (_initialYearStart) {
      return scoresToDisplay(
        computeSpiritBeanScores(claimedSlug, dayBefore(_initialYearStart)),
      );
    }
    return scoresToDisplay(currentScores);
  };

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [activeRadarTab, setActiveRadarTab] = useState<
    "flavour" | "form" | "bean"
  >("flavour");
  const [radarExpanded, setRadarExpanded] = useState(
    () => localStorage.getItem("bean-zodiac-radar-expanded") !== "false",
  );

  const initialDisplay = computeInitialDisplay();
  const [display, setDisplay] = useState<DisplayValues>(initialDisplay);
  const [preYearSpiritId, setPreYearSpiritId] = useState<ZodiacId>(() =>
    spiritZodiacIdFromDisplay(initialDisplay),
  );

  const displayRef = useRef<DisplayValues>(initialDisplay);
  const targetRef = useRef<DisplayValues>(initialDisplay);
  const preYearDisplayRef = useRef<DisplayValues>(initialDisplay);
  const rafRef = useRef<number>(0);

  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);
  const baseLineRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // reset + snap radar to start-of-year scores when year changes
  useEffect(() => {
    setActiveIdx(null);
    const seasons = getAllSeasonsForBeanYear(selectedBeanYear);
    const yearStart = seasons[0]?.startDateStr;
    if (!yearStart) return;
    const startScores = computeSpiritBeanScores(
      claimedSlug,
      dayBefore(yearStart),
    );
    const snap = scoresToDisplay(startScores);
    preYearDisplayRef.current = snap;
    setPreYearSpiritId(spiritZodiacIdFromDisplay(snap));
    displayRef.current = snap;
    targetRef.current = snap;
    setDisplay(snap);
  }, [selectedBeanYear]);

  const activeFortuneNode =
    activeIdx !== null ? (fortuneNodesInYear[activeIdx] ?? null) : null;

  // animate display values toward target when activeIdx changes
  useEffect(() => {
    targetRef.current = activeFortuneNode
      ? scoresToDisplay(activeFortuneNode.scores)
      : preYearDisplayRef.current;

    cancelAnimationFrame(rafRef.current);
    const step = () => {
      const next: DisplayValues = {
        flavour: lerpArr(
          displayRef.current.flavour,
          targetRef.current.flavour,
          0.15,
        ),
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

  // update base line height to end at last node's dot center
  useEffect(() => {
    const lastEl = nodeRefs.current[fortuneNodesInYear.length - 1];
    if (!lastEl || !timelineRef.current || !baseLineRef.current) return;
    const tlTop = timelineRef.current.getBoundingClientRect().top;
    const elRect = lastEl.getBoundingClientRect();
    baseLineRef.current.style.height = `${elRect.top + elRect.height / 2 - tlTop}px`;
  }, [fortuneNodesInYear, sectionZodiacs]);

  // scroll listener: track active node + fill bar
  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 640;
      const threshold =
        window.innerHeight * (isMobile ? (radarExpanded ? 0.6 : 0.45) : 0.35);
      let newActive: number | null = null;
      for (let i = 0; i < fortuneNodesInYear.length; i++) {
        const el = nodeRefs.current[i];
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) newActive = i;
      }
      setActiveIdx(newActive);

      if (fillRef.current && timelineRef.current) {
        if (newActive === null) {
          fillRef.current.style.height = "0px";
        } else {
          const activeEl = nodeRefs.current[newActive];
          if (activeEl) {
            const tlRect = timelineRef.current.getBoundingClientRect();
            const elRect = activeEl.getBoundingClientRect();
            const fillH = elRect.top + elRect.height / 2 - tlRect.top;
            fillRef.current.style.height = `${Math.max(0, fillH)}px`;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fortuneNodesInYear, radarExpanded]);

  if (nodes.length === 0) {
    return (
      <p className="text-zinc-500 text-sm text-center py-8">
        Your Beanstalk will grow as the seasons pass.
      </p>
    );
  }

  // ---------- year filter bar ----------

  const yearFilterBar = (
    <div className="flex justify-center w-full">
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {beanYears.map((year) => {
          const seasons = getAllSeasonsForBeanYear(year);
          const bId = seasons[0]?.beanId;
          const fId = seasons[0]?.flavourId;
          const bName = bId ? (data.beans[bId]?.name ?? bId) : String(year);
          const fName = fId ? (data.flavours[fId]?.name ?? fId) : "";
          const isSelected = year === selectedBeanYear;
          return (
            <button
              key={year}
              onClick={() => {
                if (!isSelected) {
                  setSelectedBeanYear(year);
                  topRef.current?.scrollIntoView({ behavior: "instant" });
                }
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-950 cursor-default"
                  : "border-zinc-700 bg-zinc-800 hover:border-zinc-500 cursor-pointer"
              }`}
            >
              {bId && (
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                    backgroundColor: `var(--bean-${bId})`,
                    maskImage: `url('/images/${bId}.svg')`,
                    maskSize: "contain",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskImage: `url('/images/${bId}.svg')`,
                    WebkitMaskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                  }}
                />
              )}
              <span
                style={
                  isSelected
                    ? {}
                    : {
                        background: `linear-gradient(135deg, var(--flavour-${fId}) 60%, var(--bean-${bId}) 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }
                }
              >
                {fName} {bName}
              </span>
              <span className="text-zinc-500 text-xs">{year}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const selectedYearIdx = beanYears.indexOf(selectedBeanYear);
  const prevYear = beanYears[selectedYearIdx - 1] ?? null;
  const nextYear = beanYears[selectedYearIdx + 1] ?? null;

  // ---------- spirit zodiac for left panel ----------
  const spiritId = activeFortuneNode?.spiritZodiacId ?? preYearSpiritId;
  const spiritParts = spiritId ? zodiacParts(spiritId) : null;
  const spiritFlavourId = spiritParts?.[0];
  const spiritFormId = spiritParts?.[1];
  const spiritBeanId = spiritParts?.[2];
  const spiritBean = spiritBeanId ? data.beans[spiritBeanId] : null;
  const spiritPreparation =
    spiritFlavourId && spiritFormId
      ? getPreparationName(spiritFlavourId, spiritFormId)
      : "";

  return (
    <div className="w-full flex flex-col sm:gap-4" ref={topRef}>
      <h2 className="text-2xl sm:text-4xl text-center font-bold mb-4">
        Timeline
      </h2>
      {yearFilterBar}
      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        {/* ── Left: sticky spirit bean panel ── */}
        <div className="max-lg:-mx-4 max-lg:w-screen lg:w-80 shrink-0 sticky top-0 z-20 lg:h-svh flex flex-col lg:bg-transparent lg:border-none max-lg:pt-2 lg:pt-6 sm:pb-6">
          {/* Mobile: center card wrapper */}
          <div className="max-lg:relative max-lg:mx-auto max-lg:w-[95%] max-lg:bg-zinc-900 max-lg:border max-lg:border-zinc-700 max-lg:rounded-xl max-lg:shadow-[0_0_24px_rgba(0,0,0,0.6)] max-lg:px-4 max-lg:pt-3 max-lg:pb-4 lg:contents">
            {spiritId &&
              spiritFlavourId &&
              spiritFormId &&
              spiritBeanId &&
              spiritBean && (
                <div className="text-center shrink-0">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">
                    Spirit Bean
                  </p>
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
              onClick={() =>
                setRadarExpanded((v) => {
                  const next = !v;
                  localStorage.setItem(
                    "bean-zodiac-radar-expanded",
                    String(next),
                  );
                  return next;
                })
              }
              className="lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full bg-zinc-800 border border-zinc-400 text-zinc-400 text-xs cursor-pointer z-10"
            >
              {radarExpanded ? "Hide evolution ▲" : "See evolution ▼"}
            </button>

            {/* Mobile: tab switcher + single radar */}
            <div
              className={`flex-col lg:hidden ${radarExpanded ? "flex" : "hidden"}`}
            >
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
          {/* end mobile card wrapper */}

          {/* Desktop: stacked radar charts — fill remaining height */}
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

        {/* ── Right: scrollable timeline ── */}
        <div className="flex-1 relative min-w-0 mb-[80svh]" ref={timelineRef}>
          {/* Base line */}
          <div
            ref={baseLineRef}
            className="absolute top-0 w-0.5 bg-blue-950"
            style={{ left: "10px", height: 0 }}
          />
          {/* Fill line */}
          <div
            ref={fillRef}
            className="absolute top-0 w-0.5 bg-blue-500"
            style={{ left: "10px", height: 0 }}
          />

          <div className="flex flex-col">
            {yearSections.map(({ season, nodes: sectionNodes, startIdx }) => {
              const prep = getPreparationName(season.flavourId, season.formId);
              const flavour = data.flavours[season.flavourId];
              const form = data.forms[season.formId];
              const bean = data.beans[season.beanId];
              const beanName = bean?.name ?? season.beanId;
              const isEmpty = sectionNodes.length === 0;
              const zodiac = sectionZodiacs.get(season.zodiacId) ?? null;

              return (
                <div key={season.key}>
                  {/* Section header */}
                  <div className="pl-8 pt-10 pb-4 flex flex-col items-center text-center gap-2">
                    {loadingZodiacs && !zodiac ? (
                      <div className="h-3 w-40 rounded bg-zinc-800 animate-pulse" />
                    ) : (
                      <p className="text-xs text-zinc-500">
                        {zodiac ? `The ${zodiac.trait} Season of the` : "The Season of the"}
                      </p>
                    )}
                    <p className="text-sm font-bold uppercase tracking-widest text-zinc-200">
                      <ZodiacName
                        flavourId={season.flavourId}
                        formId={season.formId}
                        beanId={season.beanId}
                        preparation={prep}
                        beanName={beanName}
                        zodiacId={season.zodiacId}
                      />
                    </p>
                    {bean && (
                      <div className="w-16 h-16 my-6">
                        <Bean
                          bean={bean}
                          flavourId={season.flavourId}
                          formId={season.formId}
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      <FlavourBadge
                        id={season.flavourId}
                        name={flavour.name}
                        label="Phase"
                        small
                      />
                      <span className="text-zinc-700 text-xs">×</span>
                      <FormBadge
                        id={season.formId}
                        name={form.name}
                        label="Season"
                        small
                      />
                      <span className="text-zinc-700 text-xs">×</span>
                      <BeanBadge
                        id={season.beanId}
                        name={beanName}
                        label="Year"
                        small
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatDisplayDate(season.startDateStr)} –{" "}
                      {formatDisplayDate(season.endDateStr)}
                    </p>
                    {loadingZodiacs && !zodiac ? (
                      <div className="flex flex-col gap-1.5 w-64 mt-1">
                        <div className="h-3 rounded bg-zinc-800 animate-pulse" />
                        <div className="h-3 w-4/5 mx-auto rounded bg-zinc-800 animate-pulse" />
                      </div>
                    ) : zodiac ? (
                      <p className="italic text-zinc-300 text-sm max-w-sm mt-1">
                        "{zodiac.seasonalFortune}"
                      </p>
                    ) : null}
                  </div>

                  {isEmpty ? (
                    <div className="pl-8 pb-4 text-center">
                      <p className="text-zinc-700 text-sm italic">
                        No fortunes recorded this season.
                      </p>
                    </div>
                  ) : (
                    sectionNodes.map((node, localIdx) => {
                      const globalIdx = startIdx + localIdx;
                      const isActive = globalIdx === activeIdx;
                      const [fId, frId, bId] = zodiacParts(
                        node.fortuneZodiacId,
                      );
                      const fortuneBean = data.beans[bId];
                      const nodeProp = getPreparationName(fId, frId);
                      const accepted = node.score > 0;

                      return (
                        <div
                          key={`fortune-${node.date}`}
                          ref={(el) => {
                            nodeRefs.current[globalIdx] = el;
                          }}
                          className="relative flex items-center gap-4 py-3"
                        >
                          {/* Dot */}
                          <div
                            className="relative z-10 left-1.25 shrink-0 rounded-full transition-all duration-200"
                            style={{
                              width: 12,
                              height: 12,
                              transform: `${isActive ? "scale(1.5)" : "scale(1)"}`,
                              backgroundColor: isActive ? "#3b82f6" : "#1e3a5f",
                              boxShadow: isActive
                                ? "0 0 0 3px rgba(59,130,246,0.25)"
                                : "none",
                            }}
                          />

                          {/* Fortune card */}
                          <div
                            className={`flex-1 min-w-0 rounded-2xl border-2 p-4 transition-colors ${isActive ? "border-blue-800 bg-zinc-900" : "border-zinc-800 bg-zinc-900/60"}`}
                          >
                            <div className="flex items-center gap-6">
                              {fortuneBean && (
                                <div
                                  className="shrink-0"
                                  style={{ width: "3rem" }}
                                >
                                  <Bean
                                    bean={fortuneBean}
                                    flavourId={fId}
                                    formId={frId}
                                    qualityId={node.qualityId}
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-zinc-500 mb-1">
                                  {formatDisplayDate(node.date)}
                                </p>

                                {fortuneBean && (
                                  <p className="text-sm font-bold uppercase tracking-widest text-zinc-200 mb-2">
                                    <ZodiacName
                                      flavourId={fId}
                                      formId={frId}
                                      beanId={bId}
                                      preparation={nodeProp}
                                      beanName={fortuneBean.name}
                                      zodiacId={node.fortuneZodiacId}
                                      qualityId={node.qualityId}
                                    />
                                  </p>
                                )}

                                <p className="italic text-zinc-300 text-sm mb-3">
                                  "{node.text}"
                                </p>

                                {node.score === 0 ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-blue-700 text-blue-500 text-xs">
                                    <span>💤</span>
                                    <span>Ignored</span>
                                  </span>
                                ) : (
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs ${
                                      accepted
                                        ? "border-green-800 text-green-200"
                                        : "border-amber-800 text-amber-200"
                                    }`}
                                  >
                                    <span>{accepted ? "🌱" : "🍂"}</span>
                                    <span>
                                      {accepted ? "Accepted" : "Resisted"}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>

          {/* Prev / Next year navigation */}
          <div className="flex justify-between gap-4 mt-8">
            {prevYear !== null ? (
              (() => {
                const prevSeasons = getAllSeasonsForBeanYear(prevYear);
                const pBId = prevSeasons[0]?.beanId;
                const pFId = prevSeasons[0]?.flavourId;
                const pBName = pBId
                  ? (data.beans[pBId]?.name ?? pBId)
                  : String(prevYear);
                const pFName = pFId ? (data.flavours[pFId]?.name ?? pFId) : "";
                return (
                  <button
                    onClick={() => {
                      setSelectedBeanYear(prevYear);
                      topRef.current?.scrollIntoView({ behavior: "instant" });
                    }}
                    className="flex flex-col items-start px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:border-zinc-500 transition-colors text-sm cursor-pointer"
                  >
                    <span className="text-zinc-500 text-xs mb-1">
                      ← Previous year
                    </span>
                    <span className="text-zinc-200 font-medium">
                      {pFName} {pBName}{" "}
                      <span className="text-zinc-500">{prevYear}</span>
                    </span>
                  </button>
                );
              })()
            ) : (
              <div />
            )}

            {nextYear !== null ? (
              (() => {
                const nextSeasons = getAllSeasonsForBeanYear(nextYear);
                const nBId = nextSeasons[0]?.beanId;
                const nFId = nextSeasons[0]?.flavourId;
                const nBName = nBId
                  ? (data.beans[nBId]?.name ?? nBId)
                  : String(nextYear);
                const nFName = nFId ? (data.flavours[nFId]?.name ?? nFId) : "";
                return (
                  <button
                    onClick={() => {
                      setSelectedBeanYear(nextYear);
                      topRef.current?.scrollIntoView({ behavior: "instant" });
                    }}
                    className="flex flex-col items-end px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:border-zinc-500 transition-colors text-sm cursor-pointer"
                  >
                    <span className="text-zinc-500 text-xs mb-1">
                      Next year →
                    </span>
                    <span className="text-zinc-200 font-medium">
                      {nFName} {nBName}{" "}
                      <span className="text-zinc-500">{nextYear}</span>
                    </span>
                  </button>
                );
              })()
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
