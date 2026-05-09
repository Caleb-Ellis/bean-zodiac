# Bean Zodiac

A playful Chinese zodiac analog using beans. **12 beans × 5 flavours × 6 forms = 360-combination cycle.**

## Commands

```bash
pnpm dev          # build content + start Vite dev server
pnpm build        # build content + type-check + Vite production build
pnpm preview      # preview production build
pnpm content      # build markdown → JSON (runs automatically before dev/build)
pnpm fmt          # format
pnpm fmt:check    # check formatting
pnpm lint         # lint
pnpm lint:fix     # lint + autofix
```

## Stack

- **Vite 6** + **React 19** SPA
- **TanStack Router** v1 — file-based routing (`src/routes/`)
- **Zustand** v5 — single `bean-zodiac` localStorage key with `persist` middleware
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **gray-matter** — build-time markdown → JSON conversion (`scripts/build-content.mjs`)

## Architecture

### The Cycle

New year switches **March 12** annually. Reference date: 12 March 1993.

Main entry point: `getZodiacMetadataForDate(date)` → `ZodiacMetadata` (zodiacId, beanId, flavourId, formId, startDate, endDate)

### Preparations

A **Preparation** = Flavour × Form name (30 total). Lookup: `getPreparationName(flavourId, formId)` via `PREPARATION_NAMES` in `zodiac.ts`.

|        | boiled  | dried        | fermented | fried       | roasted     | smoked    |
| ------ | ------- | ------------ | --------- | ----------- | ----------- | --------- |
| bitter | Infused | Desiccated   | Cultured  | Scorched    | Wood-Fired  | Charcoal  |
| sour   | Brined  | Dehydrated   | Pickled   | Agrodolce   | Chimichurri | Cured     |
| spicy  | Braised | Sichuan      | Kimchi    | Red-Hot     | Peri-Peri   | Chipotle  |
| sweet  | Candied | Crystallised | Funky     | Caramelised | Glazed      | Barbecued |
| umami  | Dashi   | Aged         | Miso      | Tempura     | Rendered    | Hickory   |

### Content

Markdown lives in `src/content/`. The build script (`scripts/build-content.mjs`) converts it to JSON in `src/data/generated/` and copies zodiac files to `public/api/zodiacs/` so `fetchZodiac()` works unchanged at `/api/zodiacs/{slug}.json`.

- **`beans/`** — 12 files (name, tagline, traits[], color, imageFile)
- **`flavours/`** — 5 files (name, character, traits[], color)
- **`forms/`** — 6 files: boiled, dried, fermented, fried, roasted, smoked (name, tagline, traits[])
- **`zodiacs/`** — 360 files, filename `{flavour}-{form}-{bean}.md`, frontmatter: slug, bean, flavour, form, trait, dish, quote, seasonalFortune, dailyMid, dailyHigh, dailyMost, dailyLow, dailyLeast. Reference style: `bitter-boiled-adzuki.md`.

### Pages

- `/` — "The Season of the [Preparation] [Bean]" when no claimed bean, "You are the [Preparation] [Bean]" when bean claimed, alongside daily fortune bean.
- `/wheel` — date picker → "You are the [Preparation] [Bean]". Shareable via `?date=YYYY-MM-DD`.
- `/compatibility` — date picker for a second bean; if a bean is claimed it's used as the first. Shareable via `?b=YYYY-MM-DD`.
- `/legunomicon` — chronological history of daily fortune entries; shows resonance vote indicator per entry.
- `/beaniary` — compendium grid of all 360 zodiacs; met beans show image + name, unmet show a black bean emoji.
- `/beanstalk` — claimed bean's full zodiac page + Spirit Bean radar charts + timeline.
- `/beans/`, `/beans/:id`, `/flavours/`, `/flavours/:id`, `/forms/`, `/forms/:id`, `/zodiacs/:id`
- `/calendar` → redirects to `/wheel`. `/zodiacs` → redirects to `/`.

### Daily Fortunes

Each zodiac has one `seasonalFortune` and five daily fortunes keyed to quality:

- `dailyMid` — mild positive expression of the trait
- `dailyHigh` — stronger positive expression of the trait
- `dailyMost` — best positive expression of the trait
- `dailyLow` — mild negative expression of the trait
- `dailyLeast` — medium negative expression of the trait

