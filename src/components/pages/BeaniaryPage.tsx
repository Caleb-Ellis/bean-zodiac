import { useEffect, useMemo, useState } from "react";
import {
  getPreparationName,
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacId,
} from "../../lib/zodiac";
import { type AllZodiacData } from "../../lib/data";
import { useStore } from "../../store";
import Bean from "../zodiac/Bean";
import ZodiacName from "../zodiac/ZodiacName";

interface Props {
  data: AllZodiacData;
}

function BeaniaryEntry({ zodiacId, data }: { zodiacId: ZodiacId; data: AllZodiacData }) {
  const [flavourId, formId, beanId] = zodiacId.split("-") as [FlavourId, FormId, BeanId];
  const bean = data.beans[beanId];
  const preparation = getPreparationName(flavourId, formId);

  if (!bean) return null;

  return (
    <li className="rounded-2xl border-2 border-zinc-800 bg-zinc-900 min-h-40">
      <a
        href={`/zodiacs/${zodiacId}`}
        className="no-underline p-4 flex flex-col items-center justify-center gap-3 h-full w-full"
      >
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
      </a>
    </li>
  );
}

export default function BeaniaryPage({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  const [metBeanIds, setMetBeanIds] = useState<ZodiacId[]>([]);

  useEffect(() => {
    const { metBeans, fortuneHistory, claimed } = useStore.getState();
    if (metBeans.length === 0) {
      const seen = new Map<ZodiacId, string>();
      for (const e of fortuneHistory) if (!seen.has(e.zodiacId)) seen.set(e.zodiacId, e.date);
      if (claimed && !seen.has(claimed.id)) seen.set(claimed.id, claimed.on);
      const backfilled = Array.from(seen, ([id, on]) => ({ id, on })).reverse();
      useStore.setState({ metBeans: backfilled });
    }
    setMetBeanIds(useStore.getState().metBeans.map((m) => m.id));
    setMounted(true);
  }, []);

  const sortedMetIds = useMemo(() => {
    return [...metBeanIds].sort((a, b) => {
      const [aFlavour, aForm, aBean] = a.split("-") as [FlavourId, FormId, BeanId];
      const [bFlavour, bForm, bBean] = b.split("-") as [FlavourId, FormId, BeanId];
      const beanCmp = (data.beans[aBean]?.name ?? aBean).localeCompare(
        data.beans[bBean]?.name ?? bBean,
      );
      if (beanCmp !== 0) return beanCmp;
      return getPreparationName(aFlavour, aForm).localeCompare(getPreparationName(bFlavour, bForm));
    });
  }, [metBeanIds]);

  const unmetCount = 360 - sortedMetIds.length;

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fade-up">
        <section className="pt-12 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4">The Beaniary</h1>
        </section>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fade-up">
      <section className="pt-12 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4">The Beaniary</h1>
      </section>
      <p className="text-lg font-bold text-center mb-2 sm:mb-4">
        You have met {sortedMetIds.length} cultivars of the Bean Zodiac.
      </p>
      <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 list-none p-0 m-0 items-stretch">
        {sortedMetIds.map((zodiacId) => (
          <BeaniaryEntry key={zodiacId} zodiacId={zodiacId} data={data} />
        ))}
        {Array.from({ length: unmetCount }, (_, i) => (
          <li
            key={`unmet-${i}`}
            className="rounded-2xl border-2 border-zinc-800 bg-zinc-900 p-4 flex items-center justify-center min-h-40"
          >
            <span style={{ fontSize: "2rem", filter: "brightness(0)" }} aria-hidden="true">
              🫘
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
