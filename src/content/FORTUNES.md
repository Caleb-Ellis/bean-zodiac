# Writing Fortunes

Guidance for the five `fortune*` fields in each zodiac entry. Fortunes are
delivered to a user based on how they answered a daily prompt.

## What you're actually writing

A fortune is one line of a **zodiac** — augury first, advice second. The reader
draws one a day for months, so the corpus is read *serially*. The whole craft is
making consecutive draws feel like different weather, not one fortune rephrased.
Judge each line two ways at once: on its own, does it land? And against its
neighbours, does it bring a genuinely different shape, register, and rhythm?

If you only remember one thing: **vary the shape, not just the words.** A pass
that swaps images while keeping the cadence changes nothing — the daily reader
feels the *rhythm* repeat, not the nouns.

## The axis

Each slot has two fortunes — `fortuneMost` and `fortuneMost2`, and so on, paired
in the file. The `2` variant sits at the **same point on the axis** as its pair
but is a **genuinely different fortune**: a different image, action, or angle,
never a reword. Both must independently satisfy every note here.

The five slots form a gradient on the entry's `trait`:

| Field          | Expression                                        |
| -------------- | ------------------------------------------------- |
| `fortuneMost`  | the trait fully embraced (peak trait)             |
| `fortuneHigh`  | high expression of the trait                      |
| `fortuneMid`   | low expression of the trait                       |
| `fortuneLow`   | low expression of the _opposite_ trait            |
| `fortuneLeast` | the opposite trait fully embraced (peak opposite) |

The arc runs from "most you" through center out to "least you." Each fortune
sits cleanly at its point — `fortuneMost` celebrates _this_ trait, not a
neighbouring virtue — and adjacent slots (Low vs. Least) must not collapse into
the same note.

`fortuneLow` and `fortuneLeast` push the reader _toward the opposite_ of their
trait. Give that opposite-trait move a **faint wary edge** — a small caveat, an
acknowledged cost — rather than pure sunny cheer, which reads off-voice over a
run of draws. Not scolding; the warmth stays. You're trading some sunniness for
an honest "this costs you something, do it anyway."

## ⚠️ The one failure that matters: structural sameness

Every other rule can be satisfied perfectly and the corpus still fails, because
the sameness that creeps in is **structural**, not topical. The dominant mold is:

> **[a quiet instruction]. [an aphoristic reframe that says the cost is worth it].**

Measured across the corpus, this mold dominates: ~90% of fortunes are exactly
two sentences, most pivot on an em-dash or sentence break, a fifth open their
second sentence on "The…", and the say/answer/verdict/silence register alone is
over a quarter of all lines. That is the sound of one fortune wearing 3,600
outfits.

Treat these as **hard targets, not suggestions:**

1. **Break the two-sentence mold.** No more than ~half of a bean's fortunes
   should be the two-beat "move + gloss." Deliberately write some as a single
   line with no footnote; a bare image with **no instruction at all**; a
   fragment; three short beats; a direct address. "Sentence, em-dash, reframe"
   is the default — change the shape, not just the words.
2. **Kill the reframe-tail.** The "— and that's its own kindness / the waiting
   is the standard / X is the whole thing" tail is wallpaper. A fortune does
   **not** need to justify its own move. Let lines land and stop.
3. **Foretell more than you advise.** This is a zodiac. An omen, luck turning,
   fortune arriving, a sign worth heeding — this register is the most on-brand
   and the most neglected; it should be common, not rare. Not every fortune
   carries a corrective move. Some just *speak the day.*
4. **Don't let the fixes calcify.** Escape hatches from prior passes ("comes to
   the one who…", "good fortune favours…", "once" as a resolution beat) have
   themselves become tics. If a phrase shows up to *avoid* sameness, vary it too.

A self-test before saving: **could this line be the second sentence of the
fortune above it?** If the cadence is interchangeable, that interchangeability
*is* the sameness — rewrite the shape.

## Widen the world

The corpus leans hard on one register: a quiet indoor coach nudging _speak or
stay quiet, move or hold, leave or stay,_ among people the reader already knows.
That note is mastered. The job is to widen *around* it. Reach deliberately —
often enough that the daily draw surprises — for what's underused:

- **Augury over advice** (see above — the single biggest lever).
- **Leave the room.** Most fortunes happen indoors, in conversation. Set some
  outdoors — on a road, in weather, in a turning season, near an animal.
- **Just good news.** Pure delight, a windfall, a reunion, a healing, effort
  rewarded — no correction, no "but." Celebration is nearly absent; a fortune is
  allowed to promise something lovely.
