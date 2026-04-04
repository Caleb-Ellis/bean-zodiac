import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { beanSchema } from "./schemas/bean";
import { flavourSchema } from "./schemas/flavour";
import { zodiacSchema } from "./schemas/zodiac";

export const collections = {
  beans: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/beans" }),
    schema: beanSchema,
  }),
  flavours: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/flavours" }),
    schema: flavourSchema,
  }),
  zodiacs: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/zodiacs" }),
    schema: zodiacSchema,
  }),
};
