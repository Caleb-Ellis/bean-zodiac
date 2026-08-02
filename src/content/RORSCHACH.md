# Rorschach style

The `rorschach*` fields in a zodiac's frontmatter drive the daily ritual's **Rorschach
variant** — a third option alongside facet and question. The user sees a warped,
mirrored composite of the bean and its flavour/form emoji, and picks one of five
"interpretations" of what they see. The picked option's tier sets the day's quality and
counts as Accept (+1), exactly like the question variant.

## The image

Generated at build time by `scripts/build-rorschach.mjs`, one SVG per zodiac slug in
`public/images/rorschach/`, with high-resolution PNG masks baked from them by
`scripts/bake-rorschach.mjs` (`pnpm blots`, run manually). A composite of the bean and its
flavour/form emoji, distorted by a per-slug turbulence + displacement filter and flattened
to a hard-edged silhouette. The user is not meant to "see the bean" — they're meant to
project onto something ambiguous.

**The blots are not mirror-symmetric.** There is no butterfly fold and no axis. Readings
built on symmetry — "two wings", "twin peaks", "a shape and its reflection" — describe an
image that is not on screen. What is actually rendered:

- **Pure black on white, hard-edged.** No grey, no soft gradient, no midtones.
- **One of three gross layouts**: a single dense mass with a ragged edge; two masses side
  by side — sometimes joined by a thin neck, sometimes split by a channel of white; or two
  masses **stacked vertically**, one above the other, which reads very differently (a thing
  over a thing, a figure below something larger) and is worth using when it appears.
- **Off-centre**, usually weighted right and low, leaving empty white at the top-left.
- **Recurring features worth naming**: small holes punched clean through the interior,
  detached specks flung clear of the main body, and an edge that alternates between
  finger-like spikes and rounded lobes. Some blots also have a **disintegrating fringe** —
  one flank breaking up into lace and loose flecks while the rest stays solid.
- **The white is readable too.** On many blots the negative space carries the picture: a
  clean oval hole reads as an eye, a channel between two masses as a gap or a path, a bay
  bitten out of one side as a cove or a missing piece. Don't restrict the reading to the
  black.

**Look at the actual blot before writing the readings.** The shape is seeded from the slug
and is genuinely different per zodiac, so the five interpretations must describe _this_
silhouette — not generic inkblot imagery. View the rendered blot directly at
`public/images/rorschach/<slug>.png`.

## The five interpretations

Each `rorschach*` field is one short reading of the blot. The five together should feel
like things a person might _actually_ say when shown an inkblot — small, concrete nouns
and shapes, not abstractions — and crucially, all five must be plausible readings of the
**same actual shape**. The tier difference is _which_ reading of that one silhouette you
offer and its emotional temperature, not a switch to an unrelated picture.

- **Order**, running `excess` → `trait` → `inverse`:
  - `rorschachMost` — aligns with `excess`: the trait at its fullest pitch (turned all the way up)
  - `rorschachHigh` — `trait`: leaning into the trait
  - `rorschachMid` — most neutral, the "just an image" reading
  - `rorschachLow` — `trait`: leaning into the trait's absence or opposite
  - `rorschachLeast` — `inverse`: the opposite of the trait, strongest
- **Tone**: mostly nonsense. Four of five should read as plausible visual readings with
  no obvious trait freight. The trait-aligned one nudges the reading toward the trait
  expression at that tier without naming it.
- **Form**: a noun phrase or short clause. No leading verb. No `You...`. The user is
  describing what they see, not what they'd do. **Prefer the plainest shape that works —
  a simple `a {adjective} {noun}` ("a seated monk", "a brilliant fountain") over a longer
  clause with participles, prepositions, or a trailing "mid-ring" / "spreading wide"
  qualifier.** Reach for the longer form only when no single adjective carries the reading;
  the extra words should earn their place, not decorate.
- **Length**: short. Two to five words is the target; the bare `a {adjective} {noun}` is
  ideal.
- **No trailing full stops.**
- Trait alignment lives in the _content_ of what's pictured, not in adjectives about it.
- **Commit to a specific noun.** Name the actual thing seen — a heron, an anvil, a votive
  jug — never hedge-words like "a form", "a shape", "a mass", "a lump", or
  "two forms". Vague nouns read as wallpaper across 360 entries; the specific noun is what
  makes a reading feel like a real person free-associating. Don't be afraid to reach for fantastical or abstract imagery if it fits better than a concrete, real-life noun.
- **Keep the vocabulary generally knowable.** Use words a person would actually reach for on
  the spot. No terms that send the reader to a dictionary.
  If a plainer word works — use it.
