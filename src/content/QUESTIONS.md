# Rewriting the 360 questions

**The task: rewrite the `question` field across all 360 zodiac entries to diversify their
settings and situations.** A census found the bank badly clustered around a thirtysomething's
social calendar — dinners, group chats, and friends asking for feedback. The goal is to push
each question away from the worn beats and toward the thin ones, so the 360 read as a full
cosmology rather than one very social season.

This document is the brief for that pass. It says what to move away from, what to move toward,
and the style spec every rewritten question (and its five answers) must still hold to.

## The five answers

The five answers span the gradient `excess` → `trait` → `inverse`. `answerMost` aligns
with the entry's `excess` field — the trait at its fullest pitch; `answerHigh` and
`answerMid` are the `trait` itself; `answerLow` is a light opposite or absence of the `trait`; `answerLeast` crosses into the `inverse`.

- **Order**, given a trait like _judicious_ (excess _overcautious_, inverse _impulsive_):
  - `answerMost` — `excess`: the trait turned all the way up (overcautious / stalling)
  - `answerHigh` — `trait`: judicious
  - `answerMid` — `trait` at low expression / middling
  - `answerLow` — `trait`, low expression: somewhat impulsive / not judicious
  - `answerLeast` — `inverse` fully embraced: fully impulsive (the opposite of judicious)
