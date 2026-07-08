import { useEffect, useMemo, useRef, useState } from "react";
import {
  getPreparationName,
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacId,
} from "../../../lib/zodiac";
import { fetchZodiac, type AllZodiacData } from "../../../lib/data";
import type { Zodiac } from "../../../lib/zodiac";
import type { BeanstalkNode } from "../../../lib/spiritBean";
import { useStore } from "../../../store";
import FlavourBadge from "../../zodiac/FlavourBadge";
import FormBadge from "../../zodiac/FormBadge";
import BeanBadge from "../../zodiac/BeanBadge";
import ZodiacName from "../../zodiac/ZodiacName";
import Bean from "../../zodiac/Bean";
import LazyMount from "../../LazyMount";
import FortuneScoreBadge from "../../zodiac/FortuneScoreBadge";
import FortuneAnswerBadge from "../../zodiac/FortuneAnswerBadge";
import { formatDisplayDate, zodiacParts, type SeasonFilter } from "./helpers";

interface YearSection {
  season: SeasonFilter;
  nodes: BeanstalkNode[];
  startIdx: number;
}

interface Props {
  data: AllZodiacData;
  yearSections: YearSection[];
  fortuneNodesInYear: BeanstalkNode[];
  activeIdx: number | null;
  onActiveIdxChange: (idx: number | null) => void;
  radarExpanded: boolean;
  showBorn: boolean;
  claimedBeanId: BeanId;
  claimedFlavourId: FlavourId;
  claimedFormId: FormId;
  claimedSlug: ZodiacId;
  claimedOn: string | null;
}

