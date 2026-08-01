import { useEffect, useState } from "react";
import {
  getPreparationName,
  getZodiacMetadataForDate,
  type FlavourId,
  type FormId,
  type Zodiac,
} from "../../../lib/zodiac";
import { fetchZodiac, type AllZodiacData } from "../../../lib/data";
import Bean from "../../zodiac/Bean";
import BeanBadge from "../../zodiac/BeanBadge";
import FlavourBadge from "../../zodiac/FlavourBadge";
import FormBadge from "../../zodiac/FormBadge";
import ZodiacName from "../../zodiac/ZodiacName";

interface Props {
  data: AllZodiacData;
  date: Date;
  showContent?: boolean;
  showFortune?: boolean;
  showQuote?: boolean;
}

export default function UnclaimedHome({ data, date, showQuote }: Props) {
  const meta = getZodiacMetadataForDate(date);
  const bean = data.beans[meta.beanId];
  const flavour = data.flavours[meta.flavourId];
  const form = data.forms[meta.formId];

  const [zodiac, setZodiac] = useState<Zodiac | null>(null);
  useEffect(() => {
    fetchZodiac(meta.zodiacId).then(setZodiac);
  }, [meta.zodiacId]);

  if (!bean || !flavour || !form) return null;

  const preparation = getPreparationName(meta.flavourId, meta.formId);

  return (
    <div className="flex flex-col items-center text-center gap-6 animate-fade-up">
      <section className="flex flex-col items-center gap-2">
        <h2 className="mb-2 flex flex-col items-center font-bold">
          <span className="block text-md sm:text-xl mb-2 sm:mb-4">
            {zodiac
              ? `We are in the ${zodiac.trait} season of the`
              : "We are in the season of the"}
          </span>
          <span className="block text-4xl sm:text-7xl mb-3 sm:mb-7">
            <ZodiacName
              flavourId={meta.flavourId}
              formId={meta.formId}
              beanId={meta.beanId}
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
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4 sm:mb-6 flex-wrap justify-center">
          <FlavourBadge id={meta.flavourId} name={flavour.name} label="Phase" />
          <span className="flex items-center gap-2">
            <span className="text-zinc-600">×</span>
            <FormBadge id={meta.formId} name={form.name} label="Season" />
          </span>
          <span className="flex items-center gap-2">
            <span className="text-zinc-600">×</span>
            <BeanBadge id={meta.beanId} name={bean.name} label="Year" />
          </span>
        </div>
        <section className="flex flex-col items-center gap-3 max-w-xl mt-2 mb-4">
          {showQuote && zodiac && (
            <p className="italic mb-4 sm:mb-6">"{zodiac.quote}"</p>
          )}
          {zodiac && (
            <section className="relative text-center bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-6 py-5 backdrop-blur-sm max-w-lg w-full">
              <p className="text-xs uppercase tracking-widest text-zinc-200 mb-3">
                What to Expect
              </p>
              <p className="italic text-zinc-200 text-lg">
                {zodiac.seasonalFortune}
              </p>
            </section>
          )}
        </section>
      </section>
      <div className="flex flex-col items-center gap-4">
        <p className="max-w-md text-zinc-300 text-balance mb-2">
          Discover your Bean, claim it, and you will receive daily wisdom.
        </p>
        <a
          href="/wheel"
          className="bg-zinc-900/80 border-2 border-zinc-500/60 text-white rounded-xl px-8 py-4 font-bold backdrop-blur-sm transition-[border-color,background-color,color] duration-200 hover:border-zinc-400 hover:text-white hover:bg-zinc-800/80"
        >
          Which Bean are You?&nbsp;→
        </a>
      </div>
    </div>
  );
}
