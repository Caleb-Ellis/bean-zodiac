import type {
  BeanId,
  FlavourId,
  FormId,
  PreparationId,
  ZodiacId,
  Bean,
  Flavour,
  Form,
  Preparation,
  Zodiac,
} from "./zodiac";
import beansJson from "../data/generated/beans.json";
import flavoursJson from "../data/generated/flavours.json";
import formsJson from "../data/generated/forms.json";
import preparationsJson from "../data/generated/preparations.json";

export type AllZodiacData = {
  beans: Record<BeanId, Bean>;
  flavours: Record<FlavourId, Flavour>;
  forms: Record<FormId, Form>;
  preparations: Record<PreparationId, Preparation>;
};

export const allZodiacData: AllZodiacData = {
  beans: beansJson as Record<BeanId, Bean>,
  flavours: flavoursJson as Record<FlavourId, Flavour>,
  forms: formsJson as Record<FormId, Form>,
  preparations: preparationsJson as Record<PreparationId, Preparation>,
};

/** The 6 Preparations of a Flavour, or the 5 of a Form, in canonical id order. */
export const preparationsFor = (
  axis: "flavour" | "form",
  id: FlavourId | FormId,
): Preparation[] =>
  Object.values(allZodiacData.preparations).filter((p) => p[axis] === id);

export const fetchZodiac = (zodiacId: ZodiacId): Promise<Zodiac> =>
  fetch(`/api/zodiacs/${zodiacId}.json`).then((r) => r.json());
