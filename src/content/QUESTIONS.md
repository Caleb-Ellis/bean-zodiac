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
- **Pubs and bars as the stage**, and **community gardens / allotments** — retired
  during the 2026-08 pass. See "Ration the ingredients" below for the rest.

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

---

# The answer spec, after the 2026-08 rewrite pass

All 296 entries without `lastUpdated` were rewritten in one pass. Everything below
was learned by getting it wrong first, usually more than once. Where a rule can be
checked mechanically it lives in `scripts/lint-questions.mjs`; where it can't, it
says so. Thresholds were calibrated against the 64 approved entries — those are the
standard, and any proposed rule that would reject *them* is a bad rule.

## Write the five moves before you write any prose

The standing failure of the whole pass was five answers that are one act at five
volumes. Restraint is not the inverse of a trait, and "the same but more" is not a
gradient anybody can vote on. So before drafting, fill this in:

| Slot | Verb | Object | Content named |
| --- | --- | --- | --- |
| Most | | | |
| High | | | |
| Mid | | | |
| Low | | | |
| Least | | | |

1. **No two rows share an object.** If Most and High both act on "them", the scene
   has one axis and needs replacing, not rewording.
2. **The difference between two rows is never a quantity.** *all / the whole of it /
   the lot / more / at length / twice* are not distinctions.
3. **Content named must be specific and different in each row** — which fact is
   disclosed, which option is taken, the actual words said.
4. If a row can only be written as an intensity ("very", "properly", "really"), the
   pole isn't an act yet. Find one.

Worked example — *reticent* (excess withholding, inverse voluble), the offer of a
job nobody knows about, family round on Sunday. Each slot names a **different fact**:

| Slot | Which fact comes out |
| --- | --- |
| Most | none of it — "work's much the same", an active deflection |
| High | the date you start, and nothing about the job |
| Mid | the job title and the town, if they ask |
| Low | the money and the start date, unprompted, before the food's out |
| Least | the interview questions and who they turned down |

That is a gradient of *content*, not of volume: five different facts, five
different acts. Written as volume it collapses into "say a bit / say more / say
everything", which is one answer with a dial on it.

## Say the thing, don't gesture at it

Every objection raised during the pass belonged to one family: **a phrase that looks
concrete and denotes nothing.** In rough order of how often it got through:

- ❌ *"give them the whole of it, start to finish"* — names a quantity, not content.
  The whole of *what*? Linted.
- ❌ *"the one thing that worries you"*, *"the real reason"*, *"the true version"* —
  the definite article and the superlative make it feel specific; the reader still
  cannot tell you what it is. Ran at **14× the approved rate** and always hid in the
  `High` slot, which is where the plain concrete act is hardest to find. Not
  linted — it is grammatically identical to legitimate uses like *"the one that
  reads from across the road"*, where the question named the paint.
- ❌ *"a straight evening"* — an invented idiom. If you can't say what it is in plain
  words, it isn't a thing.
- ❌ *"say it kindly"*, *"take it carefully"* — manner with no act inside it.

The fix is always the same and it is never longer: name the object, the words, the
move. *"tell him it doesn't get easier, but you get better at it"* is the same
length as *"give him the true answer"* and says something.

## What an answer may not do

Each of these is a hard linter failure, and each exists because it shipped once.

- **Invent a fact the question never gave.** No object, person, place, number or
  history that isn't in the scene. *"what the two years have cost her"* invents a
  two-year affair; *"put your mother's address down"* invents a mother. The fix is
  to put it in the **question** — the scene is entitled to supply any fact it likes,
  the answer is not. The numeric form (a duration or tally attached to the past) is
  linted; the rest is caught only by reading the REFERENT WORKSHEET line by line.
- **Narrate the result.** *"tell them all of it, and watch the room adjust"*. The
  answer stops when the act does; the outcome belongs to the reader's choice.
