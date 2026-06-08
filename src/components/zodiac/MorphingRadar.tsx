import { useEffect, useRef } from "react";
import type { BeanId, FlavourId, FormId } from "../../lib/zodiac";
import { FLAVOUR_EMOJI, FORM_EMOJI } from "../../lib/zodiac";
import {
  SPIRIT_BEAN_RING,
  SPIRIT_FLAVOUR_RING,
  SPIRIT_FORM_RING,
} from "../../lib/spiritBean";
import type { AllZodiacData } from "../../lib/data";

type TabKey = "bean" | "flavour" | "form";

interface Props {
  data: AllZodiacData;
  activeTab: TabKey;
  claimedFlavourId: FlavourId;
  claimedFormId: FormId;
  claimedBeanId: BeanId;
  flavourValues: number[];
  formValues: number[];
  beanValues: number[];
  flavourHighlight: number;
  formHighlight: number;
  beanHighlight: number;
}

const N = 60; // LCM(5, 6, 12)
const CX = 150;
const CY = 150;
const MAX_RADIUS = 88;
const INACTIVE_RADIUS = 18;
const LABEL_RADIUS = 106;
const ANIM_MS = 300;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1.0] as const;

// Union of bean (step 5) and flavour (step 12) positions in [0..59].
// Form (step 10) is a subset of bean so it's already covered.
const SPOKE_INDICES: number[] = [
  ...new Set([
    ...Array.from({ length: 12 }, (_, i) => i * 5),
    ...Array.from({ length: 5 }, (_, i) => i * 12),
  ]),
].sort((a, b) => a - b);
// [0, 5, 10, 12, 15, 20, 24, 25, 30, 35, 36, 40, 45, 48, 50, 55]

function getActiveSet(tab: TabKey): Set<number> {
  if (tab === "bean") return new Set(Array.from({ length: 12 }, (_, i) => i * 5));
  if (tab === "form") return new Set(Array.from({ length: 6 }, (_, i) => i * 10));
  return new Set(Array.from({ length: 5 }, (_, i) => i * 12));
}

function expandToN(points: [number, number][], n: number): [number, number][] {
  const perEdge = n / points.length;
  const result: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    for (let j = 0; j < perEdge; j++) {
      const t = j / perEdge;
      result.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
    }
  }
  return result;
}

function regularPolygon(n: number, radius: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)];
  });
}

function dataPolygon(values: number[]): [number, number][] {
  const maxVal = Math.max(...values, 40);
  return values.map((v, i) => {
    const angle = (i / values.length) * 2 * Math.PI - Math.PI / 2;
    const r = (v / maxVal) * MAX_RADIUS;
    return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
  });
}

