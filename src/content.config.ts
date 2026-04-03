import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const beans = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/beans" }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    traits: z.array(z.string()),
    color: z.string(),
    modelFile: z.string().optional(), // future: "black-bean.glb"
  }),
});

const flavours = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/flavours" }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    traits: z.array(z.string()),
    color: z.string(),
  }),
});

const zodiacs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/zodiacs" }),
  schema: z.object({
    bean: reference("beans"),
    flavour: reference("flavours"),
    dish: z.string(),
    fortune: z.string(),
  }),
});

export const collections = { beans, flavours, zodiacs };
