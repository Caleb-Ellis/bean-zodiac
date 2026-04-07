import Markdown from "react-markdown";
import { formatZodiacDate, getZodiacMetadataForDate, type ZodiacData } from "../lib/zodiac";
import Bean from "./Bean";

interface Props {
  data: ZodiacData;
  date: Date;
  showContent?: boolean;
  showDate?: boolean;
  showFortune?: boolean;
  showQuote?: boolean;
}

export default function ZodiacResult({
  data,
  date,
  showContent,
  showDate,
  showFortune,
  showQuote,
}: Props) {
  const metadata = getZodiacMetadataForDate(date);
  const bean = data.beans[metadata.beanId];
  const flavour = data.flavours[metadata.flavourId];
  const method = data.methods[metadata.methodId];
  const zodiac = data.zodiacs[metadata.zodiacId];
  const startDateStr = formatZodiacDate(metadata.startDate);
  const endDateStr = formatZodiacDate(metadata.endDate);

  return (
    <div className="flex flex-col items-center text-center gap-6 animate-fade-up">
      <section className="flex flex-col items-center gap-2">
        <h2 className="mb-2 flex flex-col items-center font-bold">
          <span className="block text-md sm:text-xl mb-2 sm:mb-4">The Year of the</span>
          <span className="block text-4xl sm:text-7xl mb-3 sm:mb-7">
            <span className={`flavour-${flavour.slug}`}>{flavour.name}</span>{" "}
            <span className={` bean-${bean.slug}`}>{bean.name}</span>
          </span>
          <span className="block text-md sm:text-xl mb-3 sm:mb-6">
            in the <span className={`method-${method.slug}`}>{method.name}</span> Season
          </span>
        </h2>
        <div className="my-6 sm:my-8">
          <Bean bean={bean} flavourId={flavour.slug} methodId={method.slug} />
        </div>
        {showDate && (
          <p className="mb-2">
            {startDateStr} - {endDateStr}
          </p>
        )}
        <section className="flex flex-col items-center gap-3 max-w-xl">
          <p className="text-zinc-300">{zodiac.dish}</p>
          {showQuote && <p className="italic text-zinc-300">"{zodiac.quote}"</p>}
        </section>
        {showFortune && (
          <section className="my-4 sm:my-6">
            <p className="text-md sm:text-xl font-bold mb-4">This Season's Fortune</p>
            <p className="italic text-zinc-300">"{zodiac.fortune}"</p>
          </section>
        )}
      </section>
      {showContent && (
        <section className="max-w-xl markdown-content">
          <Markdown>{zodiac.content}</Markdown>
        </section>
      )}
      <div className="flex flex-wrap justify-center gap-6 mt-2">
        <a className="link" href={`/beans/${bean.slug}`}>
          About the <span className={`bean-${bean.slug}`}>{bean.name}</span>
          &nbsp;→
        </a>
        <a className="link" href={`/flavours/${flavour.slug}`}>
          About <span className={`flavour-${flavour.slug}`}>Tasting {flavour.name}</span>
          &nbsp;→
        </a>
        <a className="link" href={`/methods/${method.slug}`}>
          About <span className={`method-${method.slug}`}>Being {method.name}</span>
          &nbsp;→
        </a>
      </div>
    </div>
  );
}
