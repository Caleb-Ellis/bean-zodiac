# Writing Fortunes

The five `fortune*` fields per zodiac entry. A fortune is one line of a **zodiac**,
drawn one a day for months — so the corpus is read _serially_. The craft is making
consecutive draws feel like different weather, not one line rephrased. **Vary the
shape, not just the words.**

**Clarity beats cleverness.** Every fortune must land on one read — plain and
easily understood, never a riddle to decode. Terse is good; terse-and-cryptic is
not. If a line trades legibility for compression or a clever turn, rewrite it
plainer.

## Four registers, roughly even

Mix all four across the five lines; let no one register dominate.

- **Omen** — foretell, name a sign, set a bare image. _Speaks the day._
  ("A loud arrival is on the wind.")
- **Move** — a quiet, warm nudge: speak or stay quiet, hold or let go. _Meets the
  day._ ("Say it low.")
- **Statement** — flat recognition, no image or instruction. It states a
  condition of the world the reader will recognise, never a fact about them:
  "A quiet night counts too", not "You've been putting it off."
- **Maxim** — an impersonal general truth. ("Quiet isn't the same as absent.")
  The trait lives in _which_ distinction gets drawn; it must imply this bean even
  though it never says "you." Keep it bare, and ration it hard — this shape turns
  into a house tic faster than any other (see `Mid`, below).

## The gradient

One fortune per slot. Each must satisfy every rule here.

| Field          | Aligns with | Expression                              |
| -------------- | ----------- | --------------------------------------- |
| `fortuneMost`  | `excess`    | the trait at its fullest pitch          |
| `fortuneHigh`  | `trait`     | high expression of the trait            |
| `fortuneMid`   | `trait`     | low expression of the trait             |
| `fortuneLow`   | `trait`     | absence of the trait, or low expression of the opposite    |
| `fortuneLeast` | `inverse`   | the opposite trait fully embraced       |

The column runs `excess` → `trait` → `inverse`. `Most` sits at the entry's
`excess` field — the trait turned all the way up. `High` and `Mid` are the `trait` itself at high then
low expression. `Low` is a light opposite or absence of the `trait`. `Least` crosses into the `inverse`.

Sit cleanly at each point — `Most` speaks the _excess_ of this trait, not a
neighbour — and keep adjacent slots (Low vs. Least) from collapsing together.
`Low` and `Least` lean toward the opposite trait; keep them warm.

## The shape each slot tends to want

Registers still mix across the five, but in practice each slot has a natural pull.
Lean into it unless a fresher shape genuinely serves the line better:

- **Most** — the excess stated as a general truth, faintly bleak, the trait
  admired _and_ quietly mourned. ("Suspicion often creates what it suspects."
  "Discount yourself often enough and the price will stick.") An image with no
  people in it works too ("The gate has rusted shut").
- **High** — blunt, confident, unmissable affirmation of the trait, often a bare
  imperative. Subtlety fails here: a composed gesture reads as nothing.
  ("Do not settle for less than the best." "Give them a hug!")
