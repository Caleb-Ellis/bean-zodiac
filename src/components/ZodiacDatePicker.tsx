import { useState, useEffect } from "react";
import { getBeanYear, getBeanZodiacForYear } from "../lib/zodiac";

type BeanEntry = { name: string; color: string };
type FlavourEntry = { name: string; color: string };
type ZodiacEntry = { dish: string; fortune: string };

export type ZodiacData = {
  beans: Record<string, BeanEntry>;
  flavours: Record<string, FlavourEntry>;
  zodiacs: Record<string, ZodiacEntry>;
};

interface Props {
  data: ZodiacData;
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateInputValue(value: string): Date {
  // new Date("YYYY-MM-DD") parses as UTC — split manually for local time
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function ZodiacDatePicker({ data }: Props) {
  const [date, setDate] = useState<Date>(() => new Date());

  // Ensure initial date reflects client's actual today (not build time)
  useEffect(() => {
    setDate(new Date());
  }, []);

  const beanYear = getBeanYear(date);
  const zodiac = getBeanZodiacForYear(beanYear);
  const bean = data.beans[zodiac.beanSlug];
  const flavour = data.flavours[zodiac.flavourSlug];
  const entry = data.zodiacs[zodiac.slug];

  if (!bean || !flavour || !entry) return null;

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <section className="flex flex-col items-center gap-2">
        <input
          type="date"
          value={toDateInputValue(date)}
          onChange={(e) => {
            if (e.target.value) setDate(parseDateInputValue(e.target.value));
          }}
        />
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
        <a href={`/flavours/${zodiac.flavourSlug}`}>
          About the {flavour.name} flavour →
        </a>
      </nav>
    </div>
  );
}
