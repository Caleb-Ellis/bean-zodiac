import type { BeanId, FlavourId, FormId } from "../../lib/zodiac";

interface Props {
  flavourId: FlavourId;
  formId: FormId;
  beanId: BeanId;
  /** Adds the one-shot bright sweep over the slow spin. */
  pulse?: boolean;
}

/**
 * The zodiac's colours turning behind a card. Sits inside a `relative
 * overflow-hidden` frame whose padding sets the width of the visible outline.
 */
export default function ZodiacCardBorder({
  flavourId,
  formId,
  beanId,
  pulse,
}: Props) {
  return (
    <>
      <div
        className="absolute"
        style={{
          inset: "-200%",
          background: `conic-gradient(from 0deg, var(--flavour-${flavourId}), var(--form-${formId}), var(--bean-${beanId}), var(--flavour-${flavourId}))`,
          animation: "spin 10s linear infinite",
        }}
      />
      {pulse && (
        <div
          aria-hidden
          className="absolute animate-border-pulse"
          style={{
            inset: "-200%",
            background: `conic-gradient(from 90deg, var(--flavour-${flavourId}), var(--form-${formId}), var(--bean-${beanId}), var(--flavour-${flavourId}))`,
            filter: "brightness(1.5) saturate(1.4)",
          }}
        />
      )}
    </>
  );
}
