import {
  FLAVOUR_EMOJI,
  FORM_EMOJI,
  RarityIds,
  getFortuneText,
  getFortuneZodiacId,
  getPreparationName,
  getRarityForSlug,
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacData,
  type ZodiacId,
} from "../lib/zodiac";
import Bean from "./Bean";

interface Props {
  data: ZodiacData;
  date: Date;
  claimedSlug: ZodiacId;
  showFortune?: boolean;
  onRelinquish: () => void;
}

export default function ClaimedBeanResult({
  data,
  date,
  claimedSlug,
  showFortune,
  onRelinquish,
}: Props) {
  const [flavourId, formId, beanId] = claimedSlug.split("-") as [
    FlavourId,
    FormId,
    BeanId,
  ];

  const bean = data.beans[beanId];
  const flavour = data.flavours[flavourId];
  const form = data.forms[formId];
  const zodiac = data.zodiacs[claimedSlug];
  if (!bean || !flavour || !form || !zodiac) return null;

  const preparation = getPreparationName(flavourId, formId);
  const rarityId = getRarityForSlug(claimedSlug, date);
  const seasonalMeta = getZodiacMetadataForDate(date);

  const fortuneZodiacId = getFortuneZodiacId(
    date,
    { beanId, flavourId, formId },
    seasonalMeta,
  );
  const fortuneZodiac = data.zodiacs[fortuneZodiacId];
  const fortuneText = getFortuneText(fortuneZodiac, rarityId);

  const [fortuneFlavourId, fortuneFormId, fortuneBeanId] =
    fortuneZodiacId.split("-") as [FlavourId, FormId, BeanId];
  const fortuneBean = data.beans[fortuneBeanId];
  const fortuneFlavour = data.flavours[fortuneFlavourId];
  const fortuneForm = data.forms[fortuneFormId];
  const fortunePreparation = getPreparationName(
    fortuneFlavourId,
    fortuneFormId,
  );

  return (
    <div className="flex flex-col items-center text-center gap-6 animate-fade-up">
      <section className="flex flex-col items-center gap-2">
        <h2 className="mb-2 flex flex-col items-center font-bold">
          <span className="block text-md sm:text-xl mb-2 sm:mb-4">
            You are the
          </span>
          <span className="block text-4xl sm:text-7xl mb-3 sm:mb-7">
            <span
              style={{
                background: `linear-gradient(135deg, var(--flavour-${flavour.slug}) 60%, var(--form-${form.slug}))`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: `url(#form-${form.slug}-filter) saturate(1.8) brightness(1.2)`,
              }}
            >
              {preparation}
            </span>{" "}
            <span className={`bean-${bean.slug}`}>{bean.name}</span>
          </span>
        </h2>
        <div className="mb-6 sm:mb-8">
          <Bean bean={bean} flavourId={flavour.slug} formId={form.slug} />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6 sm:mb-8 flex-wrap justify-center">
          <a
            href={`/flavours/${flavour.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
          >
            <span>{FLAVOUR_EMOJI[flavourId]}</span>
            <span className={`flavour-${flavour.slug}`}>{flavour.name}</span>
          </a>
          <span className="flex items-center gap-2">
            <span className="text-zinc-600">×</span>
            <a
              href={`/forms/${form.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
            >
              <span>{FORM_EMOJI[formId]}</span>
              <span className={`form-${form.slug}`}>{form.name}</span>
            </a>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-zinc-600">×</span>
            <a
              href={`/beans/${bean.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
            >
              <span>🫘</span>
              <span className={`bean-${bean.slug}`}>{bean.name}</span>
            </a>
          </span>
        </div>
        {showFortune &&
          fortuneText &&
          fortuneBean &&
          fortuneFlavour &&
          fortuneForm && (
            <section className="mb-4 sm:mb-6 max-w-2xl w-full flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 border-t border-zinc-600" />
                <span className="text-zinc-500 text-xs">✦</span>
                <div className="flex-1 border-t border-zinc-600" />
              </div>
              <p className="text-xs uppercase tracking-widest text-zinc-200 mb-2">
                Give us this day our daily Bean
              </p>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 sm:gap-6 w-full">
                  <div className="shrink-0" style={{ width: "6rem" }}>
                    <Bean
                      bean={fortuneBean}
                      flavourId={fortuneFlavourId}
                      formId={fortuneFormId}
                    />
                  </div>
                  <div className="flex flex-col items-start gap-2 min-w-0">
                    <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-zinc-200 text-left mb-2">
                      {rarityId === RarityIds.Heirloom && (
                        <span className="score-gold">Heirloom </span>
                      )}
                      {rarityId === RarityIds.Reserve && (
                        <span className="score-gleam">Reserve </span>
                      )}
                      <span
                        style={{
                          background: `linear-gradient(135deg, var(--flavour-${fortuneFlavour.slug}) 60%, var(--form-${fortuneForm.slug}))`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          filter: `url(#form-${fortuneForm.slug}-filter) saturate(1.8) brightness(1.2)`,
                        }}
                      >
                        {fortunePreparation}
                      </span>{" "}
                      <span className={`bean-${fortuneBean.slug}`}>
                        {fortuneBean.name}
                      </span>
                    </p>
                    <p className="italic text-zinc-200 text-lg text-left">
                      "{fortuneText}"
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 border-t border-zinc-600" />
                <span className="text-zinc-500 text-xs">✦</span>
                <div className="flex-1 border-t border-zinc-600" />
              </div>
            </section>
          )}
      </section>
      <button
        onClick={() => {
          if (
            window.confirm("Are you sure you want to relinquish your Bean?")
          ) {
            onRelinquish();
          }
        }}
        className="text-sm text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors cursor-pointer bg-transparent border-none p-0 mt-4"
      >
        Relinquish your Bean
      </button>
    </div>
  );
}
