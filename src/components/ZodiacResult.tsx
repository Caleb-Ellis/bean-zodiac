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
  const zodiac = data.zodiacs[metadata.zodiacId];
  const startDateStr = formatZodiacDate(metadata.startDate);
  const endDateStr = formatZodiacDate(metadata.endDate);

  return (
    <div className="flex flex-col items-center text-center gap-6 animate-fade-up">
      <section className="flex flex-col items-center gap-2">
        <h2 className="mb-2">
          <span className="text-xl sm:text-2xl font-bold">The Year of the</span>
          <br />
          <span className="text-4xl sm:text-7xl font-bold">
            <span className={`flavour-${flavour.slug}`}>{flavour.name}</span>{" "}
            <span className={`bean-${bean.slug}`}>{bean.name}</span>
          </span>
        </h2>
        <div className="my-6 sm:my-8">
          <Bean bean={bean} flavourId={flavour.slug} />
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
        <section
          className="max-w-xl"
          dangerouslySetInnerHTML={{ __html: zodiac.content }}
        ></section>
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
      </div>
    </div>
  );
}
