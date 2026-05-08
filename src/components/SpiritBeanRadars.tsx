import {
  FLAVOUR_EMOJI,
  FORM_EMOJI,
  type BeanId,
  type FlavourId,
  type FormId,
} from "../lib/zodiac";
import {
  SPIRIT_BEAN_RING,
  SPIRIT_FLAVOUR_RING,
  SPIRIT_FORM_RING,
} from "../lib/spiritBean";
import SpiritBeanRadar from "./SpiritBeanRadar";

interface RadarData {
  beans: Record<string, { name: string } | undefined>;
  flavours: Record<string, { name: string } | undefined>;
  forms: Record<string, { name: string } | undefined>;
}

interface FlavourRadarProps {
  data: RadarData;
  claimedId: FlavourId;
  values: number[];
  highlightIndex: number;
  showLinks?: boolean;
}

interface FormRadarProps {
  data: RadarData;
  claimedId: FormId;
  values: number[];
  highlightIndex: number;
  showLinks?: boolean;
}

interface BeanRadarProps {
  data: RadarData;
  claimedId: BeanId;
  values: number[];
  highlightIndex: number;
  showLinks?: boolean;
}

export function FlavourRadar({
  data,
  claimedId,
  values,
  highlightIndex,
  showLinks,
}: FlavourRadarProps) {
  const labels = SPIRIT_FLAVOUR_RING.map(
    (id) =>
      `${FLAVOUR_EMOJI[id]} ${data.flavours[id]?.name ?? id}${id === claimedId ? " 👤" : ""}`,
  );
  const labelColors = SPIRIT_FLAVOUR_RING.map((id) => `var(--flavour-${id})`);
  const labelHrefs = showLinks
    ? SPIRIT_FLAVOUR_RING.map((id) => `/flavours/${id}`)
    : undefined;
  return (
    <SpiritBeanRadar
      labels={labels}
      labelColors={labelColors}
      labelHrefs={labelHrefs}
      values={values}
      highlightIndex={highlightIndex}
      colorVar={`var(--flavour-${SPIRIT_FLAVOUR_RING[highlightIndex]})`}
    />
  );
}

export function FormRadar({
  data,
  claimedId,
  values,
  highlightIndex,
  showLinks,
}: FormRadarProps) {
  const labels = SPIRIT_FORM_RING.map(
    (id) =>
      `${FORM_EMOJI[id]} ${data.forms[id]?.name ?? id}${id === claimedId ? " 👤" : ""}`,
  );
  const labelColors = SPIRIT_FORM_RING.map((id) => `var(--form-${id})`);
  const labelHrefs = showLinks
    ? SPIRIT_FORM_RING.map((id) => `/forms/${id}`)
    : undefined;
  return (
    <SpiritBeanRadar
      labels={labels}
      labelColors={labelColors}
      labelHrefs={labelHrefs}
      values={values}
      highlightIndex={highlightIndex}
      colorVar={`var(--form-${SPIRIT_FORM_RING[highlightIndex]})`}
    />
  );
}

export function BeanRadar({
  data,
  claimedId,
  values,
  highlightIndex,
  showLinks,
}: BeanRadarProps) {
  const labels = SPIRIT_BEAN_RING.map(
    (id) =>
      `${(data.beans[id]?.name ?? id).replace(/ Bean$/, "")}${id === claimedId ? " 👤" : ""}`,
  );
  const labelColors = SPIRIT_BEAN_RING.map((id) => `var(--bean-${id})`);
  const labelHrefs = showLinks
    ? SPIRIT_BEAN_RING.map((id) => `/beans/${id}`)
    : undefined;
  return (
    <SpiritBeanRadar
      labels={labels}
      labelColors={labelColors}
      labelHrefs={labelHrefs}
      values={values}
      highlightIndex={highlightIndex}
      colorVar={`var(--bean-${SPIRIT_BEAN_RING[highlightIndex]})`}
    />
  );
}
