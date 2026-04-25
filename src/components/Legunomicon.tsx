import { useEffect, useState } from "react";
import {
  getPreparationName,
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacData,
} from "../lib/zodiac";
import { getFortuneHistory, type FortuneEntry } from "../lib/fortuneHistory";
import Bean from "./Bean";
import BeanBadge from "./BeanBadge";
import FlavourBadge from "./FlavourBadge";
import FormBadge from "./FormBadge";
import ZodiacName from "./ZodiacName";

interface Props {
  data: ZodiacData;
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function FortuneCard({
  entry,
  data,
}: {
  entry: FortuneEntry;
  data: ZodiacData;
}) {
  const [flavourId, formId, beanId] = entry.zodiacId.split("-") as [
    FlavourId,
    FormId,
    BeanId,
  ];
  const bean = data.beans[beanId];
  const preparation = getPreparationName(flavourId, formId);
  const entryDate = new Date(entry.date + "T12:00:00");

  if (!bean) return null;

  return (
    <li className="rounded-2xl border-2 border-zinc-800 bg-zinc-900 p-5 sm:p-6 flex items-center gap-4 sm:gap-6">
      <div className="shrink-0" style={{ width: "4rem" }}>
        <Bean
          bean={bean}
          flavourId={flavourId}
          formId={formId}
          qualityId={entry.qualityId}
        />
      </div>
      <div className="flex flex-col items-start gap-1.5 min-w-0">
        <p className="text-xs text-zinc-400">{formatDate(entry.date)}</p>
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-200">
          <ZodiacName
            flavourId={flavourId}
            formId={formId}
            beanId={beanId}
            preparation={preparation}
            beanName={bean.name}
            zodiacId={entry.zodiacId}
            qualityId={entry.qualityId}
            date={entryDate}
          />
        </p>
        <p className="italic text-zinc-300 text-base mt-1 mb-2">
          "{entry.text}"
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400 mt-1">
          <FlavourBadge
            id={flavourId}
            name={data.flavours[flavourId].name}
            small
          />
          <span className="text-zinc-600">×</span>
          <FormBadge id={formId} name={data.forms[formId].name} small />
          <span className="text-zinc-600">×</span>
          <BeanBadge id={beanId} name={bean.name} small />
        </div>
      </div>
    </li>
  );
}

export default function Legunomicon({ data }: Props) {
  const [history, setHistory] = useState<FortuneEntry[]>([]);

  useEffect(() => {
    setHistory(getFortuneHistory());
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-fade-up">
      <section className="py-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold">The Legunomicon</h1>
        <p className="mt-3 text-lg text-zinc-300 max-w-xl mx-auto">
          A record of your daily Bean fortunes.
        </p>
      </section>
      {history.length === 0 ? (
        <p className="text-center text-zinc-500 text-sm mt-4">
          Your fortune history is empty. Claim a bean on the{" "}
          <a href="/" className="link">
            home page
          </a>{" "}
          to begin.
        </p>
      ) : (
        <ul className="flex flex-col gap-3 list-none p-0 m-0">
          {history.map((entry) => (
            <FortuneCard key={entry.date} entry={entry} data={data} />
          ))}
        </ul>
      )}
    </div>
  );
}
