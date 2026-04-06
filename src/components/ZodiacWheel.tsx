import { useEffect, useRef, useState } from "react";
import {
  BEAN_ORDER,
  BEAN_ZODIAC_REFERENCE_DAY,
  BEAN_ZODIAC_REFERENCE_MONTH,
  BEAN_ZODIAC_REFERENCE_YEAR,
  FLAVOUR_EMOJI,
  FLAVOUR_ORDER,
  getBeanYear,
} from "../lib/zodiac";

// Wheel radius
const CX = 100;
const CY = 100;
// Flavour ring radii
const INNER_R1 = 33;
const INNER_R2 = 63;
// Bean ring radii
const OUTER_R1 = 66;
const OUTER_R2 = 96;
// Angular gap between segments
const GAP = 1.1;
// Sun radii
const SUN_INNER_R = 17.5;
const SUN_OUTER_R = 26;
const SUN_RAY_TIP_R = 25;
const SUN_RAY_BASE_R = 18;
const TRANSITION = "transform 2.2s cubic-bezier(0.15, 0, 0.1, 1)";

// Segment widths (degrees)
const BEAN_SEG = 360 / BEAN_ORDER.length;
const FLAVOUR_SEG = 360 / FLAVOUR_ORDER.length;
const YEARS_PER_FLAVOUR = 2;

// ---------------------------------------------------------------------------
// Static geometry — computed once at module load, never on render
// ---------------------------------------------------------------------------

