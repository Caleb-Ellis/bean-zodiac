# Rorschach style

The `rorschach*` fields in a zodiac's frontmatter drive the daily ritual's **Rorschach
variant** — a third option alongside facet and question. The user sees a warped,
mirrored composite of the bean and its flavour/form emoji, and picks one of five
"interpretations" of what they see. The picked option's tier sets the day's quality and
counts as Accept (+1), exactly like the question variant.

## The image

Generated at build time by `scripts/build-rorschach.mjs`, one SVG per zodiac slug in
`public/images/rorschach/`. A mirror-symmetric composite of the bean and its flavour/form
emoji, distorted by a per-slug turbulence + displacement filter and desaturated toward
inky black. Most blots fold left/right (the classic butterfly); the ~half that are rotated
90° before distortion fold top/bottom instead. The user is not meant to "see the bean" —
they're meant to project onto something ambiguous.

**Look at the actual blot before writing the readings.** The shape is seeded from the slug
and is genuinely different per zodiac, so the five interpretations must describe _this_
silhouette — not generic inkblot imagery. View the rendered blot directly at
`public/images/rorschach/<slug>.png`. `RORSCHACH_PROMPT.md` is a ready-to-use prompt for
doing this one slug at a time.

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
  - `rorschachLow` — `inverse`: leaning into the trait's opposite
  - `rorschachLeast` — `inverse`: the opposite of the trait, strongest
- **Tone**: mostly nonsense. Four of five should read as plausible visual readings with
  no obvious trait freight. The trait-aligned one nudges the reading toward the trait
  expression at that tier without naming it.
- **Form**: a noun phrase or short clause. No leading verb. No `You...`. The user is
  describing what they see, not what they'd do.
- **Length**: short. Six to ten words is the target.
- **No trailing full stops.**
- Trait alignment lives in the _content_ of what's pictured, not in adjectives about it.
- **Commit to a specific noun.** Name the actual thing seen — a heron, an anvil, a votive
  jug — never hedge-words like "a form", "a shape", "a mass", "a lump", or
  "two forms". Vague nouns read as wallpaper across 360 entries; the specific noun is what
  makes a reading feel like a real person free-associating.
- **Stay mostly plain, with a faint uncanny tint.** The default is everyday concrete nouns —
  a heron, an anvil, a jug, a hound. This is a divination cosmology, so a _light_ folkloric
  colour is welcome, but sparingly: think **at most one** of the five per blot carrying any
  fantastical charge, and even that kept gentle (a "sentinel" stone, a hound at a "shrine"),
  not a fantasy bestiary (no sphinx/dragon/golem/hydra in every line). If most lines read as
  myth, you've overshot — dial back to plain nouns. `rorschachMid` is always the most mundane
  of the five.
- **Keep the vocabulary generally knowable.** Use words a person would actually reach for on
  the spot. No terms that send the reader to a dictionary (no "menhir", "wyvern", "psaltery").
  If a plainer word works — "standing stone" not "menhir" — use it.
