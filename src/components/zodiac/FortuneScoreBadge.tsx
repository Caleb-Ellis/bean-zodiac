interface Props {
  score: number;
  size?: "sm" | "md";
}

export default function FortuneScoreBadge({ score, size = "sm" }: Props) {
  const padding = size === "md" ? "px-3 py-1" : "px-2 py-0.5";
  const text = size === "md" ? "text-sm" : "text-xs";
  const colorClass =
    score === 1
      ? "border-green-800 text-green-200"
      : score === -1
        ? "border-amber-800 text-amber-200"
        : "border-blue-700 text-blue-500";
  const emoji = score === 1 ? "🌱" : score === -1 ? "🍂" : "💤";
  const label = score === 1 ? "Accepted" : score === -1 ? "Resisted" : "Ignored";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${padding} ${text} ${colorClass}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
