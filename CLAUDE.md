# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build

pnpm fmt          # Format with oxfmt
pnpm fmt:check    # Check formatting without writing
pnpm lint         # Lint with oxlint
pnpm lint:fix     # Lint and auto-fix
```

## Architecture

**Bean Zodiac** is an Astro 6 static site — a playful Chinese zodiac analog using beans instead of animals.

### Zodiac System ([src/lib/zodiac.ts](src/lib/zodiac.ts))

The core of the app. Key concepts:

- **12 beans** × **5 flavours** × **6 forms** = **360-combination cycle**
- New year switches on **March 12** annually (not Chinese New Year)
- Reference Date is 12 March 1993 - this is when the Bean Zodiac started
- `getCurrentBeanZodiac()` → `getBeanZodiacForYear(beanYear)` is the main call chain

### Preparations ([src/lib/zodiac.ts](src/lib/zodiac.ts))

A **Preparation** is the named synthesis of a Flavour × Form combination — e.g. Sweet + Fried = **Caramelised**. There are 30 preparations (5 × 6). They are defined as a lookup constant `PREPARATION_NAMES` in `zodiac.ts` and accessed via `getPreparationName(flavourId, formId)`. No content collection — names only.

Full table:

|        | boiled   | dried        | fermented | fried       | roasted      | smoked      |
| ------ | -------- | ------------ | --------- | ----------- | ------------ | ----------- |
| bitter | Decocted | Desiccated   | Tinctured | Scorched    | Dark Roasted | Ashen       |
| sour   | Brined   | Dehydrated   | Pickled   | Brightened  | Charred      | Cold-Smoked |
| spicy  | Braised  | Chili-Cured  | Kimchi    | Red-Hot     | Blackened    | Chipotle    |
| sweet  | Candied  | Crystallised | Honeyed   | Caramelised | Glazed       | Barbecued   |
| umami  | Dashi    | Aged         | Miso      | Tempura     | Bronzed      | Burnished   |

### Content Collections ([src/content.config.ts](src/content.config.ts))

Astro glob-loaded collections:

- **`beans/`** — 12 markdown files, one per bean (name, tagline, traits[], color CSS hex, optional modelFile)
- **`flavours/`** — 5 markdown files, one per flavour (name, character, traits[], color CSS hex)
- **`forms/`** — 6 markdown files: boiled, dried, fermented, fried, roasted, smoked (name, tagline, traits[])
- **`zodiacs/`** — 360 markdown files, one per bean×flavour×form combination. Filename: `{flavour}-{form}-{bean}.md`. Frontmatter: slug, bean, flavour, form, trait, dish, quote, fortune. Body opens: "[Form] Beans born in the Year of the [Flavour] [Bean] are the Bean Zodiac's most [trait]." Reference file for style: `bitter-boiled-adzuki.md`.

### Pages and Routing

- `/` — Current season's zodiac displayed as "The Season of the [Preparation] [Bean]"
- `/calendar` — Date picker; result displayed as "You are the [Preparation] [Bean]"
- `/beans/` — All 12 beans listed
- `/beans/[slug]` — Bean detail with traits and markdown body
- `/flavours/` — All 5 flavours listed
- `/flavours/[slug]` — Flavour detail with traits and markdown body
- `/forms/` — All 6 forms listed
- `/forms/[slug]` — Form detail with traits and markdown body

Detail pages use `getStaticPaths()` for static generation at build time.

### Components

- **`ZodiacResult.tsx`** — used on `/`, shows current season with "The Season of the [Preparation] [Bean]" heading + Era/Season/Year badges
- **`ZodiacIdentity.tsx`** — used on `/calendar` via `ZodiacCalendar.tsx`, shows a user's personal result with "You are the [Preparation] [Bean]" heading + Era/Season/Year badges
- The preparation name in both components uses a flavour→form gradient with the form's SVG filter applied for texture

### Styling

Tailwind CSS 4 via `@tailwindcss/vite`. Each bean and element has a CSS hex color for per-page theming. Component-scoped styles live in `.astro` files.
