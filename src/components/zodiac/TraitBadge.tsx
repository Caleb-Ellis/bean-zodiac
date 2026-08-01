interface Props {
  trait: string;
  featured?: boolean;
  /** A shadow trait — rendered outlined rather than filled, so the positives read first. */
  shadow?: boolean;
}

export default function TraitBadge({ trait, featured, shadow }: Props) {
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
    <li
      className={
        shadow
          ? "text-xs px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-500 list-none"
          : "text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 list-none"
      }
    >
      {trait}
    </li>
  );
}
