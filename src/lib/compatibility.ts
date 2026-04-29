import type { BeanId, FlavourId, FormId } from "./zodiac";
import {
  BEAN_COMPATIBILITY,
  FLAVOUR_COMPATIBILITY,
  FORM_COMPATIBILITY,
  SPECIAL_COMPATIBILITY,
  TOTAL_COMPATIBILITY,
} from "../data/compatibility-data";

export type { CompatibilityEntry } from "../data/compatibility-data";

export const getBeanCompatibility = (a: BeanId, b: BeanId) => {
  const key = [a, b].sort().join("-") as keyof typeof BEAN_COMPATIBILITY;
  return BEAN_COMPATIBILITY[key];
};

export const getFlavourCompatibility = (a: FlavourId, b: FlavourId) => {
  const key = [a, b].sort().join("-") as keyof typeof FLAVOUR_COMPATIBILITY;
  return FLAVOUR_COMPATIBILITY[key];
};

export const getFormCompatibility = (a: FormId, b: FormId) => {
  const key = [a, b].sort().join("-") as keyof typeof FORM_COMPATIBILITY;
  return FORM_COMPATIBILITY[key];
};

type CompatSlice = { beanId: BeanId; flavourId: FlavourId; formId: FormId };

type SpecialCompatDetail = {
  entry: ReturnType<typeof getBeanCompatibility>;
  attrA: "bean" | "flavour" | "form";
  attrB: "bean" | "flavour" | "form";
};

export const getSpecialCompatibilityDetail = (
  a: CompatSlice,
  b: CompatSlice,
): SpecialCompatDetail | null => {
  const checks: [
    string,
    string,
    "bean" | "flavour" | "form",
    "bean" | "flavour" | "form",
  ][] = [
    [a.beanId, b.flavourId, "bean", "flavour"],
    [b.beanId, a.flavourId, "flavour", "bean"],
    [a.beanId, b.formId, "bean", "form"],
    [b.beanId, a.formId, "form", "bean"],
    [a.flavourId, b.formId, "flavour", "form"],
    [b.flavourId, a.formId, "form", "flavour"],
  ];
  for (const [x, y, attrA, attrB] of checks) {
    const key = [x, y].sort().join("-");
    const entry = SPECIAL_COMPATIBILITY[key];
    if (entry) return { entry, attrA, attrB };
  }
  return null;
};

const getSpecialCompatibility = (a: CompatSlice, b: CompatSlice) =>
  getSpecialCompatibilityDetail(a, b)?.entry ?? {
    score: 0,
    label: "",
    description: "",
  };

export const getTotalCompatibility = (
  a: CompatSlice,
  b: CompatSlice,
): { score: number; label: string; description: string } => {
  const score =
    getBeanCompatibility(a.beanId, b.beanId).score +
    getFlavourCompatibility(a.flavourId, b.flavourId).score +
    getFormCompatibility(a.formId, b.formId).score +
    getSpecialCompatibility(a, b).score;
  return { score, ...TOTAL_COMPATIBILITY[score] };
};
