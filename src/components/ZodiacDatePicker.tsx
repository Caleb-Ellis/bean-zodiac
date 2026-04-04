import { useState, useEffect } from "react";
import { getBeanYear, getBeanZodiacForYear } from "../lib/zodiac";
import ZodiacResult from "./ZodiacResult";
import ZodiacWheel from "./ZodiacWheel";

type BeanEntry = { name: string; color: string };
type FlavourEntry = { name: string; color: string };
type ZodiacEntry = { dish: string; fortune: string; body: string };

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
    <div className="flex flex-col items-center text-center gap-8">
      <section className="flex flex-col items-center gap-2">
        <input
          type="date"
          value={toDateInputValue(date)}
          onChange={(e) => {
            if (e.target.value) setDate(parseDateInputValue(e.target.value));
          }}
        />
      </section>

      <ZodiacWheel beans={data.beans} highlightSlug={zodiac.beanSlug} />

      <ZodiacResult zodiac={zodiac} bean={bean} flavour={flavour} entry={entry} />
    </div>
  );
}
