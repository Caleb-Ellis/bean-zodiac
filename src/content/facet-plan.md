# Facet rewrite plan

The queue for the remaining 270 entries. Approved entries (`lastUpdated` filled) and
the 26 already rewritten are not in it.

**The contract** is `src/content/FACETS.md`, Part 2 — nine steps, in order, worked a
whole batch at a time. Don't work from a summary of it; the steps carry the rules.

What is specific to this file:

- Each batch gets `src/content/facet-batches/batch-NN.tsv`, holding the 25 ledger rows
  plus, as `#` comments, the axis notes (step 1) and the three-list cold read (step 9).
- Use the pitch layout below unless there's a reason to depart from it.
- Tick the batch off in the status list when `commit` has passed. Leave `lastUpdated`
  for Caleb.

**Pitch layout** rotates mechanically so the elevated pair doesn't settle on the
same slots — left to judgement it drifts to `facetMost` and `facetHigh` every time.

| batch | entries | pitch layout (most/high/mid/low/least) |
| --- | --- | --- |
| 01 | sour-roasted-cannellini · sour-fried-fava · umami-smoked-kidney · bitter-dried-butter · spicy-boiled-chickpea | G/E/G/E/G |
| 02 | sour-boiled-cannellini · sour-roasted-edamame · umami-fried-fava · bitter-dried-kidney · spicy-smoked-adzuki | G/G/E/G/E |
| 03 | sour-roasted-pinto · sour-smoked-cannellini · umami-dried-chickpea · bitter-fermented-adzuki · sweet-boiled-navy | E/G/G/E/G |
| 04 | sour-dried-cannellini · sour-roasted-fava · umami-fried-butter · bitter-smoked-adzuki · sweet-fermented-black | G/E/G/G/E |
| 05 | sour-fermented-pinto · sour-dried-navy · umami-roasted-green · spicy-boiled-cannellini · bitter-fried-adzuki | E/G/E/G/G |
| 06 | umami-roasted-black · umami-fried-adzuki · sour-boiled-navy · spicy-smoked-edamame · sweet-dried-chickpea | G/E/G/E/G |
| 07 | umami-dried-edamame · umami-fried-mung · sour-roasted-green · spicy-smoked-fava · sweet-boiled-cannellini | G/G/E/G/E |
| 08 | bitter-fermented-cannellini · bitter-dried-fava · sour-fried-navy · spicy-roasted-edamame · sweet-boiled-pinto | E/G/G/E/G |
| 09 | bitter-smoked-cannellini · bitter-roasted-green · sour-dried-black · spicy-fried-edamame · sweet-fermented-navy | G/E/G/G/E |
| 10 | umami-fried-pinto · umami-fermented-green · sour-boiled-adzuki · spicy-roasted-chickpea · sweet-smoked-navy | E/G/E/G/G |
| 11 | umami-boiled-black · umami-smoked-green · sour-fermented-chickpea · spicy-roasted-adzuki · sweet-fried-pinto | G/E/G/E/G |
| 12 | bitter-roasted-kidney · bitter-dried-mung · sour-fermented-black · spicy-smoked-green · sweet-fried-chickpea | G/G/E/G/E |
| 13 | bitter-smoked-navy · bitter-dried-adzuki · sour-roasted-chickpea · spicy-fried-cannellini · sweet-fermented-butter | E/G/G/E/G |
| 14 | umami-boiled-kidney · umami-fried-navy · sour-dried-adzuki · spicy-roasted-black · sweet-fermented-fava | G/E/G/G/E |
| 15 | umami-smoked-black · umami-fermented-kidney · sour-fried-green · spicy-dried-chickpea · sweet-roasted-adzuki | E/G/E/G/G |
| 16 | bitter-fermented-black · bitter-boiled-navy · sour-fried-edamame · spicy-smoked-mung · sweet-roasted-green | G/E/G/E/G |
| 17 | bitter-fermented-navy · bitter-smoked-fava · sour-boiled-mung · spicy-dried-butter · sweet-fried-black | G/G/E/G/E |
| 18 | umami-roasted-fava · umami-dried-adzuki · sour-smoked-mung · spicy-fried-black · sweet-boiled-kidney | E/G/G/E/G |
| 19 | umami-roasted-butter · umami-fried-kidney · sour-smoked-chickpea · spicy-dried-adzuki · sweet-boiled-black | G/E/G/G/E |
| 20 | bitter-fried-kidney · bitter-roasted-cannellini · sour-boiled-butter · spicy-fermented-adzuki · sweet-smoked-black | E/G/E/G/G |
| 21 | bitter-smoked-chickpea · bitter-boiled-cannellini · sour-fried-kidney · spicy-roasted-pinto · sweet-dried-black | G/E/G/E/G |
| 22 | umami-fermented-black · umami-dried-butter · sour-smoked-kidney · spicy-roasted-cannellini · sweet-fried-mung | G/G/E/G/E |
| 23 | umami-fried-green · umami-dried-mung · sour-fermented-kidney · spicy-smoked-cannellini · sweet-boiled-edamame | E/G/G/E/G |
| 24 | bitter-fried-black · bitter-dried-navy · sour-roasted-mung · spicy-smoked-butter · sweet-fermented-chickpea | G/E/G/G/E |
| 25 | bitter-fried-green · bitter-boiled-chickpea · sour-fermented-mung · spicy-roasted-butter · sweet-smoked-kidney | E/G/E/G/G |
| 26 | umami-fried-edamame · umami-dried-kidney · sour-boiled-green · spicy-smoked-pinto · sweet-roasted-cannellini | G/E/G/E/G |
| 27 | umami-boiled-adzuki · umami-fermented-butter · sour-fried-chickpea · spicy-dried-cannellini · sweet-roasted-mung | G/G/E/G/E |
| 28 | bitter-fried-pinto · bitter-fermented-butter · sour-smoked-green · spicy-dried-kidney · sweet-boiled-mung | E/G/G/E/G |
| 29 | bitter-dried-pinto · bitter-fried-fava · sour-fermented-butter · spicy-roasted-green · sweet-smoked-cannellini | G/E/G/G/E |
| 30 | umami-fermented-adzuki · umami-boiled-fava · sour-fried-black · spicy-dried-mung · sweet-roasted-pinto | E/G/E/G/G |
| 31 | umami-fermented-edamame · umami-smoked-fava · sour-roasted-kidney · spicy-boiled-green · sweet-fried-butter | G/E/G/E/G |
| 32 | bitter-fried-navy · bitter-boiled-kidney · sour-fermented-green · spicy-dried-fava · sweet-smoked-chickpea | G/G/E/G/E |
| 33 | bitter-fried-cannellini · bitter-smoked-butter · sour-roasted-black · spicy-boiled-edamame · sweet-dried-fava | E/G/G/E/G |
| 34 | umami-boiled-green · umami-roasted-mung · sour-fermented-navy · spicy-smoked-black · sweet-fried-kidney | G/E/G/G/E |
| 35 | umami-roasted-navy · umami-boiled-mung · sour-dried-chickpea · spicy-fermented-cannellini · sweet-fried-edamame | E/G/E/G/G |
| 36 | bitter-roasted-pinto · bitter-fermented-green · sour-boiled-black · spicy-fried-mung · sweet-dried-kidney | G/E/G/E/G |
| 37 | bitter-fermented-kidney · bitter-dried-black · sour-roasted-navy · spicy-fried-chickpea · sweet-boiled-adzuki | G/G/E/G/E |
| 38 | umami-fermented-mung · umami-boiled-navy · sour-dried-edamame · spicy-roasted-fava · sweet-fried-cannellini | E/G/G/E/G |
| 39 | umami-smoked-mung · umami-boiled-cannellini · sour-fermented-fava · spicy-dried-edamame · sweet-roasted-black | G/E/G/G/E |
| 40 | bitter-dried-green · bitter-boiled-fava · sour-fried-adzuki · spicy-fermented-edamame · sweet-roasted-chickpea | E/G/E/G/G |
| 41 | bitter-roasted-butter · bitter-boiled-adzuki · sour-smoked-black · spicy-fermented-fava · sweet-dried-mung | G/E/G/E/G |
| 42 | umami-smoked-navy · umami-boiled-edamame · sour-dried-butter · spicy-fried-pinto · sweet-fermented-mung | G/G/E/G/E |
| 43 | umami-smoked-adzuki · umami-dried-fava · sour-boiled-pinto · spicy-fermented-butter · sweet-fried-navy | E/G/G/E/G |
| 44 | bitter-smoked-mung · bitter-roasted-black · sour-boiled-chickpea · spicy-dried-pinto · sweet-fermented-kidney | G/E/G/G/E |
| 45 | bitter-roasted-navy · bitter-fermented-fava · sour-boiled-edamame · spicy-dried-black · sweet-smoked-green | E/G/E/G/G |
| 46 | umami-dried-green · umami-boiled-pinto · sour-smoked-adzuki · spicy-roasted-navy · sweet-fermented-cannellini | G/E/G/E/G |
| 47 | umami-smoked-pinto · umami-fermented-cannellini · sour-dried-green · spicy-boiled-mung · bitter-fried-butter | G/G/E/G/E |
| 48 | sweet-boiled-fava · sweet-fermented-edamame · sour-roasted-adzuki · spicy-smoked-kidney · bitter-fried-mung | E/G/G/E/G |
| 49 | sweet-fermented-green · sweet-dried-adzuki · sour-fried-pinto · spicy-boiled-fava · bitter-smoked-black | G/E/G/G/E |
| 50 | umami-roasted-kidney · umami-fermented-pinto · sour-dried-mung · bitter-smoked-edamame · sweet-boiled-green | E/G/E/G/G |
| 51 | spicy-boiled-kidney · spicy-fermented-pinto · umami-dried-cannellini · sour-smoked-fava · bitter-roasted-mung | G/E/G/E/G |
| 52 | spicy-roasted-kidney · spicy-dried-green · umami-fried-cannellini · sour-fermented-edamame · bitter-boiled-pinto | G/G/E/G/E |
| 53 | sweet-fermented-pinto · sweet-smoked-mung · umami-dried-black · sour-boiled-fava · bitter-roasted-chickpea | E/G/G/E/G |
| 54 | sweet-smoked-fava · umami-roasted-edamame · sour-dried-pinto · bitter-fermented-chickpea · spicy-fried-kidney | G/E/G/G/E |

