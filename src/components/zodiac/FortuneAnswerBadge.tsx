interface Props {
  answerText: string;
  size?: "sm" | "md";
}

export default function FortuneAnswerBadge({ answerText, size = "sm" }: Props) {
  const padding = size === "md" ? "px-3 py-1" : "px-2 py-0.5";
  const text = size === "md" ? "text-sm" : "text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-zinc-700 text-zinc-300 ${padding} ${text}`}
    >
      <span>{answerText}</span>
    </span>
  );
}
