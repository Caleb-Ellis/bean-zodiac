export const BeanIds = {
  Adzuki: "adzuki",
  Black: "black",
  Butter: "butter",
  Cannellini: "cannellini",
  Chickpea: "chickpea",
  Edamame: "edamame",
  Fava: "fava",
  Green: "green",
  Kidney: "kidney",
  Mung: "mung",
  Navy: "navy",
  Pinto: "pinto",
} as const;
export type BeanId = (typeof BeanIds)[keyof typeof BeanIds];

export const FlavourIds = {
  Bitter: "bitter",
  Sour: "sour",
  Spicy: "spicy",
  Sweet: "sweet",
  Umami: "umami",
} as const;
export type FlavourId = (typeof FlavourIds)[keyof typeof FlavourIds];

export const FormIds = {
  Boiled: "boiled",
  Dried: "dried",
  Fermented: "fermented",
  Fried: "fried",
  Roasted: "roasted",
  Smoked: "smoked",
} as const;
export type FormId = (typeof FormIds)[keyof typeof FormIds];

export const QualityIds = {
  Rotten: "rotten",
  Stale: "stale",
  Garden: "garden",
  Market: "market",
  Heirloom: "heirloom",
} as const;
export type QualityId = (typeof QualityIds)[keyof typeof QualityIds];

export type ZodiacId = `${FlavourId}-${FormId}-${BeanId}`;

// Spirit tags steer the Beanstalk's soft scoring pass. Each zodiac names beans
// and a form that align with its trait (friendly) and with the opposite of its
// trait (anti) — never its own bean/form. Flavours are deliberately untagged
// (orthogonal registers with no natural opposites). On trait-positive tiers
// (Most/High/Mid) the friendly set is the active one; on anti-trait tiers
// (Low/Least) the anti set is. Accepting lifts the active set, resisting lowers
// it, independent of the base pass on the zodiac's own triple. See
// lib/spiritBean and SPIRIT_TAGS.md.
export type SpiritTags = {
  friendlyBeans: BeanId[];
  antiBeans: BeanId[];
  friendlyForm: FormId;
  antiForm: FormId;
};

export type BeanSchema = {
  name: string;
  slug: BeanId;
  tagline: string;
  traits: string[];
  imageFile: string;
};

export type FlavourSchema = {
  name: string;
  slug: FlavourId;
  tagline: string;
  traits: string[];
};

export type FormSchema = {
  name: string;
  slug: FormId;
  tagline: string;
  traits: string[];
};

export type ZodiacSchema = {
  slug: string;
  bean: string;
  flavour: string;
  form: string;
  trait: string;
  dish: string;
  quote: string;
  seasonalFortune: string;
  facetLeastTitle: string;
  facetLeast: string;
  facetLowTitle: string;
  facetLow: string;
  facetMidTitle: string;
  facetMid: string;
  facetHighTitle: string;
  facetHigh: string;
  facetMostTitle: string;
  facetMost: string;
  friendlyBeans: BeanId[];
  antiBeans: BeanId[];
  friendlyForm: FormId;
  antiForm: FormId;
  fortuneLeast: string;
  fortuneLeast2: string;
  fortuneLow: string;
  fortuneLow2: string;
  fortuneMid: string;
  fortuneMid2: string;
  fortuneHigh: string;
  fortuneHigh2: string;
  fortuneMost: string;
  fortuneMost2: string;
  question: string;
  answerMost: string;
  answerHigh: string;
  answerMid: string;
  answerLow: string;
  answerLeast: string;
  rorschachMost: string;
  rorschachHigh: string;
  rorschachMid: string;
  rorschachLow: string;
  rorschachLeast: string;
};

export type Bean = BeanSchema & { content: string };
export type Flavour = FlavourSchema & { content: string };
export type Form = FormSchema & { content: string };
export type Zodiac = ZodiacSchema & { content: string };

export type ZodiacMetadata = {
  zodiacId: ZodiacId;
  beanId: BeanId;
  flavourId: FlavourId;
  formId: FormId;
  startDate: Date;
  endDate: Date;
};
