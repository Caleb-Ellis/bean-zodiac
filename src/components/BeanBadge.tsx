import type { BeanId } from "../lib/zodiac";

interface Props {
  id: BeanId;
  name: string;
  label?: string;
  small?: boolean;
}

function BeanIcon({ id, size }: { id: BeanId; size: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: `var(--bean-${id})`,
        maskImage: `url('/images/${id}.svg')`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: `url('/images/${id}.svg')`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

export default function BeanBadge({ id, name, label, small }: Props) {
  const text = label ? `${name} ${label}` : name;
  if (small) {
    return (
      <a
        href={`/beans/${id}`}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors no-underline bean-${id}`}
      >
        <BeanIcon id={id} size={14} />
        {text}
      </a>
    );
  }
  return (
    <a
      href={`/beans/${id}`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
    >
      <BeanIcon id={id} size={18} />
      <span className={`bean-${id}`}>{text}</span>
    </a>
  );
}
