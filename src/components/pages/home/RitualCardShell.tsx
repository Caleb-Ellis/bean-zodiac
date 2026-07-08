import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { BeanId, FlavourId, FormId } from "../../../lib/zodiac";

const SWAY_KEYFRAMES: Array<[number, number]> = [
  [2, 1],
  [1, -2],
  [-1, 3],
  [-2, -3],
  [2, 1],
];
const SWAY_DURATION_MS = 11000;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

const SWAY_ANGLES = (() => {
  const raw = SWAY_KEYFRAMES.map(
    ([rx, ry]) => (Math.atan2(ry, rx) * 180) / Math.PI,
  );
  const unwrapped = [raw[0]];
  for (let i = 1; i < raw.length; i++) {
    let next = raw[i];
    const prev = unwrapped[i - 1];
    while (next - prev > 180) next -= 360;
    while (next - prev < -180) next += 360;
    unwrapped.push(next);
  }
  return unwrapped;
})();

const LAND_DELAY_MS = 1400;

interface RenderState {
  revealed: boolean;
  landed: boolean;
}

interface Props {
  /** Colour vars for the flip card's border/back — the zodiac being revealed. */
  flavourId: FlavourId;
  formId: FormId;
  beanId: BeanId;
  /** The small uppercase line above the card. Omit for none. */
  eyebrow?: string;
  /** Text on the reveal button. Defaults to "Reveal". */
  revealLabel?: string;
  /** Front-face content, given the card's reveal/land state. */
  children: (state: RenderState) => ReactNode;
}

/**
 * The shared 3D flip-card chrome behind the daily ritual and the season summary:
 * a sealed card that sways until the Reveal button flips it, then measures its
 * content to a square-ish size. Front-face content is supplied by the caller.
 */
