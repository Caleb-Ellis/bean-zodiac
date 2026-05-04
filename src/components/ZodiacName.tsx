import {
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacId,
} from "../lib/zodiac";
import { getQualityLabel, type QualityId } from "../lib/fortune";

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
