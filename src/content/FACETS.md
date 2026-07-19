# Writing Facets

Guidance for the five `facet*` fields in each zodiac entry. The `facet*Title` and
`facet*Tags` fields are fixed — **only the `facet*` lines themselves are being
rewritten.** Treat the titles and tags as given constraints, not material to
change.

## ⛔️ THE CARDINAL RULE — never cross facets and fortunes

**A facet MUST NEVER reuse the scenario, image, or wording of a fortune — and a
fortune must never reuse a facet's.** These are two separate systems and they
must read as strangers. A facet is a *probe* the reader votes on; a fortune is a
*reading* handed to them. If a facet recycles the same scene a `fortune*` line
already used (or vice versa), the entry feels like it is repeating itself and the
two systems collapse into one. This rule is **absolute and outranks every other
guideline in this document** — including freshness, polarity, and sentence
variety. Before saving any facet, scan that entry's `fortune*` and
`seasonalFortune` fields and confirm your facet shares **no scenario, image, or
phrasing** with any of them. If it does, throw it out and invent a fresh scene.

## What you're actually writing

A facet is a **probe**. The reader is shown one facet on its own — a short
scenario and an inclination — and presses **Accept** ("yes, that's me") or
**Resist** ("no, not me"). It is a small mirror held up at a decision point, and
the reader's button-press is a *vote* that moves their spirit-bean scores.

So the whole craft is a question without a question mark: drop the reader into a
moment, name the inclination, and then get out of the way so their button can
answer.

## The mechanic — and why every word is load-bearing

Each entry has a home three: its `bean`, `flavour`, and `form`. Each facet also
carries its own `facet*Tags`. The vote scores like this:

| Facet            | Accept                       | Resist                       |
| ---------------- | ---------------------------- | ---------------------------- |
| Most / High / Mid | home three **+**, tags **+** | home three **−**, tags **−** |
| Low / Least       | home three **−**, tags **+** | home three **+**, tags **−** |

Most/High/Mid are **"this is the trait"** probes — accepting affirms the bean.
Low/Least are **"this is the opposite"** probes — accepting *costs* the bean and
pays out the opposite cluster's tags. The five facets form a signed gradient
through the entry's `trait`:

| Field        | Aligns with | Expression                              |
| ------------ | ----------- | --------------------------------------- |
| `facetMost`  | `excess`    | the trait at its fullest pitch          |
| `facetHigh`  | `trait`     | high expression of the trait            |
| `facetMid`   | `trait`     | low expression of the trait             |
| `facetLow`   | `trait`     | low expression of the opposite trait    |
| `facetLeast` | `inverse`   | the opposite trait fully embraced       |

The gradient runs `excess` → `trait` → `inverse`. `facetMost` sits at the
entry's `excess` field — the trait turned all the way up. `High` and `Mid` are the `trait` itself
at high then low expression. `Low` is a light opposite or absence of the `trait`. `Least` crosses into the `inverse`.

Because the button-press *is* the score — and **Resist is just as load-bearing
as Accept** — two properties matter above all else:

1. **Polarity must be unmistakable.** The reader has to feel instantly which pole
   the line sits on (careful vs. rash, generous vs. guarded, loud vs. quiet).
   That gut read is the vote. A facet whose direction is ambiguous produces a
   noisy score, which is worse than a facet that's merely flat.
2. **Both buttons need a foothold.** There must be a real, picturable version of
   "no, not me." If the line only describes *who the reader is*, Resist becomes
   meaningless — you can't reject a portrait. This is the most common failure;
   see below.

## ⚠️ The one failure that matters: the pre-resolved portrait

The dominant facet failure is the **settled description** — a retrospective
portrait of a disposition, with the outcome already baked in:

> ❌ "The unread message keeps until evening; by dusk the right shape of it has
> surfaced."

This is lovely and it is **broken as a facet.** It tells the reader who they are
and resolves the choice inside the sentence. There is no moment to step into and
nothing to Resist — "the right shape surfaced" already decided. The reader's vote
is redundant; the line voted for them.

A facet must **suspend at the decision point** and hand the resolution to the
button. Drop the reader into a concrete moment, name the inclination, and **stop
before the outcome**:

> ✅ "A message you don't want to get wrong sits unread. You leave it till evening
> and trust the right reply to surface."

Now Accept = "yes, I sit on it" and Resist = "no, I'd reply now and fix it
later." Both are real.

A self-test before saving: **say "Resist" to your own facet — is there an
obvious, picturable opposite stance?** If "no, not me" has no shape, the line is
a portrait, not a probe. Rewrite it as a moment.

## Structure of a facet