function toXY(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function annularSector(r1: number, r2: number, a1: number, a2: number): string {
  const p1 = toXY(r2, a1),
    p2 = toXY(r2, a2);
  const p3 = toXY(r1, a2),
    p4 = toXY(r1, a1);
  const large = a2 - a1 > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(3);
  return (
    `M${f(p1.x)},${f(p1.y)} A${r2},${r2},0,${large},1,${f(p2.x)},${f(p2.y)} ` +
    `L${f(p3.x)},${f(p3.y)} A${r1},${r1},0,${large},0,${f(p4.x)},${f(p4.y)} Z`
  );
}

const BEAN_GEOMETRY = BEAN_ORDER.map((beanId, i) => {
  const mid = 90 - i * BEAN_SEG;
  const path = annularSector(
    OUTER_R1,
    OUTER_R2,
    mid - BEAN_SEG / 2 + GAP,
    mid + BEAN_SEG / 2 - GAP,
  );
  const { x, y } = toXY((OUTER_R1 + OUTER_R2) / 2, mid);
  return { beanId, path, x, y, mid };
});

const FLAVOUR_GEOMETRY = FLAVOUR_ORDER.map((flavourId, i) => {
  const mid = 90 - i * FLAVOUR_SEG;
  const path = annularSector(
    INNER_R1,
    INNER_R2,
    mid - FLAVOUR_SEG / 2 + GAP,
    mid + FLAVOUR_SEG / 2 - GAP,
  );
  const { x, y } = toXY((INNER_R1 + INNER_R2) / 2, mid);
  return { flavourId, path, x, y, mid };
});

const SUN_RAY_PATHS = Array.from({ length: 12 }, (_, i) => {
  const tipAngle = (i * 30 - 90) * (Math.PI / 180);
  const tip = {
    x: CX + SUN_RAY_TIP_R * Math.cos(tipAngle),
    y: CY + SUN_RAY_TIP_R * Math.sin(tipAngle),
  };
  const lAngle = tipAngle - 20 * (Math.PI / 180);
  const rAngle = tipAngle + 20 * (Math.PI / 180);
  const l = { x: CX + SUN_RAY_BASE_R * Math.cos(lAngle), y: CY + SUN_RAY_BASE_R * Math.sin(lAngle) };
  const r = { x: CX + SUN_RAY_BASE_R * Math.cos(rAngle), y: CY + SUN_RAY_BASE_R * Math.sin(rAngle) };
  const f = (n: number) => n.toFixed(2);
  return `M${f(tip.x)},${f(tip.y)} L${f(l.x)},${f(l.y)} L${f(r.x)},${f(r.y)} Z`;
});

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
    targetCentre,
    beanIdx,
    flavourIdx,
  } = computeTargets(date);

  const prevAbsOuter = useRef(absOuter);
  const prevAbsInner = useRef(absInner);
  const prevAbsCentre = useRef(absCentre);

  const [outerRot, setOuterRot] = useState(targetOuter);
  const [innerRot, setInnerRot] = useState(targetInner);
  const [centreRot, setCentreRot] = useState(targetCentre);
  const [activeBeanIdx, setActiveBeanIdx] = useState(beanIdx);
  const [activeFlavourIdx, setActiveFlavourIdx] = useState(flavourIdx);
  const [highlightVisible, setHighlightVisible] = useState(false);

  useEffect(() => {
    const delta = absOuter - prevAbsOuter.current;
    setOuterRot((r) => r + capDelta(delta, 720)); // cap: 2 revolutions = 24 years
    prevAbsOuter.current = absOuter;
  }, [absOuter]);

  useEffect(() => {
    const delta = absInner - prevAbsInner.current;
    setInnerRot((r) => r + capDelta(delta, 720)); // cap: 2 revolutions = 20 years
    prevAbsInner.current = absInner;
  }, [absInner]);

  useEffect(() => {
    const delta = absCentre - prevAbsCentre.current;
    setCentreRot((r: number) => r + capDelta(delta, 640)); // cap: 1.5 revolutions = 1.5 years
    prevAbsCentre.current = absCentre;
  }, [absCentre]);

  // Fade out, wait for spin to settle, then fade back in on the new segment
  useEffect(() => {
    setHighlightVisible(false);
    if (!highlight) return;
    const t = setTimeout(() => {
      setActiveBeanIdx(beanIdx);
      setActiveFlavourIdx(flavourIdx);
      setHighlightVisible(true);
    }, 2100);
    return () => clearTimeout(t);
  }, [beanIdx, flavourIdx, highlight]);

  return (
    <svg
      viewBox="0 0 200 220"
      className="w-96 sm:w-md"
      style={{ height: "auto" }}
      aria-label="Bean Zodiac Wheel"
    >
      {/* Static clip paths — defined once at the top level, outside animated groups */}
      <defs>
        {BEAN_GEOMETRY.map(({ beanId, path }) => (
          <clipPath key={beanId} id={`clip-${beanId}`}>
            <path d={path} />
          </clipPath>
        ))}
        {FLAVOUR_GEOMETRY.map(({ flavourId, path }) => (
          <clipPath key={flavourId} id={`clip-${flavourId}`}>
            <path d={path} />
          </clipPath>
        ))}
      </defs>

      {/* Outer bean ring — rotates once per 12 years */}
      <g
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          transform: `rotate(${outerRot}deg)`,
          transition: TRANSITION,
          willChange: "transform",
        }}
      >
        {BEAN_GEOMETRY.map(({ beanId, path, x, y, mid }, i) => {
          const active = i === activeBeanIdx && highlightVisible;
          const color = `var(--bean-${beanId})`;
          const filterId = `colorize-${beanId}`;
          return (
            <g key={beanId}>
              <defs>
                <filter
                  id={filterId}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood
                    floodColor={active ? "#27272a" : color}
                    result="color"
                  />
                  <feComposite in="color" in2="SourceGraphic" operator="in" />
                </filter>
              </defs>
              <path
                d={path}
                strokeWidth={3}
                clipPath={`url(#clip-${beanId})`}
                fill={active ? color : "transparent"}
                style={{ stroke: color, transition: "fill 0.5s ease" }}
              />
              <image
                href={`/images/${beanId}.svg`}
                x={x - 8}
                y={y - 8}
                width={16}
                height={16}
                clipPath={`url(#clip-${beanId})`}
                transform={`rotate(${mid - 90}, ${x}, ${y})`}
                preserveAspectRatio="xMidYMid meet"
                style={{
                  filter: `url(#${filterId})`,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            </g>
          );
        })}
      </g>

      {/* Inner flavour ring — rotates once per 10 years */}
      <g
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          transform: `rotate(${innerRot}deg)`,
          transition: TRANSITION,
          willChange: "transform",
        }}
      >
        {FLAVOUR_GEOMETRY.map(({ flavourId, path, x, y, mid }, i) => {
          const active = i === activeFlavourIdx && highlightVisible;
          const color = `var(--flavour-${flavourId})`;
          const filterId = `colorize-flavour-${flavourId}`;
          return (
            <g key={flavourId}>
              <defs>
                <filter
                  id={filterId}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood
                    floodColor={active ? "#27272a" : color}
                    result="color"
                  />
                  <feComposite in="color" in2="SourceGraphic" operator="in" />
                </filter>
              </defs>
              <path
                d={path}
                strokeWidth={4}
                clipPath={`url(#clip-${flavourId})`}
                fill={active ? color : "transparent"}
                style={{ stroke: color, transition: "fill 0.5s ease" }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                transform={`rotate(${mid - 90}, ${x}, ${y})`}
                style={{
                  userSelect: "none",
                  pointerEvents: "none",
                  filter: `url(#${filterId})`,
                }}
              >
                {FLAVOUR_EMOJI[flavourId]}
              </text>
            </g>
          );
        })}
      </g>

      {/* Centre sun — rotates once per year */}
      <g style={{ userSelect: "none", pointerEvents: "none" }}>
        <g
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: `rotate(${centreRot}deg)`,
            transition: TRANSITION,
            willChange: "transform",
          }}
        >
          {SUN_RAY_PATHS.map((d, i) => (
            <path key={i} d={d} fill="#d4d4d4" />
          ))}
          <circle
            cx={CX}
            cy={CY}
            r={SUN_INNER_R}
            fill="none"
            stroke="#d4d4d4"
            strokeWidth="2.5"
          />
          <circle
            cx={CX}
            cy={CY}
            r={SUN_OUTER_R}
            fill="none"
            stroke="#d4d4d4"
            strokeWidth="2.5"
          />
        </g>
        <text
          x={CX}
          y={CY + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          🫘
        </text>
      </g>

      {/* Arrow indicator — fixed at bottom, points up into the rings */}
      <g
        fill="white"
        opacity={0.9}
        style={{
          userSelect: "none",
          pointerEvents: "none",
          filter: "drop-shadow(0 0 3px rgba(255,255,255,0.65))",
        }}
      >
        <path
          d={`M${CX},${CY + OUTER_R2 + 2} L${CX - 4},${CY + OUTER_R2 + 11} L${CX},${CY + OUTER_R2 + 20} L${CX + 4},${CY + OUTER_R2 + 11} Z`}
        />
      </g>
    </svg>
  );
}

