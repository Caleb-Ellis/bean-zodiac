import { useEffect, useMemo, useState } from "react";
import {
  getPreparationName,
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacId,
} from "../lib/zodiac";
import { type AllZodiacData } from "../lib/data";
import { getMetBeans, addMetBean, MET_BEANS_KEY } from "../lib/metBeans";
import { getFortuneHistory } from "../lib/fortuneHistory";
import { getClaimedBeanSlug } from "../lib/claimedBean";
import Bean from "./Bean";
import ZodiacName from "./ZodiacName";

interface Props {
  data: AllZodiacData;
}

function BeaniaryEntry({
  zodiacId,
  data,
  met,
}: {
  zodiacId: ZodiacId;
  data: AllZodiacData;
  met: boolean;
}) {
  const [flavourId, formId, beanId] = zodiacId.split("-") as [
    FlavourId,
    FormId,
    BeanId,
  ];
  const bean = data.beans[beanId];
  const preparation = getPreparationName(flavourId, formId);

  if (!bean) return null;

  return (
    <li className="rounded-2xl border-2 border-zinc-800 bg-zinc-900 p-4 flex flex-col items-center gap-3 text-center h-full">
      <div
        className="flex items-center justify-center"
        style={{ width: "3.5rem", height: "5rem" }}
      >
        {met ? (
          <Bean bean={bean} flavourId={flavourId} formId={formId} />
        ) : (
          <span style={{ fontSize: "2rem", filter: "brightness(0)" }} aria-hidden="true">🫘</span>
        )}
      </div>
      {met && (
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-200 leading-tight">
          <ZodiacName
            flavourId={flavourId}
            formId={formId}
            beanId={beanId}
            preparation={preparation}
            beanName={bean.name}
            zodiacId={zodiacId}
          />
        </p>
      )}
    </li>
  );
}

export default function Beaniary({ data }: Props) {
  const [metSet, setMetSet] = useState<Set<ZodiacId>>(new Set());

  useEffect(() => {
    if (localStorage.getItem(MET_BEANS_KEY) === null) {
      getFortuneHistory().forEach((e) => addMetBean(e.zodiacId));
      const claimed = getClaimedBeanSlug();
      if (claimed) addMetBean(claimed);
    }
    setMetSet(new Set(getMetBeans()));
  }, []);

  const allZodiacIds = useMemo(() => {
    const flavourIds = (Object.keys(data.flavours) as FlavourId[]).sort();
    const formIds = (Object.keys(data.forms) as FormId[]).sort();
    const beanIds = (Object.keys(data.beans) as BeanId[]).sort();
    const ids: ZodiacId[] = [];
    for (const flavourId of flavourIds) {
      for (const formId of formIds) {
        for (const beanId of beanIds) {
          ids.push(`${flavourId}-${formId}-${beanId}` as ZodiacId);
        }
      }
    }
    return ids;
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fade-up">
      <section className="py-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold">The Beaniary</h1>
        <p className="mt-3 text-lg text-zinc-300 max-w-xl mx-auto">
          A record of every Bean you have encountered.
        </p>
      </section>
      <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 list-none p-0 m-0 items-stretch">
        {allZodiacIds.map((zodiacId) => (
          <BeaniaryEntry
            key={zodiacId}
            zodiacId={zodiacId}
            data={data}
            met={metSet.has(zodiacId)}
          />
        ))}
      </ul>
    </div>
  );
}
