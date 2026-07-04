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
- **Form**: short verb phrases that grammatically continue `You...`. No subject — start
  with a verb. ("ask for tea and another five minutes", "point at random and close the
  menu")
- **Length**: short. Tight is the goal — no clauses explaining the choice, no
  parentheticals, no justification. The user is supposed to recognize themselves in the
  _shape_ of the action, not be told what the action means.
- **No trailing full stops.** The answer is a continuation of the question, not its own
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

- A short scene, one or two sentences, that sets up a low-stakes micro-decision. Enough
  context to make the choice feel real; nothing more.
- Ends with `You...` so the answers read as direct continuations.
- The situation can be anything that frames the choice: an everyday scene, a pure hypothetical, or something
  outright fantastical. Unlike the body copy, relatability
  here lives in the _choice_, not the scene — a strange premise is fine as long as the
  five answers map onto recognizable instincts.
- Tied to the trait, but obliquely — the question is a scene where the trait gets
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
