import { useState } from "react";
import { type ZodiacData } from "../lib/zodiac";
import ZodiacWheel from "./ZodiacWheel";
import ZodiacResult from "./ZodiacResult";

type Props = {
  data: ZodiacData;
};

export default function ZodiacCalendar({ data }: Props) {
  const [inputDate, setInputDate] = useState<string>(
    toDateInputValue(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  function handleReveal() {
    if (!inputDate) return;
    const parsed = parseDateInputValue(inputDate);
    if (parsed) setSelectedDate(parsed);
  }

  return (
    <div className="flex flex-col items-center text-center gap-8">
      <ZodiacWheel data={data} date={selectedDate ?? new Date()} />
      <section className="flex flex-col items-center gap-3">
        <input
          type="date"
          className="bg-zinc-900/80 border border-zinc-700/60 text-white rounded-xl px-4 py-2.5 cursor-pointer backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 hover:border-zinc-600"
          value={inputDate}
          onChange={(e) => setInputDate(e.target.value)}
        />
        <button
          onClick={handleReveal}
          className="bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 rounded-xl px-5 py-2.5 backdrop-blur-sm transition-all duration-200 hover:border-zinc-500 hover:text-white hover:bg-zinc-800/80 active:scale-95 cursor-pointer"
        >
          Uncover the Bean within
        </button>
      </section>
      {selectedDate && (
        <div>
          <ZodiacResult
            key={selectedDate.getTime()}
            data={data}
            date={selectedDate}
            showContent
          />
        </div>
      )}
    </div>
  );
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
