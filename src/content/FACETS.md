# Writing Facets

Guidance for the five `facet*` fields in each zodiac entry. The `facet*Title` and
`facet*Tags` fields are fixed — **only the `facet*` lines themselves are being
rewritten.**

Read Part 1, work Part 2 in order, and use Part 3 when you need to look something
up. Every rule lives in exactly one place, at the step where it applies.

---

# Part 1 — What you are making

## A facet is a probe

The reader is shown one facet on its own — a short scene and an inclination — and
presses **Accept** ("yes, that's me") or **Resist** ("no, not me"). The press is a
vote that moves their spirit-bean scores.

So the craft is a question without a question mark: drop the reader into a moment,
name the inclination, and stop before the outcome.

| Facet             | Accept                       | Resist                       |
| ----------------- | ---------------------------- | ---------------------------- |
| Most / High / Mid | home three **+**, tags **+** | home three **−**, tags **−** |
| Low / Least       | home three **−**, tags **+** | home three **+**, tags **−** |

The five form a signed gradient through the entry's `trait`:

| Field        | Aligns with | Expression                           |
| ------------ | ----------- | ------------------------------------ |
| `facetMost`  | `excess`    | the trait at its fullest pitch       |
| `facetHigh`  | `trait`     | high expression of the trait         |
| `facetMid`   | `trait`     | low expression of the trait          |
| `facetLow`   | `trait`     | low expression of the opposite trait |
| `facetLeast` | `inverse`   | the opposite trait fully embraced    |

## Two things every line must do

**1. Suspend at the decision point.** The dominant failure is the settled portrait,
with the outcome baked in:

> ❌ "The unread message keeps until evening; by dusk the right shape of it has
> surfaced."

Lovely, and broken — it tells the reader who they are and resolves the choice inside
the sentence. Name the inclination and hand the resolution to the button.

**2. Both buttons need a foothold.** Say "Resist" to your own line. If "no, not me"
has no picturable shape, it's a portrait, not a probe.

**And if the act is a reversal** — dropping out, giving in, letting something go —
the scene has to make it live. What changed goes on the page, and the act lands
last. An act that arrives from nowhere reads as a different person doing it.

`facetLow` and `facetLeast` describe the reader's opposite trait. They should let
the reader feel both the freedom and the price — recognition, never reprimand, and
never "you're the kind of person who does this rude thing".

---

# Part 2 — The loop

Nine steps, in order. Work a whole batch through each step before moving to the
next; the plan file (Part 3) says which five entries are in the batch.

## Step 1 — Derive the trait, before reading the old facets

The trait is not a word to illustrate — it is the meeting of three files. Read
`beans/<bean>.md`, `flavours/<flavour>.md` and `forms/<form>.md`.

Navy × spicy × **dried** is *tough* — heat taken with no visible change. Navy ×
spicy × **boiled** is *rigid* — a position that doesn't move when pushed. Same
bean, same flavour, different axis. Get this wrong and five well-built facets probe
the wrong thing.

Write into the batch file, as `#` comments:

- **the axis in one sentence**
- **what it isn't** — name the neighbouring traits it gets confused with, and say
  how this one differs. Two entries in a batch are often near-neighbours, and they
  will collapse into each other if you don't separate them here.
  - **`src/content/trait-neighbours.tsv` names the pairs for you.** All 360 traits
    were worked through once, so this is a lookup rather than a derivation — the
    adjacency cannot be computed from the axes (*hard-line* and *firm* share no bean,
    flavour or form). Look your five up, read the entries it lists, then write the
    separation prose as usual. A `!` marks a neighbour **in your own batch**, which is
    the worst case: two entries written in one sitting collapse silently. The file
    names the pairs; it does not do the thinking, and it does not replace reading
    `beans/`, `flavours/` and `forms/`.

Then write the five poles as bare dispositions in plain words, with no scenes
attached yet. Check that `facetLow` and `facetLeast` sit on the same axis rather
than on a neighbouring virtue.

## Step 2 — Read the entry's fortunes and question

