import { useState, useEffect } from "react";
import { getBeanYear, getBeanZodiacForYear } from "../lib/zodiac";
import ZodiacWheel from "./ZodiacWheel";
import type { ZodiacData } from "./ZodiacDatePicker";

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
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function ZodiacCalendar({ data }: Props) {
  const [date, setDate] = useState<Date>(() => new Date());

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
    <div className="flex flex-col items-center text-center gap-8">
      <section className="flex flex-col items-center gap-3">
        <p className="text-stone-500">Pick a date and find your inner Bean</p>
        <input
          type="date"
          value={toDateInputValue(date)}
          onChange={(e) => {
            if (e.target.value) setDate(parseDateInputValue(e.target.value));
          }}
        />
      </section>

      <ZodiacWheel beans={data.beans} highlightSlug={zodiac.beanSlug} />

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

      <section className="flex flex-col items-center gap-4 max-w-xl">
        <p className="text-stone-600">{entry.dish}</p>
        {entry.body && (
          <p className="text-stone-700 leading-relaxed">{entry.body}</p>
        )}
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