- **Form**: match the question's grammar (see [The question](#the-question) for the two
  shapes). For a scene ending in `You...`, the answers are short verb phrases that continue
  it — no subject, start with a verb ("ask for tea and another five minutes", "point at
  random and close the menu"). For a plain standalone question ("What's your handwriting
  like?"), the answers are short descriptions or options that answer it directly ("neat as
  print, every letter even", "even I can't make it out later"). Don't mix the two shapes
  within one entry.
- **Length**: short. Tight is the goal — no clauses explaining the choice, no
  parentheticals, no justification. The user is supposed to recognize themselves in the
  _shape_ of the answer, not be told what it means.
- **Pick the question shape to fit the answers.** If the five answers are things the
  reader *does* (actions), use the `You...` scene so they read as continuations; if
  they're descriptions of a preference or state, use the plain standalone question. A
  quantity question ("how much of it do people see?") answered by behaviours ("handle it
  alone," "lean on a couple of people") reads awkward — the grammar has to line up.
- **Each answer a distinct act, and every one a real disposition.** Two failures to
  watch. (1) *Adjacent answers that collapse* — `Most` and `High` saying the same thing
  reworded, differing only in *attitude* ("keep it to yourself" vs "handle it alone").
  Separate them by what the reader concretely *does*; no two should survive a swap. (2)
  *One obviously-right answer that turns the rest into strawmen* — keep it so that a real person could own *any* of the five. If four are clearly wrong and
  one is the "sensible" one, the spectrum is broken and the vote is meaningless.
- **No trailing full stops.** The answer is a continuation or a bare option, not its own
  sentence. ("ask for tea and another five minutes" — not "ask for tea and another five
  minutes.")
- The five together should feel like a real spectrum — each one a plausible choice, with
  the spread between `Most` and `Least` wide enough that the user feels the choice
  pulling them somewhere.

> When you rewrite a `question`, its five answers must still span the same trait gradient.
> Changing the scene is fine; the trait it tests, and the spectrum the answers walk, stay put.

## Move away from these — exhausted beats (VERY IMPORTANT)

Don't write new questions in these molds. The counts are how many near-duplicates already exist.

- **Group chat arguing about where to eat** (~8). Retired outright.
- **Someone states a wrong fact / quote / number and the table nods along; do you correct
  it** (~12).
- **A friend brings you a draft / poem / haircut / baby photo / deck that isn't good and
  waits for your honest read** (heavily mined).
- **A friend vents or shares heavy news over coffee, long pause, looks up waiting** (~12).
- **Colleague hands you a slide deck / brief for a quick look before a meeting** (~9).
- **A meeting circling a decision nobody will call** (~8).
- Generic **dinner-party** openings — the single most-worn stage (~40 entries).

## Move toward these — thin or missing

Favour these settings. The freshest existing entries already live here; there's room for far more.

- **Solitude with no human audience** — a forest, a 3am kitchen, a long drive alone, water.
  Most entries have someone watching; break that.
- **The body, illness, aging, grief that's your own** — near-absent, and central to a zodiac.
- **Family with real weight** — parents, your own child, an aging relative. The bank has
  almost no parents, children, or bosses.
- **Nature & weather as the event**, not backdrop — storm, drought garden, an animal, the sea.
- **Strangers and liminal transit spaces** — bars, late buses, hotel corridors, waiting
  rooms, trains.
- **Money that actually bites** — debt, a windfall, lending to family. Current money beats
  are trivially small.
- **Authority & institutions** — landlord, bureaucracy, doctor, police, teacher.
- **Risk, mischief, the illicit, flirtation, transgression** — the bank is very safe; a
  little danger is welcome.

Invent a fresh concrete image every time, and never reuse a scenario across two entries. As
you go, keep a tally of which settings you've added so the _replacements_ don't form a new
cluster of their own.

---

# The spec a question must hold to

The `question` field and its five `answer*` fields in a zodiac's frontmatter drive the
daily ritual's **question variant** — an alternative to the facet flow. The user reads
the question and picks one of five answers; the answer they pick determines the day's
quality tier and feeds spirit-bean scoring. Any rewrite must preserve this contract.

## The question

A question takes one of two shapes. Use whichever serves the trait better; vary which one
you reach for across the corpus so neither becomes the default.

1. **A scene ending in `You...`** — a short scene, one or two sentences, that sets up a
   low-stakes micro-decision, ending with `You...` so the five answers read as direct
   continuations. Enough context to make the choice feel real; nothing more.
2. **A plain standalone question** — a direct question the reader answers about themselves
   or a preference ("What's your handwriting like?", "How would you spend a free Sunday
   morning?"). The five answers are options that answer it. Keep it low-stakes and concrete;
   the trait shows through _which_ option the reader owns, never named in the question.

- The situation can be anything that frames the choice: an everyday scene, a pure hypothetical, or something
  outright fantastical. Unlike the body copy, relatability
  here lives in the _choice_, not the scene — a strange premise is fine as long as the
  five answers map onto recognizable instincts.

### ⛔️ Give the reader something to picture — no placeholder nouns

The most common way a question dies is by describing its own shape instead of a
scene. **"Doing the right thing here will cost you something real. You…"** is the
type specimen: *the right thing* is unnamed, *something real* is unnamed, and
*here* is nowhere. The sentence is a diagram of a dilemma with every slot left
empty, so the reader has nothing to react to and the five answers float free.

Watch for these words doing the work a noun should be doing: **something,
someone, a thing, a decision, an occasion that matters, somewhere, anything, it
goes wrong, properly**. They are not banned — "someone asks you what time you'll
be there" is fine, because the *asking* is the concrete event. They are a smell.
When one appears, ask whether a reader could draw the scene. If they'd have to
invent the object themselves, you have written a template, not a question.

The fix is always the same: **name one thing.** Not the category — the object.

> ❌ "Something you took on has turned out far harder than you expected. You…"
> ✅ "You said you'd redo the bathroom in a fortnight and you're five weeks in
> with no working sink. You…"

> ❌ "You are waiting on something outside your control. You…"
> ✅ "The hospital said they'd ring with the results by six, and it's quarter
> past. You…"

Note what the naming buys: the second version fixes the stakes, the timescale and
the emotional temperature all at once, and it does it in the same word count. A
vague question is not shorter — it is the same length with the information taken
out.

The same test applies to a standalone question. "How do you take bad news?" works
because *bad news* is an event the reader can supply from their own life
instantly. "What's your relationship with the truth?" does not, because it asks
the reader to theorise about themselves rather than remember something.
- Tied to the trait, but obliquely — the question is a scene or prompt where the trait gets
  tested, not a quiz about the trait. The five answers do the trait-mapping work.

---

# Post-pass census (all 360, second look)

The diversification pass worked — the thirtysomething social calendar is gone. But the
_replacements_ have formed new clusters of their own, exactly the failure mode the brief
warned about. A fresh count across all 360 `question` fields:

## Now overrepresented — the new worn grooves

- **Transit, especially the late/night bus** (~28 transit; ~10 of them the late/night/last
  bus). The "stranger across the aisle who is crying, oversharing, scamming, or snapping" is
  now its own genre. Heavily mined — treat as retired.
- **Mortality settings** — hospital/doctor/clinic (~27) + funeral/wake/grave (~21), roughly
  1 in 7 entries, plus an aging-parent-declining cluster (~22). The elegiac register is now
  the deck's default mood, not a thin spot.
- **Bad weather as the stakes engine** (~32 storm/rain/fog/snow/sleet), usually paired with
  the trail/ridge/summit "group looks at you to call it" beat (~17). The storm-on-the-trail
  is now a tic.
- **Night + solitude + interior** — ~43 entries are nocturnal, ~41 carry solitude markers,
  ~71 sit in domestic interiors. One person, after dark, with a heavy thought, is now the
  template.
- **Adversarial transactions** — landlord/deposit (~16), scams/padded quotes (~7), bad
  tradespeople (~8), bureaucratic clerks/forms (~16). "Someone is cheating or stonewalling
  you" is a large bucket.
- **Structural sameness** — 130 of 360 open with the identical `A [thing] [does X]. You...`
  frame; another 58 open with `The`. Over half share one skeleton. Vary the opener.

## Still thin or missing — push here now

- **Daylight, warmth, summer** (~3) — the deck is permanently cold, wet, autumn-to-winter.
  Let someone be happy outdoors in good weather.
- **Making & craft** (music ~6, visual art ~3) — people *creating* a thing, not only
  receiving, sorting, or clearing it out.
- **The contemporary / digital** (~1) — a thread turning on someone, a follow from the past,
  an algorithm surfacing an old photo. Nearly invisible.
- **Play, sport, the body as joy** (~5) — pickup games, dance, a race; physical risk that's
  fun, not survival.
- **School, youth, institutions** (~1) — classrooms, first jobs, teams, clubs; collective and
  formative settings vs. lone adults.
- **Awe / the numinous / the uncanny** — fitting for a *zodiac*, currently secularized into
  "weird thing on the night bus." A genuinely strange or wondrous moment.
- **Abundance, not windfalls** — money appears only as inheritance/refund/scam. Generosity, a
  guilt-free splurge, plenty.
