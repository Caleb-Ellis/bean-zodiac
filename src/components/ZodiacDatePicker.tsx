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
    <>
      <section>
        <input
          type="date"
          value={toDateInputValue(date)}
          onChange={(e) => {
            if (e.target.value) setDate(parseDateInputValue(e.target.value));
          }}
        />
        <p>
          {zodiac.startDate} - {zodiac.endDate}
        </p>
        <h1>
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
        </h1>
      </section>

      <section>
        <p>{entry.dish}</p>
        <p>
          <strong>This Bean Year's fortune:</strong> {entry.fortune}
        </p>
      </section>

      <nav>
        <a href={`/beans/${zodiac.beanSlug}`}>About the {bean.name} →</a>
        <a href={`/flavours/${zodiac.flavourSlug}`}>
          About the {flavour.name} flavour →
        </a>
      </nav>
    </>
  );
}
