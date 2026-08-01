import PreparationName from "./PreparationName";
import {
  QualityIds,
  type BeanId,
  type FlavourId,
  type FormId,
  type QualityId,
  type ZodiacId,
} from "../../lib/zodiac";

const getQualityLabel = (
  qualityId: QualityId,
): { text: string; className: string } | undefined => {
  switch (qualityId) {
    case QualityIds.Heirloom:
      return { text: "Overcooked", className: "text-effect-bruise" };
    case QualityIds.Market:
      return { text: "Well-Cooked", className: "text-effect-emerald" };
    case QualityIds.Stale:
      return { text: "Undercooked", className: "text-effect-fog" };
    case QualityIds.Rotten:
      return { text: "Raw", className: "text-effect-void" };
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
    <PreparationName
      key={`${flavourId}-${formId}`}
      flavourId={flavourId}
      formId={formId}
      name={preparation}
    />
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
