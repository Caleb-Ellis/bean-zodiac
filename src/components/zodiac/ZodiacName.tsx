import PreparationName from "./PreparationName";
import {
  QualityIds,
  type BeanId,
  type FlavourId,
  type FormId,
  type QualityId,
  type ZodiacId,
} from "../../lib/zodiac";

const getQualityLabel = (qualityId: QualityId): string => {
  switch (qualityId) {
    case QualityIds.Heirloom:
      return "Overcooked";
    case QualityIds.Market:
      return "Perfectly-Cooked";
    case QualityIds.Stale:
      return "Undercooked";
    case QualityIds.Rotten:
      return "Raw";
    default:
      return "Well-Cooked";
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
  alignLeft?: boolean;
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
  alignLeft = false,
}: Props) {
  const qualityLabel = qualityId ? getQualityLabel(qualityId) : undefined;
  const qualitySpan = qualityLabel ? (
    <span className="text-zinc-400 text-[0.625em]">{`${qualityLabel}`}</span>
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

  return (
    <span
      className={`inline-flex gap-x-1 gap-y-0.5 flex-col items-center${alignLeft ? " sm:items-start" : ""}`}
    >
      {zodiacId && asLink ? (
        <a
          href={`/zodiacs/${zodiacId}`}
          className="no-underline hover:underline"
        >
          {preparationSpan} {beanSpan}
        </a>
      ) : (
        <span>
          {preparationSpan} {beanSpan}
        </span>
      )}
      {qualitySpan}
    </span>
  );
}
