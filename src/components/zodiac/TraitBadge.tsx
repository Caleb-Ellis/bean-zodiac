interface Props {
  trait: string;
  featured?: boolean;
}

export default function TraitBadge({ trait, featured }: Props) {
  if (featured) {
    return (
      <span
        className="text-effect-silver px-3 py-1.5 rounded-full bg-zinc-900 border-2 uppercase tracking-wide"
        style={{ borderColor: "#d4d4d8" }}
      >
        {trait}
      </span>
    );
  }
  return (
    <li className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 list-none">
      {trait}
    </li>
  );
}
