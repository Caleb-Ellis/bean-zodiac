import {
  QualityIds,
  type BeanId,
  type FlavourId,
  type FormId,
  type QualityId,
  type ZodiacId,
} from "../lib/zodiac";

interface Props {
  flavourId: FlavourId;
  formId: FormId;
  beanId: BeanId;
  preparation: string;
  beanName: string;
  zodiacId?: ZodiacId;
  qualityId?: QualityId;
}

const QUALITY_OPTIONS: Partial<
  Record<QualityId, { texts: string[]; className: string }>
> = {
  [QualityIds.Heirloom]: {
    texts: ["Heirloom", "Gourmet", "Prized", "Heritage", "Artisanal"],
    className: "text-effect-gold",
  },
  [QualityIds.Market]: {
    texts: ["Fresh", "Select", "Quality", "Reserve", "Handpicked"],
    className: "text-effect-emerald",
  },
  [QualityIds.Stale]: {
    texts: ["Stale", "Old", "Faded", "Tired", "Wilted"],
    className: "text-effect-bruise",
  },
  [QualityIds.Rotten]: {
    texts: ["Rotten", "Spoiled", "Putrid", "Foul", "Mouldy"],
    className: "text-effect-rot",
  },
};

const daySeed = Math.floor(Date.now() / 86_400_000);

export default function ZodiacName({
  flavourId,
  formId,
  beanId,
  preparation,
  beanName,
  zodiacId,
  qualityId,
}: Props) {
  const qualityOpt = qualityId ? QUALITY_OPTIONS[qualityId] : undefined;
  const qualityLabel = qualityOpt
    ? {
        text: qualityOpt.texts[daySeed % qualityOpt.texts.length] + " ",
        className: qualityOpt.className,
      }
    : undefined;
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
