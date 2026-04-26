interface Props {
  dish: string;
  className?: string;
}

export default function ZodiacDish({ dish, className }: Props) {
  return (
    <section
      className={`text-center bg-zinc-900/80 border-2 border-zinc-700/60 rounded-xl px-6 py-5 backdrop-blur-sm${className ? ` ${className}` : ""}`}
    >
      <p className="text-xs uppercase tracking-widest text-zinc-200 mb-3">You can find me in</p>
      <p className="italic text-zinc-200 text-lg">{dish}</p>
    </section>
  );
}
