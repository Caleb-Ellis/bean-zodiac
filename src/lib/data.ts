import type { BeanId, FlavourId, FormId, ZodiacId, Bean, Flavour, Form, Zodiac } from "./zodiac";
import beansJson from "../data/generated/beans.json";
import flavoursJson from "../data/generated/flavours.json";
import formsJson from "../data/generated/forms.json";

export type AllZodiacData = {
  beans: Record<BeanId, Bean>;
  flavours: Record<FlavourId, Flavour>;
  forms: Record<FormId, Form>;
};

export const allZodiacData: AllZodiacData = {
  beans: beansJson as Record<BeanId, Bean>,
  flavours: flavoursJson as Record<FlavourId, Flavour>,
  forms: formsJson as Record<FormId, Form>,
};

export const fetchZodiac = (zodiacId: ZodiacId): Promise<Zodiac> =>
  fetch(`/api/zodiacs/${zodiacId}.json`).then((r) => r.json());