function capDelta(delta: number, maxDeg: number): number {
  const abs = Math.abs(delta);
  const remainder = abs % 360;
  const revs = Math.min(
    Math.floor(abs / 360),
    Math.floor((maxDeg - remainder) / 360),
  );
  return Math.sign(delta) * (revs * 360 + remainder);
}

function computeTargets(date: Date) {
  const REF = BEAN_ZODIAC_REFERENCE_YEAR;
  const beanYear = getBeanYear(date);
  const m = BEAN_ZODIAC_REFERENCE_MONTH - 1; // Date constructor uses 0-indexed months
  const d = BEAN_ZODIAC_REFERENCE_DAY;
  const yearStart = new Date(beanYear, m, d).getTime();
  const yearEnd = new Date(beanYear + 1, m, d).getTime();
  const beanFrac = (date.getTime() - yearStart) / (yearEnd - yearStart);

  const absOuter = (beanYear - REF + beanFrac) * BEAN_SEG;
  const absInner =
    (beanYear - REF + beanFrac) * (FLAVOUR_SEG / YEARS_PER_FLAVOUR);
  const absCentre = (beanYear - REF + beanFrac) * 360; // 1 rev per year

  const modOuter = ((absOuter % 360) + 360) % 360;
  const modInner = ((absInner % 360) + 360) % 360;
  const modCentre = ((absCentre % 360) + 360) % 360;

  return {
    absOuter,
    absInner,
    absCentre,
    targetOuter: modOuter - BEAN_SEG / 2, // half-segment offset aligns boundary with arrow
    targetInner: modInner - FLAVOUR_SEG / 2,
    targetCentre: modCentre,
    beanIdx: Math.floor(modOuter / BEAN_SEG),
    flavourIdx: Math.floor(modInner / FLAVOUR_SEG),
  };
}
