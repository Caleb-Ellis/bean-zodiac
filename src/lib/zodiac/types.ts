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
  facetLeast: string;
  facetLow: string;
  facetMid: string;
  facetHigh: string;
  facetMost: string;
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
