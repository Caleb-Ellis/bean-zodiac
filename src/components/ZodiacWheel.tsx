import { BEAN_ORDER } from "../lib/zodiac";

interface ZodiacWheelProps {
  beans: Record<string, { name: string; color: string }>;
  highlightSlug?: string;
}

export default function ZodiacWheel({ beans, highlightSlug }: ZodiacWheelProps) {
  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96">
      {/* Outer dashed ring */}
      <div className="absolute inset-0 rounded-full border-4 border-dashed border-stone-200"></div>
      {/* 12 bean dots positioned around the ring */}
      {BEAN_ORDER.map((slug, i) => {
        const bean = beans[slug];
        if (!bean) return null;
        const angle = (i / 12) * 360 - 90; // start from top
        const rad = (angle * Math.PI) / 180;
        const r = 44; // percent radius from center
        const x = 50 + r * Math.cos(rad);
        const y = 50 + r * Math.sin(rad);
        const isHighlighted = slug === highlightSlug;
        return (
          <a
            key={slug}
            href={`/beans/${slug}`}
            title={bean.name}
            style={{ left: `${x}%`, top: `${y}%`, backgroundColor: bean.color }}
            className={`absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform${isHighlighted ? " scale-150 ring-2 ring-stone-400 ring-offset-1" : " hover:scale-125"}`}
          />
        );
      })}
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-stone-400 text-xs sm:text-sm text-center leading-snug">
          Zodiac Wheel<br />Coming Soon
        </span>
      </div>
    </div>
  );
}