- **Mid** — the trait at low pitch: a plain observation, a small instruction, a
  short image, or a flat maxim correcting a misread. **Do not default to the
  distinction frame** ("X is not the same as Y", "There's a difference between
  X and Y") — it is fine once in a while and deadly as a house habit.
- **Low** — a soft turn toward the opposite. A flat second-person statement is
  the natural shape ("Most people mean what they say"), as is a gentle
  instruction ("Wipe the fog from the glass and look").
- **Least** — a warm, proverbial embrace of the inverse, in the bean's own
  imagery ("Plastic pearls shine just as bright by candlelight"). This is the one
  slot where the register may break into a joke ("Become among the greatest
  beans, as I have!").

### The creature line

**The creature belongs to `Most`, `High` or `Mid` — never `Low` or `Least`.** The
creature embodies the bean's trait, so putting it at the two slots that lean
toward the *inverse* asks it to argue against itself. Use it **exactly once per
entry**, and rotate which of the three carries it from entry to entry — reaching
for `Most` every time is the single most visible tic in the corpus.

Name a behaviour with its purpose or result implied — never a bare capability
("Stick insects can hold one position all day" — nothing happens in it, nothing
for the reader to hold on to). Length is free: a short clause, a full descriptive
sentence, or two clipped ones all work.

> The warthog will eventually run toward what chases it.
> A basking shark feeds by swimming with its mouth open.
> The bactrian camel maintains its calm demeanour, even while crossing the frozen Gobi Desert.
> The brown bear wakes hungry. It eats what it wants.
> The caddisfly larva encases itself in silk and pebble cocoons. Busy. Safe.

The tone is deadpan and factual. It is usually the most vivid line in the entry,
and it is where the entry's personality lives.

## Talk to the reader

The corpus is warmer and more direct than a first draft tends to be. Plain advice
in the second person is the backbone of `High` and `Low`, and it carries no
ornament at all:

> Just do it!
> You can't be too careful with this one.
> Don't feel obligated to do things you don't want to do.
> Some decisions are better made after a good night's sleep.
> You probably don't need to pay that much attention.

`Most` is often an aphorism naming what the excess costs, phrased for a person
rather than for a plaque:

> A quick yes will incur a heavy debt.
> In our rushing, we break our own lives.
> Passion is the fire that drives us. Obsession is the fire that consumes us.
> Left to bottle up, it'll explode eventually.

And `Least` will argue the inverse outright, in a full sentence:

> It's not a failure to be influenced by others.
> Hesitation is more often safer than acting on instinct.
> Rushed work will still achieve the goal.

Clipped impersonal maxims ("A decision made once saves deciding it weekly") read
cold beside these. When a line feels like a motto, say it to somebody instead.

## Never tell the reader who they are

**No slot may assert what the reader did, knew, has, is, or is like.** Not their
character ("Past a point nothing embarrasses you"), not their habits ("You check
every kindness for the hook"), not their past acts ("You noticed before anybody
said anything"), not their possessions ("You still have the ticket stub") — and
not events around them ("Nobody minded that it wasn't special").

A fortune is read by 360 different people. Anything asserted about them is wrong
for most, and presumptuous even when right. State the world; let the reader
recognise themselves in it.

Fine, and all over the approved corpus:

- imperatives — "Put your feet up", "Use your hands"
- permissions — "You are allowed the good one", "You don't have to explain yourself"
- predictions — "You'll know before you're told"
- general truths — "Somebody has to say the good thing first"
- creature lines where "you" is merely the observer — "A lynx watches you long
  before you know it's there"

Grep for second person **anywhere in the line**, not just at the start, and
justify every hit:

```
grep -nE "^fortune[A-Za-z]+: .*\b(you|your|you're|you've|you'd|you'll)\b" src/content/zodiacs/*.md
```

## Every line must parse

Restate each fortune in plain words: *this says ___*. If the restatement comes
out empty, circular, or leans on a metaphorical verb doing undefined work, the
line is decoration, not a fortune. Rewrite it around something concrete.

- "One good thing, taken slowly, does the whole evening." — what does it mean to
  *do* an evening? Nothing is being claimed. → "Pudding is worth staying for."
- "A preference is a muscle." — a metaphor with nothing cashing it in.
- "The near-the-knuckle joke can pass." — "pass" is doing vague work.

**Run this check again after any shortening.** Most nonsense lines come from
trimming a draft whose tail was carrying the meaning: "A preference is a muscle,
and yours has been resting" was legible; the trim was not. If a line only works
with its tail, keep the tail.

## Brevity and plainness

Cut the **explaining/qualifying clause, not the poetry.** Keep the image, the
comparison, the rhythm; drop the tail that justifies or spells out the meaning.

- Too qualified: "Set the bowl down with both hands**, even when it's only soup**."
- Too terse: "A chipped mug holds the same heat" — needs "**as the good one**."

**But keep the turn.** The tail that _completes_ the image or names where the
trait tips too far is the poetry, not an explanation. Cut only the clause that
_justifies_ or moralizes ("…and that's the whole point"), never the one that
lands the bittersweet — and never the one carrying the meaning (see the parse
check above).

The house register runs **plainer than a first draft wants to be**:

- the commoner word wins — "dishes" over "pots", "chef" over "cook"
- proverbs take the folk shape `the X is the X that Y` — "The nervous deer is the
  deer that lives", not a relative-clause construction
- softening auxiliaries earn their place: "Cayenne _can_ sting the chef too",
  "A handshake _will_ settle what a hug would spoil" — general truths, not edicts
- contractions throughout; nothing composed or literary

**Don't build a fortune out of the trait's literal register.** For `warm`, heat
and cold restate the trait instead of showing it, and usually collide with the
entry's own rorschachs; warmth lives in contact and attention instead — a hug, a
handshake, company. Check what imagery the entry's rorschachs and
`seasonalFortune` have already claimed.

**Exclamation marks are rare.** Only where the pole itself is loud — `boastful`,
`histrionic`, `blaring`, `showy`. Never as a default for `Least` because that is
the joke slot. At most one across a batch of entries.

## How the trait shows without an instruction (the omen toolkit)

1. **Weather** — the trait decides what _kind_ of sign appears (patient = things
   ripening; impatient = the kettle near the whistle).
2. **What fate favours / withholds** — the trait's mode is about to be rewarded or
   quietly taxed.
3. **The lens** — a neutral portent the trait would meet its own way.
4. **Image temperature** — across Most→Least, move along one visual axis the trait
   owns (still water: deep/held → moving/spilling).

**Guardrail:** vague _meaning_, sharp _image_. One literal thing the reader can
see; the "so what" floats. No riddles, no stacked metaphors. Feeling on one read.

## `seasonalFortune`

Not part of the gradient — one hazy, wide forecast of the _season_, written at
the trait's natural pitch. **Twenty-five words, hard.**

The season is the subject, not the reader: a forecast, never an instruction.
Shape that works — a bare noun-pair naming the weather, then one clause of what
the season does with it.

> A season of hot oil and short odds — what goes in quickly comes out gold.

Both halves must be this bean's. A short tail pricing the excess is optional; make
it a cost, not a condition.

## Hard rules

- **Wears the entry's face.** Built from _this_ entry's zodiac, creature, texture —
  couldn't be pasted into another zodiac.
- **Never references the prompt**, the reader's choice, or the facet. Each line
  stands alone (the answer may route to a different slot than it matches).
- **No time anchors** — no today/morning/last week/seasons. ("The year" as a
  mythic span is fine.)
- **Don't assert events as fact**, and never assert anything about the reader —
  see "Never tell the reader who they are". Don't over-specify props.
- **Lands on one read, sees the reader** ("…oh, that's me"), **stays warm** even
  when corrective.

## Watch for sameness

No mold should repeat down the column: not the advice "[instruction] — [reframe
tail]", not the omen "lone evocative noun" or stock kit (the door, water finding
level, the heavy branch, "the X you didn't pick"), not the maxim that's true of
any trait ("patience is a virtue"). Self-test: **could this line swap with the one
above and lose nothing?** If so, rebuild the shape.

Ration house words: "the room," "let it/them/yourself," "before it becomes…",
bare-imperative openers, reassurance tails, office/desk scenery.

### Measure it, don't trust your ear

Tics are invisible while writing one entry at a time — every line looks fine
alone. Only a count over a batch shows the mold forming. Run:

```
./scripts/fortune-tics.sh '*-butter'     # one bean, or no argument for the corpus
```

It reports two-word openers used 3+ times, hedge-frame density ("Not every…",
"Some things…"), openers repeated **inside a single slot** across entries — the
worst kind, since that is what makes a slot feel templated — and duplicate lines,
including collisions with entries already finished.

Standing thresholds: no two-word opener 3+ times in a bean, never the same opener
twice in the same slot, hedge frames under ~3 per 150 lines. Fix everything it
prints before calling a batch done.
