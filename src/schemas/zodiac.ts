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
  dailyLeast: z.string(),
  dailyLow: z.string(),
  dailyMid: z.string(),
  dailyHigh: z.string(),
  dailyMost: z.string(),
});
export type ZodiacSchema = z.infer<typeof zodiacSchema>;
