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
- Main entry point: `getZodiacMetadataForDate(date)` → `ZodiacMetadata` (zodiacId, beanId, flavourId, formId, startDate, endDate)

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

- **`beans/`** — 12 files (name, tagline, traits[], color, imageFile)
- **`flavours/`** — 5 files (name, character, traits[], color)
- **`forms/`** — 6 files: boiled, dried, fermented, fried, roasted, smoked (name, tagline, traits[])
- **`zodiacs/`** — 360 files, filename `{flavour}-{form}-{bean}.md`, frontmatter: slug, bean, flavour, form, trait, dish, quote, seasonalFortune, dailyNeutral, dailyGood, dailyBest, dailyBad, dailyWorst. Reference style: `bitter-boiled-adzuki.md`.

### Pages

- `/` — "The Season of the [Preparation] [Bean]" when no claimed bean, "You are the [Preparation] [Bean]" when bean claimed, alongside daily fortune bean.
- `/wheel` — date picker → "You are the [Preparation] [Bean]". Shareable via `?date=YYYY-MM-DD`.
- `/compatibility` — date picker for a second bean; if a bean is claimed it's used as the first. Shareable via `?b=YYYY-MM-DD`.
- `/legunomicon` — chronological history of daily fortune entries (requires a claimed bean to populate).
- `/beaniary` — compendium grid of all 360 zodiacs; met beans show image + name, unmet show a black bean emoji.
- `/beans/`, `/beans/[slug]`, `/flavours/`, `/flavours/[slug]`, `/forms/`, `/forms/[slug]`, `/zodiacs/[slug]`

### Daily Fortunes

Each zodiac has one `seasonalFortune` and three daily fortunes keyed to quality:

- `dailyNeutral` - mild positive expression of the trait
- `dailyGood` — stronger positive expression of the trait
- `dailyBest` — best positive expression of the trait
- `dailyBad` - mild negative expression of the trait
- `dailyWorst` - medium negative expression of the trait (we don't want to be too negative)

All fortunes: one sentence, one em dash allowed, no qualifying statements.

### Quality

- **Garden** - Neutral, Very Common
- **Market** - Good, Common
- **Stale** - Bad, Uncommon
- **Heirloom** - Best, Rare
- **Rotten** - Worst, Very Rare

### Compatibility

Scores across bean, flavour, form, and special - total -3 to +4.

- `getBeanCompatibility(a, b)` — 78 entries
- `getFlavourCompatibility(a, b)` — 15 entries
- `getFormCompatibility(a, b)` — 21 entries
- `getSpecialCompatibilityDetail(a, b)` — cross-attribute bonus; checks bean×flavour, bean×form, flavour×form (both orderings) against `SPECIAL_COMPATIBILITY`; returns `{ entry, attrA, attrB }` or `null`
- `getTotalCompatibility(metaA, metaB)` → `{ score, label, description }` from `TOTAL_COMPATIBILITY`

All lookups sort IDs alphabetically before joining as key. Special compatibility keys are the same format (e.g. `"adzuki-sweet"`, `"bitter-fermented"`).

### Data Architecture

Client props use `ZodiacSliceData` (beans + flavours + forms only) — not the full `ZodiacData`. Zodiac fortune content is fetched on demand via static JSON endpoints.

- **`ZodiacSliceData`** — `Omit<ZodiacData, "zodiacs">`. Built with `buildZodiacSliceData(beans, flavours, forms)`. Passed as props to all three interactive pages (~15KB vs ~720KB for full data).
- **`/api/zodiacs/[slug].json`** — 360 static JSON files, one per zodiac (~1.5KB each). Generated at build time from `src/pages/api/zodiacs/[slug].json.ts`.
- **`fetchZodiac(zodiacId)`** — fetches a single zodiac JSON file. Used by components at runtime.
- **`getDailyFortuneIds(date, personalSlug)`** — synchronous; returns `{ zodiacId, qualityId }` without needing the zodiacs dict. Pair with `getFortuneText(zodiac, qualityId)` after fetching.

**Per-page fetch strategy:**

- `/` default view: fetches one zodiac (current season) on mount for fortune + dish.
- `/` claimed view (`ClaimedBeanResult`): fetches seasonal zodiac + fortune zodiac in parallel on mount.
- `/wheel` (`ZodiacWheelContainer`): pre-fetches the zodiac immediately when user clicks "Discover the Bean Within" — data is ready before the 3.7s spin ends.
- `/compatibility`: no zodiac fetches — only bean/flavour/form display data needed.

### Claimed Bean & localStorage

The claimed bean slug is stored in localStorage under the key `bean-zodiac-claimed`. A `<script is:inline>` in `Layout.astro`'s `<head>` pre-reads it into `window.__claimedBean` before React hydrates, so components can initialise state synchronously (no post-mount flicker). Helpers in `src/lib/claimedBean.ts`: `getClaimedBeanSlug`, `setClaimedBeanSlug`, `clearClaimedBeanSlug`.

**Fortune history** — daily fortune entries stored under `bean-zodiac-fortune-history` as `FortuneEntry[]` (date, zodiacId, qualityId, text), newest first. Helpers in `src/lib/fortuneHistory.ts`: `getFortuneHistory`, `addFortuneToHistory`, `clearFortuneHistory`. Populated by `ClaimedBeanResult` on mount.

**Met beans** — set of encountered zodiac IDs stored under `bean-zodiac-met-beans` as `ZodiacId[]`, newest first. Helpers in `src/lib/metBeans.ts`: `getMetBeans`, `addMetBean`, `clearMetBeans`. Recorded in three places: `ClaimedBeanResult` (claimed bean + seasonal bean + daily fortune bean on mount), `ZodiacWheelContainer` (any discovered bean on spin). On first visit to `/beaniary`, backfills from fortune history if the key is absent. All three localStorage stores are wiped together when the user relinquishes their bean.

### Styling

Tailwind CSS 4 via `@tailwindcss/vite`. Per-element CSS hex colors for theming. Component-scoped styles in `.astro` files.
