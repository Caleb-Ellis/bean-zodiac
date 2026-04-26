import type { getCollection } from "astro:content";
import type { Bean, BeanId, Flavour, FlavourId, Form, FormId, Zodiac, ZodiacId } from "./zodiac";

// Types

export type AllZodiacData = {
  beans: Record<BeanId, Bean>;
  flavours: Record<FlavourId, Flavour>;
  forms: Record<FormId, Form>;
};

// Data building

export const buildAllZodiacData = (
  beans: Awaited<ReturnType<typeof getCollection<"beans">>>,
  flavours: Awaited<ReturnType<typeof getCollection<"flavours">>>,
  forms: Awaited<ReturnType<typeof getCollection<"forms">>>,
): AllZodiacData => ({
  beans: Object.fromEntries(
    beans.map((entry) => [entry.id, { ...entry.data, content: entry.body ?? "" }]),
  ) as Record<BeanId, Bean>,
  flavours: Object.fromEntries(
    flavours.map((entry) => [entry.id, { ...entry.data, content: entry.body ?? "" }]),
  ) as Record<FlavourId, Flavour>,
  forms: Object.fromEntries(
    forms.map((entry) => [entry.id, { ...entry.data, content: entry.body ?? "" }]),
  ) as Record<FormId, Form>,
});

export const fetchZodiac = (zodiacId: ZodiacId): Promise<Zodiac> =>
  fetch(`/api/zodiacs/${zodiacId}.json`).then((r) => r.json());