export default function RitualCardShell({
  flavourId,
  formId,
  beanId,
  eyebrow,
  revealLabel = "Reveal",
  children,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [landed, setLanded] = useState(false);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const cardBoxRef = useRef<HTMLDivElement | null>(null);
  const cardContentRef = useRef<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState<number | null>(null);

  useEffect(() => {
    const content = cardContentRef.current;
    const box = cardBoxRef.current;
    if (!content || !box) return;
    const measure = () => {
      const contentH = content.offsetHeight;
      const width = box.offsetWidth;
      if (contentH > 0 && width > 0) {
        // Square unless the content forces a taller card.
        setCardHeight(Math.max(contentH, width));
      }
    };
    const ro = new ResizeObserver(measure);
    ro.observe(content);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  // Lock page scroll and hide the layout behind the card while it's mounted.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const layoutContent = document.getElementById("layout-content");
    if (layoutContent) layoutContent.style.visibility = "hidden";
    return () => {
      document.body.style.overflow = "";
      if (layoutContent) layoutContent.style.visibility = "";
    };
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const id = setTimeout(() => setLanded(true), LAND_DELAY_MS);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed) return;
    const el = tiltRef.current;
    if (!el) return;
    const segments = SWAY_KEYFRAMES.length - 1;
    let start: number | null = null;
    let frame = 0;
    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = Math.max(0, now - start);
      const t = ((elapsed % SWAY_DURATION_MS) / SWAY_DURATION_MS) * segments;
      const i = Math.floor(t);
      const local = smoothstep(t - i);
      const a0 = SWAY_ANGLES[i];
      const a1 = SWAY_ANGLES[i + 1];
      const angle = a0 + (a1 - a0) * local;
      el.style.setProperty("--tilt-angle", `${angle}deg`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [revealed]);

  return createPortal(
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center">
      <div className="max-w-xl w-full flex flex-col items-center gap-2">
        {eyebrow && (
          <div className="flex flex-col items-center gap-4">
            <p
              className="mb-3 text-xs tracking-widest uppercase text-zinc-400 text-center animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              {eyebrow}
            </p>
          </div>
        )}

        <div
          className="max-w-sm w-full animate-fade-up"
          style={{
            animationDelay: "700ms",
            animationDuration: "700ms",
            filter: "drop-shadow(0 25px 30px rgba(0,0,0,0.6))",
          }}
        >
          <div className="relative w-full" style={{ perspective: "1400px" }}>
            <div
              ref={tiltRef}
              className={`relative w-full ${revealed ? "" : "animate-card-sway"}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="relative w-full transition-transform ease-[cubic-bezier(0.65,0,0.35,1)]"
                style={{
                  transformStyle: "preserve-3d",
                  transform: revealed ? "rotateY(0deg)" : "rotateY(180deg)",
                  transitionDuration: "1500ms",
                }}
              >
                <div
                  aria-hidden
                  className="absolute top-4 bottom-4 rounded-sm"
                  style={{
                    left: "-4px",
                    width: "8px",
                    transform: "rotateY(90deg)",
                    background:
                      "linear-gradient(to right, #18181b, #27272a 40%, #27272a 60%, #18181b)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute top-4 bottom-4 rounded-sm"
                  style={{
                    right: "-4px",
                    width: "8px",
                    transform: "rotateY(90deg)",
                    background:
                      "linear-gradient(to right, #18181b, #27272a 40%, #27272a 60%, #18181b)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute left-4 right-4 rounded-sm"
                  style={{
                    top: "-4px",
                    height: "8px",
                    transform: "rotateX(90deg)",
                    background:
                      "linear-gradient(to bottom, #18181b, #27272a 40%, #27272a 60%, #18181b)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute left-4 right-4 rounded-sm"
                  style={{
                    bottom: "-4px",
                    height: "8px",
                    transform: "rotateX(90deg)",
                    background:
                      "linear-gradient(to bottom, #18181b, #27272a 40%, #27272a 60%, #18181b)",
                  }}
                />
                <div
                  aria-hidden={!revealed}
                  className="relative w-full rounded-2xl p-[1.5px] overflow-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "translateZ(4px)",
                    pointerEvents: revealed ? "auto" : "none",
                  }}
                >
                  <div
                    className="absolute"
                    style={{
                      inset: "-200%",
                      background: `conic-gradient(from 0deg, var(--flavour-${flavourId}), var(--form-${formId}), var(--bean-${beanId}), var(--flavour-${flavourId}))`,
                      animation: "spin 10s linear infinite",
                    }}
                  />
                  {revealed && (
                    <div
                      aria-hidden
                      className="absolute animate-border-pulse"
                      style={{
                        inset: "-200%",
                        background: `conic-gradient(from 90deg, var(--flavour-${flavourId}), var(--form-${formId}), var(--bean-${beanId}), var(--flavour-${flavourId}))`,
                        filter: "brightness(1.5) saturate(1.4)",
                      }}
                    />
                  )}
                  <div
                    ref={cardBoxRef}
                    className="relative w-full rounded-[calc(1rem-1.5px)] bg-zinc-900 overflow-hidden flex flex-col justify-center"
                    style={{
                      height:
                        cardHeight !== null ? `${cardHeight}px` : undefined,
                      transition:
                        cardHeight !== null
                          ? "height 600ms cubic-bezier(0.4, 0, 0.2, 1)"
                          : undefined,
                    }}
                  >
                    <div
                      ref={cardContentRef}
                      className="p-4 flex flex-col items-center gap-4"
                    >
                      {children({ revealed, landed })}
                    </div>
                  </div>
                </div>
                <div
                  aria-hidden={revealed}
                  className="absolute inset-0 rounded-2xl p-[1.5px] overflow-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg) translateZ(4px)",
                    pointerEvents: revealed ? "none" : "auto",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `linear-gradient(var(--tilt-angle, 0deg), var(--flavour-${flavourId}), var(--form-${formId}), var(--bean-${beanId}))`,
                    }}
                  />
                  <div className="relative w-full h-full rounded-[calc(1rem-1.5px)] overflow-hidden bg-zinc-950">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `linear-gradient(var(--tilt-angle, 0deg), var(--bean-${beanId}), var(--form-${formId}), var(--flavour-${flavourId}))`,
                      }}
                    />
                    <div
                      className="absolute inset-0 bg-zinc-950"
                      style={{
                        maskImage:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path fill-rule='evenodd' fill='black' d='M0 0H32V32H0Z M16 0L32 16L16 32L0 16Z M16 1L31 16L16 31L1 16Z M16 12L17 15L20 16L17 17L16 20L15 17L12 16L15 15Z M0 -4L1 -1L4 0L1 1L0 4L-1 1L-4 0L-1 -1Z M32 -4L33 -1L36 0L33 1L32 4L31 1L28 0L31 -1Z M0 28L1 31L4 32L1 33L0 36L-1 33L-4 32L-1 31Z M32 28L33 31L36 32L33 33L32 36L31 33L28 32L31 31Z M16 -2.5L18.5 0L16 2.5L13.5 0Z M32 13.5L34.5 16L32 18.5L29.5 16Z M16 29.5L18.5 32L16 34.5L13.5 32Z M0 13.5L2.5 16L0 18.5L-2.5 16Z'/></svg>\")",
                        WebkitMaskImage:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path fill-rule='evenodd' fill='black' d='M0 0H32V32H0Z M16 0L32 16L16 32L0 16Z M16 1L31 16L16 31L1 16Z M16 12L17 15L20 16L17 17L16 20L15 17L12 16L15 15Z M0 -4L1 -1L4 0L1 1L0 4L-1 1L-4 0L-1 -1Z M32 -4L33 -1L36 0L33 1L32 4L31 1L28 0L31 -1Z M0 28L1 31L4 32L1 33L0 36L-1 33L-4 32L-1 31Z M32 28L33 31L36 32L33 33L32 36L31 33L28 32L31 31Z M16 -2.5L18.5 0L16 2.5L13.5 0Z M32 13.5L34.5 16L32 18.5L29.5 16Z M16 29.5L18.5 32L16 34.5L13.5 32Z M0 13.5L2.5 16L0 18.5L-2.5 16Z'/></svg>\")",
                        maskSize: "32px 32px",
                        WebkitMaskSize: "32px 32px",
                        maskRepeat: "repeat",
                        WebkitMaskRepeat: "repeat",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: "translate(-50%, -50%)",
                  transformStyle: "preserve-3d",
                  pointerEvents: revealed ? "none" : "auto",
                }}
              >
                <div
                  className="relative rounded-full p-[1.5px] overflow-hidden shadow-xl shadow-black/80 group"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateZ(60px)",
                    opacity: revealed ? 0 : 1,
                    transition: "opacity 300ms ease",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `linear-gradient(var(--tilt-angle, 0deg), var(--flavour-${flavourId}), var(--form-${formId}), var(--bean-${beanId}))`,
                      opacity: 0.85,
                    }}
                  />
                  <button
                    onClick={() => setRevealed(true)}
                    disabled={revealed}
                    aria-hidden={revealed}
                    className="relative block whitespace-nowrap px-6 py-3 text-sm tracking-[0.3em] uppercase text-zinc-100 group-hover:text-white rounded-full cursor-pointer bg-zinc-950 group-hover:bg-zinc-900 transition-colors duration-200"
                  >
                    {revealLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
