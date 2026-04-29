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
}: {
  zodiacId: ZodiacId;
  data: AllZodiacData;
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
    <li className="rounded-2xl border-2 border-zinc-800 bg-zinc-900 p-4 flex flex-col items-center justify-center gap-3 min-h-40">
      <div
        className="flex items-center justify-center"
        style={{ width: "3.5rem", height: "5rem" }}
      >
        <Bean bean={bean} flavourId={flavourId} formId={formId} />
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-200 leading-tight text-center">
        <ZodiacName
          flavourId={flavourId}
          formId={formId}
          beanId={beanId}
          preparation={preparation}
          beanName={bean.name}
          zodiacId={zodiacId}
        />
      </p>
    </li>
  );
}

export default function Beaniary({ data }: Props) {
  const [metBeans, setMetBeans] = useState<ZodiacId[]>([]);

  useEffect(() => {
    if (localStorage.getItem(MET_BEANS_KEY) === null) {
      getFortuneHistory().forEach((e) => addMetBean(e.zodiacId));
      const claimed = getClaimedBeanSlug();
      if (claimed) addMetBean(claimed);
    }
    setMetBeans(getMetBeans());
  }, []);

  const sortedMetIds = useMemo(() => {
    return [...metBeans].sort((a, b) => {
      const [aFlavour, aForm, aBean] = a.split("-");
      const [bFlavour, bForm, bBean] = b.split("-");
      return aBean.localeCompare(bBean) || aFlavour.localeCompare(bFlavour) || aForm.localeCompare(bForm);
    });
  }, [metBeans]);

  const unmetCount = 360 - sortedMetIds.length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fade-up">
      <section className="py-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold">The Beaniary</h1>
        <p className="mt-3 text-lg text-zinc-300 max-w-xl mx-auto">
          A record of every Bean you have encountered.
        </p>
      </section>
      <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 list-none p-0 m-0 items-stretch">
        {sortedMetIds.map((zodiacId) => (
          <BeaniaryEntry
            key={zodiacId}
            zodiacId={zodiacId}
            data={data}
          />
        ))}
        {Array.from({ length: unmetCount }, (_, i) => (
          <li key={`unmet-${i}`} className="rounded-2xl border-2 border-zinc-800 bg-zinc-900 p-4 flex items-center justify-center min-h-40">
            <span style={{ fontSize: "2rem", filter: "brightness(0)" }} aria-hidden="true">🫘</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
