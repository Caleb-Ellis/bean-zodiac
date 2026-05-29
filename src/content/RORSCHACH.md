# Rorschach style

The `rorschach*` fields in a zodiac's frontmatter drive the daily ritual's **Rorschach
variant** — a third option alongside facet and question. The user sees a warped,
mirrored composite of the bean and its flavour/form emoji, and picks one of five
"interpretations" of what they see. The picked option's tier sets the day's quality and
counts as Accept (+1), exactly like the question variant.

## The image

Generated at build time by `scripts/build-rorschach.mjs`, one SVG per zodiac slug in
`public/images/rorschach/`. Mirrored around the vertical axis, distorted by a per-slug
turbulence + displacement filter, desaturated toward inky black. The user is not meant to
"see the bean" — they're meant to project onto something ambiguous.

## The five interpretations

Each `rorschach*` field is one short reading of the blot. The five together should feel
like things a person might _actually_ say when shown an inkblot — small, concrete nouns
and shapes, not abstractions.

- **Order**, given a trait:
  - `rorschachMost` — most trait-expressed reading
  - `rorschachHigh` — leaning into the trait
  - `rorschachMid` — most neutral, the "just an image" reading
  - `rorschachLow` — leaning into the trait's opposite
  - `rorschachLeast` — the opposite of the trait, strongest
- **Tone**: mostly nonsense. Four of five should read as plausible visual readings with
  no obvious trait freight. The trait-aligned one nudges the reading toward the trait
  expression at that tier without naming it.
- **Form**: a noun phrase or short clause. No leading verb. No `You...`. The user is
  describing what they see, not what they'd do.
- **Length**: short. Six to ten words is the target.
- **No trailing full stops.**
- Trait alignment lives in the _content_ of what's pictured, not in adjectives about it.
