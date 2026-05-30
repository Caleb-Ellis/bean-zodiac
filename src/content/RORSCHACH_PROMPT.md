# Rorschach rewrite prompt

A ready-to-use prompt for an LLM to look at a generated inkblot and rewrite one zodiac's
`rorschach*` frontmatter to match the shape it actually sees. Run it one slug at a time —
the "look at the real image" step is the whole point and doesn't batch. Replace `<SLUG>`
throughout (e.g. `spicy-fried-kidney`). See `RORSCHACH.md` for the full voice guide.

---

You are interpreting a Rorschach inkblot and rewriting one zodiac's `rorschach*`
frontmatter to match the shape you actually see.

## Context

This is the `bean-zodiac` project. Each zodiac has five `rorschach*` frontmatter fields
shown to a user as five "interpretations" of an inkblot they're looking at. **Right now
these readings were written blind — they have nothing to do with the actual shape of the
generated inkblot.** Your job is to fix that: look at the real image, then rewrite the
five readings so they're genuinely things a person might say when shown _this specific
blot_, while preserving the trait-tier structure below.

## Target

Slug: **<SLUG>**

The file is `src/content/zodiacs/<SLUG>.md`. Read it first to get its `trait`, `bean`,
`flavour`, `form`, and current `rorschach*` values.

## Step 1 — Look at the blot

Do these two actions immediately, no preamble:

1. **Render both versions** in one shell call (from the repo root):
   ```bash
   pnpm preview:blot <SLUG> --mode ink --out /tmp/blot-<SLUG>.png && pnpm preview:blot <SLUG> --out /tmp/blot-<SLUG>-mask.png
   ```
   This is pre-approved for any slug (`Bash(pnpm preview:blot:*)` in `.claude/settings.local.json`),
   so it won't prompt — just run it.
2. **View the PNG with the Read tool** — `Read /tmp/blot-<SLUG>.png`. You must actually look
   at the image; the readings are worthless if written without seeing it. The `--mode ink`
   file is a flat black silhouette (the pure shape, what matters most); the `-mask` file is
   the colour version, useful for distinguishing regions.

The blot is mirror-symmetric (left/right for most; top/bottom for the ~half rotated 90°).
Describe to yourself, concretely, the **2–4 things this shape could be** — small concrete
nouns and creatures, the way people really free-associate on inkblots (a moth, a horned
mask, two dancers, a pelvis, a beetle). Note distinct regions (top vs. bottom, the central
seam, the outer wings); different readings can latch onto different parts.

## Step 2 — Rewrite the five readings

Read `src/content/RORSCHACH.md` and follow it exactly. Key rules:

- Five fields, ordered by how strongly they express the zodiac's **`trait`**:
  - `rorschachMost` — most trait-expressed reading
  - `rorschachHigh` — leaning into the trait
  - `rorschachMid` — the most neutral "just an image" reading
  - `rorschachLow` — leaning into the trait's _opposite_
  - `rorschachLeast` — the opposite of the trait, strongest
- **Every one of the five must plausibly be a reading of THIS blot's actual shape.** This
  is the whole point. They are five different things _this silhouette_ could be — not five
  unrelated images. The tier difference is in _which_ reading of the same shape you offer
  and its emotional temperature, not in switching to an unrelated picture.
- **This includes `rorschachLow` and `rorschachLeast`.** "Opposite of the trait" means the
  reading leans away from the trait in _tone/posture_, NOT that it stops describing the blot.
  All five must still match the silhouette if you squint — Low/Least are the _same shape_
  read in an anti-trait way, never a shape the blot doesn't have. If a two-mass blot, even
  Least must show two masses; if a horned head, even Least is still describes something like a horned head. A
  Low/Least that contradicts the actual shape is wrong and must be rewritten.
- The trait is expressed through _what is pictured_, never through adjectives about it.
  Four of the five should read as plausible neutral visual readings; only the trait-aligned
  ends nudge toward the trait (and its opposite) through content.
- Noun phrase or short clause. No leading verb. No "You...". 6–10 words. No trailing full
  stop.
- **Commit to a specific noun**, never hedge-words ("a figure", "a form", "a shape", "a
  mass", "a lump", "two forms"). Name the actual thing — a heron, an anvil, a votive jug.
- **Stay mostly plain, with a faint uncanny tint.** Default to everyday concrete nouns (a
  heron, an anvil, a jug). A light folkloric colour suits the divination register, but
  sparingly — at most one of the five carries any fantastical charge, and even that kept
  gentle, not a fantasy bestiary (no sphinx/dragon/golem/hydra per line). If most lines read
  as myth, dial back. `rorschachMid` is always the most mundane of the five.
- **Keep the vocabulary generally knowable** — words a person would actually say on the spot,
  nothing that sends the reader to a dictionary (no "menhir", "wyvern"). Plainer is better:
  "standing stone" not "menhir".

## Step 3 — Apply

Edit only the five `rorschach*` lines in `src/content/zodiacs/<SLUG>.md`. Change nothing
else. Do not touch generated files.

Then briefly report: what you saw in the blot, and how each of the five readings maps to
that shape and to the trait tier.
