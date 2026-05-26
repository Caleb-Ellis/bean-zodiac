import type { BeanId, FlavourId, FormId } from "../../lib/zodiac";

interface Props {
  dish: string;
  className?: string;
  flavourId?: FlavourId;
  formId?: FormId;
  beanId?: BeanId;
}

export default function ZodiacDish({
  dish,
  className,
  flavourId,
  formId,
  beanId,
}: Props) {
  const animated = flavourId && formId && beanId;

  return (
    <section
      className={`relative text-center bg-zinc-900/80 ${animated ? "" : "border border-zinc-700/60 "}rounded-xl px-6 py-5 backdrop-blur-sm${className ? ` ${className}` : ""}`}
    >
      {animated && (
        <div
          aria-hidden
          className="gradient-border-ring"
          style={{
            background: `conic-gradient(from var(--gradient-angle), var(--flavour-${flavourId}), var(--form-${formId}), var(--bean-${beanId}), var(--flavour-${flavourId}))`,
          }}
        />
      )}
      <p className="text-xs uppercase tracking-widest text-zinc-200 mb-3">
        You can find me in
      </p>
      <p className="italic text-zinc-200 text-lg">{dish}</p>
    </section>
  );
}