The daily fortune selected is influenced by the user's claimed/spirit bean, the current season, and a random daily bean.

### Quality

- **Garden** — Neutral, Very Common
- **Market** — Good, Common
- **Stale** — Bad, Uncommon
- **Heirloom** — Best, Rare
- **Rotten** — Worst, Very Rare

### Compatibility

Scores across bean, flavour, form, and special — total -3 to +4.

- `getBeanCompatibility(a, b)` — 78 entries
- `getFlavourCompatibility(a, b)` — 15 entries
- `getFormCompatibility(a, b)` — 21 entries
- `getSpecialCompatibilityDetail(a, b)` — cross-attribute bonus; checks bean×flavour, bean×form, flavour×form (both orderings); returns `{ entry, attrA, attrB }` or `null`
- `getTotalCompatibility(metaA, metaB)` → `{ score, label, description }`

All lookups sort IDs alphabetically before joining as key (e.g. `"adzuki-sweet"`, `"bitter-fermented"`).

### Data Architecture

- **`AllZodiacData`** — `{ beans, flavours, forms }` imported from generated JSON at build time in `src/lib/data.ts`. Passed as `data` prop to all page components (~15KB).
- **`/api/zodiacs/{slug}.json`** — 360 static JSON files served from `public/api/zodiacs/`. Fetched on demand via `fetchZodiac(zodiacId)`.
- **`getDailyFortuneIds(date, personalSlug)`** — synchronous; returns `{ zodiacId, qualityId }`. Pair with `getFortuneText(zodiac, qualityId)` after fetching.

**Per-page fetch strategy:**

- `/` default: fetches seasonal zodiac on mount for fortune + dish.
- `/` claimed (`ClaimedBeanResult`): fetches seasonal + fortune zodiac in parallel on mount.
- `/wheel` (`ZodiacWheelContainer`): pre-fetches zodiac when user clicks "Discover the Bean Within" — data is ready before the 3.7s spin ends.
- `/compatibility`: no zodiac fetches — only bean/flavour/form display data needed.

### State & localStorage

All persistent state lives in a single Zustand store (`src/store/index.ts`) under the `bean-zodiac` localStorage key.

- **claimedBean** (`ZodiacId | null`) — the user's claimed zodiac. Thin wrapper API in `src/lib/claimedBean.ts`: `getClaimedBeanSlug`, `setClaimedBeanSlug`, `clearClaimedBeanSlug`.
- **fortuneHistory** (`FortuneEntry[]`) — daily fortune entries (date, zodiacId, qualityId, text, score), newest first. `score`: 0 = no vote, +1 = thumbs up, -1 = thumbs down. API in `src/lib/fortuneHistory.ts`.
- **metBeans** (`ZodiacId[]`) — encountered zodiac IDs, newest first. API in `src/lib/metBeans.ts`. Backfills from fortune history on first `/beaniary` visit.
- **fortuneSeenDate** (`string | null`) — `YYYY-MM-DD` of the last day the fortune dialog was dismissed. Drives whether the dialog auto-opens on `/`.
- **radarExpanded** (`boolean`) — Beanstalk mobile radar-panel expansion preference.

`relinquish()` clears claimedBean, fortuneHistory, metBeans, and fortuneSeenDate at once.

### Spirit Bean & Beanstalk (`/beanstalk`)

**Spirit Bean** — three SVG radar charts (flavour, form, bean) showing affinity scores. Rendered by `SpiritBeanRadar.tsx`. Score computation in `spiritBean.ts`:

- Baseline: all attributes start at 8. Claimed bean's flavour/form/bean each get +4.
- Each accepted fortune adds +1 to that zodiac's flavour, form, and bean; thumbs-down subtracts 1.
- Heirloom/rotten qualities apply 2× magnitude; stale/rotten negate the adjustment.
- Charts auto-scale to max value (floor 16).

**Beanstalk** — scrollable vertical timeline of fortune history. Left panel: sticky, `h-svh`, shows spirit zodiac + radar charts that lerp to cumulative scores at the active node. Right panel: scrollable timeline with a scroll-tracked fill bar. Year filter defaults to current bean year.

### Styling

Tailwind CSS 4. Per-element CSS hex colors for theming. Form visual effects use SVG filter `<defs>` rendered once at root via `FormFilters.tsx`.
