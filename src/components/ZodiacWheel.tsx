import { BEAN_ORDER, type ZodiacData } from "../lib/zodiac";

type Props = {
  data: ZodiacData;
  date: Date;
};

export default function ZodiacWheel({ data, date }: Props) {
  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96">
      <div className="absolute inset-0 rounded-full border-4 border-dashed border-stone-200"></div>
      {BEAN_ORDER.map((id, i) => {
        const bean = data.beans[id];
        const angle = (i / 12) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const r = 44;
        const x = 50 + r * Math.cos(rad);
        const y = 50 + r * Math.sin(rad);
        return (
          <a
            key={id}
            href={`/beans/${id}`}
            title={bean.name}
            style={{ left: `${x}%`, top: `${y}%`, backgroundColor: bean.color }}
            className="absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform"
          />
        );
      })}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-stone-400 text-xs sm:text-sm text-center leading-snug">
          Zodiac Wheel
          <br />
          Coming Soon
        </span>
      </div>
    </div>
  );
}