- **Widen the cast.** Beyond "the friend" and "the room": a stranger, a new
  person, a crowd, a first encounter, the unknown. Most fortunes assume the
  reader knows everyone present — let some look outward.
- **Open differently.** A quarter start on a bare command verb (Say / Stop /
  Leave / Take / Hold) and a third open on "A…" or "The…". Vary the entry — an
  image, a condition, an observation — so the grammar isn't shared.

## What makes any single line good

- **It sees the reader.** A fortune is judged on one thing: the small "…oh,
  that's me." Writing that's admired but slides off has failed.
- **It lands on a single read.** No riddles or inversions to decode; the feeling
  arrives immediately. The reader should picture what it describes without
  effort — don't stack metaphors that fight each other or compress so hard the
  literal meaning is lost. (Bad: "Anonymous warmth keeps landing as a draft from
  the hallway when your name would have made it a gift" — too many mixed images;
  what is the reader actually shown?)
- **It's short.** A line, not a paragraph. Don't over-qualify ("the way you tend
  to," "almost always") or make the same point twice. When in doubt, cut.
- **It stays warm all the way down.** Lower expressions trade flattery for
  _recognition_, not coldness. Even a corrective line reads as understanding —
  give the _why_ — not a reprimand.
- **It wears the bean's face.** Use the entry's own dish, imagery, and voice, so
  the line couldn't be pasted into another zodiac. When a line feels generic,
  rebuild it from this bean's dish, creature, or texture.
- **It never references the prompt.** A fortune must not mention the question,
  the reader's choice, or the facet behind it. The reader's answer may route them
  to a different slot than the one matching their reply, so write each line to
  stand alone — a line about the trait, not a reply to a prompt.

## House words over budget

These props went from texture to wallpaper through repetition. Not banned, but
assume the reader has seen each many times this week. Before reaching for one,
ask whether the entry's own imagery would do the work — and cut it if it's just
there to sound cozy.

- **"the room"** as audience/stage — the default backdrop for everything. Reach
  for an actual place.
- **"let it / let them / let yourself"** — the reflexive permission opener; now a
  verbal tic.
- **"before the… / before it becomes…"** — the pre-emptive-consequence clause.
- **bare-imperative openers** (Say / Stop / Leave / Take / Hold) — see "Open
  differently."
- **"for once," "the whole [thing]," "the real [thing]," "the gift you give,"
  "comes to the one who…"** — stock softeners and reassurance tails. Show the
  warmth; don't append it.
- Also lean *away* from office/comms scenery (email, inbox, meeting, deadline,
  slide deck) — it quietly assumes a desk-job reader. When you must invoke the
  trait at work, keep it generic ("say it plainly"), not a named document.

When two of these would land in one fortune, that's the signal to rewrite it
from the bean's own dish, creature, or voice instead.

## Keep it true on any day, for anyone

- **No time anchors.** Fortunes are evergreen and shown on any day. No "today,"
  "this morning," "last week," "for now," day names, or seasons.
- **Don't assert specific events as fact.** The fortune doesn't know what
  happened to the reader, so it can't state a concrete scene as though it did
  ("You sat through every opinion and said the thing the table was circling").
  Aim at a **vague future action gently invited**, not reported. A **loose past
  tendency** ("the way you tend to wait before you speak") is fine if it's broad
  enough to be true of anyone with the trait.
- **Don't over-specify the future either.** "Catch the error on line four while
  the cashier waits" assumes a day the reader isn't having. Keep the invited
  action general ("catch the small wrong thing before it grows"). Archetypes and
  conditionals are fine; a named prop on a named line is not. When in doubt,
  strip the props and keep the move.

## The scenario palette (widen toward, don't fill)

This is range to reach for, not a checklist — overusing any of it just makes a
fresh cliché. The rule above the list: **match the scenario to anyone who'd
plausibly hold the trait** — a parent, a nurse, a kid, a freelancer — not only
someone at a desk.

- **Domestic / hands-on:** cooking, fixing, cleaning, planting, mending,
  building — tactile, and it overlaps the dish.
- **Relationships & social texture:** who you sit by, the friend you call, the
  apology you carry, who gets your time. The warmest "…that's me" lives here.
- **Money & stuff:** what you buy, keep, give away, repair vs. replace, can't
  throw out.
- **Body & habit:** sleep, the walk, the meal, the morning routine, rest vs.
  push.
- **Decisions & risk in the wild:** travel, directions, the new place, the leap,
  the thing you signed up for.
- **Making & craft:** the first attempt, the practice, the draft, the thing you
  keep tinkering with — ship-vs-polish without the office.
- **Attention & noticing:** what you catch that others miss, the off note, the
  detail in a room.
