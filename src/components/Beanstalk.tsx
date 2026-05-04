import { useEffect, useMemo, useRef, useState } from "react";
import {
  getBeanYear,
  getPreparationName,
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacId,
} from "../lib/zodiac";
import type { AllZodiacData } from "../lib/data";
import { fetchZodiac } from "../lib/data";
import type { Zodiac } from "../lib/zodiac";
import {
  computeSpiritBeanScores,
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
  key: string; // startDate string
  zodiacId: ZodiacId;
  flavourId: FlavourId;
  formId: FormId;
  beanId: BeanId;
  startDateStr: string;
  endDateStr: string;
  beanYear: number;
}

// ---------- props ----------

interface Props {
  nodes: BeanstalkNode[];
  currentScores: SpiritBeanScores;
  data: AllZodiacData;
  claimedSlug: ZodiacId;
}

export default function Beanstalk({
  nodes,
  currentScores,
  data,
  claimedSlug,
}: Props) {
  const [claimedFlavourId, claimedFormId, claimedBeanId] =
    zodiacParts(claimedSlug);

  // ---------- season filter ----------

  const seasons = useMemo<SeasonFilter[]>(() => {
    const seen = new Map<string, SeasonFilter>();
    for (const node of nodes) {
      if (node.kind !== "fortune") continue;
      const [y, m, d] = node.date.split("-").map(Number);
      const meta = getZodiacMetadataForDate(new Date(y, m - 1, d));
      const startKey = formatDate(meta.startDate);
      if (!seen.has(startKey)) {
        const [fId, frId, bId] = meta.zodiacId.split("-") as [
          FlavourId,
          FormId,
          BeanId,
        ];
        seen.set(startKey, {
          key: startKey,
          zodiacId: meta.zodiacId,
          flavourId: fId,
          formId: frId,
          beanId: bId,
          startDateStr: startKey,
          endDateStr: formatDate(meta.endDate),
          beanYear: getBeanYear(meta.startDate),
        });
      }
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.startDateStr.localeCompare(b.startDateStr),
    );
  }, [nodes]);

  const [selectedSeasonKey, setSelectedSeasonKey] = useState<string | null>(
    () => {
      const meta = getZodiacMetadataForDate(new Date());
      return formatDate(meta.startDate);
    },
  );
  const [seasonZodiac, setSeasonZodiac] = useState<Zodiac | null>(null);

  const filteredNodes = useMemo(() => {
    if (!selectedSeasonKey) return nodes;
    const season = seasons.find((s) => s.key === selectedSeasonKey);
    if (!season) return nodes;
    return nodes.filter(
      (n) => n.date >= season.startDateStr && n.date <= season.endDateStr,
    );
  }, [nodes, selectedSeasonKey, seasons]);

  // Find first fortune node to seed display values
  const firstFortune = filteredNodes.find((n) => n.kind === "fortune") as
    | (BeanstalkNode & { kind: "fortune" })
    | undefined;

  const initialDisplay = firstFortune
    ? scoresToDisplay(firstFortune.scores)
    : scoresToDisplay(currentScores);

  const [activeIdx, setActiveIdx] = useState(0);
  const [activeRadarTab, setActiveRadarTab] = useState<
    "flavour" | "form" | "bean"
  >("flavour");
  const [radarExpanded, setRadarExpanded] = useState(false);
  const [display, setDisplay] = useState<DisplayValues>(initialDisplay);

  const displayRef = useRef<DisplayValues>(initialDisplay);
  const targetRef = useRef<DisplayValues>(initialDisplay);
  const rafRef = useRef<number>(0);

  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);
  const baseLineRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // fetch season zodiac for seasonalFortune display
  useEffect(() => {
    const sel = seasons.find((s) => s.key === selectedSeasonKey);
    if (!sel) return;
    setSeasonZodiac(null);
    fetchZodiac(sel.zodiacId).then(setSeasonZodiac);
  }, [selectedSeasonKey, seasons]);

  // reset + snap radar to start-of-season scores when filter changes
  useEffect(() => {
    setActiveIdx(0);
    const season = seasons.find((s) => s.key === selectedSeasonKey);
    if (!season) return;
    const startScores = computeSpiritBeanScores(
      claimedSlug,
      dayBefore(season.startDateStr),
    );
    const snap = scoresToDisplay(startScores);
    displayRef.current = snap;
    targetRef.current = snap;
    setDisplay(snap);
  }, [selectedSeasonKey]);

  // find the active fortune node (nearest fortune at or before activeIdx)
  const activeFortuneNode = (() => {
    for (let i = activeIdx; i >= 0; i--) {
      const n = filteredNodes[i];
      if (n?.kind === "fortune") return n;
    }
    return firstFortune ?? null;
  })();

  // animate display values toward target when activeIdx changes
  useEffect(() => {
    if (!activeFortuneNode) return;
    targetRef.current = scoresToDisplay(activeFortuneNode.scores);

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
    const lastEl = nodeRefs.current[filteredNodes.length - 1];
    if (!lastEl || !timelineRef.current || !baseLineRef.current) return;
    const tlTop = timelineRef.current.getBoundingClientRect().top;
    const elRect = lastEl.getBoundingClientRect();
    baseLineRef.current.style.height = `${elRect.top + elRect.height / 2 - tlTop}px`;
  }, [filteredNodes]);

  // scroll listener: track active node + fill bar
  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 640;
      const threshold =
        window.innerHeight * (isMobile ? (radarExpanded ? 0.6 : 0.45) : 0.35);
      let newActive = 0;
      for (let i = 0; i < filteredNodes.length; i++) {
        const el = nodeRefs.current[i];
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) newActive = i;
      }
      setActiveIdx(newActive);

      if (fillRef.current && timelineRef.current) {
        const activeEl = nodeRefs.current[newActive];
        if (activeEl) {
          const tlRect = timelineRef.current.getBoundingClientRect();
          const elRect = activeEl.getBoundingClientRect();
          const fillH = elRect.top + elRect.height / 2 - tlRect.top;
          fillRef.current.style.height = `${Math.max(0, fillH)}px`;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredNodes, radarExpanded]);

  if (nodes.length === 0) {
    return (
      <p className="text-zinc-500 text-sm text-center py-8">
        Your Beanstalk will grow as the seasons pass.
      </p>
    );
  }

  // ---------- season filter badges ----------
  // Group form-seasons by Bean Year
  const seasonsByBeanYear = useMemo(() => {
    const groups = new Map<number, SeasonFilter[]>();
    for (const s of seasons) {
      if (!groups.has(s.beanYear)) groups.set(s.beanYear, []);
      groups.get(s.beanYear)!.push(s);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a - b);
  }, [seasons]);

  const seasonFilterBar = seasons.length > 0 && (
    <div className="flex justify-center w-full">
      <div className="flex flex-col gap-2 mb-8 w-full max-w-2xl">
        {seasonsByBeanYear.map(([beanYear, group]) => {
          const beanId = group[0]!.beanId;
          const beanName = data.beans[beanId]?.name ?? beanId;
          const groupHasSelected = group.some(
            (s) => s.key === selectedSeasonKey,
          );
          return (
            <div
              key={beanYear}
              className={`flex flex-col gap-2 rounded-xl border px-4 py-2.5 transition-colors ${
                groupHasSelected
                  ? "border-zinc-600 bg-zinc-900"
                  : "border-zinc-800 bg-zinc-900/40"
              }`}
            >
              {/* Bean Year header */}
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                    backgroundColor: `var(--bean-${beanId})`,
                    maskImage: `url('/images/${beanId}.svg')`,
                    maskSize: "contain",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskImage: `url('/images/${beanId}.svg')`,
                    WebkitMaskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                  }}
                />
                <span className={`text-sm font-semibold bean-${beanId}`}>
                  {beanName}
                </span>
                <span className="text-sm text-zinc-500">{beanYear}</span>
              </div>
              {/* Form-season badges */}
              <div className="flex flex-wrap gap-1.5">
                {group.map((s) => {
                  const prep = getPreparationName(s.flavourId, s.formId);
                  const isSelected = selectedSeasonKey === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => {
                        if (!isSelected) setSelectedSeasonKey(s.key);
                      }}
                      className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border text-xs sm:text-sm font-medium transition-colors ${
                        isSelected
                          ? "border-blue-500 bg-blue-950 cursor-default"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-500 cursor-pointer"
                      }`}
                    >
                      <span
                        style={{
                          background: `linear-gradient(135deg, var(--flavour-${s.flavourId}) 60%, var(--form-${s.formId}) 75%)`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {prep}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const selectedSeasonIdx = seasons.findIndex(
    (s) => s.key === selectedSeasonKey,
  );
  const prevSeason = seasons[selectedSeasonIdx - 1] ?? null;
  const nextSeason = seasons[selectedSeasonIdx + 1] ?? null;

  const navigateSeason = (key: string) => {
    setSelectedSeasonKey(key);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ---------- spirit zodiac for left panel ----------
  const spiritId = activeFortuneNode?.spiritZodiacId;
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
      {seasonFilterBar}
      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        {/* ── Left: sticky spirit bean panel ── */}
        <div className="max-lg:-mx-4 max-lg:w-screen lg:w-80 shrink-0 sticky top-0 z-20 lg:h-svh flex flex-col lg:bg-transparent lg:border-none max-lg:pt-2 lg:pt-6 sm:pb-6">
          {/* Mobile: center card wrapper */}
          <div className="max-lg:relative max-lg:mx-auto max-lg:w-[92%] max-lg:bg-zinc-900 max-lg:border max-lg:border-zinc-700 max-lg:rounded-xl max-lg:shadow-[0_0_24px_rgba(0,0,0,0.6)] max-lg:px-4 max-lg:pt-3 max-lg:pb-4 lg:contents">
            {spiritId &&
              spiritFlavourId &&
              spiritFormId &&
              spiritBeanId &&
              spiritBean && (
                <div className="text-center shrink-0">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">
                    Spirit Bean
                  </p>
                  <p className="text-lg font-bold leading-tight mb-1">
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
              onClick={() => setRadarExpanded((v) => !v)}
              className="lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs cursor-pointer z-10"
            >
              {radarExpanded ? "▲" : "▼"}
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
                      color: `var(--flavour-${claimedFlavourId})`,
                    },
                    {
                      key: "form",
                      label: "Form",
                      color: `var(--form-${claimedFormId})`,
                    },
                    {
                      key: "bean",
                      label: "Bean",
                      color: `var(--bean-${claimedBeanId})`,
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
          {/* Season header */}
          {(() => {
            const sel = seasons.find((s) => s.key === selectedSeasonKey);
            if (!sel) return null;
            const prep = getPreparationName(sel.flavourId, sel.formId);
            const bean = data.beans[sel.beanId];
            const beanName = bean?.name ?? sel.beanId;
            const flavour = data.flavours[sel.flavourId];
            const form = data.forms[sel.formId];
            return (
              <div className="mb-6 pl-8 flex items-center justify-center gap-8">
                {bean && (
                  <div className="w-18 h-18 shrink-0">
                    <Bean
                      bean={bean}
                      flavourId={sel.flavourId}
                      formId={sel.formId}
                    />
                  </div>
                )}
                <div className="flex flex-col sm:min-w-lg max-w-lg">
                  <p className="text-xs text-zinc-500 mb-1">
                    The Season of the
                  </p>
                  <p className="text-sm font-bold uppercase tracking-widest text-zinc-200 mb-2">
                    <ZodiacName
                      flavourId={sel.flavourId}
                      formId={sel.formId}
                      beanId={sel.beanId}
                      preparation={prep}
                      beanName={beanName}
                      zodiacId={sel.zodiacId}
                    />
                  </p>
                  <div className="flex flex-wrap items-center gap-1 mb-3">
                    <FlavourBadge
                      id={sel.flavourId}
                      name={flavour.name}
                      label="Phase"
                      small
                    />
                    <span className="text-zinc-700 text-xs">×</span>
                    <FormBadge
                      id={sel.formId}
                      name={form.name}
                      label="Season"
                      small
                    />
                    <span className="text-zinc-700 text-xs">×</span>
                    <BeanBadge
                      id={sel.beanId}
                      name={beanName}
                      label="Year"
                      small
                    />
                  </div>
                  {seasonZodiac && (
                    <p className="italic text-zinc-300 text-sm">
                      "{seasonZodiac.seasonalFortune}"
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
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
            {filteredNodes.map((node, i) => {
              const isActive = i === activeIdx;

              const [fId, frId, bId] = zodiacParts(node.fortuneZodiacId);
              const fortuneBean = data.beans[bId];
              const prep = getPreparationName(fId, frId);
              const accepted = node.score > 0;

              return (
                <div
                  key={`fortune-${node.date}`}
                  ref={(el) => {
                    nodeRefs.current[i] = el;
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
                        <div className="shrink-0" style={{ width: "3rem" }}>
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
                              preparation={prep}
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
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-500 text-xs">
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
                            <span>{accepted ? "Accepted" : "Resisted"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prev / Next season navigation */}
          <div className="flex justify-between gap-4 mt-8">
            {prevSeason ? (
              <button
                onClick={() => navigateSeason(prevSeason.key)}
                className="flex flex-col items-start px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:border-zinc-500 transition-colors text-sm cursor-pointer"
              >
                <span className="text-zinc-500 text-xs mb-1">
                  ← Previous season
                </span>
                <ZodiacName
                  key={prevSeason.zodiacId}
                  flavourId={prevSeason.flavourId}
                  formId={prevSeason.formId}
                  beanId={prevSeason.beanId}
                  preparation={getPreparationName(
                    prevSeason.flavourId,
                    prevSeason.formId,
                  )}
                  beanName={
                    data.beans[prevSeason.beanId]?.name ?? prevSeason.beanId
                  }
                />
              </button>
            ) : (
              <div />
            )}

            {nextSeason ? (
              <button
                onClick={() => navigateSeason(nextSeason.key)}
                className="flex flex-col items-end px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:border-zinc-500 transition-colors text-sm cursor-pointer"
              >
                <span className="text-zinc-500 text-xs mb-1">
                  Next season →
                </span>
                <ZodiacName
                  key={nextSeason.zodiacId}
                  flavourId={nextSeason.flavourId}
                  formId={nextSeason.formId}
                  beanId={nextSeason.beanId}
                  preparation={getPreparationName(
                    nextSeason.flavourId,
                    nextSeason.formId,
                  )}
                  beanName={
                    data.beans[nextSeason.beanId]?.name ?? nextSeason.beanId
                  }
                />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
