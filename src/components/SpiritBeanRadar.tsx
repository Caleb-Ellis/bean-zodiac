interface Props {
  title: string;
  labels: string[];
  labelColors: string[]; // per-label CSS color, e.g. "var(--flavour-sweet)"
  labelHrefs?: string[]; // per-label link href
  values: number[];
  highlightIndex: number;
  colorVar: string; // polygon fill/stroke color
}

function toPoint(
  value: number,
  maxVal: number,
  index: number,
  total: number,
  cx: number,
  cy: number,
  radius: number,
): [number, number] {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const r = (value / maxVal) * radius;
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function gridRing(
  level: number,
  total: number,
  cx: number,
  cy: number,
  radius: number,
): string {
  return Array.from({ length: total }, (_, i) => {
    const [x, y] = toPoint(level, 1, i, total, cx, cy, radius);
    return `${x},${y}`;
  }).join(" ");
}

export default function SpiritBeanRadar({
  title,
  labels,
  labelColors,
  labelHrefs,
  values,
  highlightIndex,
  colorVar,
}: Props) {
  const n = labels.length;
  const cx = 150;
  const cy = 150;
  const maxRadius = 88;
  const labelRadius = 118;
  const maxVal = Math.max(...values, 10);

  const dataPoints = values.map((v, i) => toPoint(v, maxVal, i, n, cx, cy, maxRadius));
  const polygonPoints = dataPoints.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs uppercase tracking-widest text-zinc-400">{title}</p>
      <svg
        viewBox="0 0 300 300"
        className="w-full max-w-85"
        overflow="visible"
        aria-hidden="true"
      >
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1.0].map((level) => (
          <polygon
            key={level}
            points={gridRing(level, n, cx, cy, maxRadius)}
            fill="none"
            stroke={level === 1.0 ? "#52525b" : "#3f3f46"}
            strokeWidth={level === 1.0 ? 1.5 : 1}
          />
        ))}

        {/* Axes */}
        {labels.map((_, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const x2 = cx + maxRadius * Math.cos(angle);
          const y2 = cy + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke={i === highlightIndex ? "#71717a" : "#3f3f46"}
              strokeWidth={i === highlightIndex ? 1.5 : 1}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          style={{ fill: colorVar, stroke: colorVar }}
          fillOpacity={0.2}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data point dots */}
        {dataPoints.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === highlightIndex ? 3.5 : 2.5}
            style={{ fill: colorVar }}
          />
        ))}

        {/* Labels */}
        {labels.map((label, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const lx = cx + labelRadius * Math.cos(angle);
          const ly = cy + labelRadius * Math.sin(angle);
          const dx = lx - cx;
          const anchor = dx > 6 ? "start" : dx < -6 ? "end" : "middle";

          const opacity = i === highlightIndex ? 1 : 0.55;

          const inner = (
            <g
              key={i}
              fillOpacity={opacity}
              style={labelHrefs?.[i] ? { cursor: "pointer" } : undefined}
            >
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={10}
                fill={labelColors[i]}
                fontWeight={i === highlightIndex ? "600" : "400"}
                fontFamily="inherit"
              >
                {label}
              </text>
            </g>
          );

          if (labelHrefs?.[i]) {
            return (
              <a key={i} href={labelHrefs[i]}>
                {inner}
              </a>
            );
          }
          return inner;
        })}
      </svg>
    </div>
  );
}
