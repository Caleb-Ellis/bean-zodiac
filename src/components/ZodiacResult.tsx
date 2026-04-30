import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import {
  getPreparationName,
  getZodiacMetadataForDate,
  type Zodiac,
  type ZodiacId,
} from "../lib/zodiac";
import { fetchZodiac, type AllZodiacData } from "../lib/data";
import { clearClaimedBeanSlug, getClaimedBeanSlug } from "../lib/claimedBean";
import ClaimedBeanResult from "./ClaimedBeanResult";
import Bean from "./Bean";
import BeanBadge from "./BeanBadge";
import FlavourBadge from "./FlavourBadge";
import FormBadge from "./FormBadge";
import ZodiacDish from "./ZodiacDish";
import ZodiacName from "./ZodiacName";

interface Props {
  data: AllZodiacData;
  showContent?: boolean;
  showFortune?: boolean;
  showQuote?: boolean;
}

export default function ZodiacResult({ data, showContent, showFortune, showQuote }: Props) {
  const [date] = useState(() => new Date());
  const [claimedSlug, setClaimedSlug] = useState<ZodiacId | null | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return getClaimedBeanSlug();
  });

  const meta = getZodiacMetadataForDate(date);
  const bean = data.beans[meta.beanId];
  const flavour = data.flavours[meta.flavourId];
  const form = data.forms[meta.formId];
  const [zodiac, setZodiac] = useState<Zodiac | null>(null);
  useEffect(() => {
    fetchZodiac(meta.zodiacId).then(setZodiac);
  }, [meta.zodiacId]);

  if (claimedSlug === undefined) return null;

  if (claimedSlug) {
    return (
      <ClaimedBeanResult
        data={data}
        date={date}
        claimedSlug={claimedSlug}
        onRelinquish={() => {
          clearClaimedBeanSlug();
          setClaimedSlug(null);
        }}
      />
    );
  }

  if (!bean || !flavour || !form) return null;

  const preparation = getPreparationName(meta.flavourId, meta.formId);

  return (
    <div className="flex flex-col items-center text-center gap-6 animate-fade-up">
      <section className="flex flex-col items-center gap-2">
        <h2 className="mb-2 flex flex-col items-center font-bold">
          <span className="block text-md sm:text-xl mb-2 sm:mb-4">We are in the Season of the</span>
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
          <Bean bean={bean} flavourId={flavour.slug} formId={form.slug} />
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
        {showFortune && (
          <section className="mb-6 sm:mb-10 max-w-xl w-full flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 border-t border-zinc-600" />
              <span className="text-zinc-500 text-xs">✦</span>
              <div className="flex-1 border-t border-zinc-600" />
            </div>
            <p className="text-xs uppercase tracking-widest text-zinc-200">Wisdom of the Bean</p>
            {zodiac
              ? <p className="italic text-zinc-200 text-lg text-center px-4">"{zodiac.seasonalFortune}"</p>
              : <div className="h-6 w-72 bg-zinc-800 rounded-full animate-pulse" />
            }
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 border-t border-zinc-600" />
              <span className="text-zinc-500 text-xs">✦</span>
              <div className="flex-1 border-t border-zinc-600" />
            </div>
          </section>
        )}
        <section className="flex flex-col items-center gap-3 max-w-xl">
          {showQuote && zodiac && <p className="italic mb-4 sm:mb-6">"{zodiac.quote}"</p>}
          {zodiac && <ZodiacDish dish={zodiac.dish} className="max-w-lg w-full mb-2 sm:mb-4" />}
        </section>
      </section>
      {showContent && zodiac && (
        <section className="max-w-xl markdown-content">
          <Markdown>{zodiac.content}</Markdown>
        </section>
      )}
      <a
        href="/wheel"
        className="bg-zinc-900/80 border-2 border-zinc-500/60 text-white rounded-xl px-8 py-4 font-bold backdrop-blur-sm transition-[border-color,background-color,color] duration-200 hover:border-zinc-400 hover:text-white hover:bg-zinc-800/80"
      >
        Which Bean are You?&nbsp;→
      </a>
    </div>
  );
}
