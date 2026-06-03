# Spirit tags

Four frontmatter fields steer the Beanstalk's spirit-radar soft scoring. Unlike
the old per-tier facet tags, these are **per zodiac**, derived from its trait:

```yaml
friendlyBeans: [green, edamame]   # 2 beans that align with the trait
antiBeans: [black, butter]        # 2 beans that align with the opposite of the trait
friendlyForm: fermented           # 1 form that aligns with the trait
antiForm: smoked                  # 1 form that aligns with the opposite
```

Tags are a scoring signal only — they never change which fortune shows or any
displayed copy.

**Flavours are deliberately untagged.** The five flavours are orthogonal
registers (bitter/sour/spicy/sweet/umami), not overlapping personalities — there
is no natural "opposite of spicy," so a forced `antiFlavour` would be noise. The
flavour ring still evolves, but only via the base pass on each fortune's own
flavour. Affinity tagging lives on the bean ring (where beans genuinely shade
into one another) and the form ring (which has a mild temperamental spectrum).

## Generated, not hand-authored

These fields are produced by [`scripts/generate-spirit-tags.py`](../../scripts/generate-spirit-tags.py)
and rewritten in bulk. **Don't hand-edit them** — re-run the script instead:

```sh
python3 scripts/generate-spirit-tags.py        # rewrite all 360 files
python3 scripts/generate-spirit-tags.py --dry  # preview + print distribution
```

The script maps every personality adjective (the trait words on beans, flavours,
forms, and each zodiac's distilled `trait`) onto bipolar semantic axes via a
lexicon. A candidate's vector is the sum of its trait words; a zodiac's vector is
its distilled trait (weighted) plus the trait words of its own bean + flavour +
form (the flavour still shapes the zodiac's character vector even though we don't
tag flavours). **friendly** = the candidates most aligned with that vector;
**anti** = the most opposed. The zodiac's own bean/form is always excluded.

A load-balancing penalty (`LAMBDA`) keeps each bean/form used roughly evenly
across all 360 entries as both a friendly and an anti tag, so no single attribute
dominates a column — affinity decides ties, balance decides the rest. The `--dry`
run prints the per-ring distribution so you can see the spread.

To improve the tagging, edit the `LEXICON` (add missing trait words or adjust
axis weights) or `LAMBDA` in the script, then re-run and rebuild content.

## How it scores

When a user accepts or resists a **facet** fortune (question/rorschach variants
forgo the soft pass), two things happen — see [`lib/spiritBean.ts`](../lib/spiritBean.ts):

1. **Base pass** — the zodiac's own triple (its flavour, form, and bean) is
   scored at full strength. Trait-positive tiers (Most/High/Mid) push it up;
   anti-trait tiers (Low/Least) push it down.
2. **Soft pass** — the **active set** gets a weaker bump. The active set is
   `friendly*` on positive tiers and `anti*` on anti-trait tiers. **Accepting
   lifts the active set; resisting lowers it**, at every tier. The bean ring
   takes the full bump; the well-separated form ring takes a lighter one.

So accepting "yes, that's me" on an anti-trait (Low/Least) line lifts the *anti*
set while the base pass pushes your own triple down — driving the spirit bean
away from where it started and toward what the off-character line embodies. That
drift is the whole mechanic of the Beanstalk.

| user action | tier | base (own triple) | soft (active bean + form set) |
| --- | --- | --- | --- |
| accept | Most/High/Mid | up | friendly up |
| resist | Most/High/Mid | down | friendly down |
| accept | Low/Least | down | anti up |
| resist | Low/Least | up | anti down |

## The twelve beans / five flavours / six forms

The lexicon is built from the trait words below (the last in each list is the
shadow trait). `src/content/{beans,flavours,forms}/` is the authoritative source.

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

- `bitter` — discerning, complex, cultivated, intelligent, *cold*
- `sour` — sharp, clarifying, precise, honest, *nasty*
- `spicy` — bold, transformative, immediate, intense, *overwhelming*
- `sweet` — joyful, comforting, generous, effortless, *lazy*
- `umami` — rich, satisfying, warm, deep, *slow*

- `boiled` — patient, steady, nourishing, composed, *melancholic*
- `dried` — austere, concentrated, stoic, solitary, *unyielding*
- `fermented` — complex, introspective, unconventional, perceptive, *weird*
- `fried` — decisive, passionate, energetic, bold, *irascible*
- `roasted` — warm, generous, radiant, convivial, *hedonistic*
- `smoked` — enigmatic, inscrutable, elusive, oblique, *uncanny*

## Rules the build enforces

`build-content.mjs` fails the build unless every zodiac has: `friendlyBeans` and
`antiBeans` as exactly 2 valid bean ids each, and `friendlyForm`, `antiForm` as
single valid form ids — none of which may be the zodiac's own bean/form.