function lerpPoints(
  a: [number, number][],
  b: [number, number][],
  t: number,
): [number, number][] {
  return a.map(([ax, ay], i) => [
    ax + (b[i][0] - ax) * t,
    ay + (b[i][1] - ay) * t,
  ]);
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function toPath(points: [number, number][]): string {
  return (
    points
      .map(
        ([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`,
      )
      .join(" ") + " Z"
  );
}

function getExpanded(
  tab: TabKey,
  flavourValues: number[],
  formValues: number[],
  beanValues: number[],
) {
  const values =
    tab === "flavour"
      ? flavourValues
      : tab === "form"
        ? formValues
        : beanValues;
  return expandToN(dataPolygon(values), N);
}

function getGridExpanded(tab: TabKey, level: number): [number, number][] {
  const n = tab === "flavour" ? 5 : tab === "form" ? 6 : 12;
  return expandToN(regularPolygon(n, level * MAX_RADIUS), N);
}

export default function MorphingRadar({
  data,
  activeTab,
  claimedFlavourId,
  claimedFormId,
  claimedBeanId,
  flavourValues,
  formValues,
  beanValues,
  flavourHighlight,
  formHighlight,
  beanHighlight,
}: Props) {
  const dataPathRef = useRef<SVGPathElement>(null);
  const gridPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const spokeLineRefs = useRef<(SVGLineElement | null)[]>([]);

  const currentDataRef = useRef<[number, number][] | null>(null);
  const currentGridRef = useRef<[number, number][][]>(
    GRID_LEVELS.map((l) => getGridExpanded(activeTab, l)),
  );
  const spokeLengthsRef = useRef<number[]>(
    SPOKE_INDICES.map((idx) =>
      getActiveSet(activeTab).has(idx) ? MAX_RADIUS : INACTIVE_RADIUS,
    ),
  );

  const rafRef = useRef<number>(0);
  const spokeRafRef = useRef<number>(0);
  const prevTabRef = useRef<TabKey | null>(null);

  useEffect(() => {
    const tabChanged = prevTabRef.current !== activeTab;
    prevTabRef.current = activeTab;

    const targetData = getExpanded(
      activeTab,
      flavourValues,
      formValues,
      beanValues,
    );
    const startData = currentDataRef.current ?? targetData;

    cancelAnimationFrame(rafRef.current);

    if (!tabChanged) {
      currentDataRef.current = targetData;
      dataPathRef.current?.setAttribute("d", toPath(targetData));
      return;
    }

    const targetGrid = GRID_LEVELS.map((l) => getGridExpanded(activeTab, l));
    const startGrid = currentGridRef.current.length
      ? currentGridRef.current
      : targetGrid;
    const t0 = performance.now();

    const tick = (now: number) => {
      const raw = Math.min((now - t0) / ANIM_MS, 1);
      const t = easeInOut(raw);

      const dataPts = lerpPoints(startData, targetData, t);
      currentDataRef.current = dataPts;
      dataPathRef.current?.setAttribute("d", toPath(dataPts));

      const gridPts = targetGrid.map((tgt, i) =>
        lerpPoints(startGrid[i], tgt, t),
      );
      currentGridRef.current = gridPts;
      gridPts.forEach((pts, i) =>
        gridPathRefs.current[i]?.setAttribute("d", toPath(pts)),
      );

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        currentDataRef.current = targetData;
        currentGridRef.current = targetGrid;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeTab, flavourValues, formValues, beanValues]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const activeSet = getActiveSet(activeTab);
    const targets = SPOKE_INDICES.map((idx) =>
      activeSet.has(idx) ? MAX_RADIUS : INACTIVE_RADIUS,
    );
    const starts = [...spokeLengthsRef.current];
    const t0 = performance.now();

    cancelAnimationFrame(spokeRafRef.current);

    const tick = (now: number) => {
      const raw = Math.min((now - t0) / ANIM_MS, 1);
      const t = easeInOut(raw);

      SPOKE_INDICES.forEach((idx, si) => {
        const len = starts[si] + (targets[si] - starts[si]) * t;
        spokeLengthsRef.current[si] = len;
        const angle = (idx / N) * 2 * Math.PI - Math.PI / 2;
        const el = spokeLineRefs.current[si];
        if (el) {
          el.setAttribute("x2", (CX + len * Math.cos(angle)).toFixed(1));
          el.setAttribute("y2", (CY + len * Math.sin(angle)).toFixed(1));
        }
      });

      if (raw < 1) {
        spokeRafRef.current = requestAnimationFrame(tick);
      } else {
        spokeLengthsRef.current = targets;
      }
    };

    spokeRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(spokeRafRef.current);
  }, [activeTab]);

  const activeRing =
    activeTab === "flavour"
      ? SPIRIT_FLAVOUR_RING
      : activeTab === "form"
        ? SPIRIT_FORM_RING
        : SPIRIT_BEAN_RING;
  const n = activeRing.length;

  const activeSet = getActiveSet(activeTab);
  const highlightRingIdx =
    activeTab === "flavour"
      ? flavourHighlight
      : activeTab === "form"
        ? formHighlight
        : beanHighlight;
  const highlightGlobalIdx = SPOKE_INDICES.indexOf(
    activeTab === "flavour"
      ? flavourHighlight * 12
      : activeTab === "form"
        ? formHighlight * 10
        : beanHighlight * 5,
  );

  const colorVar =
    activeTab === "flavour"
      ? `var(--flavour-${SPIRIT_FLAVOUR_RING[flavourHighlight]})`
      : activeTab === "form"
        ? `var(--form-${SPIRIT_FORM_RING[formHighlight]})`
        : `var(--bean-${SPIRIT_BEAN_RING[beanHighlight]})`;

  const labels =
    activeTab === "flavour"
      ? SPIRIT_FLAVOUR_RING.map(
          (id) =>
            `${FLAVOUR_EMOJI[id]} ${data.flavours[id]?.name ?? id}${id === claimedFlavourId ? " 👤" : ""}`,
        )
      : activeTab === "form"
        ? SPIRIT_FORM_RING.map(
            (id) =>
              `${FORM_EMOJI[id]} ${data.forms[id]?.name ?? id}${id === claimedFormId ? " 👤" : ""}`,
          )
        : SPIRIT_BEAN_RING.map(
            (id) =>
              `${(data.beans[id]?.name ?? id).replace(/ Bean$/, "")}${id === claimedBeanId ? " 👤" : ""}`,
          );

  const labelColors =
    activeTab === "flavour"
      ? SPIRIT_FLAVOUR_RING.map((id) => `var(--flavour-${id})`)
      : activeTab === "form"
        ? SPIRIT_FORM_RING.map((id) => `var(--form-${id})`)
        : SPIRIT_BEAN_RING.map((id) => `var(--bean-${id})`);

  const dimShapes: { tab: TabKey; color: string; d: string }[] = [
    {
      tab: "flavour" as TabKey,
      color: `var(--flavour-${SPIRIT_FLAVOUR_RING[flavourHighlight]})`,
      d: toPath(dataPolygon(flavourValues)),
    },
    {
      tab: "form" as TabKey,
      color: `var(--form-${SPIRIT_FORM_RING[formHighlight]})`,
      d: toPath(dataPolygon(formValues)),
    },
    {
      tab: "bean" as TabKey,
      color: `var(--bean-${SPIRIT_BEAN_RING[beanHighlight]})`,
      d: toPath(dataPolygon(beanValues)),
    },
  ] as const;

  return (
    <div className="flex flex-col items-center h-full">
      <svg
        viewBox="15 15 270 270"
        className="w-full h-full max-w-85 max-h-full"
        overflow="visible"
        aria-hidden="true"
      >
        {GRID_LEVELS.map((level, i) => (
          <path
            key={level}
            ref={(el) => {
              gridPathRefs.current[i] = el;
            }}
            d={toPath(getGridExpanded(activeTab, level))}
            fill="none"
            stroke={level === 1.0 ? "#52525b" : "#3f3f46"}
            strokeWidth={level === 1.0 ? 1.5 : 1}
          />
        ))}

        {SPOKE_INDICES.map((idx, si) => {
          const angle = (idx / N) * 2 * Math.PI - Math.PI / 2;
          const len = spokeLengthsRef.current[si];
          const isActive = activeSet.has(idx);
          const isHighlight = si === highlightGlobalIdx;
          return (
            <line
              key={idx}
              ref={(el) => {
                spokeLineRefs.current[si] = el;
              }}
              x1={CX}
              y1={CY}
              x2={CX + len * Math.cos(angle)}
              y2={CY + len * Math.sin(angle)}
              stroke={isHighlight ? "#71717a" : "#3f3f46"}
              strokeWidth={isHighlight ? 1.5 : 1}
              strokeOpacity={isActive ? 1 : 0.35}
            />
          );
        })}

        {dimShapes.map(({ tab, color, d }) => (
          <path
            key={tab}
            d={d}
            style={{
              fill: color,
              stroke: color,
              transition: `fill ${ANIM_MS}ms, stroke ${ANIM_MS}ms`,
            }}
            fillOpacity={0.04}
            strokeOpacity={0.2}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        ))}

        <path
          ref={dataPathRef}
          d={toPath(getExpanded(activeTab, flavourValues, formValues, beanValues))}
          style={{
            fill: colorVar,
            stroke: colorVar,
            transition: `fill ${ANIM_MS}ms, stroke ${ANIM_MS}ms`,
          }}
          fillOpacity={0.2}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {labels.map((label, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const lx = CX + LABEL_RADIUS * Math.cos(angle);
          const ly = CY + LABEL_RADIUS * Math.sin(angle);
          const anchor =
            lx - CX > 6 ? "start" : lx - CX < -6 ? "end" : "middle";
          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={10}
              fill={labelColors[i]}
              fontWeight={i === highlightRingIdx ? "600" : "400"}
              fontFamily="inherit"
              fillOpacity={i === highlightRingIdx ? 1 : 0.55}
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
