import Markdown from "react-markdown";
import {
  getPreparationName,
  getZodiacMetadataForDate,
  type Zodiac,
  type AllZodiacData,
} from "../lib/zodiac";
import Bean from "./Bean";
import BeanBadge from "./BeanBadge";
import FlavourBadge from "./FlavourBadge";
import FormBadge from "./FormBadge";
import ZodiacDish from "./ZodiacDish";
import ZodiacName from "./ZodiacName";

interface Props {
  data: AllZodiacData;
  zodiac: Zodiac | null;
  date: Date;
  onClaim?: () => void;
  claimed?: boolean;
  hasClaimed?: boolean;
}

export default function ZodiacIdentity({
  data,
  zodiac,
  date,
  onClaim,
  claimed,
  hasClaimed,
}: Props) {
  const metadata = getZodiacMetadataForDate(date);
  const bean = data.beans[metadata.beanId];
  const flavour = data.flavours[metadata.flavourId];
  const form = data.forms[metadata.formId];
  const preparation = getPreparationName(metadata.flavourId, metadata.formId);

  return (
    <div className="flex flex-col items-center text-center gap-6 animate-fade-up">
      <section className="flex flex-col items-center gap-2">
        <h2 className="mb-2 flex flex-col items-center font-bold">
          <span className="block text-md sm:text-xl mb-2 sm:mb-4">
            You are the
          </span>
          <span className="block text-4xl sm:text-7xl mb-3 sm:mb-7">
            <ZodiacName
              flavourId={metadata.flavourId}
              formId={metadata.formId}
              beanId={metadata.beanId}
              preparation={preparation}
              beanName={bean.name}
            />
          </span>
        </h2>
        <div className="mb-4 sm:mb-6">
          <Bean bean={bean} flavourId={flavour.slug} formId={form.slug} />
        </div>
        {zodiac && (
          <div className="flex flex-col items-center gap-3 max-w-xl">
            <p className="italic mb-4 sm:mb-6">"{zodiac.quote}"</p>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4 sm:mb-6 flex-wrap justify-center">
          <FlavourBadge id={metadata.flavourId} name={flavour.name} />
          <span className="flex items-center gap-2">
            <span className="text-zinc-600">×</span>
            <FormBadge id={metadata.formId} name={form.name} />
          </span>
          <span className="flex items-center gap-2">
            <span className="text-zinc-600">×</span>
            <BeanBadge id={metadata.beanId} name={bean.name} />
          </span>
        </div>
        {zodiac && <ZodiacDish dish={zodiac.dish} className="max-w-lg w-full mb-2 sm:mb-4" />}
      </section>
      {zodiac && (
        <section className="max-w-xl markdown-content">
          <Markdown>{zodiac.content}</Markdown>
        </section>
      )}
      {onClaim !== undefined && (
        <div className="relative h-14 w-full max-w-sm flex items-center justify-center mt-1">
          <button
            onClick={onClaim}
            className={`absolute inset-0 flex items-center justify-center bg-zinc-900/80 border-2 border-zinc-500/60 text-white rounded-xl px-8 font-bold backdrop-blur-sm transition-all duration-300 hover:border-zinc-400 hover:bg-zinc-800/80 cursor-pointer ${claimed || hasClaimed ? "opacity-0 translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"}`}
          >
            Claim the {preparation} {bean.name}
          </button>
          <a
            href="/"
            className={`absolute inset-0 flex items-center justify-center text-zinc-300 transition-all duration-300 underline ${claimed ? "opacity-100 translate-y-0 delay-300" : "opacity-0 translate-y-2 pointer-events-none"}`}
          >
            You are ready to receive the Bean's wisdom
          </a>
          <a
            href={`/compatibility?b=${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`}
            className={`absolute inset-0 flex items-center justify-center bg-zinc-900/80 border-2 border-zinc-500/60 text-white rounded-xl px-8 font-bold backdrop-blur-sm transition-opacity duration-300 hover:border-zinc-400 hover:bg-zinc-800/80 no-underline ${hasClaimed ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            Check compatibility →
          </a>
        </div>
      )}
    </div>
  );
}
