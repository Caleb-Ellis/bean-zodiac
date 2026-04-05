import { z } from "astro/zod";
import { FlavourIds } from "../lib/zodiac";

export const flavourSchema = z.object({
  name: z.string(),
  slug: z.enum(FlavourIds),
  tagline: z.string(),
  traits: z.array(z.string()),
});
export type FlavourSchema = z.infer<typeof flavourSchema>;
