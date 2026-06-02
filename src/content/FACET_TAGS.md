# Facet tags

Five frontmatter fields — `facetMostTags`, `facetHighTags`, `facetMidTags`,
`facetLowTags`, `facetLeastTags` — let each facet vignette steer the Beanstalk's spirit
radar. Each is a list of **2 or 3 bean ids**. Your job: read each of a zodiac's five facet
lines and name the beans whose nature that line **behaves like**.

Tags are a scoring signal only. They never change which fortune shows or any displayed
copy. The facet body voice is governed by `STYLE.md`; this file is only about the tags.

## Beans only — and not the zodiac's own triple

Tags are **always beans**, never flavours or forms. The five flavours and six forms each
occupy distinct, well-separated territory, so the baseline scoring already places them
well. The twelve beans overlap and shade into one another — that's where a vignette can
genuinely evoke *several* beans, and where the nuance is worth capturing.

Tags are **not limited to the zodiac's own bean or its neighbours.** Reach across all
twelve. A bitter-boiled-adzuki facet might embody Black, Navy, or Fava beans depending on
the line — that range is the whole point.

## How it scores (read this first)

When a user accepts or resists a facet, two things happen:

1. **Base pass** — the zodiac's own triple (its flavour, form, **and bean**) is scored at
   full strength. Trait-positive tiers (Most/High/Mid) push it **up**; anti-trait tiers
   (Low/Least) push it **down**. This happens with or without tags, and you don't control
   it.
2. **Soft pass — your tags** — each tagged bean gets a weaker bump. **Accepting always
   lifts the tagged beans; resisting always lowers them — at every tier.** A tag means
   "this vignette behaves like that bean," and behaving like a bean draws you toward it.

The payoff is on the anti-trait tiers. On a Low/Least line the base pass is pushing the
zodiac's **own** bean *down*, while your tags push the embodied beans *up* — so accepting
"yes, that's me" on an off-character line drives the spirit bean **away** from where it
started and toward the beans the line names. That drift is the entire mechanic of the
Beanstalk.

**You never write `+` or `-`.** Direction comes from accept/resist; strength comes from
the tier (vivid extremes count most): roughly +2 at Most/Least, +1 through the middle.

## What to tag, tier by tier

A tag is **a bean this line behaves like** — judged against the beans' personalities (see
the reference below), not against the zodiac.

- **Most / High / Mid** (the trait) — beans that share the trait this line expresses.
- **Low / Least** (the opposite of the trait) — beans that embody the *off-character*
  behaviour the line shows. These are almost never the zodiac's own bean; they're the
  beans the bean is, for a moment, acting like instead.

**Don't tag the zodiac's own bean.** On Low/Least it fights the base pass; on the positive
tiers the base already covers it, so a tag spent there says nothing. Spend all 2–3 tags on
*other* beans — that's what creates a meaningful affinity spread.

## The twelve beans (tag reference)

Match the line's behaviour to these. The last trait in each list is the bean's shadow —
useful for anti-trait (Low/Least) lines. `src/content/beans/` and the Beaniary are the
authoritative source if you need more than the keywords.

- `adzuki` — joyful, celebratory, generous, lucky, *avoidant*
- `black` — perceptive, resilient, determined, introspective, *guarded*
- `butter` — easygoing, peaceful, content, indulgent, *inert*
- `cannellini` — refined, discerning, elegant, gracious, *perfectionist*
- `chickpea` — adaptable, sociable, warm, resourceful, *uncommitted*
- `edamame` — practical, direct, quick, sharp, *dismissive*
- `fava` — courageous, bold, daring, pioneering, *reckless*
- `green` — energetic, enthusiastic, fresh, optimistic, *restless*
- `kidney` — passionate, protective, tenacious, vital, *overextended*
- `mung` — healing, gentle, nurturing, regenerative, *insecure*
- `navy` — principled, loyal, dependable, enduring, *rigid*
- `pinto` — creative, expressive, spontaneous, imaginative, *overemotional*

## Rules the build enforces

Every `facet*Tags` field present must be **2 or 3 bean ids**, lowercase, exact spelling —
anything else fails `pnpm content`. The fields are rolled out gradually like
`question`/`rorschach*`: a tier you haven't tagged yet simply omits the field. Aim to tag
all five tiers of a zodiac at once.

## Syntax

YAML inline lists in the frontmatter, beside the matching `facet*` fields:

```yaml
facetMostTags: [black, navy]
facetHighTags: [black, cannellini]
facetMidTags: [mung, butter]
facetLowTags: [edamame, green]
facetLeastTags: [fava, green, edamame]
```

## Worked example — `bitter-boiled-adzuki` (trait: *judicious*)

The trait here is slow, steeping deliberation. The facets express it (top three) and its
opposite, snap impulsiveness (bottom two). Own bean is `adzuki` — never tag it.

- **Most — "The Long Steep":** *the apology owed since Tuesday waits another day; you'll
  deliver it whole or not at all.* Deep, guarded restraint. → `[black, navy]` (perceptive,
  introspective / principled, enduring).
- **High — "Greens, Slow to Wilt":** *asked what you thought, you answer next week, when
  the rind has cooked to broth.* Measured, fastidious judgment. → `[black, cannellini]`
  (introspective / discerning).
- **Mid — "The Hour the Skin Chooses":** *the unread message keeps until evening; by dusk
  the right shape has surfaced.* Quiet, patient timing. → `[mung, butter]` (gentle,
  patient / content to wait).
- **Low — "Yuzu Picked Green":** *you buy the chair the afternoon you see it; the hand
  already knew.* Quick instinct — off-character. The beans it now behaves like get lifted:
  → `[edamame, green]` (quick, direct / fresh, show-up-before-ready).
- **Least — "The Lid Lifted Early":** *first draft sent — tart, half-steeped, committed.*
  Full headlong impulsiveness. → `[fava, green, edamame]` (reckless, daring / restless /
  quick).

Notice the tags **range freely across the twelve** and **shift the embodied beans tier to
tier** — the top tiers name deliberate beans, the bottom tiers name impulsive ones, and
none of them is `adzuki`. These are illustrative; use your own read of each line.
