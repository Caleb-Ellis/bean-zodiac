import type { BeanZodiac } from "../lib/zodiac";

export interface ZodiacResultProps {
  zodiac: BeanZodiac;
  bean: { name: string; color: string };
  flavour: { name: string; color: string };
  entry: { dish: string; fortune: string };
}

export default function ZodiacResult({
  zodiac,
  bean,
  flavour,
  entry,
}: ZodiacResultProps) {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <section className="flex flex-col items-center gap-2">
        <h2 className="mb-2">
          <span className="text-xl sm:text-2xl font-bold">The Year of the</span>
          <br />
          <span className="text-4xl sm:text-7xl font-bold">
            <a
              href={`/flavours/${zodiac.flavourSlug}`}
              style={{ color: flavour.color }}
            >
              {flavour.name}
            </a>{" "}
            <a href={`/beans/${zodiac.beanSlug}`} style={{ color: bean.color }}>
              {bean.name}
            </a>
          </span>
        </h2>
        <p className="mb-2">
          {zodiac.startDate} – {zodiac.endDate}
        </p>
      </section>

      <section className="flex flex-col items-center gap-3 max-w-xl">
        <p className="text-stone-600 mb-4">{entry.dish}</p>
        <p className="text-xl sm:text-2xl font-bold">
          This Year's Bean Fortune
        </p>
        <p className="italic text-stone-600 mb-2">"{entry.fortune}"</p>
      </section>

      <nav className="flex gap-6">
        <a href={`/beans/${zodiac.beanSlug}`}>About the {bean.name} →</a>
        <a href={`/flavours/${zodiac.flavourSlug}`}>
          About the {flavour.name} flavour →
        </a>
      </nav>
    </div>
  );
}
