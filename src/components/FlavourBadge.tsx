import { FLAVOUR_EMOJI, type FlavourId } from "../lib/zodiac";

interface Props {
  id: FlavourId;
  name: string;
  label?: string;
  small?: boolean;
}

export default function FlavourBadge({ id, name, label, small }: Props) {
  const text = label ? `${name} ${label}` : name;
  if (small) {
    return (
      <a
        href={`/flavours/${id}`}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors no-underline flavour-${id}`}
      >
        <span>{FLAVOUR_EMOJI[id]}</span>
        {text}
      </a>
    );
  }
  return (
    <a
      href={`/flavours/${id}`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
    >
      <span>{FLAVOUR_EMOJI[id]}</span>
      <span className={`flavour-${id}`}>{text}</span>
    </a>
  );
}
