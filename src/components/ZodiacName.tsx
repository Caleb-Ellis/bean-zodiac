import { RarityIds, type BeanId, type FlavourId, type FormId, type RarityId, type ZodiacId } from "../lib/zodiac";

interface Props {
  flavourId: FlavourId;
  formId: FormId;
  beanId: BeanId;
  preparation: string;
  beanName: string;
  zodiacId?: ZodiacId;
  rarityId?: RarityId;
}

const RARITY_LABEL: Partial<Record<RarityId, { text: string; className: string }>> = {
  [RarityIds.Heirloom]: { text: "Heirloom ", className: "text-effect-gold" },
  [RarityIds.Market]: { text: "Market-Fresh ", className: "text-effect-emerald" },
};

export default function ZodiacName({
  flavourId,
  formId,
  beanId,
  preparation,
  beanName,
  zodiacId,
  rarityId,
}: Props) {
  const rarityLabel = rarityId ? RARITY_LABEL[rarityId] : undefined;
  const raritySpan = rarityLabel ? (
    <span className={rarityLabel.className}>{rarityLabel.text}</span>
  ) : null;
  const preparationSpan = (
    <span
      style={{
        background: `linear-gradient(135deg, var(--flavour-${flavourId}) 60%, var(--form-${formId}) 75%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        filter: `url(#form-${formId}-filter) saturate(1.8) brightness(1.2)`,
      }}
    >
      {preparation}
    </span>
  );
  const beanSpan = <span className={`bean-${beanId}`}>{beanName}</span>;

  if (zodiacId) {
    return (
      <a href={`/zodiacs/${zodiacId}`} className="no-underline hover:underline">
        {raritySpan}{preparationSpan} {beanSpan}
      </a>
    );
  }

  return (
    <>
      {raritySpan}{preparationSpan} {beanSpan}
    </>
  );
}
