import { z } from "astro/zod";
import { MethodIds } from "../lib/zodiac";

export const methodSchema = z.object({
  name: z.string(),
  slug: z.enum(MethodIds),
  tagline: z.string(),
  traits: z.array(z.string()),
});
export type MethodSchema = z.infer<typeof methodSchema>;
