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
  seasonalFortune: z.string(),
  dailyCommon: z.string().optional(),
  dailyUncommon: z.string().optional(),
  dailyRare: z.string().optional(),
});
export type ZodiacSchema = z.infer<typeof zodiacSchema>;
