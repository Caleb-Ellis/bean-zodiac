import { QualityIds, type BeanId, type FlavourId, type FormId, type QualityId, type ZodiacId } from "../lib/zodiac";

interface Props {
  flavourId: FlavourId;
  formId: FormId;
  beanId: BeanId;
  preparation: string;
  beanName: string;
  zodiacId?: ZodiacId;
  qualityId?: QualityId;
}

const QUALITY_LABEL: Partial<Record<QualityId, { text: string; className: string }>> = {
  [QualityIds.Heirloom]: { text: "Heirloom ", className: "text-effect-gold" },
  [QualityIds.Market]: { text: "Market-Fresh ", className: "text-effect-emerald" },
};

export default function ZodiacName({
  flavourId,
  formId,
  beanId,
  preparation,
  beanName,
  zodiacId,
  qualityId,
}: Props) {
  const qualityLabel = qualityId ? QUALITY_LABEL[qualityId] : undefined;
  const qualitySpan = qualityLabel ? (
    <span className={qualityLabel.className}>{qualityLabel.text}</span>
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
        {qualitySpan}{preparationSpan} {beanSpan}
      </a>
    );
  }

  return (
    <>
      {qualitySpan}{preparationSpan} {beanSpan}
    </>
  );
}
