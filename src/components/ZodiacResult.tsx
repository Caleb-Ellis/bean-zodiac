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
    <div className="flex flex-col items-center text-center gap-6">
      <section className="flex flex-col items-center gap-2">
        <h2 className="mb-2">
          <span className="text-xl sm:text-2xl font-bold">The Year of the</span>
          <br />
          <span className="text-4xl sm:text-7xl font-bold">
            <a
              href={`/flavours/${flavour.slug}`}
              className={`flavour-${flavour.slug}`}
            >
              {flavour.name}
            </a>{" "}
            <a href={`/beans/${bean.slug}`} className={`bean-${bean.slug}`}>
              {bean.name}
            </a>
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
        <p className="text-zinc-400 mb-4">{zodiac.dish}</p>
        {showFortune && (
          <>
            <p className="text-xl sm:text-2xl font-bold">Bean Fortune</p>
            <p className="italic text-zinc-400 mb-2">"{zodiac.fortune}"</p>
          </>
        )}
      </section>
      {showContent && (
        <section dangerouslySetInnerHTML={{ __html: zodiac.content }}></section>
      )}
      <div className="flex gap-6 mt-2">
        <a href={`/beans/${bean.slug}`}>About the {bean.name} →</a>
        <a href={`/flavours/${flavour.slug}`}>
          About the {flavour.name} Flavour →
        </a>
      </div>
    </div>
  );
}
