import { useEffect, useRef, useState } from "react";
import {
  BEAN_ORDER,
  BEAN_ZODIAC_REFERENCE_DAY,
  BEAN_ZODIAC_REFERENCE_MONTH,
  BEAN_ZODIAC_REFERENCE_YEAR,
  FLAVOUR_ORDER,
  getBeanYear,
  type ZodiacData,
} from "../lib/zodiac";

// Wheel radius
const CX = 100;
const CY = 100;
// Flavour ring radii
const INNER_R1 = 35;
const INNER_R2 = 63;
// Bean ring radii
const OUTER_R1 = 65;
const OUTER_R2 = 93;
// Angular gap between segments
const GAP = 0.8;
const TRANSITION = "transform 2.2s cubic-bezier(0.15, 0, 0.1, 1)";

// Segment widths (degrees)
const BEAN_SEG = 360 / BEAN_ORDER.length;
const FLAVOUR_SEG = 360 / FLAVOUR_ORDER.length;
const YEARS_PER_FLAVOUR = 2;

type Props = {
  data: ZodiacData;
  date: Date;
};

export default function ZodiacWheel({ data, date }: Props) {
  const { absOuter, absInner, absCentre, targetOuter, targetInner, targetCentre, beanIdx, flavourIdx } =
    computeTargets(date);

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
    if (Math.abs(delta) < 0.001) return;
    setOuterRot((r) => r + capDelta(delta, 720)); // cap: 2 revolutions = 24 years
    prevAbsOuter.current = absOuter;
  }, [absOuter]);

  useEffect(() => {
    const delta = absInner - prevAbsInner.current;
    if (Math.abs(delta) < 0.001) return;
    setInnerRot((r) => r + capDelta(delta, 1080)); // cap: 3 revolutions = 30 years
    prevAbsInner.current = absInner;
  }, [absInner]);

  useEffect(() => {
    const delta = absCentre - prevAbsCentre.current;
    if (Math.abs(delta) < 0.001) return;
    setCentreRot((r: number) => r + capDelta(delta, 360)); // cap: 1 revolution
    prevAbsCentre.current = absCentre;
  }, [absCentre]);

  // Fade out, wait for spin to settle, then fade back in on the new segment
  useEffect(() => {
    setHighlightVisible(false);
    const t = setTimeout(() => {
      setActiveBeanIdx(beanIdx);
      setActiveFlavourIdx(flavourIdx);
      setHighlightVisible(true);
    }, 1900);
    return () => clearTimeout(t);
  }, [beanIdx, flavourIdx]);

  return (
    <svg
      viewBox="0 0 200 214"
      className="w-96 sm:w-md"
      style={{ height: "auto" }}
      aria-label="Bean Zodiac Wheel"
    >
      {/* Outer bean ring — rotates once per 12 years */}
      <g
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          transform: `rotate(${outerRot}deg)`,
          transition: TRANSITION,
        }}
      >
        {BEAN_ORDER.map((beanId, i) => {
          const mid = 90 - i * BEAN_SEG;
          const path = annularSector(
            OUTER_R1,
            OUTER_R2,
            mid - BEAN_SEG / 2 + GAP,
            mid + BEAN_SEG / 2 - GAP,
          );
          const { x, y } = toXY((OUTER_R1 + OUTER_R2) / 2, mid);
          const active = i === activeBeanIdx && highlightVisible;
          const color = `var(--bean-${beanId})`;
          return (
            <g key={beanId}>
              <defs>
                <clipPath id={`clip-${beanId}`}>
                  <path d={path} />
                </clipPath>
              </defs>
              <path
                d={path}
                strokeWidth={3}
                clipPath={`url(#clip-${beanId})`}
                fill={active ? color : "transparent"}
                style={{ stroke: color, transition: "fill 0.5s ease" }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="5.5"
                fontWeight="700"
                transform={`rotate(${mid - 90}, ${x}, ${y})`}
                style={{
                  userSelect: "none",
                  pointerEvents: "none",
                  fill: active ? "black" : color,
                  transition: "fill 0.5s ease",
                }}
              >
                {data.beans[beanId].name.replace("Bean", "")}
              </text>
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
        }}
      >
        {FLAVOUR_ORDER.map((flavourId, i) => {
          const mid = 90 - i * FLAVOUR_SEG;
          const path = annularSector(
            INNER_R1,
            INNER_R2,
            mid - FLAVOUR_SEG / 2 + GAP,
            mid + FLAVOUR_SEG / 2 - GAP,
          );
          const { x, y } = toXY((INNER_R1 + INNER_R2) / 2, mid);
          const active = i === activeFlavourIdx && highlightVisible;
          const color = `var(--flavour-${flavourId})`;
          return (
            <g key={flavourId}>
              <defs>
                <clipPath id={`clip-${flavourId}`}>
                  <path d={path} />
                </clipPath>
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
                fontSize="6.5"
                fontWeight="700"
                transform={`rotate(${mid - 90}, ${x}, ${y})`}
                style={{
                  userSelect: "none",
                  pointerEvents: "none",
                  fill: active ? "black" : color,
                  transition: "fill 0.5s ease",
                }}
              >
                {data.flavours[flavourId].name}
              </text>
            </g>
          );
        })}
      </g>

      {/* Centre graphic */}
      <g style={{ userSelect: "none", pointerEvents: "none" }}>
        <g
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: `rotate(${centreRot}deg)`,
            transition: TRANSITION,
          }}
        >
          <circle
            cx={CX}
            cy={CY}
            r={24}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.8"
          />
          {Array.from({ length: 12 }, (_, i) => {
            const { x, y } = toXY(20, i * BEAN_SEG - 90);
            if (i % 3 === 0) {
              return (
                <path
                  key={i}
                  d={starPath(x, y, 2.2, 0.8, 4)}
                  fill="rgba(255,255,255,0.65)"
                />
              );
            }
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={0.8}
                fill="rgba(255,255,255,0.45)"
              />
            );
          })}
        </g>
        <text x={CX} y={CY + 8} textAnchor="middle" fontSize="20">
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
        <polygon
          points={`${CX},${CY + OUTER_R2 + 2} ${CX - 5},${CY + OUTER_R2 + 9} ${CX + 5},${CY + OUTER_R2 + 9}`}
        />
        <rect x={CX - 1} y={CY + OUTER_R2 + 9} width={2} height={4} />
      </g>
    </svg>
  );
}

function starPath(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const step = Math.PI / points;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += (i === 0 ? "M" : "L") + x.toFixed(3) + "," + y.toFixed(3);
  }
  return d + "Z";
}

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
  const absCentre = -(beanYear - REF + beanFrac) * 360; // opposite direction, 1 rev per year

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
