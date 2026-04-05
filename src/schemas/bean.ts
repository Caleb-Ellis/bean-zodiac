import { z } from "astro/zod";
import { BeanIds } from "../lib/zodiac";

export const beanSchema = z.object({
  name: z.string(),
  slug: z.enum(BeanIds),
  tagline: z.string(),
  traits: z.array(z.string()),
  imageFile: z.string(),
});
export type BeanSchema = z.infer<typeof beanSchema>;
