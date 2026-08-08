import { getPreparationName } from "../../../lib/zodiac";
import type { AllZodiacData } from "../../../lib/data";
import Bean from "../../zodiac/Bean";
import ZodiacName from "../../zodiac/ZodiacName";
import FacetVariant from "./FacetVariant";
import QuestionVariant from "./QuestionVariant";
import RitualCardShell from "./RitualCardShell";
import RorschachVariant from "./RorschachVariant";
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
    variant,
    question,
    fortuneTitle,
    fortuneText,
    scored,
    scoredText,
    text,
    scoringOut,
    handleScore,
    handleAnswer,
    handleClose,
  } = fortune;

  const fortuneBean = data.beans[fortuneBeanId];
  const fortunePreparation = getPreparationName(
    fortuneFlavourId,
    fortuneFormId,
  );

  if (!fortuneBean) return null;

  return (
    <RitualCardShell
      flavourId={fortuneFlavourId}
      formId={fortuneFormId}
      beanId={fortuneBeanId}
      eyebrow="Give us this day our daily bean"
    >
      {({ revealed, landed }) => (
        <>
          {scored && (
            <div
              className="flex flex-col items-center gap-4 pt-1 animate-fade-up"
              style={{ animationDuration: "500ms" }}
            >
              <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-zinc-200 text-center text-balance">
                <ZodiacName
                  flavourId={fortuneFlavourId}
                  formId={fortuneFormId}
                  beanId={fortuneBeanId}
                  preparation={fortunePreparation}
                  beanName={fortuneBean.name}
                  zodiacId={fortuneZodiacId}
                  qualityId={qualityId}
                  asLink={false}
                  showPoles={false}
                />
              </p>
              <Bean
                bean={fortuneBean}
                flavourId={fortuneFlavourId}
                formId={fortuneFormId}
                qualityId={qualityId}
                maxHeight="6rem"
              />
            </div>
          )}
          {!scored ? (
            <div
              className="flex flex-col items-center gap-4 w-full transition-opacity duration-350"
              style={{
                opacity: scoringOut ? 0 : 1,
                pointerEvents: scoringOut || !revealed ? "none" : "auto",
              }}
            >
              {fortuneZodiac && variant === "question" ? (
                <QuestionVariant
                  fortuneZodiac={fortuneZodiac}
                  question={question}
                  landed={landed}
                  handleAnswer={handleAnswer}
                />
              ) : fortuneZodiac && variant === "rorschach" ? (
                <RorschachVariant
                  fortuneZodiac={fortuneZodiac}
                  zodiacId={fortuneZodiacId}
                  landed={landed}
                  handleAnswer={handleAnswer}
                />
              ) : (
                <FacetVariant
                  fortuneTitle={fortuneTitle}
                  fortuneText={fortuneText}
                  landed={landed}
                  handleScore={handleScore}
                />
              )}
            </div>
          ) : (
            <div
              key={scoredText}
              className="flex flex-col items-center gap-4 animate-fade-up"
              style={{
                animationDelay: "200ms",
                animationDuration: "500ms",
              }}
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
        </>
      )}
    </RitualCardShell>
  );
}
