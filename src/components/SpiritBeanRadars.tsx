import {
  BEAN_ORDER,
  FLAVOUR_EMOJI,
  FLAVOUR_ORDER,
  FORM_EMOJI,
  FORM_ORDER,
  type BeanId,
  type FlavourId,
  type FormId,
} from "../lib/zodiac";
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
  const labels = FLAVOUR_ORDER.map(
    (id) =>
      `${FLAVOUR_EMOJI[id]} ${data.flavours[id]?.name ?? id}${id === claimedId ? " 👤" : ""}`,
  );
  const labelColors = FLAVOUR_ORDER.map((id) => `var(--flavour-${id})`);
  const labelHrefs = showLinks
    ? FLAVOUR_ORDER.map((id) => `/flavours/${id}`)
    : undefined;
  return (
    <SpiritBeanRadar
      labels={labels}
      labelColors={labelColors}
      labelHrefs={labelHrefs}
      values={values}
      highlightIndex={highlightIndex}
      colorVar={`var(--flavour-${FLAVOUR_ORDER[highlightIndex]})`}
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
  const labels = FORM_ORDER.map(
    (id) =>
      `${FORM_EMOJI[id]} ${data.forms[id]?.name ?? id}${id === claimedId ? " 👤" : ""}`,
  );
  const labelColors = FORM_ORDER.map((id) => `var(--form-${id})`);
  const labelHrefs = showLinks
    ? FORM_ORDER.map((id) => `/forms/${id}`)
    : undefined;
  return (
    <SpiritBeanRadar
      labels={labels}
      labelColors={labelColors}
      labelHrefs={labelHrefs}
      values={values}
      highlightIndex={highlightIndex}
      colorVar={`var(--form-${FORM_ORDER[highlightIndex]})`}
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
  const labels = BEAN_ORDER.map(
    (id) =>
      `${(data.beans[id]?.name ?? id).replace(/ Bean$/, "")}${id === claimedId ? " 👤" : ""}`,
  );
  const labelColors = BEAN_ORDER.map((id) => `var(--bean-${id})`);
  const labelHrefs = showLinks
    ? BEAN_ORDER.map((id) => `/beans/${id}`)
    : undefined;
  return (
    <SpiritBeanRadar
      labels={labels}
      labelColors={labelColors}
      labelHrefs={labelHrefs}
      values={values}
      highlightIndex={highlightIndex}
      colorVar={`var(--bean-${BEAN_ORDER[highlightIndex]})`}
    />
  );
}
