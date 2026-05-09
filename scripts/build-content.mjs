import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function readCollection(name) {
  const dir = resolve(root, `src/content/${name}`);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
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

// Zodiacs — one JSON per slug, plus also copy to public/api/zodiacs/ for dev server
const zodiacs = readCollection("zodiacs");
const zodiacDir = resolve(root, "src/data/generated/zodiacs");
const publicDir = resolve(root, "public/api/zodiacs");
mkdirSync(zodiacDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

for (const { id, data, content } of zodiacs) {
  const payload = JSON.stringify({ ...data, content });
  writeFileSync(resolve(zodiacDir, `${id}.json`), payload);
  writeFileSync(resolve(publicDir, `${id}.json`), payload);
}

console.log(
  `Built ${beans.length} beans, ${flavours.length} flavours, ${forms.length} forms, ${zodiacs.length} zodiacs`,
);
