import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Markdown from "react-markdown";
import {
  getPreparationName,
  getZodiacMetadataForDate,
  type FlavourId,
  type FormId,
  type Zodiac,
} from "../../../lib/zodiac";
import { type AllZodiacData } from "../../../lib/data";
import Bean from "../../zodiac/Bean";
import BeanBadge from "../../zodiac/BeanBadge";
import FlavourBadge from "../../zodiac/FlavourBadge";
import FormBadge from "../../zodiac/FormBadge";
import ZodiacCardBorder from "../../zodiac/ZodiacCardBorder";
import ZodiacName from "../../zodiac/ZodiacName";

// How long the reading card takes to leave before the acknowledgement card
// replaces it. Must match the `duration-350` class on the card wrapper.
const CARD_EXIT_MS = 350;

const BEAN_HEIGHT = "clamp(6rem, 25vw, 10rem)";

interface Props {
  data: AllZodiacData;
  zodiac: Zodiac | null;
  date: Date;
  /** Drives the fade in and out. */
  visible: boolean;
  /** A bean was already claimed before this spin: respin is the only way on. */
  hasClaimed: boolean;
  /** The claim just landed: the reading fades out for the acknowledgement. */
  justClaimed: boolean;
  respinLabel: string;
  onClaim: () => void;
  onRespin: () => void;
  onContinue: () => void;
}

export default function ZodiacResultCard({
  data,
  zodiac,
  date,
  visible,
  hasClaimed,
  justClaimed,
  respinLabel,
  onClaim,
  onRespin,
  onContinue,
}: Props) {
  const metadata = getZodiacMetadataForDate(date);
  const bean = data.beans[metadata.beanId];
  const flavour = data.flavours[metadata.flavourId];
  const form = data.forms[metadata.formId];
  const preparation = getPreparationName(metadata.flavourId, metadata.formId);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [showMessage, setShowMessage] = useState(false);
  const leaving = justClaimed && !showMessage;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!visible || justClaimed) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRespin();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, justClaimed, onRespin]);

  useEffect(() => {
    if (!justClaimed) return;
    const id = setTimeout(() => setShowMessage(true), CARD_EXIT_MS);
    return () => clearTimeout(id);
  }, [justClaimed]);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className={`fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/70 outline-none transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        key={showMessage ? "message" : "reading"}
        className={`w-full max-w-lg transition-[opacity,translate] duration-350 ${
          leaving ? "opacity-0 -translate-y-2.5 pointer-events-none" : ""
        }`}
      >
        <div
          className="relative w-full max-h-[calc(100dvh-2rem)] flex rounded-2xl p-[1.5px] overflow-hidden animate-fade-up"
          style={{
            animationDelay: showMessage ? undefined : "150ms",
            filter: "drop-shadow(0 25px 30px rgba(0,0,0,0.6))",
          }}
        >
          <ZodiacCardBorder
            flavourId={metadata.flavourId}
            formId={metadata.formId}
            beanId={metadata.beanId}
            pulse
          />
          <div className="relative w-full min-h-0 flex flex-col rounded-[calc(1rem-1.5px)] bg-zinc-900 overflow-hidden">
            {showMessage ? (
              <div className="shrink-0 px-5 py-6 flex flex-col items-center gap-4">
                <p className="text-zinc-300 text-sm sm:text-base text-center text-balance italic leading-normal">
                  Each day, a Bean will visit you.
                </p>
                <p className="text-zinc-300 text-sm sm:text-base text-center text-balance italic leading-normal">
                  What you do with it will be noted.
                </p>
                <p className="text-zinc-300 text-sm sm:text-base text-center text-balance italic leading-normal">
                  The first is waiting.
                </p>
                <button
                  autoFocus
                  onClick={onContinue}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer bg-transparent text-sm"
                >
                  Continue <span className="text-xs">→</span>
                </button>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 flex flex-col items-center text-center gap-4">
                <h2 className="flex flex-col items-center font-bold">
                  <span className="block text-md sm:text-lg mb-2">
                    {hasClaimed ? "The" : "You are the"}
                  </span>
                  <span className="block text-2xl sm:text-5xl text-center text-balance">
                    <ZodiacName
                      flavourId={metadata.flavourId}
                      formId={metadata.formId}
                      beanId={metadata.beanId}
                      preparation={preparation}
                      beanName={bean.name}
                      asLink={false}
                    />
                  </span>
                </h2>
                {/* Fixed height so the text doesn't jump when the image loads. */}
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{ height: BEAN_HEIGHT }}
                >
                  <Bean
                    bean={bean}
                    flavourId={flavour.slug as FlavourId}
                    formId={form.slug as FormId}
                    maxHeight={BEAN_HEIGHT}
                  />
                </div>
                {zodiac && (
                  <p className="italic text-zinc-200 text-balance sm:text-base">
                    "{zodiac.quote}"
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 flex-wrap justify-center">
                  <FlavourBadge
                    id={metadata.flavourId}
                    name={flavour.name}
                    small
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="text-zinc-600">×</span>
                    <FormBadge id={metadata.formId} name={form.name} small />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-zinc-600">×</span>
                    <BeanBadge id={metadata.beanId} name={bean.name} small />
                  </span>
                </div>
                {zodiac && (
                  <section className="markdown-content">
                    <Markdown>{zodiac.content}</Markdown>
                  </section>
                )}
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  {hasClaimed ? (
                    <button
                      onClick={onRespin}
                      className="flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 transition-colors cursor-pointer bg-transparent"
                    >
                      <span>{respinLabel}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 w-3.5 h-3.5"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={onClaim}
                        className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-700 text-green-300 hover:bg-[#042012] hover:border-green-600 transition-colors cursor-pointer bg-transparent"
                      >
                        <span>✓</span>
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={onRespin}
                        className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-700 text-amber-300 hover:bg-[#261503] hover:border-amber-600 transition-colors cursor-pointer bg-transparent"
                      >
                        <span>✕</span>
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