export default function Timeline({
  data,
  yearSections,
  fortuneNodesInYear,
  onActiveIdxChange,
  activeIdx,
  radarExpanded,
  showBorn,
  claimedBeanId,
  claimedFlavourId,
  claimedFormId,
  claimedSlug,
  claimedOn,
}: Props) {
  const bornIdx = fortuneNodesInYear.length;
  const totalNodes = fortuneNodesInYear.length + (showBorn ? 1 : 0);

  // Persisted season recaps, keyed by season start date for per-section lookup.
  const seasonSummaries = useStore((s) => s.seasonSummaries);
  const summaryByKey = useMemo(
    () => new Map(seasonSummaries.map((s) => [s.seasonKey, s])),
    [seasonSummaries],
  );
  const [sectionZodiacs, setSectionZodiacs] = useState<Map<string, Zodiac>>(
    new Map(),
  );
  const [loadingZodiacs, setLoadingZodiacs] = useState(false);
  const pendingFetches = useRef(0);

  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);
  const baseLineRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

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

  // update base line height to end at last node's dot center
  useEffect(() => {
    const lastEl = nodeRefs.current[totalNodes - 1];
    if (!lastEl || !timelineRef.current || !baseLineRef.current) return;
    const tlTop = timelineRef.current.getBoundingClientRect().top;
    const elRect = lastEl.getBoundingClientRect();
    baseLineRef.current.style.height = `${elRect.top + elRect.height / 2 - tlTop}px`;
  }, [totalNodes, sectionZodiacs]);

  // scroll listener: track active node + fill bar
  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 640;
      const threshold =
        window.innerHeight * (isMobile ? (radarExpanded ? 0.6 : 0.45) : 0.35);
      let newActive: number | null = null;
      for (let i = 0; i < totalNodes; i++) {
        const el = nodeRefs.current[i];
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) newActive = i;
      }
      onActiveIdxChange(newActive);

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
  }, [totalNodes, radarExpanded, onActiveIdxChange]);

  const sectionsRendered = useMemo(
    () =>
      yearSections.map(({ season, nodes: sectionNodes, startIdx }) => {
        const prep = getPreparationName(season.flavourId, season.formId);
        const flavour = data.flavours[season.flavourId];
        const form = data.forms[season.formId];
        const bean = data.beans[season.beanId];
        const beanName = bean?.name ?? season.beanId;
        const isEmpty = sectionNodes.length === 0;
        const zodiac = sectionZodiacs.get(season.zodiacId) ?? null;

        if (isEmpty) return null;

        return (
          <div key={season.key}>
            <div className="pl-8 pt-10 pb-4 flex flex-col items-center text-center gap-2">
              {loadingZodiacs && !zodiac ? (
                <div className="h-3 w-40 rounded bg-zinc-800 animate-pulse" />
              ) : (
                <p className="text-xs text-zinc-500">
                  {zodiac
                    ? `The ${zodiac.trait} season of the`
                    : "The season of the"}
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
                  <LazyMount placeholder={<div className="w-16 h-16" />}>
                    <Bean
                      bean={bean}
                      flavourId={season.flavourId}
                      formId={season.formId}
                    />
                  </LazyMount>
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
              {(() => {
                const summary = summaryByKey.get(season.startDateStr);
                if (!summary) return null;
                return (
                  <div className="mt-4 flex flex-col items-center gap-2 max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
                    <p className="text-[0.65rem] tracking-widest uppercase text-zinc-500">
                      The season's reading
                    </p>
                    <ul className="flex flex-col items-center gap-1.5">
                      {summary.observations.map((line, i) => (
                        <li
                          key={i}
                          className="text-xs italic text-zinc-400 text-center text-balance"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>

            {sectionNodes.map((node, localIdx) => {
              const globalIdx = startIdx + localIdx;
              const isActive = globalIdx === activeIdx;
              const [fId, frId, bId] = zodiacParts(node.fortuneZodiacId);
              const fortuneBean = data.beans[bId];
              const nodeProp = getPreparationName(fId, frId);

              return (
                <div
                  key={`fortune-${node.date}`}
                  ref={(el) => {
                    nodeRefs.current[globalIdx] = el;
                  }}
                  className="relative flex items-center gap-4 py-3"
                >
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

                  <div
                    className={`flex-1 min-w-0 rounded-2xl border-2 p-4 transition-colors ${isActive ? "border-blue-800 bg-zinc-900" : "border-zinc-800 bg-zinc-900/60"}`}
                  >
                    <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-4 sm:gap-6">
                      <div className="order-1 sm:order-2 flex-1 min-w-0 w-full">
                        <p className="text-xs text-zinc-500 mb-1">
                          {formatDisplayDate(node.date)}
                        </p>

                        {fortuneBean && (
                          <p className="text-sm font-bold uppercase tracking-widest text-zinc-200 sm:mb-2">
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
                        <div className="hidden sm:block">
                          {node.text ? (
                            <p className="italic text-zinc-300 text-sm mb-2">
                              "{node.text}"
                            </p>
                          ) : (
                            <p className="italic text-zinc-500 text-xs mb-2">
                              This bean had nothing to say to you this day.
                            </p>
                          )}
                          <hr className="border-t border-zinc-800 mt-1 mb-2" />
                          {node.variant === "question" && node.question ? (
                            <p className="italic text-zinc-500 text-xs mb-2">
                              {node.question}
                            </p>
                          ) : node.variant === "rorschach" &&
                            node.rorschachImage ? (
                            <div
                              aria-hidden
                              className="w-14 h-14 bg-zinc-200 mb-2"
                              style={{
                                maskImage: `url(${node.rorschachImage})`,
                                WebkitMaskImage: `url(${node.rorschachImage})`,
                                maskRepeat: "no-repeat",
                                WebkitMaskRepeat: "no-repeat",
                                maskSize: "contain",
                                WebkitMaskSize: "contain",
                                maskPosition: "center",
                                WebkitMaskPosition: "center",
                              }}
                            />
                          ) : (
                            node.facetText && (
                              <p className="italic text-zinc-500 text-xs mb-2">
                                {node.facetTitle && (
                                  <span className="not-italic font-semibold text-zinc-400">
                                    {node.facetTitle}:{" "}
                                  </span>
                                )}
                                {node.facetText}
                              </p>
                            )
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            {node.variant === "question" && node.answerText ? (
                              <FortuneAnswerBadge
                                answerText={node.answerText}
                                size="sm"
                              />
                            ) : node.variant === "rorschach" &&
                              node.rorschachText ? (
                              <FortuneAnswerBadge
                                answerText={node.rorschachText}
                                size="sm"
                              />
                            ) : (
                              <FortuneScoreBadge score={node.score} size="sm" />
                            )}
                          </div>
                        </div>
                      </div>
                      {fortuneBean && (
                        <div
                          className="shrink-0 order-2 sm:order-1"
                          style={{ width: "3rem" }}
                        >
                          <LazyMount placeholder={<div style={{ width: "3rem", height: "4rem" }} />}>
                            <Bean
                              bean={fortuneBean}
                              flavourId={fId}
                              formId={frId}
                              qualityId={node.qualityId}
                            />
                          </LazyMount>
                        </div>
                      )}
                      <div className="order-3 w-full flex flex-col items-center sm:hidden">
                        {node.text ? (
                          <p className="italic text-zinc-300 text-sm mb-2">
                            "{node.text}"
                          </p>
                        ) : (
                          <p className="italic text-zinc-500 text-xs mb-2">
                            This bean had nothing to say to you this day.
                          </p>
                        )}
                        <hr className="border-t border-zinc-800 mt-1 mb-2 w-full" />
                        {node.variant === "question" && node.question ? (
                          <p className="italic text-zinc-500 text-xs mb-2">
                            {node.question}
                          </p>
                        ) : node.variant === "rorschach" &&
                          node.rorschachImage ? (
                          <div
                            aria-hidden
                            className="w-14 h-14 bg-zinc-200 mb-2"
                            style={{
                              maskImage: `url(${node.rorschachImage})`,
                              WebkitMaskImage: `url(${node.rorschachImage})`,
                              maskRepeat: "no-repeat",
                              WebkitMaskRepeat: "no-repeat",
                              maskSize: "contain",
                              WebkitMaskSize: "contain",
                              maskPosition: "center",
                              WebkitMaskPosition: "center",
                            }}
                          />
                        ) : (
                          node.facetText && (
                            <p className="italic text-zinc-500 text-xs mb-2">
                              {node.facetTitle && (
                                <span className="not-italic font-semibold text-zinc-400">
                                  {node.facetTitle}:{" "}
                                </span>
                              )}
                              {node.facetText}
                            </p>
                          )
                        )}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {node.variant === "question" && node.answerText ? (
                            <FortuneAnswerBadge
                              answerText={node.answerText}
                              size="sm"
                            />
                          ) : node.variant === "rorschach" &&
                            node.rorschachText ? (
                            <FortuneAnswerBadge
                              answerText={node.rorschachText}
                              size="sm"
                            />
                          ) : (
                            <FortuneScoreBadge score={node.score} size="sm" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }),
    [yearSections, sectionZodiacs, loadingZodiacs, activeIdx, data, summaryByKey],
  );

  return (
    <div className="flex-1 relative min-w-0 mb-[80svh]" ref={timelineRef}>
      <div
        ref={baseLineRef}
        className="absolute top-0 w-0.5 bg-blue-950"
        style={{ left: "10px", height: 0 }}
      />
      <div
        ref={fillRef}
        className="absolute top-0 w-0.5 bg-blue-500"
        style={{ left: "10px", height: 0 }}
      />
      <div className="flex flex-col">
        {sectionsRendered}
        {showBorn &&
          (() => {
            const claimedBean = data.beans[claimedBeanId];
            const claimedBeanName = claimedBean?.name ?? claimedBeanId;
            const claimedPrep = getPreparationName(
              claimedFlavourId,
              claimedFormId,
            );
            const isActive = activeIdx === bornIdx;
            return (
              <div
                ref={(el) => {
                  nodeRefs.current[bornIdx] = el;
                }}
                className="relative flex items-center gap-4 py-3"
                style={{ scrollMarginTop: "45svh" }}
              >
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

                <div
                  className={`flex-1 min-w-0 rounded-2xl border-2 p-4 transition-colors ${isActive ? "border-blue-800 bg-zinc-900" : "border-zinc-800 bg-zinc-900/60"}`}
                >
                  <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-4 sm:gap-6">
                    {claimedOn && (
                      <p className="text-xs text-zinc-500 order-1 sm:hidden">
                        {formatDisplayDate(claimedOn)}
                      </p>
                    )}
                    {claimedBean && (
                      <div
                        className="shrink-0 order-2 sm:order-1"
                        style={{ width: "3rem" }}
                      >
                        <LazyMount placeholder={<div style={{ width: "3rem", height: "4rem" }} />}>
                          <Bean
                            bean={claimedBean}
                            flavourId={claimedFlavourId}
                            formId={claimedFormId}
                          />
                        </LazyMount>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 order-3 sm:order-2 w-full">
                      {claimedOn && (
                        <p className="hidden sm:block text-xs text-zinc-500 mb-1">
                          {formatDisplayDate(claimedOn)}
                        </p>
                      )}
                      <p className="text-sm font-bold uppercase tracking-widest text-zinc-200 sm:mb-2">
                        You claimed the{" "}
                        <ZodiacName
                          flavourId={claimedFlavourId}
                          formId={claimedFormId}
                          beanId={claimedBeanId}
                          preparation={claimedPrep}
                          beanName={claimedBeanName}
                          zodiacId={claimedSlug}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
