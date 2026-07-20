# Writing Nicknames

The user's spirit nickname, derived from their **current** Beanstalk scores:

| axis           | role                                                       |
| -------------- | ---------------------------------------------------------- |
| **#1 bean**    | the core — what they most are                              |
| **#12 bean**   | the absence — what they least are (or `null`, see Pure core) |
| **#1 flavour** | the register — the emotional temperature of the whole name |
| **#1 form**    | the delivery — how it reaches other people                  |

12 × 11 × 5 × 6 = **3,960** nicknames, plus **360** pure-core names with no #12
bean (12 × `null` × 5 × 6) = **4,320** total, one per combination. Unlike
fortunes, a user sees only their own — so the corpus is read _comparatively_
(screenshots, friends, a change after weeks). The craft is making neighbouring
cells feel like different people, not one idea reworded.

**A nickname is 1–2 words, a concrete image, and names a person you could
recognise.** It is not a description of traits.

## The four axes must all be felt

The commonest failure is a name built only from the #1 bean. Every nickname has
to carry the absence too, and the flavour/form have to change what kind of person
it is. Test: swap the #12 bean, or swap the flavour — if the name still fits, it
is not specific enough.

**Load-Bearing Wall** (navy / pinto / sour / boiled) — Navy's dependability,
sour's plainness, boiled's patient sustaining, and the Pinto-shaped hole is the
whole joke: zero ornament, zero spontaneity. It holds the house up and will not
be interesting about it.

## Start from the zodiac trait, then subtract

Three of the four axes — #1 flavour, #1 form, #1 bean — **are** a zodiac slug.
Every cell therefore has a hand-authored entry already describing it:
`adzuki-chickpea-umami-boiled` maps to `umami-boiled-adzuki`, whose `trait` is
_affectionate_; the `spicy-fried` cell of the same batch is _irrepressible_.
`nickname-batches.py --batch N` prints the trait / inverse / excess for all 30.

So the job has a clean shape:

> **nickname = the zodiac's trait, minus the #12 bean**

Use the trait as the starting point and the #12 bean as what you take away from
it. _Affectionate_ minus chickpea (sociable, adaptable) is not "warm" — it is
warmth with no gift for company: devoted to a few, hopeless in a room.

**Read the frontmatter fields only, never the entry bodies.** The 30 bodies run
to ~17,600 words and would swamp the batch, and their imagery sits beside the
nickname in the UI — a name that echoes the user's own fortune reads as
repetition, not resonance.

The risk this introduces is **anchoring**: a trait is a tidy single word and it
is tempting to just restate it, which silently drops the #12 bean and produces
exactly the failure this guide exists to prevent. The trait covers 3 axes; the
4th is the one carrying most of the character. If a name would still fit with a
different #12 bean, you have restated the trait rather than written a nickname.

## Three modes, chosen by the bean pair

Which technique to use is **not** a matter of taste — it is decided by how the #1
and #12 beans relate. Using the wrong one is what produces filler.

### Tension (aligned pair, ~36%)

The two beans are _similar_, so the absence is a genuine surprise. Name the
contradiction.

- **Absent Host** (adzuki / chickpea) — celebrates hard, won't work the room.
- **Eager Bystander** (green / fava) — first to arrive, never once jumps.
- **Sudden Party** (adzuki / chickpea / sweet / fried) — same beans as the
  first, thrown fast and warm instead of avoided.

### Missing faculty (orthogonal pair, ~41% — the largest bucket)

The beans are _unrelated_ — no contradiction, no redundancy. The absence reads as
a faculty the person simply doesn't have. This is the workhorse mode.

- **Unexamined Nerve** (fava / black) — brave, never looks inward.
- **Indiscriminate Balm** (mung / cannellini) — heals everyone, no standards
  about whom.
- **Immaculate Temper** (cannellini / green) — polished, and quick to flare.

### Totality (opposed pair, ~23%)

The beans are already opposites, so the absence is _expected_ and there's no
contradiction available. Name the **purity** instead: this person is unmixed,
undiluted, with no counterweight anywhere.

- **Nothing Pending** (butter / green) — no urgency in any direction.
- **Beloved Flake** (chickpea / navy) — everyone's friend, nobody's anchor.
- **Kept Vigil** (kidney / butter) — all protection, never rests.

### Pure core (no #12 bean — the `null` batches, ~8% of the corpus)

Keyed `{hi}-null-{flavour}-{form}`. Shown when the user's lowest bean is **not
meaningfully below the pack** (`score[#11] − score[#12] < 3`): last place is a
tie among the beans they simply haven't expressed, so there is no honest absence
to name. This fires for **~46% of users at any given time** — the low bean is the
weakest-signal axis — so these are not a fallback stub; for many users this _is_
their nickname, and it must be as strong as any other.

There is no subtraction here. Name the **trait at full strength** — the one place
where restating the zodiac's `trait` is correct, because the reading really is "a
person who is wholly this, with no notable lack." Register and delivery still do
their work; only the absence is gone.

- **Open Hearth** (adzuki / — / umami / boiled) — warmth with nothing withheld
  and nothing missing.
- **Live Wire** (green / — / spicy / fried) — pure charge, no ballast asked for.

## When the beans give you nothing, put the contradiction on flavour/form

The opposed pairs are the weakest third, because totality mode alone drifts
abstract. The fix: let the **register fight the beans**.

