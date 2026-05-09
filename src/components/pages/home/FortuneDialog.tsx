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

export default function FortuneDialog({ data, fortune }: Props) {
  const {
    fortuneZodiacId,
    fortuneFlavourId,
    fortuneFormId,
    fortuneBeanId,
    fortuneZodiac,
    qualityId,
    fortuneText,
    scored,
    scoredText,
    revealed,
    revealing,
    scoringOut,
    showQuality,
    qualityFading,
    handleReveal,
    handleScore,
    handleIgnore,
    handleClose,
  } = fortune;

  const fortuneBean = data.beans[fortuneBeanId];
  const fortunePreparation = getPreparationName(fortuneFlavourId, fortuneFormId);

  if (!fortuneBean) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center">
      <div className="max-w-lg w-full flex flex-col items-center gap-4">
        <div
          className="flex flex-col items-center gap-4"
          style={{
            opacity: qualityFading ? 0 : 1,
            transition: "opacity 0.4s",
          }}
        >
          <h2
            className="mb-2 flex flex-col items-center font-bold text-center animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            <span className="block text-md sm:text-xl mb-2 sm:mb-4">The</span>
            <span className="block text-2xl sm:text-5xl mb-3 sm:mb-7">
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
            </span>
          </h2>
          <div
            className="mb-8 sm:mb-12 animate-fade-up max-w-36 sm:max-w-none"
            style={{ animationDelay: "100ms" }}
          >
            <Bean
              bean={fortuneBean}
              flavourId={fortuneFlavourId}
              formId={fortuneFormId}
              qualityId={showQuality ? qualityId : undefined}
              maxHeight="8rem"
            />
          </div>
        </div>

        <div
          className="relative w-full rounded-2xl p-[1.5px] overflow-hidden animate-fade-up shadow-2xl shadow-black/90"
          style={{ animationDelay: "200ms" }}
        >
          <div
            className="absolute"
            style={{
              inset: "-200%",
              background: `conic-gradient(from 0deg, var(--flavour-${fortuneZodiac?.flavour}), var(--form-${fortuneZodiac?.form}), var(--bean-${fortuneZodiac?.bean}), var(--flavour-${fortuneZodiac?.flavour}))`,
              animation: "spin 10s linear infinite",
            }}
          />
          <div className="relative w-full rounded-[calc(1rem-1.5px)] bg-zinc-900 p-4 flex flex-col items-center gap-4">
            <p className="text-xs uppercase tracking-widest text-zinc-400">
              Give us this day our daily bean
            </p>
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-3.5 right-3 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer bg-transparent border-none text-base leading-none"
            >
              ✕
            </button>

            {fortuneZodiac ? (
              <p className="text-zinc-300 text-sm sm:text-base text-center">{fortuneZodiac.dish}</p>
            ) : (
              <div className="h-4 w-48 bg-zinc-800 rounded-full animate-pulse" />
            )}

            {!revealed ? (
              <button
                onClick={handleReveal}
                disabled={!fortuneZodiac || revealing}
                className="mt-2 px-4 py-2 rounded-full border border-white text-sm text-zinc-300 hover:text-zinc-100 transition-[colors,opacity] duration-350 cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed font-semibold tracking-widest animate-pulse-gentle"
                style={{ opacity: revealing ? 0 : 1 }}
              >
                RECEIVE THE BEAN'S WISDOM
              </button>
            ) : (
              <>
                {fortuneText ? (
                  <p className="italic text-zinc-200 text-center sm:text-base animate-fade-up mb-2">
                    "{fortuneText}"
                  </p>
                ) : (
                  <div className="h-5 w-56 bg-zinc-800 rounded-full animate-pulse" />
                )}

                {!scored ? (
                  <div
                    className="flex flex-wrap justify-center gap-3 text-sm animate-fade-up transition-opacity duration-350"
                    style={{
                      opacity: scoringOut ? 0 : 1,
                      pointerEvents: scoringOut ? "none" : "auto",
                    }}
                  >
                    <button
                      onClick={() => handleScore(1)}
                      className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-900 text-green-700 hover:border-green-700 hover:text-green-300 transition-colors cursor-pointer bg-transparent"
                    >
                      <span>🌱</span>
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleScore(-1)}
                      className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-900 text-amber-700 hover:border-amber-700 hover:text-amber-300 transition-colors cursor-pointer bg-transparent"
                    >
                      <span>🍂</span>
                      <span>Resist</span>
                    </button>
                    <button
                      onClick={handleIgnore}
                      className="flex items-center gap-2 px-3 py-1 rounded-full border border-blue-700 text-blue-500 hover:border-blue-500 hover:text-blue-300 transition-colors cursor-pointer bg-transparent"
                    >
                      <span>💤</span>
                      <span>Ignore</span>
                    </button>
                  </div>
                ) : (
                  <div
                    key={scoredText}
                    className="flex flex-col items-center gap-4 animate-fade-up"
                  >
                    {scoredText && (
                      <p className="text-sm text-zinc-400 italic text-center mb-2">{scoredText}</p>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
