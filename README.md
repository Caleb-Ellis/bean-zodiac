# Bean Zodiac

A playful Chinese zodiac analog using beans. **12 beans × 5 flavours × 6 forms = 360-combination cycle.**

## Commands

```bash
pnpm dev          # build content + start Vite dev server
pnpm build        # build content + type-check + Vite production build
pnpm preview      # preview production build
pnpm content      # build markdown → JSON (runs automatically before dev/build)
pnpm blots        # regenerate blot SVGs + bake PNG masks (manual, see Rorschach)
pnpm blots:build  # SVGs only
pnpm blots:bake   # PNG masks only (needs the SVGs to exist)
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

### How bean, flavour and form relate

The three axes are independent and each carries its own character, expressed the same way: five `positiveTraits` and two `negativeTraits`. The **bean** is who you are (plus a `role` — "The Reveler", "The Sentinel"), the **flavour** is the temper the season is taken in, the **form** is how the bean is worked on. Their prose bodies follow the same three-beat shape: what the thing is, what it gives, and — always last — its shadow.

A zodiac is one cell of the 12 × 5 × 6 grid, and it is **authored, not derived**. Nothing in the build combines the parents' trait lists into the child; a zodiac names its own triple in frontmatter:

- **`trait`** — the virtue this combination lands on (`ceremonious`, `laconic`, `unruffled`)
- **`excess`** — the same quality overdone (`pompous`, `monosyllabic`, `impassive`)
- **`inverse`** — its opposite (`offhand`, `garrulous`, `agitated`)

That triple is the spine of the whole entry. Every five-slot gradient — `facet*`, `fortune*`, `question`'s `answer*`, and `rorschach*` — runs the same axis: **Most** = excess, **High** = trait, **Mid** = neutral, **Low** = the trait's absence, **Least** = inverse. So a tier means the same thing in every ritual variant, and the quality tier the user lands on is a position on that one axis.

The parents' own trait lists aren't decoration: they're what a zodiac's triple should read as a plausible collision of, and the season-summary copy speaks in their vocabulary without naming the bean, flavour or form outright. The build also flattens `trait` alone to `src/data/generated/zodiac-traits.json` for synchronous lookup.

### Content

Markdown lives in `src/content/`. The build script (`scripts/build-content.mjs`) converts it to JSON in `src/data/generated/` and copies zodiac files to `public/api/zodiacs/` so `fetchZodiac()` works unchanged at `/api/zodiacs/{slug}.json`.

- **`beans/`** — 12 files (slug, name, role, tagline, positiveTraits[], negativeTraits[], imageFile)
- **`flavours/`** — 5 files (slug, name, tagline, positiveTraits[], negativeTraits[])
- **`forms/`** — 6 files: boiled, dried, fermented, fried, roasted, smoked (slug, name, tagline, positiveTraits[], negativeTraits[])
- **`zodiacs/`** — 360 files, filename `{flavour}-{form}-{bean}.md`, frontmatter: slug, lastUpdated, bean, flavour, form, the `trait`/`excess`/`inverse` triple (see above), creature, dish, quote, seasonalFortune, facet\*/fortune\* gradient (Most/High/Mid/Low/Least), the `friendlyBeans`/`antiBeans`/`antiTriple`/`friendlyForm`/`antiForm` spirit tags for spirit-bean scoring, `question` + `answerMost/High/Mid/Low/Least` for the question-variant ritual, and `rorschachMost/High/Mid/Low/Least` for the rorschach-variant ritual (see `STYLE.md` for body voice, `QUESTIONS.md` for question/answer voice, `RORSCHACH.md` for rorschach voice, `SPIRIT_TAGS.md` for tagging).

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

Each zodiac also carries **spirit tags** — `friendlyBeans`/`antiBeans` (2 beans each), `friendlyForm`/`antiForm` (one id each), and `antiTriple` (a zodiac slug). These form two symmetric **poles**: the friendly pole is the zodiac's own slug + `friendlyBeans` + `friendlyForm`; the anti pole is `antiTriple` + `antiBeans` + `antiForm`. `antiTriple` is the zodiac's *shadow* — itself a real `{flavour}-{form}-{bean}` slug, built from the most-opposed flavour, form and bean — so the anti pole carries a flavour exactly as the friendly pole does, with no separate flavour tag needed. None of the anti fields may be the zodiac's own bean/form/flavour, and the anti-triple's bean/form are barred from `antiBeans`/`antiForm`, so each pole covers 3 distinct beans and 2 distinct forms. These drive the scoring pass on the Beanstalk (see Spirit Bean below) — they don't affect which fortune is shown. They are generated in bulk by `scripts/generate-spirit-tags.py` (never hand-edited), and `build-content.mjs` fails the build if any are missing or invalid. See `SPIRIT_TAGS.md` for the full mechanism.

The daily fortune selected is influenced by the user's claimed/spirit bean, the current season, and a random daily bean.

#### Ritual variants

The dialog comes in three variants. The fortune slug, its quality tier and its variant are all rolled together, deterministically per day, by a single entry point — `getDailyRitual(date, spiritSlug, seenRituals, recentSlugs)` in `src/lib/fortune.ts`. The variant is weighted out of 7: facet 4/7, question 2/7, rorschach 1/7 (the base roll is exposed standalone as `getVariantForSlug`).

- **Facet variant** — user reads the rolled facet text and clicks Accept (+1) or Resist (−1). Quality is rolled.
- **Question variant** — user reads `question` and picks one of five answers (`answerMost`..`answerLeast`). The answer locks `qualityId` to its tier and counts as Accept (+1). No Ignore/Resist.
- **Rorschach variant** — user is shown the zodiac's inkblot ("What do you see?") and picks one of five readings (`rorschachMost`..`rorschachLeast`). Like the question variant, the pick locks `qualityId` to its tier and counts as Accept (+1).

The variant downgrades to facet for any zodiac that lacks the optional `question`/`rorschach*` fields, so the question and rorschach variants roll out gradually as zodiacs are authored.

**Lifetime ritual-uniqueness** — a user can never receive the same _ritual_ twice. A ritual's identity (`ritualKey`) is the fortune slug plus its variant, and — for the facet variant only — the rolled tier (question/rorschach tiers are the user's answer, not part of the ritual). The hook builds `seenRituals` from every past `fortuneHistory` entry and `getDailyRitual` re-rolls the whole slug/tier/variant triple until it produces a key never seen before (a softer `recentSlugs`/`FORTUNE_REPEAT_WINDOW` slug window still layers on for near-term variety). The ritual space is 360 slugs × (facet ×5 tiers + question + rorschach) = **2,520**, so no repeat occurs until the full space is exhausted (~6.9 years of daily use). The re-roll's attempt 0 uses the unperturbed day seed, so days with no collision are byte-for-byte identical to the pre-uniqueness roll, and because the seen set is drawn only from immutable past entries the result stays deterministic across reloads.

The inkblots are SVGs generated by `scripts/build-rorschach.mjs` into `public/images/rorschach/{slug}.svg`. Each is a mirror-symmetric blot composed from the bean image plus flavour/form emoji, warped by a seeded `feTurbulence`/`feDisplacementMap` filter. All geometry is seeded from the slug hash, so blots are stable across rebuilds. Two further seeded 50/50 transforms vary the composition: a vertical flip of the finished blot (turns it upside down), and a 90° rotation applied *inside* the filter, before the displacement — so the noise warps the rotated composition. The rotation also swaps the symmetry axis: un-rotated blots fold left/right (the classic butterfly), rotated ones fold top/bottom. Regenerate with `node scripts/build-rorschach.mjs`.

To eyeball a blot the way a browser renders it (Inkscape and other headless rasterizers get the filter chain wrong), `pnpm preview:blot <slug>` serves `public/` and screenshots it in headless Chrome to a PNG. `--mode ink` gives a flat black silhouette on white (best for "what do you see?" free-association); the default `--mode mask` shows the gradient revealed through the blot as the app does. e.g. `pnpm preview:blot spicy-fried-kidney --mode ink --out /tmp/blot.png`.

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

All persistent bean data lives in a single Zustand store (`src/store/index.ts`) under the `bean-zodiac` localStorage key.

- **claimed** (`ClaimedBean | null`, shape `{ id: ZodiacId, on: YYYY-MM-DD }`) — the user's claimed zodiac. Set via `setClaimed(id)`.
- **fortuneHistory** (`FortuneEntry[]`) — daily entries `{ date, zodiacId, qualityId, score, ritualType, ritualTitle, ritualPrompt, ritualResponse, fortuneText }`, newest first. `score`: 0 = no vote, +1 = accepted, -1 = resisted. `qualityId` is the resolved tier: the rolled one for facet entries, the answered one for question/rorschach entries (where `score` is always +1). All three ritual types share one shape — what the ritual put to the user is `ritualPrompt`, what they gave back is `ritualResponse`:

  | ritualType | ritualTitle | ritualPrompt | ritualResponse      |
  | ---------- | ----------- | ------------ | ------------------- |
  | facet      | facet title | the facet    | — (the score is it) |
  | question   | —           | the question | the chosen answer   |
  | rorschach  | —           | — (the blot) | the chosen reading  |

- **metBeans** (`MetBeans`, shape `{ [ZodiacId]: { [QualityId]: true } }`) — which zodiacs have been encountered, and at which tiers. A scored fortune records the tier it resolved to (`persistFortune`, the only writer for the fortune bean); every other encounter — claimed, seasonal, revealed on the wheel, the spirit bean — records the neutral Garden tier. This drives the reveal gating on a zodiac's page (see below).
- **lastSeasonSeen** (`string | null`) — season key last acknowledged; **seasonSummaries** (`SeasonSummary[]`) — persisted recaps `{ seasonKey, observations }`, newest first.

`relinquish()` resets the whole persisted state at once.

The store keeps only what is user-generated or a deliberate snapshot of what the user was shown. Anything that is a pure function of the surviving fields is derived at the read site instead of stored: the rorschach mask path (`/images/rorschach/{zodiacId}.png`, in `buildBeanstalkNodes`), and a summary's closing/incoming bean ids (`seasonZodiacsForKey`, from the calendar). The zodiac copy fields are the exception — they are only recoverable via the async per-slug `fetchZodiac`, and the Beanstalk renders history synchronously.

UI preferences live separately in `src/store/ui.ts` under `bean-zodiac-ui` (currently just **radarExpanded**, the Beanstalk mobile radar-panel expansion), so exports and `relinquish()` cover bean data only.

**Backup** (`src/lib/backup.ts`, surfaced on `/me`) — `exportData()` downloads the `bean-zodiac` blob verbatim; `importData(text)` validates it (top-level `version` not newer than `STORE_VERSION`, plus a shape check on `claimed`, `fortuneHistory`, `metBeans` and `seasonSummaries`) and writes it back verbatim, so the `persist` migrate chain runs on the next rehydration.

**Reveal gating** (`ZodiacDetail.tsx`) — how much of a zodiac's page is legible depends on the tiers in `metBeans[id]`. Meeting it **well-cooked** (garden/market) opens everything. Otherwise the quote, body copy and dish are withheld and replaced by a single line — _"You've never met the …"_ if there are no tiers at all, _"You don't know the … very well"_ if it has been met at some other tier — while the trait table always shows, each row revealed only by the tiers at its own end of the spectrum: Undercooked by rotten/stale, Well-Cooked by garden/market, Overcooked by heirloom. Unrevealed rows read `???`.

### Spirit Bean & Beanstalk (`/beanstalk`)

**Spirit Bean** — three SVG radar charts (flavour, form, bean) showing affinity scores. Rendered by `SpiritBeanRadar.tsx`. Score computation in `spiritBean.ts`:

- Baseline: all attributes start at 10. Claimed bean's flavour/form/bean each get +10.
- The model is **asymmetric in direction, symmetric in shape**: Accept is the strong signal and only ever *adds*; Resist only ever *subtracts*. Each zodiac has two **poles**, and a tier decides which one a choice moves:
  - **friendly pole** = the zodiac's own slug + `friendlyBeans` (2) + `friendlyForm` (1) — moved by "good" tiers (Heirloom/Market/Garden).
  - **anti pole** = `antiTriple` + `antiBeans` (2) + `antiForm` (1) — moved by "bad" tiers (Stale/Rotten).
- Both poles score identically (`ACCEPT_RULES`/`RESIST_RULES` in `computeSpiritBeanScores`), so the anti pole mirrors the friendly one rather than being a weaker special case. Each rule is a **triple** delta on that pole's flavour/form/bean plus a **soft** delta on its 2 beans + 1 form:

  | tier | Accept (triple / soft) | Resist (triple / soft) |
  | --- | --- | --- |
  | Heirloom | +4 / +2 | −2 / −1 |
  | Market | +3 / +1 | −1 / −1 |
  | Garden | +2 / +1 | −1 / 0 |
  | Stale | +2 / +1 | −1 / 0 |
  | Rotten | +3 / +1 | −2 / −1 |

  Because `antiTriple` carries a flavour, bad tiers move the flavour ring too — the friendly and anti poles are fully equivalent. Magnitudes are full (un-halved) across beans, flavour, and form.
- Question/rorschach answers always count as Accept; the picked tier becomes the day's `qualityId`. Rorschach answers count at half — both triple and soft deltas are halved, rounded toward the choice's sign so a non-zero rule always keeps a minimal nudge.
- Tags are **looked up by `zodiacId`** from `src/data/generated/spirit-tags.json` (imported synchronously). History entries used to carry a `spiritTags` snapshot; nothing ever read it (the tags are a pure function of the zodiac, so a snapshot could only ever be a stale copy) and it is gone as of store v7 — this way the tag model can change shape without migrating stored history. Trade-off: regenerating tags retroactively re-scores past entries.
- There is no longer any neighbour bleed — the `SPIRIT_*_RING` arrays are purely radar-chart point ordering now, not scoring adjacency. Charts auto-scale to max value (floor 16).

**Beanstalk** — scrollable vertical timeline of fortune history. Left panel: sticky, shows spirit zodiac + radar charts that lerp to cumulative scores at the active node. Right panel: scrollable timeline with a scroll-tracked fill bar. Year filter defaults to current bean year.

### Season Summary

When a Form season turns over (every 2 months), an engaged user gets a one-time recap of who they became — `SeasonSummaryDialog.tsx`, built by `getSeasonSummary(date, lastSeasonSeen)` in `src/lib/seasonSummary.ts`. It's shown at most once per season (guarded by `lastSeasonSeen`) and the rendered `observations` are snapshotted onto the persisted `SeasonSummary` (in `seasonSummaries`), so the Beanstalk marker always shows exactly what the user was told even if the generators change.

All copy/order is seeded from the closing season's start date, so a given season always renders identically. Richness scales with engagement (`fortuneHistory` entries in that season window): under 7 → a single faint line; 7–13 → the single most **salient** drift observation; 14+ → the three highest-salience observations (shuffled) plus a pinned closing **bridge** line.

- **Observations** are candidate lines each carrying a normalised salience, drawn from: spirit drift toward / away from the most- and least-moved attributes (`computeSpiritBeanScores` before vs after the window), the facet Accept/Resist lean (open / closed / balanced), and where the accepted quality tiers cluster (rarity-weighted).
- **Bridge** compares the claimed zodiac against the season-drift zodiac (the max-delta attribute in each ring) with three framings by divergence: same (drift reinforced you), near (< 20 pts), far (≥ 20 pts).
- **Traits** for the dialog header/footer and bridge come from `src/data/generated/zodiac-traits.json` — a flat `zodiacId → trait` index emitted by `build-content.mjs` for synchronous lookups (the full zodiac JSON is otherwise only fetched async).

### Styling

Tailwind CSS 4. Per-element CSS hex colors for theming. Form visual effects use SVG filter `<defs>` rendered once at root via `FormFilters.tsx`.
