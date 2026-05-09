import { BeanIds, FlavourIds, FormIds, type FlavourId, type FormId, type ZodiacId } from "./types";

export const BEAN_ORDER = [
  BeanIds.Edamame,
  BeanIds.Black,
  BeanIds.Fava,
  BeanIds.Green,
  BeanIds.Pinto,
  BeanIds.Mung,
  BeanIds.Cannellini,
  BeanIds.Navy,
  BeanIds.Adzuki,
  BeanIds.Butter,
  BeanIds.Chickpea,
  BeanIds.Kidney,
] as const;

export const FLAVOUR_ORDER = [
  FlavourIds.Umami,
  FlavourIds.Sweet,
  FlavourIds.Sour,
  FlavourIds.Bitter,
  FlavourIds.Spicy,
] as const;

export const FORM_ORDER = [
  FormIds.Fried,
  FormIds.Roasted,
  FormIds.Fermented,
  FormIds.Boiled,
  FormIds.Smoked,
  FormIds.Dried,
] as const;

export const FLAVOUR_EMOJI: Record<FlavourId, string> = {
  [FlavourIds.Bitter]: "☕",
  [FlavourIds.Sour]: "🍋",
  [FlavourIds.Spicy]: "🌶️",
  [FlavourIds.Sweet]: "🍭",
  [FlavourIds.Umami]: "🍄",
} as const;

export const FORM_EMOJI: Record<FormId, string> = {
  [FormIds.Boiled]: "💧",
  [FormIds.Dried]: "☀️",
  [FormIds.Fermented]: "🦠",
  [FormIds.Fried]: "🔥",
  [FormIds.Roasted]: "♨️",
  [FormIds.Smoked]: "💨",
} as const;

const PREPARATION_NAMES: Record<`${FlavourId}-${FormId}`, string> = {
  "bitter-boiled": "Infused",
  "bitter-dried": "Desiccated",
  "bitter-fermented": "Cultured",
  "bitter-fried": "Scorched",
  "bitter-roasted": "Wood-Fired",
  "bitter-smoked": "Charcoal",
  "sour-boiled": "Brined",
  "sour-dried": "Dehydrated",
  "sour-fermented": "Pickled",
  "sour-fried": "Agrodolce",
  "sour-roasted": "Chimichurri",
  "sour-smoked": "Cured",
  "spicy-boiled": "Braised",
  "spicy-dried": "Sichuan",
  "spicy-fermented": "Kimchi",
  "spicy-fried": "Red-Hot",
  "spicy-roasted": "Peri-Peri",
  "spicy-smoked": "Chipotle",
  "sweet-boiled": "Candied",
  "sweet-dried": "Crystallised",
  "sweet-fermented": "Funky",
  "sweet-fried": "Caramelised",
  "sweet-roasted": "Glazed",
  "sweet-smoked": "Barbecued",
  "umami-boiled": "Dashi",
  "umami-dried": "Aged",
  "umami-fermented": "Miso",
  "umami-fried": "Tempura",
  "umami-roasted": "Rendered",
  "umami-smoked": "Hickory",
} as const;

export const getPreparationName = (flavourId: FlavourId, formId: FormId): string =>
  PREPARATION_NAMES[`${flavourId}-${formId}`];

const VALID_FLAVOUR_IDS = new Set<string>(Object.values(FlavourIds));
const VALID_FORM_IDS = new Set<string>(Object.values(FormIds));
const VALID_BEAN_IDS = new Set<string>(Object.values(BeanIds));

export const isValidZodiacId = (slug: string): slug is ZodiacId => {
  const parts = slug.split("-");
  if (parts.length !== 3) return false;
  const [flavourId, formId, beanId] = parts;
  return (
    VALID_FLAVOUR_IDS.has(flavourId) && VALID_FORM_IDS.has(formId) && VALID_BEAN_IDS.has(beanId)
  );
};
