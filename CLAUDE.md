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

- **12 beans** × **5 flavors** = **60-year cycle** (LCM, like the real Chinese zodiac)
- New year switches on **March 12** annually (not Chinese New Year)
- `REFERENCE_YEAR = 2026` anchors the cycle
- `getCurrentBeanZodiac()` → `getBeanZodiacForYear(beanYear)` is the main call chain

### Content Collections ([src/content.config.ts](src/content.config.ts))

Three Astro glob-loaded collections:

- **`beans/`** — 12 markdown files, one per bean (name, tagline, traits[], color CSS hex, optional modelFile)
- **`elements/`** — 5 markdown files, one per flavor element (name, character, traits[], color CSS hex)
- **`zodiacs/`** — 60 markdown files, one per bean×element pair (bean slug, flavor slug, tagline)

Zodiacs are the Cartesian product of all beans and elements. Each gets a horoscope-style tagline.

### Pages and Routing

- `/` — Current year's zodiac (bean + element + combo horoscope teaser)
- `/calendar` — 121-year table (60 past + current + 60 future), highlights current year
- `/beans/` — All 12 beans listed
- `/beans/[slug]` — Bean detail with traits and markdown body
- `/flavours/` — All 5 flavours listed
- `/flavours/[slug]` — Flavour detail with traits and markdown body
- `/zodiacs/[beanYear]` — Zodiac detail with markdown body

Detail pages use `getStaticPaths()` for static generation at build time.

### Styling

Tailwind CSS 4 via `@tailwindcss/vite`. Each bean and element has a CSS hex color for per-page theming. Component-scoped styles live in `.astro` files.

### Planned Features

`BeanModel.astro` is a placeholder for 3D `.glb` bean models (Three.js/Threlte). Model files would live at `/public/models/{beanName}.glb`.