**A facet must not share a scenario, image, or wording with any of that entry's
`fortune*` lines or its `seasonalFortune`.** A facet is a probe the reader votes on;
a fortune is a reading handed to them. If a facet recycles a fortune's scene the two
systems collapse into one.

Note in the batch file what imagery is now off-limits, and what the old facets
you're replacing used, so you don't rebuild them.

Overlap with the entry's own `question` and `answer*` lines is **fine** — they sit
on the same trait, so they share vocabulary and territory by nature. Only avoid a
facet that maps onto an answer one-to-one.

`node scripts/lint-facets.mjs` warns when a facet shares a corpus-rare word with one
of its own fortunes. **A bare adjective collision is usually a false positive —
leave the prose alone.** The check is a proxy for the thing that matters, which is a
recycled *scene or image*. An entry's fortunes have usually taken the trait's whole
working vocabulary — a sardonic entry's fortunes own both "funny" and "accurate" —
so any facet that says something plainly about the disposition will trip it.

This was learned the hard way: `sour-fermented-pinto` tripped twice, and rather than
dismiss the warning the line was rewritten around it, ending up at "there is a
version of why each of them is up there that would travel the table in ten seconds"
in place of a plain sentence. Three nested abstractions, unreadable on one pass, and
worse than what it replaced. Warnings are for judging, not obeying. Reword only when
the collision is real — the same picture, the same move, the same phrase — and never
at the cost of clarity.

## Step 3 — Check the ledger

```
node scripts/facet-ledger.mjs report          # what's used most, what's used once
node scripts/facet-ledger.mjs check           # collapses, gaps, repeated pairs
```

Pick against the top of each list. Read the **register bucket** tally at the same
time and decide which of the five is going into a thin bucket — decide it now, not
after four are written.

`node scripts/census-settings.mjs` counts what the corpus already uses. Treat it as
a check against repetition, not a shopping list.

`node scripts/facet-ledger.mjs free` prints the settings **not** blocked by the
10-entry window, grouped by bucket and marked for thinness — pick from that rather
than guessing and being refused. `plan` prints the same list when called with no file,
and on a blocked setting it names what is still free in that bucket.

## Step 4 — Choose all five scenarios before writing a word of prose

For each, name where it happens, what structurally happens, and who else is there.
State the stakes in a clause: if it comes out "nothing much", throw that scene away
now rather than after it is written. The flattest failures are the admin of life —
packing a bag, choosing a coffee, hanging a picture, a routine errand.

**The stakes clause is written into the batch file and `plan` refuses the batch
without it** — a `# STAKES: <what it costs>` line under every row. It is a gate
because the rule on its own does not hold: a whole session of four batches went
through without the clause ever being written, and `plan` waved the scenes past,
because buckets, settings, casts and pitch cannot see that a scene is empty. What
came out was a sofa with a fourteen-week lead time, a man counting change at a bank
counter, and a free head massage declined — three probes with nothing at risk in any
of them. Writing the clause is the moment the judgement actually happens.

**A low-pitch pole still needs a full-stakes scene.** Every thin facet in that
session sat at `facetLow`, and the reason is worth naming: low is the mildest pole,
and mildness of *pitch* quietly became emptiness of *scene*. The pitch belongs in the
act — a small move, plainly made. What is at risk behind it stays as real as
anywhere else in the gradient.

Fill the 25 rows into the batch file and run `plan` (Part 3) before any prose exists.

### Where a facet can be set

- **Somewhere anyone could stand.** A dentist's chair, a footpath, a supermarket
  aisle, a cinema row, a doorstep, a hotel breakfast room, a friend's kitchen.
- **No *niche* hobby premises.** Caving, reef-keeping, metal detecting, competitive
  dog agility: Resist collapses into "I'm not that person" and the vote is lost.
  Ordinary pastimes are fine and always were — tennis, bouldering, sewing,
  five-a-side, running, an evening class. The bar is not whether it is a hobby but
  **whether the reader can picture themselves doing the act**. If the scene needs a
  world the reader has never been near, rebuild it; if it needs an afternoon anyone
  might have had, use it.