edamame / mung is the second-most redundant pair in the grid. Written straight,
in sour / dried, it produces the limp _No Softer Word_ — every axis saying
"harsh." In **umami / roasted** the register contradicts the beans — a blunt
person with a warm, radiant delivery — and it becomes **Warm Verdict**.

Whenever a cell feels flat, check whether the flavour/form is agreeing with the
beans. If it is, that agreement is the problem, and the contradiction is the name.

## Flavour sets temperature, form sets delivery

These are not interchangeable, and they are not decoration. The same bean pair
across registers must yield genuinely different people:

| butter / navy   | nickname             |
| --------------- | -------------------- |
| umami / boiled  | **Long Simmer**      |
| sweet / roasted | **Permanent Sunday** |
| spicy / fried   | **Lazy Detonation**  |
| bitter / smoked | **Cool Recline**     |

Same person-shape — at ease, unconscriptable — but one is beloved, one is aloof,
one goes off without warning.

- **Flavour** — umami: deep, slow, lingering · bitter: dry, cool, at one remove ·
  sour: sharp, plain, sometimes stings · sweet: warm, easy, generous ·
  spicy: intense, immediate, impossible to ignore.
- **Form** — boiled: patient, sustaining · dried: spare, solitary, austere ·
  fermented: private, strange, conclusions without workings · fried: fast,
  decisive, quick to flare · roasted: radiant, convivial, fills the room ·
  smoked: elusive, untraceable, you can't say what shifted.

## Compress the grammar — a moniker, not a description

A name with a joiner in it (`of`, `in`, `at`, `from`, `with`, a relative clause)
reads as a description of an object. Compress it and it reads as a name someone
is actually called. Prefer the modifier-noun form:

| description             | moniker                    |
| ----------------------- | -------------------------- |
| Keeper of Toasts        | **Toast Keeper**           |
| Coffee at Midnight      | **Midnight Coffee**        |
| Flare in a Field        | **Field Flare**            |
| Wake That Won't End     | **Endless Wake**           |
| Archivist of Parties    | **Party Archivist**        |

Compress by default. Three cases where you should not:

- **The joiner is carrying the image.** _Fly in Amber_ is something caught and
  preserved; "Amber Fly" is just a fly that happens to be amber.
- **The compressed form is unsayable.** "Left-Out Blanket," "Senderless Parcel."
  If it fails said aloud, rewrite the image instead of forcing the word order —
  _Spare Blanket_, _Anonymous Parcel_.
- **It is already a moniker.** _Last One Up_, _Everybody's Birthday_. Names built
  on a person or a possessive don't need the treatment.

Watch what compression does to the ledger: the head noun moves to the last word,
so _Keeper of Toasts_ (head `toasts`) becomes _Toast Keeper_ (head `keeper`).
Compressing a batch can quietly push a common noun over its cap, or free one up.

## The image ledger — the real hazard at this scale

Individual bad names are not the risk. **Collective sameness is.** Across the
first three dozen drafts, "cellar," "study," "joyless" and "blade" each recurred
without anyone intending it.

- Keep a running ledger of every **concrete noun** used (cellar, study, wall,
  flame, room, blade, door). Cap each at a small number across the whole corpus.
- Track **constructions**, not just words. `Nothing X`, `No X`, `[adj] [abstraction]`,
  `All X, No Y` all go stale fast. Ration them.
- **Watch the `Un-` prefix especially.** It is the path of least resistance for
  naming an absence, which is what all three modes ask for — in the first 40
  drafts it appeared 9 times (Unsigned, Unlit, Unvetted, Unsworn, Unrested,
  Unpolished, Unshown, Unexamined, Ungarnished) despite active effort to vary.
  Prefer a positive image of what *is* there over a negated one: _Table for
  One_ says the same thing as "Uncompanioned" and is alive.
- Totality mode is the worst offender — it pulls toward negation. Force a
  concrete noun or a person into most of them. _Low Flame_ and _Beloved
  Flake_ survive because they have an object and a person; _Warm Vague_ is
  two abstractions and dies.

## Hard rules

- **1–2 words. Never a leading "The".** The name is a title, not a
  description — _Permanent Sunday_, not _The Permanent Sunday_. Three words is
  a hard ceiling, not a target; an internal article is permitted when the
  grammar demands it, but rarely fits at this length.
- **Compress the grammar.** Prefer _Toast Keeper_ to _Keeper of Toasts_. Keep a
  joiner only when it is carrying the image or the compressed form is unsayable
  — see above.
- **Concrete over abstract.** An object, a place, a role, a person — not a
  quality. _Table for One_, not _Refined Solitude_.
- **Never name a bean, flavour, or form.** No "buttery," no "the bitter one."
- **Never state a trait outright.** Not "Perfectionist." Show the shape.
- **Recognisable, not flattering — but never cruel.** These land on a user. Aim
  for the accuracy of a good nickname from a friend: it stings a little and you
  keep it. _Beautifully Unbudged_ is fair; a name that reads as contempt is
  not.
- **No second person.** No "you."
- **Gender-neutral throughout.** No Gentleman, Lady, Mistress, King.
- **Must survive being said aloud** to someone who doesn't know the system.

## Watch for sameness

Before shipping a batch, read the names for one bean's whole row (11 low-bean
cells × 30 registers) in sequence. If a row reads as one idea with adjectives
swapped, the #12 bean isn't doing any work — that's the tell, and it means going
back to the mode table above rather than editing words.
