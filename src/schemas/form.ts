import { z } from "astro/zod";
import { FormIds } from "../lib/zodiac";

export const formSchema = z.object({
  name: z.string(),
  slug: z.enum(FormIds),
  tagline: z.string(),
  traits: z.array(z.string()),
});
export type FormSchema = z.infer<typeof formSchema>;
