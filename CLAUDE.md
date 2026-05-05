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

|        | boiled  | dried        | fermented | fried       | roasted     | smoked    |
| ------ | ------- | ------------ | --------- | ----------- | ----------- | --------- |
| bitter | Infused | Desiccated   | Cultured  | Scorched    | Wood-Fired  | Charcoal  |
| sour   | Brined  | Dehydrated   | Pickled   | Agrodolce   | Chimichurri | Cured     |
| spicy  | Braised | Sichuan      | Kimchi    | Red-Hot     | Peri-Peri   | Chipotle  |
| sweet  | Candied | Crystallised | Funky     | Caramelised | Glazed      | Barbecued |
| umami  | Dashi   | Aged         | Miso      | Tempura     | Rendered    | Hickory   |

### Content Collections

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
- `/me` — claimed bean's full zodiac page + Spirit Bean radar charts (see below).
- `/beans/`, `/beans/[slug]`, `/flavours/`, `/flavours/[slug]`, `/forms/`, `/forms/[slug]`, `/zodiacs/[slug]`

### Daily Fortunes

Each zodiac has one `seasonalFortune` and three daily fortunes keyed to quality:

- `dailyMid` - mild positive expression of the trait
- `dailyHigh` — stronger positive expression of the trait
- `dailyMost` — best positive expression of the trait
- `dailyLow` - mild negative expression of the trait
- `dailyLeast` - medium negative expression of the trait (we don't want to be too negative)

The daily fortune that is selected is influenced by the user's claimed/spirit bean, the current season, and a random daily bean.

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
- **`getDailyFortuneIds(date, personalSlug)`** — synchronous; returns `{ zodiacId, qualityId }` without needing the zodiacs dict. Pair with `getFortuneText(zodiac, qualityId)` after fetching. Stale and Rotten fortunes show negative text; resonance votes are inverted for Spirit Bean scoring.

**Per-page fetch strategy:**

- `/` default view: fetches one zodiac (current season) on mount for fortune + dish.
- `/` claimed view (`ClaimedBeanResult`): fetches seasonal zodiac + fortune zodiac in parallel on mount.
- `/wheel` (`ZodiacWheelContainer`): pre-fetches the zodiac immediately when user clicks "Discover the Bean Within" — data is ready before the 3.7s spin ends.
- `/compatibility`: no zodiac fetches — only bean/flavour/form display data needed.

### Claimed Bean & localStorage

The claimed bean slug is stored in localStorage under the key `bean-zodiac-claimed`. A `<script is:inline>` in `Layout.astro`'s `<head>` pre-reads it into `window.__claimedBean` before React hydrates, so components can initialise state synchronously (no post-mount flicker). Helpers in `src/lib/claimedBean.ts`: `getClaimedBeanSlug`, `setClaimedBeanSlug`, `clearClaimedBeanSlug`.

**Fortune history** — daily fortune entries stored under `bean-zodiac-fortune-history` as `FortuneEntry[]` (date, zodiacId, qualityId, text, score), newest first. `score`: 0 = no vote, +1 = thumbs up, -1 = thumbs down. Helpers in `src/lib/fortuneHistory.ts`: `getFortuneHistory`, `addFortuneToHistory`, `updateFortuneScore`, `clearFortuneHistory`. `ClaimedBeanResult` shows "Accept" / "Resist" buttons below the daily fortune; vote is toggleable.

**Met beans** — set of encountered zodiac IDs stored under `bean-zodiac-met-beans` as `ZodiacId[]`, newest first. Helpers in `src/lib/metBeans.ts`: `getMetBeans`, `addMetBean`, `clearMetBeans`. Recorded in three places: `ClaimedBeanResult` (claimed bean + seasonal bean + daily fortune bean on mount), `ZodiacWheelContainer` (any discovered bean on spin). On first visit to `/beaniary`, backfills from fortune history if the key is absent. All three localStorage stores are wiped together when the user relinquishes their bean.

### Spirit Bean (`/beanstalk`)

Three SVG radar charts (flavour, form, bean) showing affinity scores. Rendered by `SpiritBeanRadar.tsx` (custom SVG, no library). Score computation in `spiritBean.ts`:

- Baseline: all attributes start at 8.
- Claimed bean's flavour/form/bean each get +4.
- Each accepted fortune adds +1 to that zodiac's flavour, form, and bean; thumbs-down subtracts 1.
- Heirloom/rotten qualities apply 2× magnitude; stale/rotten negate the adjustment.
- Charts auto-scale to max value (floor 16). Labels use per-attribute CSS color variables.

### The Beanstalk (`/beanstalk`, below Spirit Bean)

A scrollable vertical timeline showing how the Spirit Bean has shifted across seasons. Rendered by `Beanstalk.tsx`.

- **Nodes**: all fortune history entries become nodes (scored or not). `score !== 0` → Accepted/Resisted pill; `score === 0` → grey Ignored pill.
- **Year filter**: bean year badges above the timeline (e.g. "Sweet Butter Bean 2026"). Defaults to the current bean year on load; cannot be deselected, only switched.
- **Left panel**: sticky, `h-svh`, shows the spirit zodiac name (via `ZodiacName`) and three stacked radar charts that animate (JS lerp via `requestAnimationFrame`) to the cumulative Spirit Bean scores at the active node.
- **Right panel**: scrollable timeline with a vertical line (dark blue base, bright blue fill tracking scroll position). Fortune cards show the fortune zodiac name, badges, fortune text, and a scored/ignored pill. Season headers are included.
- **Scroll tracking**: window scroll listener advances the active node when an element's top crosses 60% of the viewport; the fill bar height is updated directly via ref.
- **Data**: `buildBeanstalkNodes(claimedSlug)` in `spiritBean.ts` builds the node list (all history, sorted ascending). `computeSpiritBeanScoresUpTo(claimedSlug, cutoffDateStr)` computes cumulative scores at a given date.

### Styling

Tailwind CSS 4 via `@tailwindcss/vite`. Per-element CSS hex colors for theming. Component-scoped styles in `.astro` files.
