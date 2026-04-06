import { Fragment, useEffect, useRef, useState } from "react";
import {
  BEAN_ORDER,
  BEAN_ZODIAC_REFERENCE_DAY,
  BEAN_ZODIAC_REFERENCE_MONTH,
  BEAN_ZODIAC_REFERENCE_YEAR,
  FLAVOUR_EMOJI,
  FLAVOUR_ORDER,
  METHOD_EMOJI,
  METHOD_ORDER,
  getBeanYear,
} from "../lib/zodiac";
import type { MethodId } from "../lib/zodiac";

// Wheel centre
const CX = 100;
const CY = 100;
// Method ring radii (middle ring)
const METHOD_R1 = 37;
const METHOD_R2 = 55;
// Flavour ring radii (inner ring)
const FLAVOUR_R1 = 15;
const FLAVOUR_R2 = 35;
// Bean ring radii
const BEAN_R1 = 57;
const BEAN_R2 = 83;
// Angular gap between segments
const GAP = 1.1;
const TRANSITION = "transform 2.2s cubic-bezier(0.15, 0, 0.1, 1)";
const ACTIVE_DARK = "#27272a";

// Segment widths (degrees)
const BEAN_SEG = 360 / BEAN_ORDER.length;
const FLAVOUR_SEG = 360 / FLAVOUR_ORDER.length;
const METHOD_SEG = 360 / METHOD_ORDER.length;
const YEARS_PER_FLAVOUR = 2;

// ---------------------------------------------------------------------------
// Static geometry + filters — computed once at module load, never on render
// ---------------------------------------------------------------------------