- **A moment, then an inclination.** "[Concrete situation]. [What you're inclined
  to do]." End there. Don't narrate what happens next or gloss why it's wise.
- **Specific scene, general action — and the action still names concrete things.**
  This is the balance the whole facet turns on. The *scene* is a particular,
  pictured moment ("the cashier turns out to be someone you shared a house with
  for two years"). The *action* is a recognizable habit, not a one-off cinematic
  act — but "general" never means abstract. Name what the reader actually does or
  says in concrete nouns: "you keep it to a few words," "content at the window,
  chiming in only when there's something worth adding," "filling it with a story,
  a question, or a random fact." **Reject the vague outcome-phrase** — "settle it
  in a line," "leave with the one thing worth remembering," "say what needs
  saying." Those describe a *result* and name nothing; the reader can't picture
  the doing, so the line reads as nothing at all.
- **Don't resolve it, and don't make the reader the villain.** A facet that lands
  on a single sharp act with a named consequence ("you jump the ending with a
  better story of your own — they don't try again") both pre-resolves the vote and
  paints the reader badly. Keep the action a warm, ongoing inclination the reader
  recognizes in themselves, with the outcome left for the button. Even the
  opposite-trait poles read as recognition, never as "you're the kind of person
  who does this rude thing."
- **Second person, present, suspended.** "You see the chair in the window and buy
  it that afternoon — no list, no sleeping on it." Not "you bought," not "you
  always," not "the hand already knew."
- **Short.** A line, occasionally two short beats. No reframe-tail justifying the
  move ("— and that's its own kindness," "the waiting is the whole thing"). Let
  the line land and stop.
- **Let the title frame, let the dish season.** The fixed `facet*Title` is a
  small label — write the line so it sits under that title without contradicting
  it, but don't restate it. The bean's dish and texture should *flavour* the
  line, not *be* it: the situation reads as universal, the wording tastes like
  this bean, and it couldn't be pasted into another zodiac.

## Keep the low end honest

`facetLow` and `facetLeast` describe the reader's *opposite* trait. A judicious bean's `facetLeast` ("you send the rough draft rather than
polish it; the edit can come on the rebound") should let the reader feel both the
freedom and the price. Warmth stays, but trade some sunniness for an honest "this
costs you something." Even the opposite-trait facets read as recognition, never
reprimand.

## Widen the world — fewer desks, more weather, a little absurd

The corpus leans hard on two registers: **office / comms scenery** (email, inbox,
the meeting, the deadline, the draft-as-document) and quiet indoor conversations
among people the reader already knows. Lean deliberately away from both. Facets
can go somewhere ordinary writing doesn't — they're a single private moment, so
they can afford a sharper, stranger, more specific hypothetical:

- **The lightly fantastical.** A facet may pose an *impossible* situation as long
  as the inclination inside it is true to the reader. "A door appears in your
  kitchen wall that wasn't there this morning. You..." — the door is absurd; the
  way you'd react to it is the real probe. Use this to test the trait under a
  pressure no ordinary day supplies.
- **The absurd hypothetical.** "You're handed a map to somewhere that isn't
  named." "A stranger offers to trade futures with you, sight unseen." "The last
  train is leaving and you don't know where it goes." These dramatize the trait —
  risk, patience, generosity, control — at a scale a desk never will.
- **Leave the room and the city.** A road, weather, an animal, a threshold, something unexplained.
- **Widen the cast.** A stranger, a crowd, a first encounter, someone who won't be
  there tomorrow — not only "the friend" and "the room."
- **Keep the real ones too.** Not every facet should be fantastical, or the
  conceit becomes its own cliché. Ground the gradient: some plain, recognizable
  human moments (the apology you carry, the chair in the window), some strange.
  Aim for variety *across the five*, so a reader cycling through them feels range,
  not a theme.

The rule above all of it: **the situation may be impossible, but the inclination
must be true.** The absurdity is a stage; the trait is the play. If the
fantastical wrapper obscures which pole the reader is voting for, it has failed
the polarity test — cut it back until the choice is clean again.

> ⛔ **The scenarios in this document are burned.** Every concrete image used
> above as an illustration — the door in the kitchen wall, the unnamed map, the
> stranger trading futures sight unseen, the last train, the chair in the window,
> the unread message that keeps till evening, the rough draft sent on the rebound
> — is an *example of the shape*, never inventory to draw from. Do not use any of
> them, or a light paraphrase of them, in a real entry. If a facet you've written
> resembles one of these, you've copied the example instead of inventing a scene —
> throw it out and start from a fresh image. The doc teaches the *move*; the
> images are yours to find.

## Vary the sentence structure — within the file AND across the corpus

This is the single fastest way the writing goes stale. There are **360 files**,
five facets each — 1,800 lines met in long runs — and the reader feels a repeated
grammatical skeleton long before they could name it. A scenario can be fresh while
its *sentence* is the 1,400th copy of the same mould. Vary the shape on **two
axes**:

**Within the five of one entry.** They're met back-to-back, so sameness shows
instantly. Don't write five "[situation]. You [verb]." lines in a row. Mix:

- a bare scenario that ends on an implied choice,
- a two-beat moment with a turn in the middle,
- a single vivid image you're invited to claim,
- a stranger / hypothetical / fantastical one,
- a plain domestic one.

If two facets in the same file open the same way or share a cadence, rewrite one.

**Across files — the part that rots the corpus.** Even with five distinct shapes
per file, the *same five shapes in the same order* every time becomes its own
drone. Watch for skeletons that have become reflexes and actively spend them down:

- the two-sentence "[Scene set in clause one]. You [verb] before [clause]." mould,
- every facet opening on a possessive subject ("Your train…", "Your friend…"),
- the trailing "…rather than [the worse option]" tail on every low-end facet,
- the em-dash mid-line aside as a default rhythm,
- "Someone hands you…" / "A stranger asks you…" as the go-to opener.

Reach for forms the mould doesn't reach: open on the inclination and *then* the
scene; a one-clause line with no second sentence; a question the scene poses
without "you" in it; dialogue or a sound as the opener; an imperative the reader
either follows or doesn't. The point isn't a checklist — it's that a reader
cycling through many entries should never feel a template ticking underneath.

## Build the scene in the order the reader needs it

A facet fails quietly when it's *evocative to the writer* but unparseable to a
cold reader — the scene leans on a setting the line never actually established.
The writer pictures a train platform; the reader gets "the whistle blows for the
last call" and has no idea what whistle, or why there's suddenly a bowl. The
image was real in your head and absent on the page.

Two rules keep a scenario parseable:

- **Establish the place before the props that depend on it.** A prop only reads
  if its setting is already on the page. "Your train is boarding and there's a
  line at the soup cart on the platform" lands because the train and the platform
  arrive *before* the bowl you're about to grab. Reverse that order — prop first,
  setting implied — and the reader is decoding instead of voting.
- **No compressed nouns that carry hidden scenery.** "The platform stall," "the
  last call," "the night desk" pack a whole location into a phrase the reader may
  not unpack on a single read. If a noun needs the reader to *infer* a setting,
  spell the setting out plainly ("the soup cart on the platform"). Texture is
  welcome; a riddle is not.

The test: hand the line to someone who can't see the picture in your head. If
they have to ask "what whistle?" or "why a bowl?", the scene is built out of
order or compressed too hard — rebuild it so each noun arrives already grounded.

## Stay true on any day, for anyone

- **Never open with a quotation mark.** A leading `"` breaks the YAML
  frontmatter — the parser reads the line as a quoted scalar and chokes. Dialogue
  is welcome, just don't let it sit in the first character: recast it ("They ask
  what you make of it") or lead with a word before the quote.
- **No mid-line colon followed by a space.** A `: ` inside the facet text breaks
  the YAML frontmatter the same way — the parser reads everything before the colon
  as a key and chokes on the rest. So no "the one underneath: who decided" and no
  "one question: is it true." Recast with an em-dash ("the one underneath — who
  decided") or split into two sentences. (A colon with no trailing space, like a
  time, is fine, but you're avoiding time anchors anyway.)
- **No time anchors.** No "today," day names, or seasons. (A facet's *scenario*
  can be a specific moment — "the waiter is back, hovering" — but not a calendar
  one.)
- **It lands on a single read.** No riddles or inversions to decode; the feeling
  and the polarity arrive immediately. The reader should picture the scene
  without effort — don't stack metaphors that fight each other.
- **It stays warm all the way down.** Lower expressions trade flattery for
  recognition, not coldness.
- **Watch the house words.** "the room" as the default backdrop, "let it / let
  yourself" as a reflexive opener, the self-justifying reframe-tail, and named
  office props all turn from texture to wallpaper through repetition. When one
  shows up, ask whether the bean's own imagery would do the work instead.
- **Cut the reflexive intensifier.** A stock tail-clause that only cranks a dial —
  signalling how fast, how eagerly, how completely the beat happened — adds no
  information the verb didn't already carry, and its precision is fake: it anchors
  to nothing the reader would actually notice. Worse, it resolves the beat shut,
  voting on the outcome the button is meant to decide. Trust the verb, or spend
  the words on one real, load-bearing detail instead.
