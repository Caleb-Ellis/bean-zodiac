import { Fragment, useEffect, useRef, useState } from "react";
import {
  BEAN_ORDER,
  BEAN_ZODIAC_REFERENCE_DAY,
  BEAN_ZODIAC_REFERENCE_MONTH,
  BEAN_ZODIAC_REFERENCE_YEAR,
  FLAVOUR_EMOJI,
  FLAVOUR_ORDER,
  FORM_EMOJI,
  FORM_ORDER,
  getBeanYear,
  getFormIdForDate,
} from "../../../lib/zodiac";
import type { FormId } from "../../../lib/zodiac";

// Wheel centre
const CX = 100;
const CY = 100;
// Flavour ring radii (inner ring)
const FLAVOUR_R1 = 16;
const FLAVOUR_R2 = 34;
// Form ring radii (middle ring)
const FORM_R1 = 36;
const FORM_R2 = 55;
// Bean ring radii
const BEAN_R1 = 57;
const BEAN_R2 = 83;
// Angular gap between segments
const GAP = 1.1;
const EASING = "cubic-bezier(0.4, 0, 0.1, 1)";
const TRANSITION_FLAVOUR = `transform 2.5s ${EASING} 0ms`;
const TRANSITION_FORM = `transform 2.5s ${EASING} 0ms`;
const TRANSITION_BEAN = `transform 2.5s ${EASING} 0ms`;
// Idle spin: form (middle ring, 1yr/rev) at 1rev/min; bean/flavour scaled by real cycle lengths
const IDLE_FORM_DPMs = 360 / 60000;            // 1 yr  → 1 rev/min
const IDLE_BEAN_DPMs = IDLE_FORM_DPMs / 12;    // 12 yr → 1 rev/12min
const IDLE_FLAVOUR_DPMs = IDLE_FORM_DPMs / 10; // 10 yr → 1 rev/10min
const ACTIVE_DARK = "#27272a";

// Segment widths (degrees)
const BEAN_SEG = 360 / BEAN_ORDER.length;
const FLAVOUR_SEG = 360 / FLAVOUR_ORDER.length;
const FORM_SEG = 360 / FORM_ORDER.length;
const YEARS_PER_FLAVOUR = 2;

// ---------------------------------------------------------------------------
// Static geometry + filters — computed once at module load, never on render
// ---------------------------------------------------------------------------

