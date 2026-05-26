import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getPreparationName } from "../../../lib/zodiac";
import type { AllZodiacData } from "../../../lib/data";
import Bean from "../../zodiac/Bean";
import ZodiacName from "../../zodiac/ZodiacName";
import type { DailyFortune } from "./useDailyFortune";

interface Props {
  data: AllZodiacData;
  fortune: DailyFortune;
}

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

export default function FortuneDialog({ data, fortune }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [landed, setLanded] = useState(false);
  const tiltRef = useRef<HTMLDivElement | null>(null);

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

  const {
    fortuneZodiacId,
    fortuneFlavourId,
    fortuneFormId,
    fortuneBeanId,
    fortuneZodiac,
    qualityId,
    fortuneTitle,
    fortuneText,
    scored,
    scoredText,
    text,
    scoringOut,
    showQuality,
    qualityFading,
    handleScore,
    handleClose,
  } = fortune;

  const fortuneBean = data.beans[fortuneBeanId];
  const fortunePreparation = getPreparationName(
    fortuneFlavourId,
    fortuneFormId,
  );

  if (!fortuneBean) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center">
      <div className="max-w-xl w-full flex flex-col items-center gap-2">
        <div className="flex flex-col items-center gap-4">
          <p
            className="text-xs tracking-widest uppercase text-zinc-500 text-center animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            Give us this day our daily bean
          </p>
          <p
            className="mb-3 text-base sm:text-lg font-semibold text-zinc-200 text-balance text-center animate-fade-up"
            style={{ animationDelay: "400ms" }}
          >
            {fortuneZodiac?.dish}
          </p>
        </div>

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
                      background: `conic-gradient(from 0deg, var(--flavour-${fortuneZodiac?.flavour}), var(--form-${fortuneZodiac?.form}), var(--bean-${fortuneZodiac?.bean}), var(--flavour-${fortuneZodiac?.flavour}))`,
                      animation: "spin 10s linear infinite",
                    }}
                  />
                  {revealed && (
                    <div
                      aria-hidden
                      className="absolute animate-border-pulse"
                      style={{
                        inset: "-200%",
                        background: `conic-gradient(from 90deg, var(--flavour-${fortuneZodiac?.flavour}), var(--form-${fortuneZodiac?.form}), var(--bean-${fortuneZodiac?.bean}), var(--flavour-${fortuneZodiac?.flavour}))`,
                        filter: "brightness(1.5) saturate(1.4)",
                      }}
                    />
                  )}
                  <div className="relative w-full rounded-[calc(1rem-1.5px)] bg-zinc-900 p-4 flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-4 pt-1">
                      <p
                        className="text-sm sm:text-base font-bold uppercase tracking-widest text-zinc-200 text-center text-balance"
                        style={{
                          opacity: qualityFading ? 0 : 1,
                          transition: "opacity 0.4s",
                        }}
                      >
                        <ZodiacName
                          flavourId={fortuneFlavourId}
                          formId={fortuneFormId}
                          beanId={fortuneBeanId}
                          preparation={fortunePreparation}
                          beanName={fortuneBean.name}
                          zodiacId={fortuneZodiacId}
                          qualityId={showQuality ? qualityId : undefined}
                          asLink={false}
                        />
                      </p>
                      <Bean
                        bean={fortuneBean}
                        flavourId={fortuneFlavourId}
                        formId={fortuneFormId}
                        qualityId={showQuality ? qualityId : undefined}
                        maxHeight="6rem"
                      />
                    </div>
                    {!scored ? (
                      <div
                        className="flex flex-col items-center gap-4 w-full transition-opacity duration-350"
                        style={{
                          opacity: scoringOut ? 0 : 1,
                          pointerEvents:
                            scoringOut || !revealed ? "none" : "auto",
                        }}
                      >
                        {fortuneTitle ? (
                          <p
                            className={`font-bold text-zinc-200 text-center ${landed ? "animate-fade-up" : "opacity-0"}`}
                            style={
                              landed
                                ? {
                                    animationDelay: "150ms",
                                    animationDuration: "500ms",
                                  }
                                : undefined
                            }
                          >
                            {fortuneTitle}
                          </p>
                        ) : (
                          <div className="h-3 w-32 bg-zinc-800 rounded-full animate-pulse" />
                        )}
                        {fortuneText ? (
                          <p
                            className={`text-zinc-200 text-center sm:text-base mb-2 ${landed ? "animate-fade-up" : "opacity-0"}`}
                            style={
                              landed
                                ? {
                                    animationDelay: "400ms",
                                    animationDuration: "500ms",
                                  }
                                : undefined
                            }
                          >
                            {fortuneText}
                          </p>
                        ) : (
                          <div className="h-5 w-56 bg-zinc-800 rounded-full animate-pulse" />
                        )}
                        <div
                          className={`flex flex-wrap justify-center gap-4 text-sm ${landed ? "animate-fade-up" : "opacity-0"}`}
                          style={
                            landed
                              ? {
                                  animationDelay: "700ms",
                                  animationDuration: "500ms",
                                }
                              : undefined
                          }
                        >
                          <button
                            onClick={() => handleScore(1)}
                            className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-700 text-green-300 hover:bg-[#042012] hover:border-green-600 transition-colors cursor-pointer bg-transparent"
                          >
                            <span>🌱</span>
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleScore(-1)}
                            className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-700 text-amber-300 hover:bg-[#261503] hover:border-amber-600 transition-colors cursor-pointer bg-transparent"
                          >
                            <span>🍂</span>
                            <span>Resist</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={scoredText}
                        className="flex flex-col items-center gap-4 animate-fade-up"
                      >
                        {scoredText && (
                          <p className="text-zinc-300 text-sm sm:text-base text-center">
                            {scoredText}
                          </p>
                        )}
                        {text && (
                          <p className="italic text-zinc-200 text-center sm:text-base mb-2">
                            "{text}"
                          </p>
                        )}
                        <div className="flex items-center gap-6">
                          <a
                            href="/beanstalk"
                            className="text-sm text-zinc-400 hover:text-zinc-200 underline transition-colors"
                          >
                            The Beanstalk grows →
                          </a>
                          <button
                            onClick={handleClose}
                            aria-label="Close"
                            className="flex align-center text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer bg-transparent border-none text-sm leading-none"
                          >
                            Close ✕
                          </button>
                        </div>
                      </div>
                    )}
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
                      backgroundImage: `linear-gradient(var(--tilt-angle, 0deg), var(--flavour-${fortuneZodiac?.flavour}), var(--form-${fortuneZodiac?.form}), var(--bean-${fortuneZodiac?.bean}))`,
                    }}
                  />
                  <div className="relative w-full h-full rounded-[calc(1rem-1.5px)] overflow-hidden bg-zinc-950">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `linear-gradient(var(--tilt-angle, 0deg), var(--bean-${fortuneZodiac?.bean}), var(--form-${fortuneZodiac?.form}), var(--flavour-${fortuneZodiac?.flavour}))`,
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
                      backgroundImage: `linear-gradient(var(--tilt-angle, 0deg), var(--flavour-${fortuneZodiac?.flavour}), var(--form-${fortuneZodiac?.form}), var(--bean-${fortuneZodiac?.bean}))`,
                      opacity: 0.85,
                    }}
                  />
                  <button
                    onClick={() => setRevealed(true)}
                    disabled={revealed}
                    aria-hidden={revealed}
                    className="relative block px-6 py-3 text-sm tracking-[0.3em] uppercase text-zinc-100 group-hover:text-white rounded-full cursor-pointer bg-zinc-950 group-hover:bg-zinc-900 transition-colors duration-200"
                  >
                    Reveal
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