- **Nothing that reads as an expertise test.** If Resist means "I wouldn't be able
  to" rather than "I wouldn't", rebuild it. This is the rule the hobby line is
  really serving — laying a hedge with a billhook fails it, playing a match does not.
- **No prop that presumes the reader's circumstances** — a garden, a car, cash in
  hand, children, a spare room. A slightly general phrase beats a concrete one the
  reader can't stand inside. (This qualifies concreteness, it doesn't cancel it:
  still name real words, objects and moves rather than outcome-phrases like "settle
  it in a line". And a car that belongs to somebody named on the page is fine.)
- **The reader is in their twenties or thirties.** Not a village elder. No
  grandchildren of their own, no retirement, no parish council or allotment
  committee. They can have grandparents; they just aren't one.
- **No vague community scenery.** Village halls, fetes, tombolas, jumble sales,
  scout huts, coffee mornings — generic English-village set dressing nobody has
  actually stood in. Name a real place with real business going on.
- **Avoid office and comms scenery** — inboxes, meetings, deadlines, the
  draft-as-document. The corpus is saturated with it.
- **Five distinct settings per entry, and five distinct scenario *types*.** Five
  different rooms all asking "how much of the free thing do you take?" is one probe
  asked five times.
- **Four distinct register buckets per entry, one of them thin.** Distinct settings
  were not catching sameness of *register* — kitchen, party, car, pub, phone is five
  places and one narrow world, and two thirds of the corpus sat in domestic +
  nightlife + street. The five must span at least four of the twenty buckets, and at
  least one must sit in a bucket the corpus has barely used. `plan` refuses the batch
  otherwise. Bucket list in Part 3.
- **Settings may not repeat within 10 entries**, corpus-wide. One pass produced five
  boats and six mountain huts before anyone noticed. Thin buckets are exempt — the
  point of the thin-bucket rule is to send you there.

### Raise the setting — a pass of its own

The first scenario that arrives is almost always the domestic one: a kitchen table,
a living room, somebody's flat. Take each of the five and ask what the same probe
looks like somewhere with more in it.

**Mine the titles.** `facet*Title` is usually a pun on a film or a book that bears
on the pole — *Off With Their Beans!*, *Zero Dark Beanty*, *Beanlet 2*. That is the
Queen of Hearts, an analyst certain when everyone else hedges, and the most famous
ditherer in English. Ask what the story behind the title is actually about, and let
it hand you a situation. Never restate or explain the title in the line.

**Wild is allowed.** A mission to space, a search party after dark, a ship in
weather, a heist, a crossing — all fine, and better than another kitchen.

**Elevated is a property of the situation, never of the building.** This is the one
that goes wrong, and it goes wrong quietly: you pick an unused room from a thin
bucket, write an ordinary errand in it, and tick the box. An audit of forty
supposedly elevated facets found roughly two thirds were exactly that — a queue at a
fairground, a lap of an ice rink, a hostel changeover, answering a question in a
lecture hall. Nothing wrong with them as scenes; they just weren't doing the job the
pitch exists for, which is to be **interesting to read**. Two ways to earn it, and a
facet needs one:

- **Lane A — the act cannot be taken back.** Not a deadline; irreversibility. The
  reader arrives after something has already gone wrong, and what they do lands
  somewhere that outlives the scene. The curtain goes up without him. The buyer walks
  and the sale is dead. It is on the court record. You own the boxes now. You are two
  hundred miles north.
- **Lane B — the reader gets to see inside something.** Interest by access rather
  than jeopardy. A trapdoor under a stage that was not in the show. A medium running
  a table. A night shelter twenty minutes after the cut-off, where it turns out there
  *is* a cut-off and it does get bent. The scene has to show how the place works, not
  merely be set there.

**The test, answerable before any prose exists:** *name what the reader cannot undo,
or name what the reader gets to see.* If neither has an answer, it is a grounded
scene with a postcode. Write the answer into the batch file next to the row.