- **Measure the act against what others hadn't done yet.** *"pick the green and have
  him started before either of them has spoken"* implies haste by narrating the room
  instead of showing an act that is itself hasty.
- **Presume the reader's history.** *"the good thing that happened, because there was
  one"* out of a question that described an ordinary evening.
- **Leave a pro-form dangling.** *"start one up and hold the whole room"* under a
  question that never mentioned a story or a room. Substitute the question's noun for
  every pronoun and read it back; if nothing fits, it fails.
- **Test skill instead of disposition.** If a reader could answer "I couldn't" rather
  than "I wouldn't", settle the capability in the question as a given — *"people stop
  and listen when you talk; you've no idea why"* — so the vote is what you do with it.
- **Read as villainy at `Low` and `Least`.** Those are dispositions a decent person
  owns, not bad behaviour.

## Rhythm

The approved corpus lets **three of five answers land in a single beat**. A bulk pass
drifts hard the other way — mid-pass this hit 42% compound answers against an
approved 11%, and every answer arriving as *"do X, and do Y"* is the woodenness
readers feel before they can name it.

- At least one answer per entry must be a single clause; two or three is the target.
- Compound answers are fine when the second clause carries content (*"give them the
  date you start, and nothing about the job"*) and dead when it carries filler
  (*"…and leave it there"*, *"…and mean it"*, *"…and that's that"*).
- Answers run about 9 words. Length is not the problem; explaining is.

## The question has to parse too

`lint-questions.mjs` checks structure, not sense — a meaningless question can pass
every rule in it. Read the scene back cold, clause by clause, and restate each as a
flat fact:

- **Every phrase must denote.** ❌ *"You want a straight evening with her"*.
- **Every verb gets its object.** ❌ *"she has started again"* — started what?
- **Every *again / still / another / back on* needs its prior in the question.** The
  scene may absolutely establish a history — *"it's the third evening running"* is a
  fact it is entitled to supply. It may not imply one and leave the reader to invent it.

## Give the reader a want

The deepest tic isn't vocabulary, it's architecture: **somebody brings you a
situation and you react to it**, over and over. The approved corpus does that in 9%
of entries; three beans of this pass hit 38–44% before it was caught and converted.

A scene is stronger when the reader wants something the situation obstructs. Compare:

> ❌ "It's your first week in the choir and one of the altos asks what you make of
> the conductor. You…"
> ✅ "**You want the solo in the spring concert.** It's your first week in the choir,
> and at the break one of the altos asks what you make of the conductor. You…"

Same trait, same answers — but now holding the opinion back has a price, and the
gradient measures a real cost rather than free caution. Traits *about* reception
(interpretive, attuned) are the honest exception; don't bolt a want onto those.

## Ration the ingredients

Cheap second parties and settings become tics faster than any phrasing does. Counts
are shares of a bean's questions; the approved corpus is the benchmark.

| Ingredient | Keep at | Approved | Notes |
| --- | --- | --- | --- |
| "a friend" as the other person | ≤15% | 13% | hit 44% in one bean; the substitute for family became worse than family |
| the reader's own family | ≤20% | 9% | brother/sister/niece as reflex |
| civic settings (club, committee, village hall, parish, chairman) | ~1 per bean | **0%** | an entire village-hall world that isn't in the approved corpus at all |
| purely reactive scenes | ≤15% | 9% | see above |
| standalone `?` questions | 20–30% | — | per bean, not per flavour group |

Also retired, on top of the earlier list: **pubs and bars as the stage**, **community
gardens and allotments**, and repeat props generally — `src/content/TALLY.md` holds
a per-bean table of every setting used, and is the file to check before inventing one.

## One fantastical premise per bean

The strongest entries of the pass are the impossible ones, because the five answers
stay ordinary instincts inside a strange frame: a different city at the end of your
street each night; a bench that gives you what the person beside you feels; an hour a
year to hear a voice you've lost; an hour a day weighing nothing; a room that keeps
your last sentence audible for a week. Aim for one per bean, and keep the other
entries grounded.

## What the tooling can and can't do

`node scripts/lint-questions.mjs --file=<batch>` before applying, `--bean=<name>`
after, `--axis` for the neighbour-trait report. Capture the output and read the exit
code — chaining `lint; apply` on one line applies even when the lint failed, which
happened twice.

It reliably catches: pro-forms without antecedents, invented history, quantity
phrasing, manner tails, outcome tails, presumption, five-compound rhythm, opener
drone, collapsed answer pairs, retired beats, UK-coded slang, shape mismatches.

It cannot catch: whether the sentence means anything, whether the scene tests *this*
trait rather than its neighbour, or whether the reader has anything at stake. Those
are the REFERENT WORKSHEET and the axis check, both of which have to be read rather
than skimmed. Green lint is not the same as finished work — the worst line of the
whole pass passed every automated check.

---

# Taken from FACETS.md

The facet document is further along than this one, and the question pass rediscovered
several rules it had already written down — village-hall scenery being the plainest
case. Everything below is imported from it, adapted where the two forms genuinely
differ. Read it as debt already paid rather than advice not yet tested.

**The forms differ in one way that governs the rest.** A facet is met alone and
cannot presume anything. A question is a scene that is *entitled to supply facts* —
"it's the third evening running" is legitimate in a question and a fabrication in an
answer. So where a facet rule says "put it on the page", for questions that means:
**put it in the question**, never in the answers.

## The cold read — three lists, written out, after all editing

This is the facet process's highest-value step and the question pass had no
equivalent. The REFERENT WORKSHEET the linter prints is a weaker cousin: it lists
suspects, it doesn't make you enumerate. For each entry, write out:

```
ON THE PAGE:      every fact the question actually states, in order
THE ANSWERS NEED: every person, object, number and event the five answers refer to
THE POLE NEEDS:   what makes Most the excess rather than the trait, and Least the
                  inverse rather than restraint
```

Everything in lists two and three must appear in list one. Every fault raised during
the question pass would have died here: *"the two years"* (a duration list one never
had), *"put your mother's address down"* (a person), *"a bag of shopping in the car"*
(a car), *"soup for the train"* (a journey home).

Why re-reading doesn't substitute: you wrote the scene with all of it in your head,
so the missing facts are present to you and absent to the reader. Enumeration is the
only way to see the page as a stranger does.

**Any edit re-triggers the read** — not a re-reading, the lists again, on the new
text. Trims take nouns with them, and a late tidying pass across a finished bean is
the most dangerous moment in the process because it feels superficial. **Rewriting a
whole scene is more dangerous than trimming one**: the old nouns stay live in your
head and the answers keep pointing at them.

## The stakes test

Before writing any prose, say what is at risk in a clause. **If it comes out "nothing
much", the scene is admin** — throw it away now rather than after it's written. The
flattest failures are the errands of life: packing a bag, choosing a coffee, a
routine trip to the shops.

This is sharper than "give the reader a want" above, and it comes first: a want with
nothing riding on it is still admin.

## Motive check on reversals

`Low` and `Least` are often withdrawals — you let it go, you don't ask, you hand it
back. **A reversal with no cause on the page reads as somebody else doing it.** If
the scene doesn't say what changed, the answer arrives from nowhere and can't be
owned. Either put the cause in the question or pick a different act.

## Perception traits

For *attuned, observant, insightful, vigilant, intuitive, diagnostic* — both obvious
moves fail. **Stating the perception** in the question ("something is off about him")
settles it before the reader votes. **Stripping it entirely** leaves the answers
arbitrary. Instead: **one concrete deniable signal, the rest of the scene pointing
the other way, and answers disproportionate to it.** Never write the reader's
inference into the question — that's what picking an answer is for.

## Props the reader may not have

A prop that presumes the reader's circumstances — a garden, a car, children, a spare
room, cash in hand — costs you the readers who don't have one. A slightly general
phrase beats a concrete one nobody can stand inside. This does **not** cancel
concreteness: still name real objects and moves. And a car that belongs to somebody
named in the scene is fine; it's *your* car that presumes.

Audited: **10 of 296 questions** presume one — five a daughter or son
(`bitter-fermented-butter`, `bitter-fried-black`, `sour-dried-butter`,
`sour-dried-chickpea`, `spicy-boiled-fava`, `spicy-fried-black`), two a spare room
(`sweet-boiled-mung`, `sweet-fried-mung`), plus a wife (`sweet-dried-kidney`) and a
shed (`umami-boiled-green`). That is a low rate and several are load-bearing — a
child is the point of *nurturing* and a wife is the point of *adoring*. Left as they
are, and recorded here so the next pass decides deliberately rather than by accident.

## A controlled vocabulary would catch what prose tallies miss

Facets carry `src/content/facet-ledger.tsv`: every line records its **setting** (from
a fixed list), **scenario** (two hyphenated words, unique across the corpus),
**cast**, and **pitch**. It exists because *repetition is invisible from inside a
single entry* — nobody holds 360 entries in their head.

The question pass used prose tables in `TALLY.md` instead, and the result is exactly
what you'd expect: the tables recorded settings faithfully and still missed that "a
friend" had reached 44% of one bean's questions, because nothing counted the cast.
If questions get another pass, the ledger is the thing to copy — the same twenty
register buckets, the same cast vocabulary (`alone, friend, stranger, group, family,
official, neighbour, partner, colleague, housemate, child`), the same rules:

- **Settings may not repeat within 10 entries**, corpus-wide.
- **A bean's questions should span several register buckets, with at least one in a
  bucket the corpus has barely used** — the facet rule is four buckets per entry, one
  thin; the question analogue is per bean, since a question has only one scene.
- **Cap any one cast per bean**, which is the mechanical version of the ration table
  above.

## Warnings are for judging, not obeying

From the facet document, and the question pass proved it twice: *"the instrument has
no taste, and contorting a good line to satisfy a heuristic is how the worst sentence
in this document got written."*

Both times it was an opener-share cap firing on a corrective batch that spanned six
beans, where most of the lines weren't being redrafted at all. The fix was to scope
the check to single-bean batches, not to bend the prose. **When the linter flags
something, decide whether the prose or the rule is wrong, and fix whichever it is.**

## Two rules of theirs this document deliberately does not follow

Flagged rather than imported, because the forms may genuinely want different things:

1. **Impossible premises.** FACETS.md *dropped* its one-per-entry rule after 32 of
   them, on the grounds that the premise nearly always just literalised the trait —
   "effort made countable, calm made contagious" — and the vote collapsed into obeying
   the rule. The question pass then introduced the same rule and produced five, of
   which at least three do exactly what that warning describes: a bench that transmits
   feeling for *empathetic*, an hour weighing nothing for *ethereal*, a room that
   keeps your sentence for *lingering*. The two that hold up are the ones where the
   premise sets up a **choice** rather than restating the trait — the nightly city
   (you decide how much of elsewhere to take on) and the hour a year to hear a lost
   voice (you decide whether to use it). **If the rule survives, narrow it to that:
   the premise must create the decision, not illustrate the disposition.**
2. **The reader's age.** Facets fix the reader in their twenties or thirties — no
   retirement, no grandchildren, no decades-long tenure. Questions have not observed
   this: they include a thirty-year filing system, forty years of a practice, a
   retirement do, a grown-up son. Either the question reader is allowed a longer life
   than the facet reader, in which case say so here, or the questions need an audit.

> ⛔ Like FACETS.md, **the scenarios used as illustration in this document are
> burned.** They demonstrate a shape; they are not inventory.