function toXY(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  const p = (n: number) => Math.round(n * 1e6) / 1e6;
  return { x: p(CX + r * Math.cos(rad)), y: p(CY + r * Math.sin(rad)) };
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

function makeFilter(id: string, color: string, spread: string) {
  return (
    <filter
      key={id}
      id={id}
      x={spread}
      y={spread}
      width={spread === "-20%" ? "140%" : "200%"}
      height={spread === "-20%" ? "140%" : "200%"}
      colorInterpolationFilters="sRGB"
    >
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
  const path = annularSector(
    FLAVOUR_R1,
    FLAVOUR_R2,
    mid - FLAVOUR_SEG / 2 + GAP,
    mid + FLAVOUR_SEG / 2 - GAP,
  );
  const { x, y } = toXY((FLAVOUR_R1 + FLAVOUR_R2) / 2, mid);
  return { flavourId, path, x, y, mid };
});

const FORM_GEOMETRY = FORM_ORDER.map((formId, i) => {
  const mid = 90 - i * FORM_SEG; // reversed so anti-clockwise rotation tracks correctly
  const path = annularSector(FORM_R1, FORM_R2, mid - FORM_SEG / 2 + GAP, mid + FORM_SEG / 2 - GAP);
  const { x, y } = toXY((FORM_R1 + FORM_R2) / 2, mid);
  return { formId, path, x, y, mid };
});

// All filter definitions precomputed — two variants per segment (normal + active).
// Kept outside the component so React never reconciles them after mount.
const STATIC_FILTERS = (
  <>
    {BEAN_GEOMETRY.map(({ beanId }) => (
      <Fragment key={beanId}>
        {makeFilter(`f-b-${beanId}`, `var(--bean-${beanId})`, "-20%")}
        {makeFilter(`f-b-${beanId}-a`, ACTIVE_DARK, "-20%")}
      </Fragment>
    ))}
    {FLAVOUR_GEOMETRY.map(({ flavourId }) => (
      <Fragment key={flavourId}>
        {makeFilter(`f-fl-${flavourId}`, `var(--flavour-${flavourId})`, "-50%")}
        {makeFilter(`f-fl-${flavourId}-a`, ACTIVE_DARK, "-50%")}
      </Fragment>
    ))}
    {FORM_GEOMETRY.map(({ formId }) => (
      <Fragment key={formId}>
        {makeFilter(`f-m-${formId}`, `var(--form-${formId})`, "-50%")}
        {makeFilter(`f-m-${formId}-a`, ACTIVE_DARK, "-50%")}
      </Fragment>
    ))}
    {makeFilter("f-centre-a", ACTIVE_DARK, "-50%")}
    <filter key="f-white" id="f-white">
      <feComponentTransfer>
        <feFuncR type="linear" slope="0" intercept="1" />
        <feFuncG type="linear" slope="0" intercept="1" />
        <feFuncB type="linear" slope="0" intercept="1" />
      </feComponentTransfer>
    </filter>
  </>
);

export const BEANS_LETTERS = [
  "B",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "E",
  "A",
  "N",
  "S",
  "!",
];

// ---------------------------------------------------------------------------

type Props = {
  date: Date;
  highlight?: boolean;
  idle?: boolean;
  beansLetterCount?: number;
  beansVisible?: boolean;
};

export default function ZodiacWheel({
  date,
  highlight = true,
  idle = false,
  beansLetterCount,
  beansVisible,
}: Props) {
  const {
    absBean,
    absFlavour,
    absForm,
    targetBean,
    targetFlavour,
    targetForm,
    beanIdx,
    flavourIdx,
    formIdx,
  } = computeTargets(date);

  const centreColor = "#ffffff";

  const prevAbsBean = useRef(absBean);
  const prevAbsFlavour = useRef(absFlavour);
  const prevAbsForm = useRef(absForm);

  const [beanRot, setBeanRot] = useState(targetBean);
  const [flavourRot, setFlavourRot] = useState(targetFlavour);
  const [formRot, setFormRot] = useState(targetForm);
  const [activeBeanIdx, setActiveBeanIdx] = useState(beanIdx);
  const [activeFlavourIdx, setActiveFlavourIdx] = useState(flavourIdx);
  const [activeFormIdx, setActiveFormIdx] = useState(formIdx);
  const [beanActive, setBeanActive] = useState(false);
  const [flavourActive, setFlavourActive] = useState(false);
  const [formActive, setFormActive] = useState(false);
  const [centreActive, setCentreActive] = useState(false);

  const beanRef = useRef<SVGGElement>(null);
  const flavourRef = useRef<SVGGElement>(null);
  const formRef = useRef<SVGGElement>(null);
  const idleRaf = useRef(0);
  const idleAngle = useRef({ bean: 0, flavour: 0, form: 0 });
  const idlePrevTime = useRef(0);
  const prevIdleRef = useRef(false);

  // Must be declared before the absBean/absFlavour/absForm effects so that
  // prevAbs refs are neutralised before those effects read them on the same commit.
  //
  // The idle=true branch always starts the rAF and returns its own cleanup so
  // that React StrictMode's double-invocation correctly restarts the loop.
  useEffect(() => {
    if (idle) {
      prevIdleRef.current = true;
      idleAngle.current = {
        bean: ((beanRot % 360) + 360) % 360,
        flavour: ((flavourRot % 360) + 360) % 360,
        form: ((formRot % 360) + 360) % 360,
      };
      idlePrevTime.current = 0;
      const tick = (t: number) => {
        if (idlePrevTime.current) {
          const dt = t - idlePrevTime.current;
          idleAngle.current.bean += dt * IDLE_BEAN_DPMs;
          idleAngle.current.flavour += dt * IDLE_FLAVOUR_DPMs;
          idleAngle.current.form += dt * IDLE_FORM_DPMs;
        }
        idlePrevTime.current = t;
        if (beanRef.current) beanRef.current.style.transform = `rotate(${idleAngle.current.bean}deg)`;
        if (flavourRef.current) flavourRef.current.style.transform = `rotate(${idleAngle.current.flavour}deg)`;
        if (formRef.current) formRef.current.style.transform = `rotate(${idleAngle.current.form}deg)`;
        idleRaf.current = requestAnimationFrame(tick);
      };
      idleRaf.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(idleRaf.current);
    }

    // idle is false — rAF was already cancelled by the cleanup from the idle=true effect.
    if (prevIdleRef.current) {
      prevIdleRef.current = false;
      const { bean: curBean, flavour: curFlavour, form: curForm } = idleAngle.current;
      const normBean = ((curBean % 360) + 360) % 360;
      const normFlavour = ((curFlavour % 360) + 360) % 360;
      const normForm = ((curForm % 360) + 360) % 360;
      // Zero out the abs deltas so the abs effects below become no-ops this commit.
      prevAbsBean.current = absBean;
      prevAbsFlavour.current = absFlavour;
      prevAbsForm.current = absForm;
      // CSS transition starts from the DOM's current position (rAF's last frame).
      // Spin at least 180° so the wheel always reads as "kicking back to life",
      // even when a ring happens to be sitting near its target.
      setBeanRot(curBean + capDelta(atLeast180(((targetBean - normBean) + 360) % 360), 900));
      setFlavourRot(curFlavour + capDelta(atLeast180(((targetFlavour - normFlavour) + 360) % 360), 990));
      setFormRot(curForm + capDelta(atLeast180(((targetForm - normForm) + 360) % 360), 1080));
    }
  }, [idle]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const delta = absBean - prevAbsBean.current;
    setBeanRot((r) => r + capDelta(delta, 540));
    prevAbsBean.current = absBean;
  }, [absBean]);

  useEffect(() => {
    const delta = absFlavour - prevAbsFlavour.current;
    setFlavourRot((r) => r + capDelta(delta, 630));
    prevAbsFlavour.current = absFlavour;
  }, [absFlavour]);

  useEffect(() => {
    const delta = absForm - prevAbsForm.current;
    setFormRot((r) => r + capDelta(delta, 720));
    prevAbsForm.current = absForm;
  }, [absForm]);

  useEffect(() => {
    setBeanActive(false);
    setFlavourActive(false);
    setFormActive(false);
    setCentreActive(false);
    if (!highlight) return;
    const t1 = setTimeout(() => {
      setActiveBeanIdx(beanIdx);
      setActiveFlavourIdx(flavourIdx);
      setActiveFormIdx(formIdx);
      setBeanActive(true);
    }, 2700);
    const t2 = setTimeout(() => setFormActive(true), 2850);
    const t3 = setTimeout(() => setFlavourActive(true), 3000);
    const t4 = setTimeout(() => setCentreActive(true), 3150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [beanIdx, flavourIdx, formIdx, highlight]);

  return (
    <svg
      viewBox="0 0 200 220"
      className="w-96 sm:w-md lg:w-140"
      style={{ height: "auto" }}
      aria-label="Bean Zodiac Wheel"
    >
      <defs>
        <style>{`
          @keyframes centre-glow {
            0%   { opacity: 0.7; transform: scale(1); }
            100% { opacity: 0; transform: scale(4); }
          }
        `}</style>
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
        {FORM_GEOMETRY.map(({ formId, path }) => (
          <clipPath key={formId} id={`clip-m-${formId}`}>
            <path d={path} />
          </clipPath>
        ))}
      </defs>

      {/* Outer bean ring — rotates once per 12 years */}
      <g
        ref={beanRef}
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          transform: `rotate(${beanRot}deg)`,
          transition: idle ? "none" : TRANSITION_BEAN,
          willChange: "transform",
        }}
      >
        {BEAN_GEOMETRY.map(({ beanId, path, x, y, mid }, i) => {
          const active = i === activeBeanIdx && beanActive;
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
                x={x - 7}
                y={y - 7}
                width={14}
                height={14}
                clipPath={`url(#clip-b-${beanId})`}
                transform={`rotate(${mid - 90}, ${x}, ${y})`}
                preserveAspectRatio="xMidYMid meet"
                style={{
                  filter: `url(#f-b-${beanId}${active ? "-a" : ""})`,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            </g>
          );
        })}
      </g>

      {/* Middle form ring — rotates once every year */}
      <g
        ref={formRef}
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          transform: `rotate(${formRot}deg)`,
          transition: idle ? "none" : TRANSITION_FORM,
          willChange: "transform",
        }}
      >
        {FORM_GEOMETRY.map(({ formId, path, x, y, mid }, i) => {
          const active = i === activeFormIdx && formActive;
          const color = `var(--form-${formId})`;
          return (
            <g key={formId}>
              <path
                d={path}
                strokeWidth={3}
                clipPath={`url(#clip-m-${formId})`}
                fill={active ? color : "transparent"}
                style={{ stroke: color, transition: "fill 0.5s ease" }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                transform={`rotate(${mid - 90}, ${x}, ${y})`}
                style={{
                  userSelect: "none",
                  pointerEvents: "none",
                  filter: `url(#f-m-${formId}${active ? "-a" : ""})`,
                }}
              >
                {FORM_EMOJI[formId as FormId]}
              </text>
            </g>
          );
        })}
      </g>

      {/* Inner flavour ring — rotates once every 10 years */}
      <g
        ref={flavourRef}
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          transform: `rotate(${flavourRot}deg)`,
          transition: idle ? "none" : TRANSITION_FLAVOUR,
          willChange: "transform",
        }}
      >
        {FLAVOUR_GEOMETRY.map(({ flavourId, path, x, y, mid }, i) => {
          const active = i === activeFlavourIdx && flavourActive;
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
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                transform={`rotate(${mid - 90}, ${x}, ${y})`}
                style={{
                  userSelect: "none",
                  pointerEvents: "none",
                  filter: `url(#f-fl-${flavourId}${active ? "-a" : ""})`,
                }}
              >
                {FLAVOUR_EMOJI[flavourId]}
              </text>
            </g>
          );
        })}
      </g>

      {/* Centre bean emoji */}
      <g style={{ userSelect: "none", pointerEvents: "none" }}>
        <circle
          cx={CX}
          cy={CY}
          r={12}
          fill={centreActive ? centreColor : "transparent"}
          stroke={centreActive ? centreColor : "white"}
          strokeWidth="1.5"
          opacity={0.9}
          style={{
            transition: "fill 0.5s ease, filter 0.5s ease",
            filter: centreActive
              ? `drop-shadow(0 0 5px ${centreColor}) drop-shadow(0 0 10px ${centreColor})`
              : "none",
          }}
        />
        <circle
          cx={CX}
          cy={CY}
          r={12}
          fill={centreColor}
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            opacity: centreActive ? undefined : 0,
            animation: centreActive ? "centre-glow 1s ease-out forwards" : "none",
            willChange: "transform, opacity",
            pointerEvents: "none",
          }}
        />
        <text
          x={CX}
          y={CY + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          style={{
            filter: centreActive ? "url(#f-centre-a)" : "url(#f-white)",
          }}
        >
          🫘
        </text>
      </g>

      {/* BEANS letters circling the wheel — base toward centre, skip bottom gap */}
      <g
        style={{
          opacity: beansVisible ? 1 : 0,
          transition: "opacity 0.3s ease",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {BEANS_LETTERS.map((letter, i) => {
          const deg = 110 + i * (320 / (BEANS_LETTERS.length - 1)); // clockwise from ~6:40 to ~5:20, tight gap around arrow
          const { x, y } = toXY(90, deg);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="5.5"
              fill="white"
              fontWeight="bold"
              transform={`rotate(${90 + deg}, ${x}, ${y})`}
              style={{
                opacity: i < (beansLetterCount ?? 0) ? 1 : 0,
                transition: i < (beansLetterCount ?? 0) ? "opacity 0.3s ease" : "none",
              }}
            >
              {letter}
            </text>
          );
        })}
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
          d={`M${CX},${CY + BEAN_R2 + 2} L${CX - 4},${CY + BEAN_R2 + 11} L${CX},${CY + BEAN_R2 + 20} L${CX + 4},${CY + BEAN_R2 + 11} Z`}
        />
      </g>
    </svg>
  );
}

// Forward delta in [0,360); add a full turn when it falls short of 180° so the
// ring always spins at least half a revolution coming out of idle.
function atLeast180(forwardDelta: number): number {
  return forwardDelta < 180 ? forwardDelta + 360 : forwardDelta;
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

  const absBean = (beanYear - REF + beanFrac) * BEAN_SEG;
  const absFlavour = (beanYear - REF + beanFrac) * (FLAVOUR_SEG / YEARS_PER_FLAVOUR);
  const absForm = (beanYear - REF + beanFrac) * 360;

  const modBean = ((absBean % 360) + 360) % 360;
  const modFlavour = ((absFlavour % 360) + 360) % 360;
  const modForm = ((absForm % 360) + 360) % 360;

  return {
    absBean,
    absFlavour,
    absForm,
    targetBean: modBean - BEAN_SEG / 2,
    targetFlavour: modFlavour - FLAVOUR_SEG / 2,
    targetCentre: modForm,
    targetForm: modForm - FORM_SEG / 2,
    beanIdx: Math.floor(modBean / BEAN_SEG),
    flavourIdx: Math.floor(modFlavour / FLAVOUR_SEG),
    formIdx: FORM_ORDER.indexOf(getFormIdForDate(date)),
  };
}
