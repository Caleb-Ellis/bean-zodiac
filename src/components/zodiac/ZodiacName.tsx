import {
  QualityIds,
  type BeanId,
  type FlavourId,
  type FormId,
  type QualityId,
  type ZodiacId,
} from "../../lib/zodiac";

const getQualityLabel = (qualityId: QualityId): { text: string; className: string } | undefined => {
  switch (qualityId) {
    case QualityIds.Heirloom:
      return { text: "Vivid", className: "text-effect-gold" };
    case QualityIds.Market:
      return { text: "Bright", className: "text-effect-emerald" };
    case QualityIds.Stale:
      return { text: "Faded", className: "text-effect-fog" };
    case QualityIds.Rotten:
      return { text: "Dark", className: "text-effect-void" };
    default:
      return undefined;
  }
};

interface Props {
  flavourId: FlavourId;
  formId: FormId;
  beanId: BeanId;
  preparation: string;
  beanName: string;
  zodiacId?: ZodiacId;
  qualityId?: QualityId;
  asLink?: boolean;
}

export default function ZodiacName({
  flavourId,
  formId,
  beanId,
  preparation,
  beanName,
  zodiacId,
  qualityId,
  asLink = true,
}: Props) {
  const qualityLabel = qualityId ? getQualityLabel(qualityId) : undefined;
  const qualitySpan = qualityLabel ? (
    <span className={qualityLabel.className}>{qualityLabel.text} </span>
  ) : null;
  const preparationSpan = (
    <span
      key={`${flavourId}-${formId}`}
      style={{
        display: "inline-block",
        maxWidth: "100%",
        wordBreak: "break-word",
        background: `linear-gradient(135deg, var(--flavour-${flavourId}) 60%, var(--form-${formId}) 75%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        filter: `saturate(1.5) brightness(1.2)`,
      }}
    >
      {preparation}
    </span>
  );
  const beanSpan = <span className={`bean-${beanId}`}>{beanName}</span>;

  if (zodiacId && asLink) {
    return (
      <a href={`/zodiacs/${zodiacId}`} className="no-underline hover:underline">
        {qualitySpan}
        {preparationSpan} {beanSpan}
      </a>
    );
  }

  return (
    <>
      {qualitySpan}
      {preparationSpan} {beanSpan}
    </>
  );
}
