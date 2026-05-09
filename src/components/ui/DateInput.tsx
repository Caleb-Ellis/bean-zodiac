interface Props {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

const baseClass =
  "bg-zinc-900/80 border-2 border-zinc-700/60 text-white rounded-xl px-4 py-2.5 cursor-pointer backdrop-blur-sm transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 hover:border-zinc-600 [&::-webkit-calendar-picker-indicator]:hidden";

export default function DateInput({ value, onChange, className }: Props) {
  return (
    <input
      type="date"
      className={className ? `${baseClass} ${className}` : baseClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
