import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function readCollection(name) {
  const dir = resolve(root, `src/content/${name}`);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !/^[A-Z]/.test(f))
    .map((f) => {
      const { data, content } = matter(readFileSync(resolve(dir, f), "utf8"));
      return { id: f.replace(/\.md$/, ""), data, content: content.trim() };
    });
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2));
}

// Beans
const beans = readCollection("beans");
const beansRecord = Object.fromEntries(
  beans.map(({ id, data, content }) => [id, { ...data, content }]),
);
writeJson(resolve(root, "src/data/generated/beans.json"), beansRecord);

// Flavours
const flavours = readCollection("flavours");
const flavoursRecord = Object.fromEntries(
  flavours.map(({ id, data, content }) => [id, { ...data, content }]),
);
writeJson(resolve(root, "src/data/generated/flavours.json"), flavoursRecord);

// Forms
const forms = readCollection("forms");
const formsRecord = Object.fromEntries(
  forms.map(({ id, data, content }) => [id, { ...data, content }]),
);
writeJson(resolve(root, "src/data/generated/forms.json"), formsRecord);

// Facet tags are beans only (see FACET_TAGS.md) — 2 or 3 per tier when present.
const FACET_TAG_IDS = new Set([
  "adzuki", "black", "butter", "cannellini", "chickpea", "edamame",
  "fava", "green", "kidney", "mung", "navy", "pinto",
]);
const FACET_TAG_FIELDS = [
  "facetMostTags", "facetHighTags", "facetMidTags", "facetLowTags", "facetLeastTags",
];

function validateFacetTags(id, data) {
  for (const field of FACET_TAG_FIELDS) {
    const tags = data[field];
    if (tags == null) continue;
    if (!Array.isArray(tags)) {
      throw new Error(`${id}: ${field} must be a list of bean ids, got ${typeof tags}`);
    }
    if (tags.length < 2 || tags.length > 3) {
      throw new Error(`${id}: ${field} must have 2 or 3 beans, got ${tags.length}`);
    }
    for (const tag of tags) {
      if (!FACET_TAG_IDS.has(tag)) {
        throw new Error(`${id}: ${field} has invalid bean "${tag}"`);
      }
    }
  }
}

// Zodiacs — one JSON per slug, plus also copy to public/api/zodiacs/ for dev server
const zodiacs = readCollection("zodiacs");
const zodiacDir = resolve(root, "src/data/generated/zodiacs");
const publicDir = resolve(root, "public/api/zodiacs");
mkdirSync(zodiacDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

for (const { id, data, content } of zodiacs) {
  validateFacetTags(id, data);
  const payload = JSON.stringify({ ...data, content });
  writeFileSync(resolve(zodiacDir, `${id}.json`), payload);
  writeFileSync(resolve(publicDir, `${id}.json`), payload);
}

console.log(
  `Built ${beans.length} beans, ${flavours.length} flavours, ${forms.length} forms, ${zodiacs.length} zodiacs`,
);

await import("./build-rorschach.mjs");
