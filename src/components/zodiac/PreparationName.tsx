import type { FlavourId, FormId } from "../../lib/zodiac";

interface Props {
  flavourId: FlavourId;
  formId: FormId;
  name: string;
}

/**
 * A Preparation name in its own colours — the Flavour bleeding into the Form,
 * the same gradient wherever a Preparation is named.
 */
export default function PreparationName({ flavourId, formId, name }: Props) {
  return (
    <span
      style={{
        background: `linear-gradient(135deg, var(--flavour-${flavourId}) 60%, var(--form-${formId}) 75%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {name}
    </span>
  );
}