function toXY(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function annularSector(r1: number, r2: number, a1: number, a2: number): string {
  const p1 = toXY(r2, a1), p2 = toXY(r2, a2);
  const p3 = toXY(r1, a2), p4 = toXY(r1, a1);
  const large = a2 - a1 > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(3);
  return (
    `M${f(p1.x)},${f(p1.y)} A${r2},${r2},0,${large},1,${f(p2.x)},${f(p2.y)} ` +
    `L${f(p3.x)},${f(p3.y)} A${r1},${r1},0,${large},0,${f(p4.x)},${f(p4.y)} Z`
  );
}

function makeFilter(id: string, color: string, spread: string) {
  return (
    <filter key={id} id={id} x={spread} y={spread} width={spread === "-20%" ? "140%" : "200%"} height={spread === "-20%" ? "140%" : "200%"} colorInterpolationFilters="sRGB">
      <feFlood floodColor={color} result="color" />
      <feComposite in="color" in2="SourceGraphic" operator="in" />
    </filter>
  );
}

const BEAN_GEOMETRY = BEAN_ORDER.map((beanId, i) => {
  const mid = 90 - i * BEAN_SEG;
  const path = annularSector(BEAN_R1, BEAN_R2, mid - BEAN_SEG / 2 + GAP, mid + BEAN_SEG / 2 - GAP);
  const { x, y } = toXY((BEAN_R1 + BEAN_R2) / 2, mid);
  return { beanId, path, x, y, mid };
});

const FLAVOUR_GEOMETRY = FLAVOUR_ORDER.map((flavourId, i) => {
  const mid = 90 - i * FLAVOUR_SEG;
  const path = annularSector(FLAVOUR_R1, FLAVOUR_R2, mid - FLAVOUR_SEG / 2 + GAP, mid + FLAVOUR_SEG / 2 - GAP);
  const { x, y } = toXY((FLAVOUR_R1 + FLAVOUR_R2) / 2, mid);
  return { flavourId, path, x, y, mid };
});

const METHOD_GEOMETRY = METHOD_ORDER.map((methodId, i) => {
  const mid = 90 + i * METHOD_SEG; // reversed so anti-clockwise rotation tracks correctly
  const path = annularSector(METHOD_R1, METHOD_R2, mid - METHOD_SEG / 2 + GAP, mid + METHOD_SEG / 2 - GAP);
  const { x, y } = toXY((METHOD_R1 + METHOD_R2) / 2, mid);
  return { methodId, path, x, y, mid };
});

// All filter definitions precomputed — two variants per segment (normal + active).
// Kept outside the component so React never reconciles them after mount.
const STATIC_FILTERS = (
  <>
    {BEAN_GEOMETRY.map(({ beanId }) => (
      <Fragment key={beanId}>
        {makeFilter(`f-b-${beanId}`,   `var(--bean-${beanId})`, "-20%")}
        {makeFilter(`f-b-${beanId}-a`, ACTIVE_DARK,             "-20%")}
      </Fragment>
    ))}
    {FLAVOUR_GEOMETRY.map(({ flavourId }) => (
      <Fragment key={flavourId}>
        {makeFilter(`f-fl-${flavourId}`,   `var(--flavour-${flavourId})`, "-50%")}
        {makeFilter(`f-fl-${flavourId}-a`, ACTIVE_DARK,                   "-50%")}
      </Fragment>
    ))}
    {METHOD_GEOMETRY.map(({ methodId }) => (
      <Fragment key={methodId}>
        {makeFilter(`f-m-${methodId}`,   `var(--method-${methodId})`, "-50%")}
        {makeFilter(`f-m-${methodId}-a`, ACTIVE_DARK,                 "-50%")}
      </Fragment>
    ))}
  </>
);

// ---------------------------------------------------------------------------

type Props = {
  date: Date;
  highlight?: boolean;
};

export default function ZodiacWheel({ date, highlight = true }: Props) {
  const {
    absOuter,
    absInner,
    absCentre,
    targetOuter,
    targetInner,
    targetMethod,
    beanIdx,
    flavourIdx,
    methodIdx,
  } = computeTargets(date);

  const prevAbsOuter = useRef(absOuter);
  const prevAbsInner = useRef(absInner);
  const prevAbsCentre = useRef(absCentre);

  const [outerRot, setOuterRot] = useState(targetOuter);
  const [innerRot, setInnerRot] = useState(targetInner);
  const [methodRot, setMethodRot] = useState(targetMethod);
  const [activeBeanIdx, setActiveBeanIdx] = useState(beanIdx);
  const [activeFlavourIdx, setActiveFlavourIdx] = useState(flavourIdx);
  const [activeMethodIdx, setActiveMethodIdx] = useState(methodIdx);
  const [highlightVisible, setHighlightVisible] = useState(false);

  useEffect(() => {
    const delta = absOuter - prevAbsOuter.current;
    setOuterRot((r) => r + capDelta(delta, 720));
    prevAbsOuter.current = absOuter;
  }, [absOuter]);

  useEffect(() => {
    const delta = absInner - prevAbsInner.current;
    setInnerRot((r) => r + capDelta(delta, 720));
    prevAbsInner.current = absInner;
  }, [absInner]);

  useEffect(() => {
    const delta = absCentre - prevAbsCentre.current;
    setMethodRot((r) => r + capDelta(delta, 640));
    prevAbsCentre.current = absCentre;
  }, [absCentre]);

  useEffect(() => {
    setHighlightVisible(false);
    if (!highlight) return;
    const t = setTimeout(() => {
      setActiveBeanIdx(beanIdx);
      setActiveFlavourIdx(flavourIdx);
      setActiveMethodIdx(methodIdx);
      setHighlightVisible(true);
    }, 2100);
    return () => clearTimeout(t);
  }, [beanIdx, flavourIdx, methodIdx, highlight]);

  return (
    <svg
      viewBox="0 0 200 220"
      className="w-96 sm:w-md"
      style={{ height: "auto" }}
      aria-label="Bean Zodiac Wheel"
    >
      <defs>
        {STATIC_FILTERS}
        {BEAN_GEOMETRY.map(({ beanId, path }) => (
          <clipPath key={beanId} id={`clip-b-${beanId}`}>
            <path d={path} />
          </clipPath>
        ))}
        {FLAVOUR_GEOMETRY.map(({ flavourId, path }) => (
          <clipPath key={flavourId} id={`clip-fl-${flavourId}`}>
            <path d={path} />
          </clipPath>
        ))}
        {METHOD_GEOMETRY.map(({ methodId, path }) => (
          <clipPath key={methodId} id={`clip-m-${methodId}`}>
            <path d={path} />
          </clipPath>
        ))}
      </defs>

      {/* Outer bean ring — rotates once per 12 years */}
      <g style={{ transformOrigin: `${CX}px ${CY}px`, transform: `rotate(${outerRot}deg)`, transition: TRANSITION, willChange: "transform" }}>
        {BEAN_GEOMETRY.map(({ beanId, path, x, y, mid }, i) => {
          const active = i === activeBeanIdx && highlightVisible;
          const color = `var(--bean-${beanId})`;
          return (
            <g key={beanId}>
              <path
                d={path}
                strokeWidth={3}
                clipPath={`url(#clip-b-${beanId})`}
                fill={active ? color : "transparent"}
                style={{ stroke: color, transition: "fill 0.5s ease" }}
              />
              <image
                href={`/images/${beanId}.svg`}
                x={x - 7} y={y - 7} width={14} height={14}
                clipPath={`url(#clip-b-${beanId})`}
                transform={`rotate(${mid - 90}, ${x}, ${y})`}
                preserveAspectRatio="xMidYMid meet"
                style={{ filter: `url(#f-b-${beanId}${active ? "-a" : ""})`, userSelect: "none", pointerEvents: "none" }}
              />
            </g>
          );
        })}
      </g>

      {/* Middle method ring — spins anti-clockwise */}
      <g style={{ transformOrigin: `${CX}px ${CY}px`, transform: `rotate(${-methodRot}deg)`, transition: TRANSITION, willChange: "transform" }}>
        {METHOD_GEOMETRY.map(({ methodId, path, x, y, mid }, i) => {
          const active = i === activeMethodIdx && highlightVisible;
          const color = `var(--method-${methodId})`;
          return (
            <g key={methodId}>
              <path
                d={path}
                strokeWidth={3}
                clipPath={`url(#clip-m-${methodId})`}
                fill={active ? color : "transparent"}
                style={{ stroke: color, transition: "fill 0.5s ease" }}
              />
              <text
                x={x} y={y}
                textAnchor="middle" dominantBaseline="middle" fontSize="10"
                transform={`rotate(${mid - 90}, ${x}, ${y})`}
                style={{ userSelect: "none", pointerEvents: "none", filter: `url(#f-m-${methodId}${active ? "-a" : ""})` }}
              >
                {METHOD_EMOJI[methodId as MethodId]}
              </text>
            </g>
          );
        })}
      </g>

      {/* Inner flavour ring */}
      <g style={{ transformOrigin: `${CX}px ${CY}px`, transform: `rotate(${innerRot}deg)`, transition: TRANSITION, willChange: "transform" }}>
        {FLAVOUR_GEOMETRY.map(({ flavourId, path, x, y, mid }, i) => {
          const active = i === activeFlavourIdx && highlightVisible;
          const color = `var(--flavour-${flavourId})`;
          return (
            <g key={flavourId}>
              <path
                d={path}
                strokeWidth={4}
                clipPath={`url(#clip-fl-${flavourId})`}
                fill={active ? color : "transparent"}
                style={{ stroke: color, transition: "fill 0.5s ease" }}
              />
              <text
                x={x} y={y}
                textAnchor="middle" dominantBaseline="middle" fontSize="9"
                transform={`rotate(${mid - 90}, ${x}, ${y})`}
                style={{ userSelect: "none", pointerEvents: "none", filter: `url(#f-fl-${flavourId}${active ? "-a" : ""})` }}
              >
                {FLAVOUR_EMOJI[flavourId]}
              </text>
            </g>
          );
        })}
      </g>

      {/* Centre bean emoji */}
      <g style={{ userSelect: "none", pointerEvents: "none" }}>
        <circle cx={CX} cy={CY} r={12} fill="none" stroke="white" strokeWidth="1.5" opacity={0.9} />
        <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10">
          🫘
        </text>
      </g>

      {/* Arrow indicator — fixed at bottom, points up into the rings */}
      <g fill="white" opacity={0.9} style={{ userSelect: "none", pointerEvents: "none", filter: "drop-shadow(0 0 3px rgba(255,255,255,0.65))" }}>
        <path d={`M${CX},${CY + BEAN_R2 + 2} L${CX - 4},${CY + BEAN_R2 + 11} L${CX},${CY + BEAN_R2 + 20} L${CX + 4},${CY + BEAN_R2 + 11} Z`} />
      </g>
    </svg>
  );
}

function capDelta(delta: number, maxDeg: number): number {
  const abs = Math.abs(delta);
  const remainder = abs % 360;
  const revs = Math.min(Math.floor(abs / 360), Math.floor((maxDeg - remainder) / 360));
  return Math.sign(delta) * (revs * 360 + remainder);
}

function computeTargets(date: Date) {
  const REF = BEAN_ZODIAC_REFERENCE_YEAR;
  const beanYear = getBeanYear(date);
  const m = BEAN_ZODIAC_REFERENCE_MONTH - 1;
  const d = BEAN_ZODIAC_REFERENCE_DAY;
  const yearStart = new Date(beanYear, m, d).getTime();
  const yearEnd = new Date(beanYear + 1, m, d).getTime();
  const beanFrac = (date.getTime() - yearStart) / (yearEnd - yearStart);

  const absOuter = (beanYear - REF + beanFrac) * BEAN_SEG;
  const absInner = (beanYear - REF + beanFrac) * (FLAVOUR_SEG / YEARS_PER_FLAVOUR);
  const absCentre = (beanYear - REF + beanFrac) * 360;

  const modOuter = ((absOuter % 360) + 360) % 360;
  const modInner = ((absInner % 360) + 360) % 360;
  const modCentre = ((absCentre % 360) + 360) % 360;

  return {
    absOuter,
    absInner,
    absCentre,
    targetOuter: modOuter - BEAN_SEG / 2,
    targetInner: modInner - FLAVOUR_SEG / 2,
    targetCentre: modCentre,
    targetMethod: modCentre - METHOD_SEG / 2,
    beanIdx: Math.floor(modOuter / BEAN_SEG),
    flavourIdx: Math.floor(modInner / FLAVOUR_SEG),
    methodIdx: Math.floor(modCentre / METHOD_SEG),
  };
}