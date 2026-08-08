import PreparationName from "./PreparationName";
import {
  QualityIds,
  type BeanId,
  type FlavourId,
  type FormId,
  type QualityId,
  type ZodiacId,
} from "../../lib/zodiac";
import zodiacTraits from "../../data/generated/zodiac-traits.json";

const TRAITS = zodiacTraits as Record<
  string,
  { trait: string; excess: string; inverse: string }
>;

// The quality tier names how far the day's pick sat from the zodiac's own trait,
// so the label carries the matching pole: excess at the top, inverse at the
// bottom. Without a zodiac to look up, it falls back to the bare tier name.
const getQualityLabel = (
  qualityId: QualityId,
  zodiacId?: ZodiacId,
  showPoles?: boolean,
): string => {
  const poles = showPoles && zodiacId ? TRAITS[zodiacId] : undefined;
  switch (qualityId) {
    case QualityIds.Heirloom:
      return poles ? `Overcooked — ${poles.excess}` : "Overcooked";
    case QualityIds.Market:
      return poles ? `Well-Cooked — Very ${poles.trait}` : "Well-Cooked";
    case QualityIds.Stale:
      return poles ? `Underdone — slightly ${poles.inverse}` : "Underdone";
    case QualityIds.Rotten:
      return poles ? `Raw — ${poles.inverse}` : "Raw";
    default:
      return poles ? `Cooked — ${poles.trait}` : "Cooked";
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
  showPoles?: boolean;
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
  showPoles = true,
}: Props) {
  const qualityLabel = qualityId
    ? getQualityLabel(qualityId, zodiacId, showPoles)
    : undefined;
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
