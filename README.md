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

A **Preparation** = Flavour × Form name (30 total). Lookup: `getPreparationName(flavourId, formId)` via `PREPARATION_NAMES` in `src/lib/zodiac/constants.ts`.

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
- **`zodiacs/`** — 360 files, filename `{flavour}-{form}-{bean}.md`, frontmatter: slug, bean, flavour, form, trait, dish, quote, seasonalFortune, facet\*/fortune\* gradient (Most/High/Mid/Low/Least), plus optional `question` + `answerMost/High/Mid/Low/Least` for the question-variant ritual and `rorschachMost/High/Mid/Low/Least` for the rorschach-variant ritual (see `STYLE.md` for body voice, `QUESTIONS.md` for question/answer voice, `RORSCHACH.md` for rorschach voice).

### Pages

- `/` — "The season of the [Preparation] [Bean]" when no claimed bean, "You are the [Preparation] [Bean]" when bean claimed, alongside daily fortune bean.
- `/wheel` — date picker → "You are the [Preparation] [Bean]". Shareable via `?date=YYYY-MM-DD`.
- `/compatibility` — date picker for a second bean; if a bean is claimed it's used as the first. Shareable via `?b=YYYY-MM-DD`.
- `/beanstalk` — claimed bean's Spirit Bean radar charts + reverse-chronological timeline of fortune history.
- `/beaniary` — hub linking to:
  - `/beaniary/beans`, `/beaniary/beans/:id` — the twelve beans
  - `/beaniary/flavours`, `/beaniary/flavours/:id` — the five flavours
  - `/beaniary/forms`, `/beaniary/forms/:id` — the six forms
  - `/beaniary/met` — beans encountered so far
- `/zodiacs/:id` — full page for any of the 360 zodiacs.
- Legacy redirects: `/calendar` → `/wheel`, `/zodiacs` → `/`, `/beans` → `/beaniary/beans`, `/flavours` → `/beaniary/flavours`, `/forms` → `/beaniary/forms` (and `:id` equivalents).

### Daily Fortunes

Each zodiac has one `seasonalFortune` and five daily fortunes:

- `facetMid` — mild expression of the trait
- `facetHigh` — medium expression of the trait
- `facetMost` — strong expression of the trait
- `facetLow` — mild expression of the opposite of the trait (e.g. if trait is "courageous" this is could be "cowardly")
- `facetLeast` — medium expression of the opposite of the trait

The daily fortune selected is influenced by the user's claimed/spirit bean, the current season, and a random daily bean.

#### Ritual variants

The dialog comes in three variants, chosen deterministically per day per spirit-bean via `getVariantForSlug(spiritSlug, date)` in `src/lib/fortune.ts`. Weighted out of 5: facet 2/5, question 2/5, rorschach 1/5.

- **Facet variant** — user reads the rolled facet text and clicks Accept (+1) or Resist (−1). Quality is rolled.
- **Question variant** — user reads `question` and picks one of five answers (`answerMost`..`answerLeast`). The answer locks `qualityId` to its tier and counts as Accept (+1). No Ignore/Resist.
- **Rorschach variant** — user is shown the zodiac's inkblot ("What do you see?") and picks one of five readings (`rorschachMost`..`rorschachLeast`). Like the question variant, the pick locks `qualityId` to its tier and counts as Accept (+1).

The variant downgrades to facet for any zodiac that lacks the optional `question`/`rorschach*` fields, so the question and rorschach variants roll out gradually as zodiacs are authored.

The inkblots are SVGs generated by `scripts/build-rorschach.mjs` into `public/images/rorschach/{slug}.svg`. Each is a left/right mirror-symmetric blot composed from the bean image plus flavour/form emoji, warped by a seeded `feTurbulence`/`feDisplacementMap` filter. All geometry is seeded from the slug hash, so blots are stable across rebuilds. The composed blot is additionally given independent 50/50 horizontal and vertical flips (also seeded). Since the blot is already left/right symmetric, the horizontal flip is a visual no-op; the vertical flip turns it upside down. Regenerate with `node scripts/build-rorschach.mjs`.

### Quality

- **Garden** — Neutral, Common
- **Market** — Bright, Uncommon
- **Stale** — Faded, Uncommon
- **Heirloom** — Vivid, Rare
- **Rotten** — Dark, Rare

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

- **claimed** (`ClaimedBean | null`, shape `{ id: ZodiacId, on: YYYY-MM-DD }`) — the user's claimed zodiac. Set via `setClaimed(id)`.
- **fortuneHistory** (`FortuneEntry[]`) — daily fortune entries `{ date, zodiacId, qualityId, facetTitle, facetText, score, text, seenAt }` plus optional question-variant fields `{ variant, question, answeredQuality, answerText }`, newest first. `score`: 0 = no vote, +1 = accepted, -1 = resisted. On question entries `qualityId` reflects the answered tier and `score` is always +1. `seenAt` is the ISO timestamp the user dismissed the fortune dialog (drives whether it auto-opens on `/`).
- **metBeans** (`MetBean[]`, shape `{ id: ZodiacId, on: YYYY-MM-DD }`) — encountered zodiacs, newest first.
- **radarExpanded** (`boolean`) — Beanstalk mobile radar-panel expansion preference.

`relinquish()` clears claimed, fortuneHistory, and metBeans at once.

### Spirit Bean & Beanstalk (`/beanstalk`)

**Spirit Bean** — three SVG radar charts (flavour, form, bean) showing affinity scores. Rendered by `SpiritBeanRadar.tsx`. Score computation in `spiritBean.ts`:

- Baseline: all attributes start at 8. Claimed bean's flavour/form/bean each get +4.
- Each accepted fortune adds +1 to that zodiac's flavour, form, and bean; thumbs-down subtracts 1. Question-variant answers always count as Accept (+1); the picked tier becomes the day's `qualityId` and drives the magnitude.
- Heirloom/rotten qualities apply 2× magnitude; stale/rotten negate the adjustment.
- Charts auto-scale to max value (floor 16).

**Beanstalk** — scrollable vertical timeline of fortune history. Left panel: sticky, shows spirit zodiac + radar charts that lerp to cumulative scores at the active node. Right panel: scrollable timeline with a scroll-tracked fill bar. Year filter defaults to current bean year.

### Styling

Tailwind CSS 4. Per-element CSS hex colors for theming. Form visual effects use SVG filter `<defs>` rendered once at root via `FormFilters.tsx`.