`E` elevated · `G` grounded — three grounded and two elevated in every entry.

## Status

- [x] **batch 01** — sour-roasted-cannellini (frank), sour-fried-fava (swift), umami-smoked-kidney (mournful), bitter-dried-butter (tranquil), spicy-boiled-chickpea (resourceful)
- [x] **batch 02** — sour-boiled-cannellini (precise), sour-roasted-edamame (forthright), umami-fried-fava (assured), bitter-dried-kidney (hardy), spicy-smoked-adzuki (transfixing)
- [x] **batch 03** — sour-roasted-pinto (irreverent), sour-smoked-cannellini (piercing), umami-dried-chickpea (substantive), bitter-fermented-adzuki (antiquarian), sweet-boiled-navy (provident)
- [x] **batch 04** — sour-dried-cannellini (stringent), sour-roasted-fava (authentic), umami-fried-butter (settled), bitter-smoked-adzuki (oracular), sweet-fermented-black (pensive)
- [x] **batch 05** — sour-fermented-pinto (sardonic), sour-dried-navy (firm), umami-roasted-green (curious), spicy-boiled-cannellini (painstaking), bitter-fried-adzuki (droll)
- [x] **batch 06** — umami-roasted-black (insightful), umami-fried-adzuki (passionate), sour-boiled-navy (literal-minded), spicy-smoked-edamame (feisty), sweet-dried-chickpea (wholesome)
- [x] **batch 07** — umami-dried-edamame (foundational), umami-fried-mung (purposeful), sour-roasted-green (ebullient), spicy-smoked-fava (wild), sweet-boiled-cannellini (kind)
- [x] **batch 08** — bitter-fermented-cannellini (scholarly), bitter-dried-fava (steely), sour-fried-navy (particular), spicy-roasted-edamame (confident), sweet-boiled-pinto (daydreamy)
- [x] **batch 09** — bitter-smoked-cannellini (hermetic), bitter-roasted-green (brisk), sour-dried-black (flinty), spicy-fried-edamame (emphatic), sweet-fermented-navy (homespun)
- [x] **batch 10** — umami-fried-pinto (instinctive), umami-fermented-green (creative), sour-boiled-adzuki (sincere), spicy-roasted-chickpea (gregarious), sweet-smoked-navy (lingering)
- [x] **batch 11** — umami-boiled-black (patient), umami-smoked-green (budding), sour-fermented-chickpea (clever), spicy-roasted-adzuki (exultant), sweet-fried-pinto (effusive)
- [x] **batch 12** — bitter-roasted-kidney (proud), bitter-dried-mung (clinical), sour-fermented-black (perceptive), spicy-smoked-green (footloose), sweet-fried-chickpea (funny)
- [x] **batch 13** — bitter-smoked-navy (watchful), bitter-dried-adzuki (selective), sour-roasted-chickpea (open-minded), spicy-fried-cannellini (driven), sweet-fermented-butter (silly)
- [x] **batch 14** — umami-boiled-kidney (disciplined), umami-fried-navy (authoritative), sour-dried-adzuki (tart), spicy-roasted-black (magnetic), sweet-fermented-fava (visionary)
- [x] **batch 15** — umami-smoked-black (solemn), umami-fermented-kidney (rooted), sour-fried-green (impulsive), spicy-dried-chickpea (conductive), sweet-roasted-adzuki (convivial)
- [x] **batch 16** — bitter-fermented-black (ruminative), bitter-boiled-navy (upright), sour-fried-edamame (blunt), spicy-smoked-mung (bewitching), sweet-roasted-green (buoyant)
- [x] **batch 17** — bitter-fermented-navy (bookish), bitter-smoked-fava (otherworldly), sour-boiled-mung (impartial), spicy-dried-butter (taut), sweet-fried-black (ardent)
- [x] **batch 18** — umami-roasted-fava (defiant), umami-dried-adzuki (reverential), sour-smoked-mung (revealing), spicy-fried-black (relentless), sweet-boiled-kidney (compassionate)
- [x] **batch 19** — umami-roasted-butter (receptive), umami-fried-kidney (stalwart), sour-smoked-chickpea (attuned), spicy-dried-adzuki (avid), sweet-boiled-black (constant)
- [x] **batch 20** — bitter-fried-kidney (hard-line), bitter-roasted-cannellini (refined), sour-boiled-butter (honest), spicy-fermented-adzuki (rhapsodic), sweet-smoked-black (mystical)
- [x] **batch 21** — bitter-smoked-chickpea (liminal), bitter-boiled-cannellini (judicious), sour-fried-kidney (challenging), spicy-roasted-pinto (flamboyant), sweet-dried-black (abiding)
- [x] **batch 22** — umami-fermented-black (introspective), umami-dried-butter (mellow), sour-smoked-kidney (searing), spicy-roasted-cannellini (charismatic), sweet-fried-mung (openhanded)
- [x] **batch 23** — umami-fried-green (accomplished), umami-dried-mung (restorative), sour-fermented-kidney (tested), spicy-smoked-cannellini (arresting), sweet-boiled-edamame (dependable)
- [x] **batch 24** — bitter-fried-black (forensic), bitter-dried-navy (steady), sour-roasted-mung (solicitous), spicy-smoked-butter (hushed), sweet-fermented-chickpea (empathetic)
- [x] **batch 25** — bitter-fried-green (impatient), bitter-boiled-chickpea (conciliatory), sour-fermented-mung (diagnostic), spicy-roasted-butter (indulgent), sweet-smoked-kidney (enamoured)
- [x] **batch 26** — umami-fried-edamame (keen), umami-dried-kidney (faithful), sour-boiled-green (outspoken), sweet-roasted-cannellini (welcoming). Four entries: spicy-smoked-pinto (spellbinding) was already approved on 2026-08-24 and was left untouched.
- [x] **batch 27** — umami-boiled-adzuki (affectionate), umami-fermented-butter (reflective), sour-fried-chickpea (nimble), spicy-dried-cannellini (sure), sweet-roasted-mung (cosseting)
- [ ] **batch 28** — bitter-fried-pinto (satirical), bitter-fermented-butter (philosophical), sour-smoked-green (pungent), spicy-dried-kidney (primed), sweet-boiled-mung (nurturing)
- [ ] **batch 29** — bitter-dried-pinto (cryptic), bitter-fried-fava (fearless), sour-fermented-butter (understated), spicy-roasted-green (high-spirited), sweet-smoked-cannellini (delicate)
- [ ] **batch 30** — umami-fermented-adzuki (elegiac), umami-boiled-fava (resolved), sour-fried-black (clipped), spicy-dried-mung (piquant), sweet-roasted-pinto (mischievous)
- [ ] **batch 31** — umami-fermented-edamame (observant), umami-smoked-fava (primal), sour-roasted-kidney (fair), spicy-boiled-green (zealous), sweet-fried-butter (sunny)
- [ ] **batch 32** — bitter-fried-navy (incisive), bitter-boiled-kidney (forbearing), sour-fermented-green (quirky), spicy-dried-fava (audacious), sweet-smoked-chickpea (charming)
- [ ] **batch 33** — bitter-fried-cannellini (exacting), bitter-smoked-butter (still), sour-roasted-black (earnest), spicy-boiled-edamame (industrious), sweet-dried-fava (indomitable)
- [ ] **batch 34** — umami-boiled-green (prolific), umami-roasted-mung (melancholy), sour-fermented-navy (scrupulous), spicy-smoked-black (smouldering), sweet-fried-kidney (doting)
- [ ] **batch 35** — umami-roasted-navy (wistful), umami-boiled-mung (replenishing), sour-dried-chickpea (wry), spicy-fermented-cannellini (singular), sweet-fried-edamame (motivated)
- [ ] **batch 36** — bitter-roasted-pinto (stylish), bitter-fermented-green (speculative), sour-boiled-black (methodical), spicy-fried-mung (urgent), sweet-dried-kidney (adoring)
- [ ] **batch 37** — bitter-fermented-kidney (vigilant), bitter-dried-black (laconic), sour-roasted-navy (declarative), spicy-fried-chickpea (spontaneous), sweet-boiled-adzuki (joyful)
- [ ] **batch 38** — umami-fermented-mung (poetic), umami-boiled-navy (custodial), sour-dried-edamame (pointed), spicy-roasted-fava (adventurous), sweet-fried-cannellini (lavish)
- [ ] **batch 39** — umami-smoked-mung (steeped), umami-boiled-cannellini (conscientious), sour-fermented-fava (contrarian), spicy-dried-edamame (mordant), sweet-roasted-black (gracious)
- [ ] **batch 40** — bitter-dried-green (honed), bitter-boiled-fava (dauntless), sour-fried-adzuki (quick-witted), spicy-fermented-edamame (inventive), sweet-roasted-chickpea (fun)
- [ ] **batch 41** — bitter-roasted-butter (nonchalant), bitter-boiled-adzuki (ceremonious), sour-smoked-black (penetrating), spicy-fermented-fava (subversive), sweet-dried-mung (tender)
- [ ] **batch 42** — umami-smoked-navy (timeless), umami-boiled-edamame (dedicated), sour-dried-butter (plain), spicy-fried-pinto (kinetic), sweet-fermented-mung (gentle)
- [ ] **batch 43** — umami-smoked-adzuki (hallowed), umami-dried-fava (formidable), sour-boiled-pinto (candid), spicy-fermented-butter (eccentric), sweet-fried-navy (romantic)
- [ ] **batch 44** — bitter-smoked-mung (ethereal), bitter-roasted-black (poised), sour-boiled-chickpea (fair-minded), spicy-dried-pinto (hot-blooded), sweet-fermented-kidney (sympathetic)
- [ ] **batch 45** — bitter-roasted-navy (prudent), bitter-fermented-fava (questioning), sour-boiled-edamame (logical), spicy-dried-black (contained), sweet-smoked-green (iridescent)
- [ ] **batch 46** — umami-dried-green (potent), umami-boiled-pinto (musing), sour-smoked-adzuki (knowing), spicy-roasted-navy (staunch), sweet-fermented-cannellini (diplomatic)
- [ ] **batch 47** — umami-smoked-pinto (atmospheric), umami-fermented-cannellini (idealistic), sour-dried-green (bracing), spicy-boiled-mung (tireless), bitter-fried-butter (deadpan)
- [ ] **batch 48** — sweet-boiled-fava (encouraging), sweet-fermented-edamame (practised), sour-roasted-adzuki (transparent), spicy-smoked-kidney (consuming), bitter-fried-mung (austere)
- [ ] **batch 49** — sweet-fermented-green (whimsical), sweet-dried-adzuki (devoted), sour-fried-pinto (open), spicy-boiled-fava (adamant), bitter-smoked-black (inscrutable)
- [ ] **batch 50** — umami-roasted-kidney (openhearted), umami-fermented-pinto (inward), sour-dried-mung (astringent), bitter-smoked-edamame (reticent), sweet-boiled-green (playful)
- [ ] **batch 51** — spicy-boiled-kidney (dogged), spicy-fermented-pinto (mercurial), umami-dried-cannellini (distinguished), sour-smoked-fava (clear-eyed), bitter-roasted-mung (temperate)
- [ ] **batch 52** — spicy-roasted-kidney (emotive), spicy-dried-green (electric), umami-fried-cannellini (principled), sour-fermented-edamame (sceptical), bitter-boiled-pinto (contemplative)
- [ ] **batch 53** — sweet-fermented-pinto (fanciful), sweet-smoked-mung (balmy), umami-dried-black (profound), sour-boiled-fava (righteous), bitter-roasted-chickpea (cosmopolitan)
- [ ] **batch 54** — sweet-smoked-fava (dazzling), umami-roasted-edamame (attentive), sour-dried-pinto (epigrammatic), bitter-fermented-chickpea (interpretive), spicy-fried-kidney (ferocious)
