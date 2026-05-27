import { useEffect, useState } from "react";
import {
  getPreparationName,
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type Zodiac,
  type ZodiacId,
} from "../../../lib/zodiac";
import { fetchZodiac, type AllZodiacData } from "../../../lib/data";
import { useStore } from "../../../store";
import Bean from "../../zodiac/Bean";
import BeanBadge from "../../zodiac/BeanBadge";
import FlavourBadge from "../../zodiac/FlavourBadge";
import FormBadge from "../../zodiac/FormBadge";
import ZodiacName from "../../zodiac/ZodiacName";
import Divider from "../../ui/Divider";

interface Props {
  data: AllZodiacData;
  date: Date;
  claimedSlug: ZodiacId;
  onRelinquish: () => void;
}

export default function ClaimedHomeContent({
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

  const [seasonalZodiac, setSeasonalZodiac] = useState<Zodiac | null>(null);
  useEffect(() => {
    fetchZodiac(seasonalMeta.zodiacId).then(setSeasonalZodiac);
  }, [seasonalMeta.zodiacId]);

  if (!bean || !flavour || !form) return null;

  const preparation = getPreparationName(flavourId, formId);

  const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const todayEntry = useStore((s) =>
    s.fortuneHistory.find((e) => e.date === localDateStr),
  );

  const storedZodiacId = todayEntry?.zodiacId;
  const storedSplit = storedZodiacId
    ? (storedZodiacId.split("-") as [FlavourId, FormId, BeanId])
    : null;
  const fortuneFlavourId = storedSplit?.[0];
  const fortuneFormId = storedSplit?.[1];
  const fortuneBeanId = storedSplit?.[2];
  const fortuneBean = fortuneBeanId ? data.beans[fortuneBeanId] : undefined;
  const fortunePreparation =
    fortuneFlavourId && fortuneFormId
      ? getPreparationName(fortuneFlavourId, fortuneFormId)
      : "";
  const qualityId = todayEntry?.qualityId;
  const text = todayEntry?.text ?? null;

  const handleRelinquish = () => {
    if (
      window.confirm(
        "Are you sure you want to relinquish your Bean? Your Beaniary, Legunomicon and Spirit Bean will be reset.",
      )
    ) {
      useStore.getState().relinquish();
      onRelinquish();
    }
  };

  return (
    <div className="flex flex-col items-center text-center gap-6 animate-fade-up">
      {fortuneBean &&
        storedZodiacId &&
        fortuneFlavourId &&
        fortuneFormId &&
        fortuneBeanId &&
        qualityId && (
          <section className="mb-8 sm:mb-12 max-w-2xl w-full flex flex-col items-center gap-4">
            <Divider />
            <p className="text-xs uppercase tracking-widest text-zinc-200 mb-2">
              Today you received this Bean's Wisdom
            </p>
            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
                <a
                  href={`/zodiacs/${storedZodiacId}`}
                  className="shrink-0 block no-underline"
                  style={{ width: "6rem" }}
                >
                  <Bean
                    bean={fortuneBean}
                    flavourId={fortuneFlavourId}
                    formId={fortuneFormId}
                    qualityId={qualityId}
                  />
                </a>
                <div className="relative flex flex-col items-center sm:items-start gap-4 min-w-0 overflow-hidden">
                  <div className="flex flex-col sm:flex-wrap sm:flex-row items-center sm:items-start gap-4">
                    <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-zinc-200 text-center text-balance">
                      <ZodiacName
                        flavourId={fortuneFlavourId}
                        formId={fortuneFormId}
                        beanId={fortuneBeanId}
                        preparation={fortunePreparation}
                        beanName={fortuneBean.name}
                        zodiacId={storedZodiacId}
                        qualityId={qualityId}
                      />
                    </p>
                  </div>
                  {text ? (
                    <p className="italic text-zinc-200 sm:text-lg text-center sm:text-left">
                      "{text}"
                    </p>
                  ) : (
                    <p className="italic text-zinc-500 text-sm text-center sm:text-left">
                      This bean had nothing to say to you this day.
                    </p>
                  )}
                  <a
                    href="/beanstalk"
                    className="text-sm text-zinc-400 hover:text-zinc-200 underline transition-colors"
                  >
                    View in Beanstalk →
                  </a>
                </div>
              </div>
            </div>
            <Divider />
          </section>
        )}

      <section className="flex flex-col items-center gap-2">
        <h2 className="mb-2 flex flex-col items-center font-bold">
          <span className="block text-md sm:text-xl mb-2 sm:mb-4">
            You are the
          </span>
          <span className="block text-4xl sm:text-7xl mb-3 sm:mb-7 text-center text-balance">
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
          <Bean
            bean={bean}
            flavourId={flavour.slug as FlavourId}
            formId={form.slug as FormId}
          />
        </div>
        <div className="flex flex-row flex-wrap justify-center items-center gap-2 text-sm text-zinc-400 mb-4 sm:mb-6">
          <a
            href="/beaniary"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline text-zinc-300"
          >
            🫘&nbsp; The Beaniary
          </a>
          <a
            href="/beanstalk"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline text-zinc-300"
          >
            🪴&nbsp; The Beanstalk
          </a>
          <a
            href={`/zodiacs/${claimedSlug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline text-zinc-300"
          >
            👤&nbsp; About Me
          </a>
        </div>
        <section className="mt-6 sm:mt-8 max-w-3xl w-full flex flex-col items-center gap-4">
          <Divider />
          <p className="text-xs uppercase tracking-widest text-zinc-200">
            {seasonalZodiac ? (
              `We are in the ${seasonalZodiac.trait} season of the`
            ) : (
              <span className="inline-block h-4 w-48 bg-zinc-800 rounded-full animate-pulse" />
            )}
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
          {seasonalZodiac ? (
            <p className="italic text-zinc-200 sm:text-lg text-center px-4">
              "{seasonalZodiac.seasonalFortune}"
            </p>
          ) : (
            <div className="h-5 w-64 bg-zinc-800 rounded-full animate-pulse" />
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
          <Divider />
        </section>
        <div className="mt-8">
          <button
            onClick={handleRelinquish}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer bg-transparent text-sm"
          >
            Relinquish your Bean <span className="text-xs">✕</span>
          </button>
        </div>
      </section>
    </div>
  );
}