**Trouble alone is not Lane A.** An oversold flight has gone wrong and is still dull,
because the consequence is seat allocation — reversible, forgotten by Tuesday. The
question is not whether something went wrong but whether what you do here survives
the scene.

**Match the lane to the pole.** `facetLow` and `facetLeast` are withdrawals — you
decline, you let it go, you don't ask. Lane A fights that: build jeopardy, then
shrug, and the scene deflates. Lane B suits it exactly, because an interesting place
and a small refusal sit together comfortably. So **Lane A for Most and High, Lane B
for Low and Least**, and Mid takes either.

**Escalate the situation, keep the act ordinary.** The reader's move has to be one
they recognise making — you hand him his bag, you take five people and go, you put
the paddle down. If the act needs skill or nerve the reader can't picture having,
the vote is lost and you have written an expertise test in a better costume.

**The mix is fixed: 3 grounded, 2 elevated.** Always. All five heightened is its own
monotony, and the grounded three are what the other two are measured against.

**No impossible premises.** There was a rule requiring one per entry. It was dropped
after 32 of them: they came out as 32 variants of "Here X is true", the premise
nearly always just literalised the trait — effort made countable, calm made
contagious — and the vote collapsed into obeying the rule rather than revealing
anything. If a scene needs a bent rule of the world to carry the pole, the scene is
not doing the work.

## Step 5 — Write the line

Situation named plainly in the opening clause, then the pressure and what it costs,
then the act — blunt, and last.

### Shape

- **Detail in the setup, blunt act at the end.** Spend the words on the situation;
  let the closing act be plain. "You tell him not yet." "You tell them you're fine."
- **State the stakes outright.** Don't imply them with props — say what it costs.
- **Build it in the order the reader needs.** Never make the reader assemble the
  scene from props ("the cash is in your pocket, and they mention five o'clock" —
  *what* is being bought?).
- **Short.** A line, or three short beats. No tail justifying the move.
- **Second person, present, suspended.** Not "you bought", not "the hand already
  knew". Habitual phrasing is fine at the trait poles ("before you'd take it you'll
  have got under it with a torch").
- **Vary the sentence shape** within the five — they're met back-to-back, so sameness
  shows instantly — and across the corpus. Spend down the reflexes: the two-sentence
  "[Scene]. You [verb]." mould, every line opening on "You are…" or a possessive
  subject, the trailing "…rather than [the worse option]", the em-dash aside as
  default rhythm, "Someone hands you…". If two facets in a file share a cadence,
  rewrite one.

### The act

- **The act is its own sentence, and it stands alone.** Never join it to the setup —
  not with a comma, not with "and", "so" or an em-dash. Not "Your partner has noticed
  you've been in every day this week, and you go again on the way home" but "…every
  day this week. You go again on the way home." The last sentence has to read
  correctly with nothing before it, because it is lifted out verbatim into
  `facet*Action` for the front end to style on its own. A facet that is one sentence
  has no setup at all.
