# Rorschach style

The `rorschach*` fields in a zodiac's frontmatter drive the daily ritual's **Rorschach
variant** — a third option alongside facet and question. The user sees a warped composite
of the bean and its flavour/form emoji, and picks one of five "interpretations" of what
they see. The picked option's tier sets the day's quality and counts as Accept (+1),
exactly like the question variant.

## The image

Generated at build time by `scripts/build-rorschach.mjs`, one SVG per zodiac slug in
`public/images/rorschach/`, with high-resolution PNG masks baked from them by
`scripts/bake-rorschach.mjs` (`pnpm blots`, run manually). A composite of the bean and its
flavour/form emoji, distorted by a per-slug turbulence + displacement filter and flattened
to a hard-edged silhouette. The user is not meant to "see the bean" — they're meant to
project onto something ambiguous.

**The only thing rendered is black.** There is no white and no colour — the rest of the
frame is void, not a feature. Never write "a white channel", "white space" or "the white
reads as X". Describe the masses and the gaps between them.

**The blots are not mirror-symmetric.** There is no butterfly fold and no axis. Readings
built on symmetry — "two wings", "twin peaks", "a shape and its reflection" — describe an
image that is not on screen.

**Where it sits in the frame does not matter.** No "upper two-thirds", no "weighted low and
right". Describe the forms only.

What is actually rendered:

- **Hard-edged black.** No grey, no soft gradient, no midtones, no texture.
- **One of three gross layouts**: a single dense mass with a ragged edge; two masses side
  by side — sometimes joined by a thin neck, sometimes separated by a gap; or two masses
  **stacked**, one above the other, which reads very differently (a thing over a thing, a
  figure below something larger) and is worth using when it appears.
- **Recurring features worth naming**: small holes punched clean through the interior,
  detached specks flung clear of the main body, and an edge that alternates between
  finger-like spikes and rounded lobes. Some blots also have a **disintegrating fringe** —
  one flank breaking up into lace and loose flecks while the rest stays solid.
- **The gaps carry the picture too.** A clean oval hole reads as an eye or an egg, a channel
  between two masses as a seam, a bay bitten out of one side as a missing piece. Read them
  as holes and gaps in the black, not as white shapes of their own.

**Look at the actual blot before writing the readings.** The shape is seeded from the slug
and is genuinely different per zodiac, so the five interpretations must describe _this_
silhouette — not generic inkblot imagery. View the rendered blot directly at
`public/images/rorschach/<slug>.png`.

## Method

**Shape first, tiers second.** Write the silhouette down literally, then list what it
honestly offers — six or seven objects a person might blurt at it — and only then work out
which of those can carry the five tiers. Choosing from the trait ladder and back-filling a
shape justification produces sets that look nothing like the blot, and it is obvious to the
reader. Writing the description and the shortlist down, rather than holding them in your
head, is the step that keeps this honest; skip it and the sets quietly stop describing the
image.

**Assign Mid last.** Mid has the least trait pull, so it is where a plausible everyday noun
gets reached for instead of a reading — a teapot, a signpost, a locked diary, none of which
were on the page. Fill Most, High, Low and Least first, then give Mid the best *shape* read
still left on the shortlist.

**The blots are splotchy and asymmetrical; genuinely round ones are rare.** Before using a
spherical object — a ball, a globe, an orange, a bubble — go back to the outline and check
the blot really is round. Usually it isn't, and the organic reading (a fist, a brain, a
thistle, a heap of laundry) is truer. Boxes, cylinders, plates and other flat-sided things
are fine: seen at an angle they read as an irregular patch, which is what these shapes
mostly are.

**Nothing invisible is a reading.** A silhouette cannot show speed, temperature, smoke,
texture, sound, motion, history or what is underground. "A stone gathering pace", "a grate
barely warm", "a crater still smoking", "a bunker dug well in" and "a face refusing to
blink" are all non-readings — strip the invisible half and you are left with a lump.

## The five interpretations

Each `rorschach*` field is one short reading of the blot. The five together should feel
like things a person might _actually_ say when shown an inkblot, and all five must be
plausible readings of the **same actual shape**.

- **Order**, running `excess` → `trait` → `inverse`:
  - `rorschachMost` — aligns with `excess`: the trait at its fullest pitch (turned all the way up)
  - `rorschachHigh` — `trait`: leaning into the trait
  - `rorschachMid` — the trait at ordinary, unremarkable pitch
  - `rorschachLow` — leaning into the trait's absence or opposite
  - `rorschachLeast` — `inverse`: the opposite of the trait, strongest
- **Every reading maps the whole silhouette**, not one corner of it. If a reading accounts
  for the crest but leaves the body of the blot unexplained, it isn't a reading of this
  image.
- **Never the same or similar object twice in a set.** The commonest failure by far is one
  object dialled five ways — five ropes, five stones, five water surfaces, four fireplaces,
  four buried things. Aim for five different classes of thing: person, animal, food, tool,
  weather, and so on. The same goes across a batch of entries written together: ten entries
  must not become ten variants of one idea.
- **Reuse across the corpus is fine.** A reading already used by another zodiac can be used
  again, as long as it is an honest read of _this_ silhouette and earns _this_ tier. Two
  entries whose blots both genuinely look like an anvil should both say an anvil. Only
  repeats inside one set, or inside one batch, are a problem.
- **Mid is not a null.** "Just an image, no freight" makes the middle of every entry a dead
  slot. Give it the trait at everyday pitch, so the gradient stays continuous through the
  centre.
- **Each pole must reach its actual word.** "Plain and functional" is not philistine; "empty"
  is not sombre; "nothing there" is not thoughtless. Say the tier's word out loud and check
  the object earns it.
- **Most can be grand.** The excess pole is allowed to be big and barely literal — a void,
  a whirling miasma, an unknowable thing — where the other four stay grounded.
- Trait alignment lives in the _content_ of what's pictured, never in adjectives about it.

## Wording

- **Two to three words.** Strip participles and prepositional tails: "a burst pillow", not
  "down from a burst pillow"; "a birthday cake", not "a cake with candles"; "a beach
  bonfire", not "a bonfire on a beach".
- **Name a state, not an action.** "an unkempt mannequin", not "a wig slipping off"; "a
  cracked egg", not "an egg cracking open".
- **One object, not a relation between two.** "kitchen scales" beats "a chess player over
  the board"; "a couple of clams" beats "two rams butting heads".
- **Form**: a noun phrase. No leading verb. No `You...`. The user is describing what they
  see, not what they'd do.
- **No trailing full stops.**
- **Commit to a specific noun** — a heron, an anvil, a votive jug — rather than hedge-words
  like "a form", "a shape", "a mass", "two halves". Vague nouns read as wallpaper across 360
  entries.
  - **"a figure" and "a face" are allowed**, bare or qualified — "a hooded figure", "a stone
    face", "a figure in a doorway". They're what people genuinely say at an inkblot, and a
    blot often reads as a person or a face without resolving into anyone in particular.
  - **At the inverse pole, vagueness can be the content.** "nothing", "no idea", "a small
    mess", "something being eaten" all work where the tier means indifference or absence.
- Plurals and mass nouns are fine: "rocks", "chicken bones", "firecrackers", "chewing gum".
- **Homely beats composed.** "fried chicken", "a cheese pull", "a bag of chips", "a smoker's
  lungs" land better than a carefully built tableau.
- **Keep the vocabulary generally knowable.** Use words a person would reach for on the spot,
  and prefer the commoner one — a tornado over a dervish, a teatowel over a hankie. No terms
  that send the reader to a dictionary.
