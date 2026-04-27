import { useEffect, useState } from "react";
import {
  getPreparationName,
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type Zodiac,
  type ZodiacId,
} from "../lib/zodiac";
import { getDailyFortuneIds, getFortuneText } from "../lib/fortune";
import { fetchZodiac, type AllZodiacData } from "../lib/data";
import {
  addFortuneToHistory,
  clearFortuneHistory,
} from "../lib/fortuneHistory";
import Bean from "./Bean";
import BeanBadge from "./BeanBadge";
import FlavourBadge from "./FlavourBadge";
import FormBadge from "./FormBadge";
import ZodiacName from "./ZodiacName";

interface Props {
  data: AllZodiacData;
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
  if (!bean || !flavour || !form) return null;

  const preparation = getPreparationName(flavourId, formId);
  const seasonalMeta = getZodiacMetadataForDate(date);
  const seasonalBean = data.beans[seasonalMeta.beanId];
  const seasonalFlavour = data.flavours[seasonalMeta.flavourId];
  const seasonalForm = data.forms[seasonalMeta.formId];
  const seasonalPreparation = getPreparationName(
    seasonalMeta.flavourId,
    seasonalMeta.formId,
  );
  const daysLeft = Math.ceil(
    (seasonalMeta.endDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  const { zodiacId: fortuneZodiacId, qualityId } = getDailyFortuneIds(
    date,
    claimedSlug,
  );
  const [fortuneFlavourId, fortuneFormId, fortuneBeanId] =
    fortuneZodiacId.split("-") as [FlavourId, FormId, BeanId];
  const fortuneBean = data.beans[fortuneBeanId];
  const fortuneFlavour = data.flavours[fortuneFlavourId];
  const fortuneForm = data.forms[fortuneFormId];
  const fortunePreparation = getPreparationName(
    fortuneFlavourId,
    fortuneFormId,
  );

  const [seasonalZodiac, setSeasonalZodiac] = useState<Zodiac | null>(null);
  const [fortuneZodiac, setFortuneZodiac] = useState<Zodiac | null>(null);

  useEffect(() => {
    Promise.all([
      fetchZodiac(seasonalMeta.zodiacId),
      fetchZodiac(fortuneZodiacId),
    ]).then(([seasonal, fortune]) => {
      setSeasonalZodiac(seasonal);
      setFortuneZodiac(fortune);
      const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      addFortuneToHistory({
        date: localDateStr,
        zodiacId: fortuneZodiacId,
        qualityId,
        text: getFortuneText(fortune, qualityId),
      });
    });
  }, []);

  const fortuneText = fortuneZodiac
    ? getFortuneText(fortuneZodiac, qualityId)
    : null;

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
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center gap-4 sm:gap-6 w-full">
              <div className="shrink-0" style={{ width: "6rem" }}>
                <Bean
                  bean={fortuneBean}
                  flavourId={fortuneFlavourId}
                  formId={fortuneFormId}
                  qualityId={qualityId}
                />
              </div>
              <div className="flex flex-col items-start gap-2 min-w-0">
                <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-zinc-200 text-left mb-2">
                  <ZodiacName
                    flavourId={fortuneFlavourId}
                    formId={fortuneFormId}
                    beanId={fortuneBeanId}
                    preparation={fortunePreparation}
                    beanName={fortuneBean.name}
                    zodiacId={fortuneZodiacId}
                    qualityId={qualityId}
                  />
                </p>
                {fortuneText && (
                  <p className="italic text-zinc-200 sm:text-lg text-left mb-1 sm:mb-2">
                    "{fortuneText}"
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400 mt-1">
                  <FlavourBadge
                    id={fortuneFlavourId}
                    name={fortuneFlavour.name}
                  />
                  <span className="text-zinc-600">×</span>
                  <FormBadge id={fortuneFormId} name={fortuneForm.name} />
                  <span className="text-zinc-600">×</span>
                  <BeanBadge id={fortuneBeanId} name={fortuneBean.name} />
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
            <ZodiacName
              flavourId={flavourId}
              formId={formId}
              beanId={beanId}
              preparation={preparation}
              beanName={bean.name}
            />
          </span>
        </h2>
        <div className="mb-6 sm:mb-8">
          <Bean bean={bean} flavourId={flavour.slug} formId={form.slug} />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4 sm:mb-6">
          <a
            href="/legunomicon"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline text-zinc-300"
          >
            📖&nbsp; The Legunomicon
          </a>
          <a
            href={`/zodiacs/${claimedSlug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline text-zinc-300"
          >
            About Me →
          </a>
        </div>
        <section className="mt-6 sm:mt-8 max-w-3xl w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 border-t border-zinc-600" />
            <span className="text-zinc-500 text-xs">✦</span>
            <div className="flex-1 border-t border-zinc-600" />
          </div>
          <p className="text-xs uppercase tracking-widest text-zinc-200">
            {seasonalZodiac
              ? `We are in the ${seasonalZodiac.trait} Season of the`
              : "Current Season"}
          </p>
          <p className="text-sm sm:text-lg font-bold uppercase tracking-widest text-zinc-200 text-left mb-2">
            <ZodiacName
              flavourId={seasonalMeta.flavourId}
              formId={seasonalMeta.formId}
              beanId={seasonalMeta.beanId}
              preparation={seasonalPreparation}
              beanName={seasonalBean?.name ?? ""}
              zodiacId={seasonalMeta.zodiacId}
            />
          </p>
          {seasonalBean && (
            <div className="my-2 sm:my-4" style={{ width: "7rem" }}>
              <Bean
                bean={seasonalBean}
                flavourId={seasonalMeta.flavourId}
                formId={seasonalMeta.formId}
              />
            </div>
          )}
          {seasonalZodiac && (
            <p className="italic text-zinc-200 sm:text-lg text-center px-4">
              "{seasonalZodiac.seasonalFortune}"
            </p>
          )}
          <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-zinc-400 my-2 sm:my-4">
            <FlavourBadge
              id={seasonalMeta.flavourId}
              name={seasonalFlavour?.name ?? seasonalMeta.flavourId}
              label="Phase"
            />
            <span className="text-zinc-600">×</span>
            <FormBadge
              id={seasonalMeta.formId}
              name={seasonalForm?.name ?? seasonalMeta.formId}
              label="Season"
            />
            <span className="text-zinc-600">×</span>
            <BeanBadge
              id={seasonalMeta.beanId}
              name={seasonalBean?.name ?? seasonalMeta.beanId}
              label="Year"
            />
          </div>
          <p className="text-sm text-zinc-400">
            Ends in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 border-t border-zinc-600" />
            <span className="text-zinc-500 text-xs">✦</span>
            <div className="flex-1 border-t border-zinc-600" />
          </div>
        </section>
        <div className="mt-8">
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to relinquish your Bean? Your Legunomicon fortune history will also be deleted.",
                )
              ) {
                clearFortuneHistory();
                onRelinquish();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer bg-transparent text-sm"
          >
            Relinquish your Bean <span className="text-xs">✕</span>
          </button>
        </div>
      </section>
    </div>
  );
}