- **Active to the end.** A passive close ("your notice goes in", "the family have
  been messaged") hands the act to nobody and drains the vote.
- **A not-doing needs a named thing not done.** "You say nothing", "you leave them
  where they are" — on their own, nothing happens and the vote has nothing to attach
  to. Watch for the version wearing an active verb: *leaving* something where it is is
  still not doing anything.
  - The corpus does carry refusals as whole acts — *You do not.*, *You'd rather talk
    about the views.*, *You leave it be — it isn't yours to tidy.* Every one of them
    works because the setup put a specific, available act in front of the reader
    first. The declining is legible because the thing declined is on the page.
  - **So the test is not the verb, it is the setup.** If the preceding sentences name
    an act the reader could take right now, declining it is a real vote. If they
    don't, the not-doing is a blank and gets rebuilt as a doing.
- **One move.** Not two, not a triad. Approved facets do carry joined acts — *You
  thank him, leave your number just in case, and walk out.* — but those are the shape
  Caleb's editing arrives at, not the shape to draft. Drafting to one move and letting
  the setup carry everything else is the instruction: **write it short, because
  lengthening it afterwards is easy and trimming it is what keeps going wrong.**
  Anything that isn't the move itself belongs in the preceding sentences.
- **Short, sharp, and finished when the verb lands.** Ten words is the working
  median; past about fifteen, look hard at what is doing the work. The failure is not
  length as such — it is content that belongs in the setup being dumped after the
  verb, so the line goes on waffling once the vote has been cast. ❌ "You give her the
  actual two years, the months in bed and the job you walked out of and what you think
  of the last place, in the words you would use for it." ✅ Put those three facts in
  the setup as their own sentence, then: "You tell her how the two years really went."
  - Test: everything after the verb should be part of the act, not a gloss on it. If
    a clause explains, qualifies, lists or places, it belongs earlier.
  - Length is earned only when **the enumeration is the thing being voted on** — the
    effusive pole listing the whole tour, the thorough pole naming every check.
- **No composure tail.** Once the act has landed, the hand reaches for a small
  domestic gesture to settle the line down — *and you go and put the kettle on*, *and
  sit back down*, *and carry on with your food*, *then sit on the wall to wait*,
  *until it goes cold*. Every one says the same thing: the reader is unbothered.
  Nobody voted for that. **Stop on the act.** The line is allowed to end abruptly —
  that is what stopping at the decision point looks like.
  - Test: delete the last clause. If the facet still asks the same question, the
    clause was mood and it stays deleted.
  - A second *act* is fine — "you hand him his bag, and tell him he's getting the
    train from here" is two things happening. A second *posture* is not.
  - Where a pole genuinely is about carrying on regardless (tranquil, untouched,
    unremarkable), the continuing must have a fact in it and be the whole act, not a
    comma-spliced reassurance after a different one.
- **The act may not introduce shared history.** A specific that arrives at the act
  and presupposes a past the reader was never given — a running joke, an old
  nickname, a story between the two of you — cannot be Accepted, because there is
  nothing to recognise. ❌ "You talk to her the way you always have, including the
  joke about the chaplain." *What* joke about *what* chaplain? Either put the history
  on the page or cut the specific: "You talk to her the way you did before she was
  ill." The distinction: an act may introduce something the reader **produces** — an
  observation, a question, a decision, a line of their own. It may not introduce
  something they are supposed to already **share**.

### Register

Spoken and plain, the way someone would say it aloud — "the cutest ever dog", "it's
always a fox", "a lot more drilling", "he probably is friendly". Not composed prose.
Warmth stays all the way down the gradient.

**Never give anyone a first name.** People are "a friend", "your partner", "your
dad", "a friend's flatmate", "the woman who runs the shop". A name reads as a
different piece of writing, and makes the reader a spectator to somebody else's life
rather than the person in the scene.

Keep the vocabulary plain. Regional slang — *lad*, *mate*, *bloke*, *chap*,
*knackered*, *quid* — dates the voice and reads as dialect rather than speech.

This extends past slang to **British colloquial naming of ordinary things**. Say
*leaving drinks*, not *a leaving do*. Say *grandmother*, not *gran* or *nan*. Say
*across the street*, not *over the road*; *until two*, not *till two*. The test is
whether the word is the plain name for the thing or the local name for it — the
local one narrows the reader to one country and reads as somebody else's voice.

A foil is allowed where it sharpens polarity ("You weren't planning to, but…", "He
probably is friendly"). What fails is the habit-summary — "you'd normally", "you
always" — which describes a character instead of a moment.

### Explicitness — imply nothing

Assume the reader will not fill in a single gap, because they won't: they read one
facet, cold, and vote.

- **Name every person and what they are to the reader.** Not "four of you", not
  "everyone", not "someone" — "three friends and your housemate", "the woman who runs
  the shop". If the reader could ask *who?*, the line has failed.
- **Name the thing, not its category.** Not "a booking that's fallen through" — "the
  cottage they'd booked for the weekend has cancelled on them". Not "the work", "the
  job", "the situation".
- **Say what the act physically is and what it does.** "You get everyone sat down"
  accomplishes nothing the reader can see. Do you tell them to leave it until
  tomorrow? Put a film on? Open the wine?
- **No pronoun standing in for content.** "it", "the thing", "the whole thing", "the
  rest of it" all need a noun the line has already given.

Dumbing it down is the right instinct. A facet that reads as slightly over-explained
is working; one that reads as elegantly compressed is usually leaning on the reader
to supply what you left out.

### Perception traits (intuitive, observant, insightful, self-aware)

Both obvious moves fail. **Stating the perception** ("you don't believe a word of
it", "something is off about him") establishes the reader as perceptive before the
act, so Accept is just agreeing with a portrait. **Stripping it entirely** leaves the
act arbitrary and the scene mundane.

Instead: **one concrete, deniable signal, everything else in the scene pointing the
other way, and an act out of proportion to it.** The signal lets the reader feel it;
the disproportion is what they vote on. Never write the reader's inference into the
line.

### Frontmatter hazards

- **Never open with a quotation mark** — it breaks the YAML.
- **No `: ` inside the line** — same reason. Use an em-dash or split the sentence.
- **No dating anchors** — don't pin a scene to a particular day ("by Tuesday", "next
  Friday"). Seasons are fine to name, as are recurrences ("every Sunday", "those
  Saturday lessons"), clock times and "at the weekend".

## Step 6 — The clarity pass

Do this on every line, and rewrite on any failure. This is the bar the whole thing
lives or dies by: a facet must never be muddy, and it must be obvious what it is
asking. It lands on a single read — no riddles, no stacked metaphors.

- **Restate it** — "This asks whether you'd ___." One sentence, no hedging. If you
  can't finish it cleanly, the line is muddy and nothing else about it matters.
- **Say both buttons** — Accept in a clause, Resist in a clause. They must be
  different *dispositions*, not different competences, and both picturable.
- **Point at the act** — name the exact words where it happens. If it's an urge ("you
  want to"), a not-doing, or an outcome-phrase ("settle it in a line"), rewrite it.
- **First eight words only** — is the situation already clear? Any noun that needs
  unpacking gets spelled out.
- **Last clause test** — is the final clause an *act* or a *manner*? A tail that only
  says how fast, how completely or how little it touched you ("and you're already onto
  the next one", "in about a minute") adds nothing the verb carried, and editorialises
  the reader — usually into somebody colder than the pole needs.
- **Referent check** — point at every "the" and "your". Each must attach to something
  already on the page. "your conversation" when no conversation was mentioned, "the
  plan" when none was described: the reader stalls, and a stalled reader can't vote.
- **Motive check** — is the reason for the act on the page? A reversal with no cause
  reads as somebody else doing it.
- **Inference check** — nothing may state what the reader concluded. That's the
  button's job.

The linter helps with two of these. It catches first-mention definite people ("the
lad in the corner" — which lad?) and trade nouns doing the work of a setting ("the
ring", "the round", "the shift"). Name the place and the jargon reads fine; a
defining clause after the noun — "the woman who runs the shop", "the man playing the
lead" — does the identifying and passes.

The recurring muddiness failures, in the order they actually happen: motive missing
from a reversal, a compressed noun carrying hidden scenery, a perception stated
rather than signalled, and an abstraction standing in for the thing.

## Step 7 — Propose before writing anything into the file

Five lines, each with these underneath, one line each:

- **Setting** — where it happens.
- **Context** — what is happening, and to whom.
- **Stakes** — what is at risk, and why it can't be shrugged off.
- **Action** — the act the line stops on.
- **Trait** — how it reaches the pole, and what Accept and Resist each mean.

This is a test, not a formality. If **Stakes** comes out as "nothing much", the scene
is admin. If **Action** can't be written without saying what happens next, the facet
has pre-resolved itself. If Accept and Resist can't each be said in a short clause,
it's a portrait — rebuild it before proposing it.

Revise on feedback, and re-propose only what changed.

## Step 8 — Write in, lint, and stop editing

Copy each facet's closing sentence verbatim into the matching `facet*Action` field —
it drifts the moment you edit a facet and forget, so the linter fails on one that no
longer matches. Only rewritten entries carry it.

```
node scripts/lint-facets.mjs
```

**Run it with no flags.** `--written` filters to entries whose `lastUpdated` is filled
— that is, the ones Caleb has *approved* — so it skips everything you have just
written and reports clean on an untouched batch. This document told you to use
`--written` for nine batches, and nine batches went out unlinted on the strength of it.

Fix everything you are going to fix — cut any manner tails, settle any wording.
**All editing stops here.**

When the linter flags something, decide whether the *prose* or the *rule* is wrong.
Several rules have needed narrowing (defining participles after "the man", "the lot"
as an auction lot). Fix the rule when it's the rule, and say so. But the opposite
mistake is the commoner one: the instrument has no taste, and contorting a good line
to satisfy a heuristic is how the worst sentence in this document got written.

## Step 9 — The cold read, last, always

Only now, on text nothing else is going to touch, write **three lists** for every
facet into the batch file:

```
ON THE PAGE:    every fact the line actually states, in order
THE ACT NEEDS:  every person, object and event the closing act refers to
THE POLE NEEDS: what makes this read as THIS pole, and what the other button is
```

Every item in the second and third lists must appear in the first. If it doesn't,
either put it on the page or change the act.

This is the single highest-frequency failure in the whole process and it cannot be
caught by re-reading or by the linter. Why re-reading fails: you wrote the line with
the whole scene in your head, so the missing facts are present to you and absent to
the reader. Enumerating is the only way to see the page as a stranger does. No regex
can do it — definite references resolve semantically, and a linter that tried would
flag 159 perfectly good approved facets.

**Worked failure.** *"Under your name you write the date the fire alarm went off in
her first week."* — ON THE PAGE: a leaving card, a colleague, she's going to another
company. THE ACT NEEDS: a fire alarm, a first week, a shared memory of both. None are
on the page, so the act refers to a history only the writer has. The fix is not to cut
the detail but to establish it: *"In her first week she set the fire alarm off making
toast, and the whole building stood out in the car park in the rain for an hour. Under
your name you write the date it happened."*

**On the third list, which was added late and after four separate failures.** The
first two lists test whether the line *parses*. They do not test whether it is still
probing the thing it was built to probe, and a line can lose that while every
referent stays intact. All four came from trimming or rewriting, and all four passed
a clean cold read:

- `sweet-boiled-navy` facetMost lost "ninety bags in the store room". Hoarding became
  ordinary policy — with no surplus on the page there is no excess to vote on.
- `sour-roasted-fava` facetMost lost "there is a version of that which would sound
  better". That clause *is* Resist; without it the facet offers no other button.
- `sour-roasted-fava` facetLeast lost the four hundred pounds, and with it the cost.
- `umami-dried-chickpea` facetLow lost "nothing else to do all night", so talking
  about the route stopped being a choice.

So ask, in writing: **what on the page makes this the excess rather than the trait**
(or the inverse rather than restraint), **and what exactly would Resist look like?**
Both answers must be things the line states. A pole with no evidence is a different
pole; a pole with no opposite is a portrait. One facet reached this list with every
referent correct and a scene that had made Resist literally impossible.

### Any edit re-triggers the cold read

Not a re-reading — the lists, written out again, on the new text. Every referent
break found so far was introduced by an edit made *after* the line was checked,
because the edit is always a trim and a trim always takes a noun with it. A late
tidying pass across a finished batch is the most dangerous moment in the process,
precisely because it feels like it is only touching the surface.

**Rewriting a whole scene is more dangerous than trimming one, not less.** When a
scene is replaced, its old nouns stay live in your head and the act keeps pointing at
them. The rowing machine the new version no longer contained, so "you get off" got
off nothing. The food stall whose name survived only in the ledger row. The outdoor
production that became "the director" and "the third row". In each case the act was
correct about the scene the writer remembered.

**Reshaping has collateral.** Changing one facet can push its entry over the
same-shape cap, forcing edits to facets you weren't targeting. Those are edits like
any other and re-trigger the cold read. Mark them in the batch file so the reason
survives.

### Stamp, then commit

```
node scripts/cold-read.mjs     stamp  src/content/facet-batches/batch-NN.tsv
node scripts/facet-ledger.mjs   commit src/content/facet-batches/batch-NN.tsv
```

The stamp records a hash of the exact text you read. `commit` recomputes those hashes
and **refuses the batch if any facet has changed since**, so a late tidying pass
cannot slip past the reading. Edit something afterwards — and you will — and that
facet goes back through the cold read and gets restamped.

**Know what the stamp cannot do.** Stamping is an assertion, not a verification. It
catches text that drifts *after* a read; it cannot catch a read that never happened,
because the stamp goes on either way. This has been tested in anger: a pass was
reasoned about in general, described in the batch file as read, and stamped — and
nothing objected. The gate protects against forgetting, not against skipping.
Skipping is on you.

Why it is wired into the build rather than left as a rule: it *was* a rule, in this
document, in bold, and it still failed. Seven of the seven referent breaks in batch 02
were introduced by edits made after the line had been cold-read. Not one came from the
original draft. The cold read never fails by being refused; it fails by being
overtaken.

Then tick the batch in the plan file. Leave `lastUpdated` alone — that is Caleb's.

---

# Part 3 — Reference

## Batches — the plan file is the contract

The remaining entries are queued in `src/content/facet-plan.md`, five per batch,
arranged so no two entries in a batch share a bean, a flavour or a form. Slug order
is the one order never to use: slugs are `flavour-form-bean`, so consecutive files
share two axes and near-neighbour traits, and the scenes bleed into each other.

Each batch gets a working file, `src/content/facet-batches/batch-NN.tsv`, holding the
machine rows and — as `#` comments — the two things that cannot be linted: **the axis
sentence with what-it-isn't** (step 1) and **the cold read of every finished line**
(step 9). Writing them into the file rather than performing them in chat is the
point: it makes skipping them visible, and it survives a handover.

```
node scripts/facet-ledger.mjs plan   <batch.tsv>   # before any prose
node scripts/cold-read.mjs     stamp <batch.tsv>   # after the last edit
node scripts/facet-ledger.mjs commit <batch.tsv>   # refuses on drift
```

`plan` checks all 25 rows at once — buckets, thin bucket, the 3/2 pitch mix, scenario
uniqueness, the setting window, cast caps — and refuses the batch **before any prose
exists**. The incremental `add` only fails on the fifth row, by which point the
writing is done and the pull is to keep it.

## The ledger

`src/content/facet-ledger.tsv` records what every written facet is *about*. It exists
because repetition is invisible from inside a single entry — the corpus is 360
entries and nobody can hold it in their head.

- **setting** — a term from the script's controlled vocabulary, not a description.
  `house`, `street`, `pub`, `stairwell`, `uncanny`. No possessives ("kitchen", not
  "your kitchen"), no scene detail — "street on the way to a station" and "street
  outside the pub" are both `street`. `add` rejects anything off the list and suggests
  near matches; pass `--new-setting=<bucket>` when a genuinely new place turns up, and
  add it to `BUCKETS` in the script.
- **scenario** — exactly two hyphenated words naming what structurally happens
  (`favour-asked`, `commitment-broken`, `credit-deflected`). Unlike setting, this
  should be **unique across all 1,800 facets**. If `add` shouts that it exists, make
  the scenario specific to this trait rather than the generic shape of the act.
- **cast** — `alone`, `friend`, `stranger`, `group`, `family`, `official`,
  `neighbour`, `partner`, `colleague`, `housemate`, `child`. Two of any one cast per
  entry, maximum.
- **pitch** — `grounded` or `elevated`, three and two per entry.

**The twenty register buckets:** domestic, nightlife, eating, retail, services,
transit, street, nature, leisure, sport, medical, civic, learning, culture, work,
ceremony, away, care, remote, strange.

---

> ⛔ **The scenarios in this document are burned.** Every concrete image used above as
> illustration is an example of the *shape*, never inventory to draw from. If a facet
> you've written resembles one, throw it out and start from a fresh image.
