import { useEffect, useRef, useState } from "react";
import {
  BEAN_ORDER,
  BEAN_ZODIAC_REFERENCE_YEAR,
  FLAVOUR_ORDER,
  getBeanYear,
  type ZodiacData,
} from "../lib/zodiac";

type Props = {
  data: ZodiacData;
  date: Date;
};

// SVG layout constants
const CX = 100;
const CY = 100;
const OUTER_R2 = 93; // outer edge of bean ring
const OUTER_R1 = 67; // inner edge of bean ring
const INNER_R2 = 61; // outer edge of flavour ring
const INNER_R1 = 39; // inner edge of flavour ring
const GAP = 0.8; // angular half-gap between segments (degrees)

function toXY(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function annularSector(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  a1: number,
  a2: number,
): string {
  const p1 = toXY(cx, cy, r2, a1);
  const p2 = toXY(cx, cy, r2, a2);
  const p3 = toXY(cx, cy, r1, a2);
  const p4 = toXY(cx, cy, r1, a1);
  const large = a2 - a1 > 180 ? 1 : 0;
  return (
    `M${p1.x.toFixed(3)},${p1.y.toFixed(3)} ` +
    `A${r2},${r2},0,${large},1,${p2.x.toFixed(3)},${p2.y.toFixed(3)} ` +
    `L${p3.x.toFixed(3)},${p3.y.toFixed(3)} ` +
    `A${r1},${r1},0,${large},0,${p4.x.toFixed(3)},${p4.y.toFixed(3)} Z`
  );
}

// Shortest angular delta from `from` to `to` in degrees
function shortestDelta(from: number, to: number): number {
  let diff = (((to - from) % 360) + 360) % 360;
  if (diff > 180) diff -= 360;
  return diff;
}

// Local text rotation so labels always read correctly from outside the wheel.
//
// Derivation: at rest the segment at local angle `mid` sits at global angle
// G = mid + ringRot.  For tangential text to not be upside-down we want the
// global text rotation to be (G - 90) for the bottom half and (G + 90) for
// the top half.  Subtracting ringRot gives the required local rotation:
//   bottom half:  (G - 90) - ringRot = mid - 90
//   top half:     (G + 90) - ringRot = mid + 90
function textLocalRot(mid: number, ringRot: number): number {
  const normG = (((mid + ringRot) % 360) + 360) % 360;
  return normG > 180 ? mid + 90 : mid - 90;
}

// Exact target rotations for a given date, including the fractional position
// within the current bean year / flavour period.
function computeTargets(date: Date) {
  const REF = BEAN_ZODIAC_REFERENCE_YEAR; // 1993
  const beanYear = getBeanYear(date);
  const beanIdx = (((beanYear - REF) % 12) + 12) % 12;
  const flavourIdx = ((Math.floor((beanYear - REF) / 2) % 5) + 5) % 5;

  // Fraction elapsed within the current bean year (March 12 → March 12)
  const beanYearStart = new Date(beanYear, 2, 12).getTime();
  const beanYearEnd = new Date(beanYear + 1, 2, 12).getTime();
  const beanFrac =
    (date.getTime() - beanYearStart) / (beanYearEnd - beanYearStart);

  // Fraction elapsed within the current 2-year flavour period
  const flavourStartYear = beanYear - ((((beanYear - REF) % 2) + 2) % 2);
  const flavourStart = new Date(flavourStartYear, 2, 12).getTime();
  const flavourEnd = new Date(flavourStartYear + 2, 2, 12).getTime();
  const flavourFrac =
    (date.getTime() - flavourStart) / (flavourEnd - flavourStart);

  // Subtract half a segment so the *boundary line* (not the center) aligns
  // with the arrow at beanFrac/flavourFrac = 0 (i.e. exactly on March 12 of
  // the reference year, the start edge of Edamame / Umami sits at the arrow).
  return {
    targetOuter: (beanIdx + beanFrac) * 30 - 15,
    targetInner: (flavourIdx + flavourFrac) * 72 - 36,
  };
}

export default function ZodiacWheel({ data, date }: Props) {
  const { targetOuter, targetInner } = computeTargets(date);

  // Track previous targets and accumulate rotations so animation always takes
  // the shortest angular path (avoids spinning the wrong way at year boundaries).
  const prevOuter = useRef(targetOuter);
  const prevInner = useRef(targetInner);
  const [outerRot, setOuterRot] = useState(targetOuter);
  const [innerRot, setInnerRot] = useState(targetInner);

  useEffect(() => {
    const delta = shortestDelta(prevOuter.current, targetOuter);
    if (Math.abs(delta) > 0.001) {
      setOuterRot((r) => r + delta + 360); // 1 extra full rotation
    }
    prevOuter.current = targetOuter;
  }, [targetOuter]);

  useEffect(() => {
    const delta = shortestDelta(prevInner.current, targetInner);
    if (Math.abs(delta) > 0.001) {
      setInnerRot((r) => r + delta + 720); // 2 extra full rotations
    }
    prevInner.current = targetInner;
  }, [targetInner]);

  const transition = "transform 2.2s cubic-bezier(0.15, 0, 0.1, 1)";

  return (
    <svg
      viewBox="0 0 200 214"
      className="w-96 sm:w-md"
      style={{ height: "auto" }}
      aria-label="Bean Zodiac Wheel"
    >
      <defs>
        <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="60%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Dark backdrop circles */}
      <circle cx={CX} cy={CY} r={OUTER_R2 + 1} fill="rgba(0,0,0,0.3)" />
      <circle cx={CX} cy={CY} r={INNER_R1 - 1} fill="rgba(0,0,0,0.4)" />

      {/* Soft glow behind the rings */}
      <circle cx={CX} cy={CY} r={OUTER_R2 + 1} fill="url(#glowGradient)" />

      {/* Outer bean ring — rotates once per 12 years */}
      <g
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          transform: `rotate(${outerRot}deg)`,
          transition,
        }}
      >
        {BEAN_ORDER.map((beanId, i) => {
          const seg = 30; // 360 / 12
          const mid = 90 - i * seg; // segment i centered at this local angle
          const a1 = mid - seg / 2 + GAP;
          const a2 = mid + seg / 2 - GAP;
          const { x, y } = toXY(CX, CY, (OUTER_R1 + OUTER_R2) / 2, mid);
          return (
            <g key={beanId}>
              <path
                d={annularSector(CX, CY, OUTER_R1, OUTER_R2, a1, a2)}
                style={{ fill: `var(--bean-${beanId})` }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="5.5"
                fill="rgba(0,0,0,0.8)"
                fontWeight="700"
                transform={`rotate(${textLocalRot(mid, outerRot)}, ${x}, ${y})`}
                style={{ userSelect: "none", pointerEvents: "none" }}
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
          transition,
        }}
      >
        {FLAVOUR_ORDER.map((flavourId, i) => {
          const seg = 72; // 360 / 5
          const mid = 90 - i * seg;
          const a1 = mid - seg / 2 + GAP;
          const a2 = mid + seg / 2 - GAP;
          const { x, y } = toXY(CX, CY, (INNER_R1 + INNER_R2) / 2, mid);
          return (
            <g key={flavourId}>
              <path
                d={annularSector(CX, CY, INNER_R1, INNER_R2, a1, a2)}
                style={{ fill: `var(--flavour-${flavourId})` }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="6.5"
                fill="rgba(0,0,0,0.8)"
                fontWeight="700"
                transform={`rotate(${textLocalRot(mid, innerRot)}, ${x}, ${y})`}
                style={{ userSelect: "none", pointerEvents: "none" }}
              >
                {data.flavours[flavourId].name}
              </text>
            </g>
          );
        })}
      </g>

      {/* Bean emoji in the centre */}
      <text
        x={CX}
        y={CY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="18"
        style={{ userSelect: "none", pointerEvents: "none", fill: 'white' }}
      >
        BEANS
      </text>

      {/* Arrow indicator — fixed at bottom, points up into the rings */}
      <polygon
        points={`${CX},${CY + OUTER_R2 + 3} ${CX - 6},${CY + OUTER_R2 + 14} ${CX + 6},${CY + OUTER_R2 + 14}`}
        fill="white"
        opacity={0.85}
      />
    </svg>
  );
}
