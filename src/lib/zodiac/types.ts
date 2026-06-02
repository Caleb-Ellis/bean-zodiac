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

// A facet tag is a bean the facet vignette embodies. The zodiac's own triple is
// always scored at full strength by the base pass; a tier's bean tags add a
// weaker bump that lifts those beans on accept (they need not be the zodiac's
// own bean — that's the point). See lib/spiritBean.
export type FacetTagId = BeanId;

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
  facetLeastTags?: FacetTagId[];
  facetLowTags?: FacetTagId[];
  facetMidTags?: FacetTagId[];
  facetHighTags?: FacetTagId[];
  facetMostTags?: FacetTagId[];
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
