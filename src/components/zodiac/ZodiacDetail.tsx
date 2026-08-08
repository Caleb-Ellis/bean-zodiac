import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import BackLink from "./BackLink";
import Bean from "./Bean";
import BeanBadge from "./BeanBadge";
import FlavourBadge from "./FlavourBadge";
import FormBadge from "./FormBadge";
import ZodiacDish from "./ZodiacDish";
import ZodiacName from "./ZodiacName";
import { allZodiacData, fetchZodiac } from "../../lib/data";
import {
  getPreparationName,
  type BeanId,
  type FlavourId,
  type FormId,
  type Zodiac,
  type ZodiacId,
} from "../../lib/zodiac";
import { useStore } from "../../store";

/** Placeholder for a trait the user hasn't cooked this bean to yet. */
function Unknown() {
  return <span className="text-zinc-600 tracking-widest">???</span>;
}

interface Props {
  id: ZodiacId;
  /** Rendered inside the card, below the trait rows. */
  children?: React.ReactNode;
}

export default function ZodiacDetail({ id, children }: Props) {
  const [flavourId, formId, beanId] = id.split("-") as [
    FlavourId,
    FormId,
    BeanId,
  ];

  const bean = allZodiacData.beans[beanId];
  const flavour = allZodiacData.flavours[flavourId];
  const form = allZodiacData.forms[formId];

  const [zodiac, setZodiac] = useState<Zodiac | null>(null);
  useEffect(() => {
    fetchZodiac(id).then(setZodiac);
  }, [id]);

  // Meeting the bean at any quality opens the whole page; never meeting it
  // leaves everything hidden.
  const metTiers = useStore((s) => s.metBeans[id]);
  const everMet = !!metTiers && Object.keys(metTiers).length > 0;

  if (!bean || !flavour || !form) return null;

  const preparation = getPreparationName(flavourId, formId);

  return (
    <div
      className="animate-fade-up relative rounded-2xl p-[1.5px] overflow-hidden shadow-2xl shadow-black/90"
      style={{ animationDelay: "50ms" }}
    >
      <div
        className="absolute"
        style={{
          inset: "-200%",
          background: `conic-gradient(from 0deg, var(--flavour-${flavourId}), var(--form-${formId}), var(--bean-${beanId}), var(--flavour-${flavourId}))`,
        }}
      />
      <article className="relative rounded-2xl bg-zinc-900 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-80 shrink-0 h-80 md:h-auto">
            <Bean bean={bean} flavourId={flavourId} formId={formId} />
          </div>
          <div className="p-6 md:p-8 flex flex-col gap-4 min-w-0">
            <BackLink />
            <h1 className="text-3xl font-bold">
              <ZodiacName
                flavourId={flavourId}
                formId={formId}
                beanId={beanId}
                preparation={preparation}
                beanName={bean.name}
              />
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <FlavourBadge id={flavourId} name={flavour.name} />
              <span className="text-zinc-600">×</span>
              <FormBadge id={formId} name={form.name} />
              <span className="text-zinc-600">×</span>
              <BeanBadge id={beanId} name={bean.name} />
            </div>
            {zodiac && everMet && (
              <p className="text-zinc-300 italic">"{zodiac.quote}"</p>
            )}
            {zodiac &&
              (everMet ? (
                <div className="markdown-content mb-2">
                  <ReactMarkdown>{zodiac.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-zinc-500 italic mb-2">
                  You've never met this bean...
                </p>
              ))}
            {zodiac && (
              <div className="flex flex-col sm:flex-row gap-4">
                <dl className="flex-1 sm:self-start grid grid-cols-[auto_1fr] rounded-xl border border-zinc-700/60 bg-zinc-900/80 divide-y divide-zinc-800 overflow-hidden">
                  <div className="col-span-2 grid grid-cols-subgrid items-center gap-x-3 px-4 py-2.5">
                    <dt className="text-xs uppercase tracking-widest text-zinc-500">
                      Raw
                    </dt>
                    <dd className="text-sm text-zinc-400 text-right">
                      {everMet ? zodiac.inverse : <Unknown />}
                    </dd>
                  </div>
                  <div className="col-span-2 grid grid-cols-subgrid items-center gap-x-3 px-4 py-2.5 bg-zinc-800/40">
                    <dt className="text-xs uppercase tracking-widest text-zinc-400">
                      Cooked
                    </dt>
                    <dd className="text-effect-silver text-sm font-semibold text-right">
                      {everMet ? zodiac.trait : <Unknown />}
                    </dd>
                  </div>
                  <div className="col-span-2 grid grid-cols-subgrid items-center gap-x-3 px-4 py-2.5">
                    <dt className="text-xs uppercase tracking-widest text-zinc-500">
                      Overcooked
                    </dt>
                    <dd className="text-sm text-zinc-400 text-right">
                      {everMet ? zodiac.excess : <Unknown />}
                    </dd>
                  </div>
                </dl>
                <ZodiacDish dish={zodiac.dish} className="flex-1" />
              </div>
            )}
            {children}
          </div>
        </div>
      </article>
    </div>
  );
}
