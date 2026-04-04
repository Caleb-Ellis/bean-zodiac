import { z } from "astro/zod";
import { reference } from "astro:content";

export const zodiacSchema = z.object({
  slug: z.string(),
  bean: reference("beans"),
  flavour: reference("flavours"),
  dish: z.string(),
  fortune: z.string(),
});
export type ZodiacSchema = z.infer<typeof zodiacSchema>;
