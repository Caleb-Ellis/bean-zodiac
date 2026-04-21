import { z } from "astro/zod";
import { reference } from "astro:content";

export const zodiacSchema = z.object({
  slug: z.string(),
  bean: reference("beans"),
  flavour: reference("flavours"),
  form: reference("forms"),
  trait: z.string(),
  dish: z.string(),
  quote: z.string(),
  fortune: z.string(),
  midFortune: z.string().optional(),
  highFortune: z.string().optional(),
});
export type ZodiacSchema = z.infer<typeof zodiacSchema>;
