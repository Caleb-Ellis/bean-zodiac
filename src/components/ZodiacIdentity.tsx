import Markdown from "react-markdown";
import {
  FLAVOUR_EMOJI,
  FORM_EMOJI,
  getPreparationName,
  getZodiacMetadataForDate,
  type ZodiacData,
} from "../lib/zodiac";
import Bean from "./Bean";

interface Props {
  data: ZodiacData;
  date: Date;
  showContent?: boolean;
  showQuote?: boolean;
}

export default function ZodiacIdentity({
  data,
  date,
  showContent,
  showQuote,
}: Props) {
  const metadata = getZodiacMetadataForDate(date);
  const bean = data.beans[metadata.beanId];
  const flavour = data.flavours[metadata.flavourId];
  const form = data.forms[metadata.formId];
  const zodiac = data.zodiacs[metadata.zodiacId];
  const preparation = getPreparationName(metadata.flavourId, metadata.formId);

  return (
    <div className="flex flex-col items-center text-center gap-6 animate-fade-up">
      <section className="flex flex-col items-center gap-2">
        <h2 className="mb-2 flex flex-col items-center font-bold">
          <span className="block text-md sm:text-xl mb-2 sm:mb-4">
            You are the
          </span>
          <span className="block text-4xl sm:text-7xl mb-3 sm:mb-7">
            <span
              style={{
                background: `linear-gradient(135deg, var(--flavour-${flavour.slug}) 60%, var(--form-${form.slug}))`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: `url(#form-${form.slug}-filter) saturate(1.8) brightness(1.2)`,
              }}
            >
              {preparation}
            </span>{" "}
            <span className={`bean-${bean.slug}`}>{bean.name}</span>
          </span>
        </h2>
        <div className="mb-4 sm:mb-6">
          <Bean bean={bean} flavourId={flavour.slug} formId={form.slug} />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4 sm:mb-6 flex-wrap justify-center">
          <a
            href={`/flavours/${flavour.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
          >
            <span>{FLAVOUR_EMOJI[metadata.flavourId]}</span>
            <span className={`flavour-${flavour.slug}`}>{flavour.name} Era</span>
          </a>
          <span className="text-zinc-600">×</span>
          <a
            href={`/forms/${form.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
          >
            <span>{FORM_EMOJI[metadata.formId]}</span>
            <span className={`form-${form.slug}`}>{form.name} Season</span>
          </a>
          <span className="text-zinc-600">×</span>
          <a
            href={`/beans/${bean.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
          >
            <span>🫘</span>
            <span className={`bean-${bean.slug}`}>{bean.name} Year</span>
          </a>
        </div>
        <section className="flex flex-col items-center gap-3 max-w-xl">
          {showQuote && <p className="italic mb-4 sm:mb-6">"{zodiac.quote}"</p>}
          <div className="bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-6 py-5 backdrop-blur-sm max-w-lg w-full mb-2 sm:mb-4">
            <p className="text-xs uppercase tracking-widest text-zinc-200 mb-3">
              You can find me in
            </p>
            <p className="italic text-zinc-200 text-lg">{zodiac.dish}</p>
          </div>
        </section>
      </section>
      {showContent && (
        <section className="max-w-xl markdown-content">
          <Markdown>{zodiac.content}</Markdown>
        </section>
      )}
    </div>
  );
}
