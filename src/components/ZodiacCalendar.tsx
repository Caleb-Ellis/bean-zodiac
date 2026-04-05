import { useState } from "react";
import { type ZodiacData } from "../lib/zodiac";
import ZodiacWheel from "./ZodiacWheel";
import ZodiacResult from "./ZodiacResult";

type Props = {
  data: ZodiacData;
};

export default function ZodiacCalendar({ data }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showResult, setShowResult] = useState<boolean>(false);

  return (
    <div className="flex flex-col items-center text-center gap-8">
      <ZodiacWheel data={data} date={selectedDate} />
      <section className="flex flex-col items-center gap-3">
        <p className="text-zinc-400">Pick a date and uncover the Bean within</p>
        <input
          type="date"
          value={toDateInputValue(selectedDate)}
          onChange={(e) => {
            if (e.target.value) {
              const parsedDate = parseDateInputValue(e.target.value);
              if (parsedDate) {
                setSelectedDate(parsedDate);
                setShowResult(true);
              }
            }
          }}
        />
      </section>
      {showResult && (
        <ZodiacResult key={selectedDate.getTime()} data={data} date={selectedDate} showContent />
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
