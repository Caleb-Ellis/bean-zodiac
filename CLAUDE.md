# CLAUDE.md

## Commands

```bash
pnpm dev / build / preview
pnpm fmt / fmt:check / lint / lint:fix
```

## Architecture

**Bean Zodiac** — Astro 6 static site, a playful Chinese zodiac analog using beans.

- **12 beans × 5 flavours × 6 forms = 360-combination cycle**
- New year switches **March 12** annually. Reference date: 12 March 1993.
- Main call chain: `getCurrentBeanZodiac()` → `getBeanZodiacForYear(beanYear)`

### Preparations

A **Preparation** = Flavour × Form name (30 total). Lookup: `getPreparationName(flavourId, formId)` via `PREPARATION_NAMES` in `zodiac.ts`.

|        | boiled   | dried        | fermented | fried       | roasted      | smoked      |
| ------ | -------- | ------------ | --------- | ----------- | ------------ | ----------- |
| bitter | Decocted | Desiccated   | Tinctured | Scorched    | Dark-Roasted | Ashen       |
| sour   | Brined   | Dehydrated   | Pickled   | Brightened  | Charred      | Cold-Smoked |
| spicy  | Braised  | Sichuan      | Kimchi    | Red-Hot     | Peri-Peri    | Chipotle    |
| sweet  | Candied  | Crystallised | Honeyed   | Caramelised | Glazed       | Barbecued   |
| umami  | Dashi    | Aged         | Miso      | Tempura     | Bronzed      | Burnished   |

### Content Collections

- **`beans/`** — 12 files (name, tagline, traits[], color, optional modelFile)
- **`flavours/`** — 5 files (name, character, traits[], color)
- **`forms/`** — 6 files: boiled, dried, fermented, fried, roasted, smoked (name, tagline, traits[])
- **`zodiacs/`** — 360 files, filename `{flavour}-{form}-{bean}.md`, frontmatter: slug, bean, flavour, form, trait, dish, quote, seasonalFortune, dailyCommon?, dailyUncommon?, dailyRare?. Reference style: `bitter-boiled-adzuki.md`.

### Pages

- `/` — "The Season of the [Preparation] [Bean]"
- `/calendar` — date picker → "You are the [Preparation] [Bean]"
- `/compatibility` — two date pickers, shareable via `?a=YYYY-MM-DD&b=YYYY-MM-DD`
- `/beans/`, `/beans/[slug]`, `/flavours/`, `/flavours/[slug]`, `/forms/`, `/forms/[slug]`

### Daily Fortunes

Each zodiac has one `seasonalFortune` and three daily fortunes keyed to rarity:

- `dailyCommon` — mild expression of the trait
- `dailyUncommon` — stronger expression of the trait
- `dailyRare` — the trait at full, unguarded intensity

All fortunes: one sentence, one em dash allowed, no qualifying statements. Each step up intensifies the trait — never pushes against it.

### Rarity

- **Heirloom** — 1-in-10
- **Reserve** — 2-in-10
- **Garden** — 7-in-10

Exposed as `rarityId` on `ZodiacMetadata`. Badge in `ZodiacIdentity.tsx`. Wheel center fills/glows in rarity color on activation (`RARITY_CENTRE_COLOR` in `ZodiacWheel.tsx`).

### Compatibility

Scores across bean, flavour, form — each −1/0/+1/+2 — total −4 to +4.

- `getBeanCompatibility(a, b)` — 78 entries
- `getFlavourCompatibility(a, b)` — 15 entries
- `getFormCompatibility(a, b)` — 21 entries
- `getTotalCompatibility(metaA, metaB)` → `{ score, label, description }` from `TOTAL_COMPATIBILITY` (score 4 = "Same Pod", −4 = "Spoiled Batch")

All lookups sort IDs alphabetically before joining as key.

### Components

- **`ZodiacResult.tsx`** — `/`, current season + Era/Season/Year badges
- **`ZodiacIdentity.tsx`** — `/calendar`, personal result + badges
- **`ZodiacCompatibility.tsx`** — `/compatibility`, per-dimension rows with overall total
- Preparation name uses a flavour→form gradient with the form's SVG filter for texture

### Styling

Tailwind CSS 4 via `@tailwindcss/vite`. Per-element CSS hex colors for theming. Component-scoped styles in `.astro` files.
