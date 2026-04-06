import Markdown from "react-markdown";
import {
  formatZodiacDate,
  getZodiacMetadataForDate,
  type ZodiacData,
} from "../lib/zodiac";
import Bean from "./Bean";

interface Props {
  data: ZodiacData;
  date: Date;
  showContent?: boolean;
  showFortune?: boolean;
}

export default function ZodiacResult({
  data,
  date,
  showContent,
  showFortune,
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
          <span className="block text-lg sm:text-xl mb-1 sm:mb-2">The Season of the</span>
          <span className={`block text-2xl sm:text-3xl mb-2 sm:mb-3 flavour-${flavour.slug}`}>{flavour.name}</span>
          <span className={`block text-4xl sm:text-6xl mb-3 sm:mb-4 method-${method.slug}`}>{method.name}</span>
          <span className={`block text-6xl sm:text-8xl bean-${bean.slug}`}>{bean.name}</span>
        </h2>
        <div className="my-6 sm:my-8">
          <Bean bean={bean} flavourId={flavour.slug} methodId={method.slug} />
        </div>
        <p className="mb-2">
          {startDateStr} - {endDateStr}
        </p>
      </section>
      <section className="flex flex-col items-center gap-3 max-w-xl">
        <p className="text-zinc-300 mb-2">{zodiac.dish}</p>
        {showFortune && (
          <>
            <p className="text-xl sm:text-2xl font-bold mt-2">Bean Fortune</p>
            <p className="italic text-zinc-300 mb-2">"{zodiac.fortune}"</p>
          </>
        )}
      </section>
      {showContent && (
        <section className="max-w-xl markdown-content">
          <Markdown>{zodiac.content}</Markdown>
        </section>
      )}
      <div className="flex gap-6 mt-2">
        <a className="link" href={`/beans/${bean.slug}`}>
          About the <span className={`bean-${bean.slug}`}>{bean.name}</span>
          &nbsp;→
        </a>
        <a className="link" href={`/flavours/${flavour.slug}`}>
          About the{" "}
          <span className={`flavour-${flavour.slug}`}>
            {flavour.name} Flavour
          </span>
          &nbsp;→
        </a>
        <a className="link" href={`/methods/${method.slug}`}>
          About the{" "}
          <span className={`method-${method.slug}`}>
            {method.name} Method
          </span>
          &nbsp;→
        </a>
      </div>
    </div>
  );
}
