import type { BeanZodiac } from "../lib/zodiac";

export interface ZodiacResultProps {
  zodiac: BeanZodiac;
  bean: { name: string; color: string };
  flavour: { name: string; color: string };
  entry: { dish: string; fortune: string };
}

export default function ZodiacResult({ zodiac, bean, flavour, entry }: ZodiacResultProps) {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <section className="flex flex-col items-center gap-2">
        <p className="text-sm text-stone-500">
          {zodiac.startDate} – {zodiac.endDate}
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          The Year of the{" "}
          <a
            href={`/flavours/${zodiac.flavourSlug}`}
            style={{ color: flavour.color }}
          >
            {flavour.name}
          </a>{" "}
          <a href={`/beans/${zodiac.beanSlug}`} style={{ color: bean.color }}>
            {bean.name}
          </a>
        </h2>
      </section>

      <section className="flex flex-col items-center gap-3 max-w-xl">
        <p className="text-stone-600">{entry.dish}</p>
        <p className="text-lg font-semibold text-stone-800">This Year's Bean Fortune</p>
        <p className="italic text-stone-600">"{entry.fortune}"</p>
      </section>

      <nav className="flex gap-6">
        <a href={`/beans/${zodiac.beanSlug}`}>About the {bean.name} →</a>
        <a href={`/flavours/${zodiac.flavourSlug}`}>About the {flavour.name} flavour →</a>
      </nav>
    </div>
  );
}
