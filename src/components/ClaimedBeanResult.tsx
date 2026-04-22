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
  onRelinquish: () => void;
}

export default function ClaimedBeanResult({
  data,
  date,
  claimedSlug,
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
  const seasonalBean = data.beans[seasonalMeta.beanId];
  const seasonalFlavour = data.flavours[seasonalMeta.flavourId];
  const seasonalForm = data.forms[seasonalMeta.formId];
  const seasonalZodiac = data.zodiacs[seasonalMeta.zodiacId];
  const seasonalPreparation = getPreparationName(
    seasonalMeta.flavourId,
    seasonalMeta.formId,
  );
  const seasonalTrait = seasonalZodiac?.trait;
  const daysLeft = Math.ceil(
    (seasonalMeta.endDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

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
        <section className="mb-8 sm:mb-12 max-w-2xl w-full flex flex-col items-center gap-4">
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
                    <span className="score-gleam">Market-Fresh </span>
                  )}
                  {rarityId === RarityIds.Garden && (
                    <span>Store-Bought </span>
                  )}
                  <a
                    href={`/zodiacs/${fortuneZodiacId}`}
                    className="no-underline hover:underline"
                  >
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
                  </a>
                </p>
                <p className="italic text-zinc-200 sm:text-lg text-left sm:mb-1">
                  "{fortuneText}"
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400 mt-1">
                  <a
                    href={`/flavours/${fortuneFlavour.slug}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
                  >
                    <span>{FLAVOUR_EMOJI[fortuneFlavourId]}</span>
                    <span className={`flavour-${fortuneFlavour.slug}`}>
                      {fortuneFlavour.name}
                    </span>
                  </a>
                  <span className="text-zinc-600">×</span>
                  <a
                    href={`/forms/${fortuneForm.slug}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
                  >
                    <span>{FORM_EMOJI[fortuneFormId]}</span>
                    <span className={`form-${fortuneForm.slug}`}>
                      {fortuneForm.name}
                    </span>
                  </a>
                  <span className="text-zinc-600">×</span>
                  <a
                    href={`/beans/${fortuneBean.slug}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
                  >
                    <span>🫘</span>
                    <span className={`bean-${fortuneBean.slug}`}>
                      {fortuneBean.name}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 border-t border-zinc-600" />
            <span className="text-zinc-500 text-xs">✦</span>
            <div className="flex-1 border-t border-zinc-600" />
          </div>
        </section>
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
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6 sm:mb-8">
          <a
            href={`/zodiacs/${claimedSlug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline text-zinc-300"
          >
            About Me →
          </a>
          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to relinquish your Bean?")
              ) {
                onRelinquish();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer bg-transparent text-sm"
          >
            Relinquish <span className="text-xs">✕</span>
          </button>
        </div>
        <p className="text-sm text-zinc-400">
          The {seasonalTrait} Season of the{" "}
          <a
            href={`/zodiacs/${seasonalMeta.zodiacId}`}
            className="no-underline hover:underline"
          >
            <span
              style={{
                background: `linear-gradient(135deg, var(--flavour-${seasonalFlavour?.slug}) 60%, var(--form-${seasonalForm?.slug}))`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: `url(#form-${seasonalForm?.slug}-filter) saturate(1.8) brightness(1.2)`,
              }}
            >
              {seasonalPreparation}
            </span>{" "}
            <span className={`bean-${seasonalBean?.slug}`}>
              {seasonalBean?.name}
            </span>
          </a>{" "}
          ends in {daysLeft} {daysLeft === 1 ? "day" : "days"}.
        </p>
        <p className="text-sm italic text-zinc-400">
          "{seasonalZodiac.seasonalFortune}"
        </p>
      </section>
    </div>
  );
}
