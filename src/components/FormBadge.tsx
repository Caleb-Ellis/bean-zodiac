import { FORM_EMOJI, type FormId } from "../lib/zodiac";

interface Props {
  id: FormId;
  name: string;
  label?: string;
  small?: boolean;
}

export default function FormBadge({ id, name, label, small }: Props) {
  const text = label ? `${name} ${label}` : name;
  if (small) {
    return (
      <a
        href={`/forms/${id}`}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors no-underline form-${id}`}
      >
        <span>{FORM_EMOJI[id]}</span>
        {text}
      </a>
    );
  }
  return (
    <a
      href={`/forms/${id}`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
    >
      <span>{FORM_EMOJI[id]}</span>
      <span className={`form-${id}`}>{text}</span>
    </a>
  );
}
