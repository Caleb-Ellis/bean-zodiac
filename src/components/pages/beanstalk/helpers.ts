import {
  FORM_ORDER,
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacId,
} from "../../../lib/zodiac";

export interface SeasonFilter {
  key: string;
  zodiacId: ZodiacId;
  flavourId: FlavourId;
  formId: FormId;
  beanId: BeanId;
  startDateStr: string;
  endDateStr: string;
  beanYear: number;
}

const FORM_SAMPLE: Record<string, [relYear: 0 | 1, month: number]> = {
  fried: [0, 3],
  roasted: [0, 5],
  fermented: [0, 7],
  boiled: [0, 9],
  smoked: [0, 11],
  dried: [1, 1],
};

export function getAllSeasonsForBeanYear(beanYear: number): SeasonFilter[] {
  return FORM_ORDER.map((formId) => {
    const [relYear, month] = FORM_SAMPLE[formId]!;
    const sampleDate = new Date(beanYear + relYear, month - 1, 15);
    const meta = getZodiacMetadataForDate(sampleDate);
    return {
      key: formatDate(meta.startDate),
      zodiacId: meta.zodiacId,
      flavourId: meta.flavourId,
      formId: meta.formId,
      beanId: meta.beanId,
      startDateStr: formatDate(meta.startDate),
      endDateStr: formatDate(meta.endDate),
      beanYear,
    };
  });
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function zodiacParts(id: ZodiacId): [FlavourId, FormId, BeanId] {
  return id.split("-") as [FlavourId, FormId, BeanId];
}

export function dayBefore(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}
