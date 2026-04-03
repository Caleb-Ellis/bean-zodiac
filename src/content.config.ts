import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const beans = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/beans" }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    traits: z.array(z.string()),
    color: z.string(), // CSS color for theming
    modelFile: z.string().optional(), // future: "black-bean.glb"
  }),
});

const flavours = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/flavours" }),
  schema: z.object({
    name: z.string(),
    character: z.string(), // brief sensory descriptor
    traits: z.array(z.string()),
    color: z.string(),
  }),
});

const combos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/combos" }),
  schema: z.object({
    bean: z.string(), // bean slug e.g. "butter"
    flavour: z.string(), // flavour slug e.g. "bitter"
    tagline: z.string(), // one-line horoscope teaser
  }),
});

export const collections = { beans, elements: flavours, combos };
