#!/usr/bin/env python3
"""Generate spirit-tag frontmatter for every zodiac entry.

For each zodiac we derive the trait-aligned fields used by the Beanstalk's
scoring pass (see the Spirit Bean section of README.md). The model is symmetric
— each zodiac has two poles, and each pole is a triple plus an entourage of 2
beans and 1 form:

  friendly pole : the zodiac's own slug + friendlyBeans (2) + friendlyForm (1)
  anti pole     : antiTriple            + antiBeans (2)     + antiForm (1)

  friendlyBeans : 2 beans that align with the zodiac's trait (never its own)
  antiBeans     : 2 beans that align with the zodiac's inverse
  antiTriple    : the zodiac's shadow — a real `{flavour}-{form}-{bean}` slug
                  built from the flavour, form and bean nearest the inverse
  friendlyForm  : 1 form that aligns with the trait (never its own)
  antiForm      : 1 form that aligns with the inverse

Because antiTriple carries a flavour, the anti pole gets flavour movement the
same way the friendly pole always has — through its triple — so no separate
flavour tag is needed. The anti-triple's bean/form are barred from antiBeans/
antiForm, so each pole covers 3 distinct beans and 2 distinct forms.

How it works: every personality adjective (the trait words on beans, flavours
and forms, and each zodiac's authored `trait` and `inverse`) is mapped onto a
handful of bipolar semantic axes via LEXICON below. A candidate's vector is the
sum of its trait words. A zodiac gets *two* vectors, one per pole:

  friendly = TRAIT_WEIGHT * trait   + (bean + flavour + form)
  anti     = TRAIT_WEIGHT * inverse - (bean + flavour + form)

The inverse is authored, not derived, so the anti pole is built from what the
entry actually says its opposite is rather than from the negated trait — the two
part company often enough to matter (the inverse of `responsible` is
`unaccountable`, which is not merely "less order"). Its triple term is negated
because the shadow is the entry's own bean/flavour/form read backwards. Both
poles then pick the *same* way — highest cosine with their own vector — so anti
means "genuinely like the inverse" rather than "unlike the trait", and an
orthogonal stranger no longer qualifies. The zodiac's own bean/flavour/form is
always excluded from its own lists.

`excess` is deliberately unused: it is the trait overshot, so it points the same
direction the trait does and adds nothing to a cosine model.

Every trait and inverse word in the corpus must appear in LEXICON — a word with
no entry contributes a zero vector and quietly leaves that pole to its triple —
so the run aborts, naming them, before writing anything.

This is a deterministic heuristic, not a hand-tuned pass — the tags are a coarse
scoring signal, not displayed copy. Re-run after editing the lexicon, or after
changing any zodiac's trait or inverse:

  python3 scripts/generate-spirit-tags.py        # rewrite all 360 files
  python3 scripts/generate-spirit-tags.py --dry  # print, don't write
"""

import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src" / "content"
# Which zodiac collection to tag. Override with --dir=<name> to regenerate a
# different one.
ZODIAC_DIR = "zodiacs"

# Bipolar semantic axes. Each adjective contributes signed weights on the axes
# it touches; unlisted axes are zero.
AXES = [
    "energy", "warmth", "depth", "stability", "risk", "care", "refine", "express",
    "social",
    # Added axes. "mood" is valence (buoyant <-> sorrowful) — without it a
    # melancholic bean scores the same as a cold, slow, deep one. "disclose" is
    # self-revelation, split out of "express": a Smoked bean can be highly
    # expressive and still tell you nothing. "order" is deference to structure,
    # split out of "stability": Navy's steadiness and Fava's are opposites here.
    "mood", "disclose", "order",
]

# adjective -> {axis: weight}. Covers every trait word used by the 12 beans, 5
# flavours and 6 forms, plus every `trait` and `inverse` authored across the 360
# zodiacs. Nothing else belongs here: main() checks the corpus against it and
# refuses to run if a word is missing.
LEXICON = {
    # --- parent words: the trait lists of the 12 beans, 5 flavours, 6 forms ---
    "accepting": {"care": 1, "social": 1, "order": -1},
    "adaptable": {"stability": -1, "risk": 1, "social": 1},
    "affectionate": {"warmth": 2, "care": 1, "disclose": 1},
    "ambitious": {"energy": 2, "risk": 1, "order": -1},
    "anxious": {"energy": 1, "stability": -1, "mood": -1},
    "arresting": {"energy": 1, "express": 2},
    "arrogant": {"care": -1, "express": 1, "social": -1, "disclose": -1},
    "attentive": {"depth": 1, "care": 2, "refine": 1},
    "auspicious": {"mood": 1},
    "avoidant": {"risk": -1, "care": -1, "disclose": -1},
    "bracing": {"energy": 1, "care": -1, "refine": 1},
    "brittle": {"stability": -1, "care": -1, "refine": 1},
    "buoyant": {"energy": 1, "stability": 1, "mood": 2},
    "calming": {"energy": -1, "warmth": 1, "care": 1},
    "candid": {"care": -1, "express": 1, "disclose": 2},
    "capable": {"stability": 1, "refine": 1},
    "catalytic": {"energy": 2, "express": 1, "social": 1},
    "caustic": {"warmth": -2, "care": -2, "express": 1},
    "celebratory": {"warmth": 1, "express": 2, "social": 2, "mood": 2},
    "championing": {"care": 2, "express": 1, "social": 1},
    "clarifying": {"depth": 1, "refine": 1},
    "clear-eyed": {"depth": 1, "refine": 1, "mood": -1},
    "cloying": {"warmth": 1, "refine": -2, "mood": 1},
    "cold": {"warmth": -2},
    "combustible": {"energy": 2, "stability": -2},
    "commemorative": {"depth": 1, "mood": -1, "order": 1},
    "committed": {"stability": 1, "care": 1, "order": 1},
    "complacent": {"energy": -1, "risk": -1, "mood": 1, "order": -1},
    "composed": {"stability": 2},
    "concentrated": {"depth": 1, "stability": 1, "refine": 1},
    "contented": {"energy": -1, "stability": 1, "mood": 1},
    "convening": {"care": 1, "social": 2},
    "courageous": {"energy": 1, "risk": 2},
    "cultivated": {"depth": 1, "refine": 2},
    "curious": {"energy": 1, "depth": 1, "social": 1},
    "curt": {"care": -1, "express": -2, "disclose": -1},
    "daring": {"energy": 1, "risk": 2},
    "decisive": {"energy": 1, "stability": 1},
    "decorous": {"refine": 2, "express": -1, "order": 2},
    "deep": {"depth": 2},
    "defiant": {"risk": 1, "express": 1, "order": -2},
    "dependable": {"stability": 2, "order": 1},
    "devoted": {"warmth": 1, "stability": 1, "care": 2, "order": 1},
    "direct": {"depth": -1, "express": 1},
    "discerning": {"depth": 1, "refine": 2},
    "discreet": {"refine": 1, "disclose": -1},
    "disdainful": {"warmth": -2, "care": -1, "social": -1},
    "dismissive": {"warmth": -1, "care": -2},
    "distinctive": {"refine": 1, "express": 1},
    "dogmatic": {"depth": -1, "care": -1, "order": 2},
    "dry": {"warmth": -1, "express": -1, "mood": -1},
    "dutiful": {"stability": 1, "care": 1, "order": 2},
    "eager": {"energy": 2, "mood": 1},
    "ebullient": {"energy": 2, "express": 1, "social": 1, "mood": 2},
    "elusive": {"warmth": -1, "depth": 1, "stability": -1},
    "enduring": {"stability": 2},
    "exacting": {"stability": 1, "refine": 2, "order": 1},
    "excessive": {"risk": 1, "refine": -1, "order": -1},
    "expansive": {"warmth": 1, "express": 2, "social": 1, "disclose": 1},
    "exploitable": {"risk": -1, "care": 1, "order": 1},
    "expressive": {"warmth": 1, "express": 2},
    "fervent": {"energy": 2, "warmth": 1, "order": 1},
    "flighty": {"stability": -2, "order": -1},
    "flourishing": {"energy": 1, "express": 1, "mood": 1},
    "forgiving": {"care": 2, "order": -1},
    "forthcoming": {"express": 1, "social": 1, "disclose": 2},
    "galvanising": {"energy": 2, "express": 1, "social": 1},
    "generous": {"warmth": 2, "care": 1},
    "gratifying": {"warmth": 1, "care": 1, "mood": 1},
    "healing": {"care": 2},
    "heavy": {"energy": -1, "mood": -1},
    "hospitable": {"warmth": 2, "care": 1, "social": 2},
    "imaginative": {"depth": 1, "express": 2},
    "immediate": {"energy": 2, "stability": -1},
    "imperishable": {"stability": 2},
    "incisive": {"depth": 1, "refine": 2},
    "indirect": {"depth": 1, "express": -1, "disclose": -1},
    "indulgent": {"risk": 1, "refine": -1, "mood": 1, "order": -1},
    "inert": {"energy": -2, "risk": -1},
    "ingratiating": {"care": 1, "social": 1, "disclose": -1, "order": 1},
    "initiating": {"energy": 2, "risk": 1},
    "insecure": {"warmth": -1, "stability": -1},
    "insular": {"social": -2, "disclose": -2},
    "intense": {"energy": 2, "depth": 1},
    "inventive": {"depth": 1, "risk": 1, "express": 1},
    "inward": {"depth": 2, "social": -2, "disclose": -2},
    "ironic": {"express": 1, "mood": 1, "disclose": -1},
    "judicious": {"depth": 1, "stability": 2, "refine": 1, "order": 1},
    "lingering": {"energy": -1, "depth": 1, "stability": 1},
    "listless": {"energy": -2, "mood": -1},
    "loyal": {"warmth": 1, "stability": 2, "order": 2},
    "magnetic": {"warmth": 1, "express": 2, "social": 2},
    "mediating": {"care": 1, "social": 1, "order": 1},
    "melancholic": {"energy": -1, "depth": 1, "mood": -2},
    "mellow": {"energy": -1, "warmth": 1, "mood": 1},
    "mistrustful": {"warmth": -1, "risk": -1, "disclose": -2},
    "nurturing": {"warmth": 1, "care": 2},
    "obliging": {"care": 1, "social": 1, "order": 1},
    "observant": {"depth": 2, "disclose": -1},
    "opaque": {"depth": 1, "disclose": -2},
    "optimistic": {"energy": 1, "warmth": 1},
    "original": {"express": 2, "order": -1},
    "ostentatious": {"refine": -1, "express": 2, "social": 1},
    "overextended": {"energy": 1, "stability": -1},
    "overwhelming": {"energy": 2, "stability": -1},
    "penetrating": {"depth": 2, "refine": 1},
    "perfectionist": {"stability": 1, "refine": 2},
    "pervasive": {"depth": 1, "express": 1, "social": 1},
    "possessive": {"care": 1, "social": -1, "disclose": -1, "order": 1},
    "practical": {"depth": -1, "stability": 1, "refine": 1},
    "protective": {"warmth": 1, "care": 2},
    "radiant": {"warmth": 1, "express": 2},
    "rash": {"stability": -2, "risk": 2, "refine": -1},
    "reassuring": {"warmth": 1, "care": 1, "mood": 1},
    "receptive": {"depth": 1, "care": 1, "social": 1, "disclose": 1},
    "reckless": {"stability": -2, "risk": 2},
    "refined": {"refine": 2},
    "resolute": {"stability": 2, "risk": 1},
    "resonant": {"depth": 2, "express": 1},
    "resourceful": {"energy": 1, "risk": 1, "refine": 1},
    "restless": {"energy": 2, "stability": -2},
    "restorative": {"warmth": 1, "care": 2},
    "rigid": {"stability": 2, "risk": -1, "care": -1, "order": 2},
    "self-generating": {"energy": 1, "social": -1, "order": -1},
    "self-possessed": {"stability": 2, "disclose": -1},
    "self-sufficient": {"stability": 1, "social": -1, "disclose": -1},
    "selfless": {"care": 2, "disclose": -1, "order": 1},
    "singular": {"express": 1, "social": -1, "order": -1},
    "sociable": {"warmth": 1, "express": 1, "social": 2},
    "spare": {"refine": 1, "express": -2},
    "spirited": {"energy": 2, "express": 1, "mood": 1},
    "stagnant": {"energy": -2, "stability": 1, "mood": -1},
    "steady": {"stability": 2},
    "subtle": {"refine": 2, "express": -1},
    "suggestive": {"depth": 1, "express": 1, "disclose": -1},
    "supercilious": {"warmth": -1, "care": -1, "express": 1, "social": -1},
    "sustaining": {"stability": 2, "care": 2},
    "tactless": {"care": -2, "refine": -1, "disclose": 1},
    "tasteful": {"refine": 2, "express": 1},
    "tenacious": {"energy": 1, "stability": 1, "risk": 1},
    "theatrical": {"refine": -1, "express": 2, "disclose": -1},
    "unassuming": {"refine": -1, "express": -1, "social": -1},
    "uncommitted": {"stability": -2},
    "undaunted": {"stability": 1, "risk": 2},
    "unflappable": {"energy": -1, "stability": 2},
    "unhedged": {"risk": 1, "express": 1, "disclose": 2},
    "unhurried": {"energy": -2, "stability": 1},
    "uninhibited": {"express": 2, "disclose": 2, "order": -1},
    "unmoored": {"stability": -2, "social": -1, "order": -1},
    "unpretentious": {"refine": -1, "social": 1, "disclose": 1},
    "unrestrained": {"stability": -1, "express": 2, "order": -2},
    "unsentimental": {"warmth": -1, "depth": -1, "care": -1},
    "unwavering": {"stability": 2, "order": 1},
    "unyielding": {"stability": 2, "care": -1},
    "upright": {"stability": 1, "refine": 1, "order": 2},
    "vital": {"energy": 2},
    "vivid": {"energy": 1, "express": 2},
    "volatile": {"energy": 1, "stability": -2},
    "warm": {"warmth": 2},
    "weird": {"stability": -1, "express": 1},
    "yielding": {"stability": -1, "care": 1, "order": 1},

    # --- zodiac words: every authored trait and inverse across the 360 ---
    "abdicating": {"care": -2, "order": -2},
    "abiding": {"warmth": 1, "stability": 2},
    "above-board": {"disclose": 2, "order": 1},
    "absorbed": {"energy": -1, "depth": 2, "social": -1},
    "abstemious": {"risk": -1, "refine": 1, "order": 1},
    "accommodating": {"care": 1, "social": 1, "order": 1},
    "acerbic": {"warmth": -2, "care": -1, "express": 1},
    "acquiescent": {"care": 1, "express": -1, "order": 1},
    "adamant": {"stability": 2, "care": -1, "order": -1},
    "admiring": {"warmth": 2, "social": 1, "mood": 1},
    "adoring": {"warmth": 2, "care": 1, "disclose": 1},
    "aggrieved": {"warmth": -1, "mood": -2, "order": -1},
    "agitated": {"energy": 1, "stability": -2, "mood": -1},
    "agreeable": {"care": 1, "social": 1, "order": 1},
    "aimless": {"depth": -1, "stability": -1, "order": -2},
    "amenable": {"warmth": 1, "social": 1, "order": 1},
    "analytical": {"depth": 2, "refine": 1},
    "anchored": {"stability": 2, "order": 1},
    "anonymous": {"express": -2, "social": -1, "disclose": -2},
    "antiquarian": {"depth": 1, "refine": 1, "order": 1},
    "antisocial": {"warmth": -1, "care": -1, "social": -2},
    "apathetic": {"energy": -2, "care": -1, "mood": -1},
    "appraising": {"warmth": -1, "depth": 1, "refine": 1},
    "appreciative": {"warmth": 2, "social": 1, "mood": 1},
    "approachable": {"warmth": 2, "social": 2, "disclose": 1},
    "approximate": {"refine": -2},
    "arch": {"warmth": -1, "refine": 1, "express": 1, "disclose": -1},
    "ardent": {"energy": 2, "warmth": 2, "disclose": 1},
    "artistic": {"depth": 1, "express": 2},
    "ascetic": {"warmth": -2, "care": -1, "refine": 1, "order": 1},
    "assiduous": {"energy": 1, "stability": 2, "refine": 1, "order": 1},
    "astringent": {"warmth": -1, "care": -1, "refine": 1},
    "atmospheric": {"depth": 2, "express": 1, "disclose": -1},
    "attached": {"warmth": 2, "stability": 1, "social": 1},
    "attuned": {"depth": 1, "care": 1, "social": 1},
    "authentic": {"refine": -1, "disclose": 2},
    "authoritative": {"express": 1, "social": 1, "order": 2},
    "avid": {"energy": 2, "express": 1, "mood": 1},
    "avowed": {"stability": 1, "disclose": 2, "order": 1},
    "bacchanalian": {"energy": 2, "refine": -2, "social": 2, "order": -2},
    "bashful": {"warmth": 1, "express": -1, "social": -1, "disclose": -1},
    "becalming": {"energy": -2, "stability": 2, "care": 1},
    "benign": {"energy": -1, "warmth": 1, "care": 1},
    "biddable": {"risk": -1, "express": -1, "order": 2},
    "bland": {"refine": -1, "express": -2, "mood": -1},
    "blank": {"depth": -2, "express": -2},
    "bleak": {"warmth": -2, "mood": -2},
    "blindsided": {"depth": -2, "stability": -1},
    "blunt": {"care": -1, "express": 1, "disclose": 1},
    "boastful": {"care": -1, "express": 2, "disclose": 1},
    "bookish": {"depth": 2, "social": -1},
    "bountiful": {"warmth": 2, "care": 2, "express": 1},
    "braced": {"energy": 1, "stability": 2, "risk": -1},
    "breezy": {"energy": 1, "depth": -1, "mood": 2},
    "brimming": {"energy": 1, "express": 1, "mood": 1},
    "brisk": {"energy": 2, "warmth": -1},
    "bristling": {"energy": 1, "care": -1, "social": -1},
    "brooding": {"warmth": -1, "depth": 2},
    "budding": {"energy": 1, "depth": -1, "mood": 1},
    "calculated": {"energy": -1, "depth": 1, "stability": 1, "refine": 1},
    "carefree": {"stability": -1, "risk": 1, "care": -1, "mood": 2},
    "careful": {"stability": 1, "risk": -1, "refine": 1},
    "careless": {"stability": -1, "care": -1, "refine": -2},
    "casual": {"energy": -1, "care": -1, "order": -1},
    "categorical": {"stability": 2, "refine": 1, "order": 2},
    "cautionary": {"risk": -2, "care": 1, "order": 1},
    "cautious": {"stability": 1, "risk": -2, "refine": 1},
    "chafing": {"stability": -1, "mood": -1, "order": -2},
    "challenging": {"care": -1, "express": 1, "order": -1},
    "charismatic": {"express": 2, "social": 2},
    "charming": {"warmth": 1, "express": 1, "social": 2},
    "checked": {"energy": -1, "stability": 1, "order": 1},
    "cherishing": {"warmth": 2, "care": 2},
    "choosy": {"care": -1, "refine": 2, "social": -1},
    "circumspect": {"depth": 1, "risk": -1, "disclose": -1},
    "civilised": {"refine": 2, "social": 1, "order": 2},
    "clinical": {"warmth": -2, "care": -1, "refine": 2},
    "coarse": {"refine": -2, "express": 1},
    "coaxing": {"energy": -1, "warmth": 1, "care": 2, "social": 1},
    "coddling": {"risk": -1, "care": 2, "order": -1},
    "cold-eyed": {"warmth": -2, "depth": 1, "care": -1},
    "cold-hearted": {"warmth": -2, "care": -2},
    "collaborative": {"warmth": 1, "care": 1, "social": 2},
    "colourless": {"refine": -1, "express": -2, "social": -1},
    "comforting": {"warmth": 2, "care": 1},
    "commanding": {"express": 2, "social": 1, "order": 1},
    "commonplace": {"depth": -1, "refine": -1, "express": -1},
    "compassionate": {"warmth": 2, "care": 2},
    "competitive": {"energy": 1, "risk": 1, "care": -1},
    "compliant": {"risk": -1, "express": -1, "order": 2},
    "conclusive": {"stability": 2, "refine": 1, "order": 1},
    "concrete": {"depth": -1, "refine": 1, "express": -1},
    "conditional": {"warmth": -1, "stability": -1, "risk": -1},
    "conductive": {"energy": 2, "express": 1, "social": 1},
    "confident": {"stability": 1, "risk": 1, "express": 1},
    "confiding": {"warmth": 1, "social": 1, "disclose": 2},
    "conforming": {"express": -1, "social": 1, "order": 2},
    "conformist": {"risk": -1, "social": 1, "order": 2},
    "conserving": {"stability": 2, "risk": -1, "order": 1},
    "considerate": {"care": 2, "refine": 1, "social": 1},
    "consoling": {"warmth": 2, "care": 2},
    "conspicuous": {"express": 2, "social": 1, "disclose": 1},
    "constant": {"stability": 2, "care": 1, "order": 1},
    "consuming": {"energy": 2, "depth": 1, "care": 1},
    "contagious": {"energy": 1, "express": 2, "social": 2},
    "contained": {"stability": 2, "express": -2},
    "content": {"energy": -1, "stability": 1, "risk": -1},
    "contrarian": {"risk": 1, "social": -1, "order": -2},
    "contrite": {"express": -1, "mood": -1, "disclose": 1, "order": 1},
    "conventional": {"stability": 1, "express": -1, "order": 2},
    "convivial": {"warmth": 1, "social": 2, "mood": 1},
    "convoluted": {"depth": 1, "refine": -1, "express": -1},
    "corrective": {"care": -1, "refine": 1, "order": 2},
    "cosmopolitan": {"refine": 1, "express": 1, "social": 1},
    "cosseting": {"warmth": 1, "care": 2, "social": 1},
    "coy": {"express": 1, "social": 1, "disclose": -1},
    "credulous": {"depth": -1, "risk": 1, "order": 1},
    "crisp": {"energy": 1, "refine": 2, "express": 1},
    "crooked": {"care": -1, "refine": -1, "order": -2},
    "crusading": {"energy": 2, "care": 1, "express": 1, "order": 1},
    "cryptic": {"depth": 1, "express": -1, "disclose": -2},
    "custodial": {"stability": 1, "care": 1, "order": 2},
    "dabbling": {"depth": -2, "stability": -2, "risk": 1},
    "dampening": {"energy": -1, "care": -1, "mood": -1},
    "dated": {"stability": 1, "refine": -1, "order": 1},
    "daydreamy": {"energy": -1, "depth": 1, "stability": -1, "express": 1},
    "deadpan": {"warmth": -1, "express": -1, "mood": 1},
    "dedicated": {"energy": 1, "stability": 2, "order": 1},
    "defensive": {"warmth": -1, "stability": -1, "care": -1},
    "deferential": {"care": 1, "express": -1, "order": 2},
    "deflated": {"energy": -1, "mood": -2},
    "delegating": {"energy": -1, "care": -1, "social": 1, "order": 1},
    "deliberate": {"energy": -1, "stability": 2, "refine": 1},
    "deliberative": {"energy": -1, "depth": 1, "stability": 1},
    "delicate": {"energy": -1, "care": 1, "refine": 2},
    "demanding": {"energy": 1, "care": -1, "refine": 1, "order": 1},
    "demonstrative": {"warmth": 1, "express": 2, "disclose": 1},
    "dependent": {"stability": -1, "risk": -1, "social": 1, "order": 1},
    "derelict": {"care": -2, "order": -2},
    "derivative": {"refine": -1, "express": -2, "order": 1},
    "diagnostic": {"depth": 1, "care": 1, "refine": 2},
    "diffident": {"risk": -1, "express": -1, "social": -1},
    "dim": {"depth": -1, "express": -2, "mood": -1},
    "diplomatic": {"care": 1, "refine": 1, "social": 1, "disclose": -1},
    "disagreeable": {"warmth": -1, "care": -1, "social": -2},
    "disarming": {"warmth": 1, "care": 1, "express": 1, "social": 1},
    "disciplined": {"stability": 2, "refine": 1, "order": 2},
    "discouraging": {"care": -1, "social": -1, "mood": -1},
    "discursive": {"depth": 1, "refine": -1, "express": 2},
    "disinterested": {"warmth": -1, "care": -1, "refine": 1, "order": 1},
    "disloyal": {"warmth": -1, "care": -1, "order": -2},
    "dispassionate": {"energy": -1, "warmth": -1, "care": -1},
    "distinguished": {"refine": 2, "social": 1, "order": 1},
    "distracted": {"energy": 1, "depth": -2, "stability": -1},
    "dithering": {"energy": -1, "stability": -2, "risk": -1},
    "docile": {"energy": -1, "risk": -1, "order": 2},
    "dogged": {"energy": 1, "stability": 2},
    "dour": {"warmth": -2, "express": -1, "mood": -2},
    "dowdy": {"refine": -2, "express": -2},
    "draining": {"energy": -1, "care": -2, "mood": -1},
    "dreamlike": {"depth": 1, "stability": -1, "express": 1},
    "driven": {"energy": 2, "stability": 1, "order": 1},
    "durable": {"stability": 2},
    "easy-to-please": {"warmth": 1, "care": 1, "refine": -2, "mood": 1},
    "easygoing": {"energy": -1, "warmth": 1, "stability": 1, "refine": -1},
    "economical": {"risk": -1, "refine": 1, "express": -1, "order": 1},
    "eerie": {"warmth": -1, "depth": 1, "express": 1},
    "effusive": {"warmth": 1, "express": 2, "disclose": 2},
    "electric": {"energy": 2, "express": 1},
    "elegiac": {"warmth": 1, "depth": 2, "mood": -2},
    "elevating": {"warmth": 1, "refine": 1, "express": 1, "mood": 2},
    "embellished": {"refine": 1, "express": 2, "disclose": -1},
    "emboldening": {"risk": 1, "care": 1, "express": 1, "social": 1},
    "emollient": {"warmth": 1, "care": 1, "social": 1},
    "emotive": {"warmth": 1, "express": 2, "disclose": 1},
    "empathetic": {"warmth": 1, "depth": 1, "care": 2},
    "emphatic": {"energy": 1, "express": 2, "disclose": 1},
    "empty": {"depth": -1, "express": -2, "mood": -1},
    "encouraging": {"warmth": 1, "care": 2, "social": 1},
    "enthusiastic": {"energy": 2, "warmth": 1, "express": 1},
    "entitled": {"care": -2, "express": 1, "social": -1, "order": -1},
    "enveloping": {"warmth": 2, "care": 2, "social": 1},
    "ephemeral": {"depth": -1, "stability": -2},
    "epigrammatic": {"depth": 1, "refine": 2, "express": 1},
    "equable": {"energy": -1, "warmth": 1, "stability": 2, "mood": 1},
    "equivocal": {"refine": -1, "disclose": -1, "order": -1},
    "erratic": {"stability": -2, "refine": -1},
    "evergreen": {"stability": 2, "mood": 1},
    "expedient": {"risk": 1, "refine": -1, "order": -2},
    "experimental": {"stability": -1, "risk": 2, "express": 1, "order": -1},
    "extinguished": {"energy": -2, "express": -1, "mood": -1},
    "exuberant": {"energy": 2, "warmth": 1, "express": 2},
    "exultant": {"energy": 1, "express": 2, "mood": 2},
    "faddish": {"depth": -1, "stability": -2, "order": -1},
    "fair-minded": {"care": 1, "refine": 1, "order": 1},
    "fair-weather": {"warmth": -1, "stability": -2, "care": -1},
    "faithful": {"warmth": 1, "stability": 2, "order": 2},
    "faithless": {"warmth": -1, "stability": -1, "order": -2},
    "fallow": {"energy": -2, "stability": 1, "express": -1},
    "faltering": {"energy": -1, "stability": -1, "risk": -1},
    "feeble": {"energy": -2, "stability": -1},
    "ferocious": {"energy": 2, "warmth": 1, "care": 1},
    "fervid": {"energy": 2, "warmth": 1, "stability": -1, "express": 2},
    "fierce": {"energy": 2, "warmth": 1, "care": 1},
    "figurative": {"depth": 1, "refine": 1, "express": 1, "disclose": -1},
    "firm": {"stability": 2, "order": 1},
    "fitful": {"energy": 1, "stability": -2},
    "flamboyant": {"refine": -1, "express": 2, "social": 1},
    "flat": {"energy": -2, "express": -1, "mood": -1},
    "fleeting": {"energy": 1, "stability": -2},
    "flexible": {"stability": -1, "risk": 1},
    "flinty": {"warmth": -2, "stability": 1},
    "flustered": {"energy": 1, "stability": -2},
    "fond": {"warmth": 2, "care": 1},
    "forbearing": {"energy": -1, "stability": 2, "care": 1, "mood": -1},
    "forgetful": {"depth": -1, "care": -1, "order": -1},
    "forgettable": {"depth": -1, "express": -2},
    "formal": {"warmth": -1, "refine": 2, "disclose": -1, "order": 2},
    "formidable": {"energy": 1, "warmth": -1, "stability": 2},
    "forthright": {"express": 1, "disclose": 2},
    "fortifying": {"stability": 2, "care": 2},
    "forward": {"risk": 1, "care": -1, "express": 2, "social": 1},
    "forward-looking": {"depth": -1, "risk": 1, "mood": 1},
    "fostering": {"warmth": 1, "care": 2, "social": 1},
    "foundational": {"stability": 2, "order": 2},
    "fragile": {"energy": -1, "stability": -2},
    "frank": {"care": -1, "express": 1, "disclose": 2},
    "frenetic": {"energy": 2, "stability": -2},
    "frosty": {"warmth": -2, "social": -1, "disclose": -1},
    "frugal": {"stability": 1, "risk": -1, "refine": 1},
    "fussy": {"energy": 1, "care": -1, "refine": 2, "order": 1},
    "gallant": {"warmth": 1, "risk": 1, "refine": 1, "order": 1},
    "galvanised": {"energy": 2, "mood": 1},
    "game": {"energy": 1, "risk": 2, "mood": 1},
    "garrulous": {"express": 2, "social": 2, "disclose": 1},
    "gauche": {"refine": -2, "express": 1, "social": -1},
    "genial": {"warmth": 2, "social": 2, "mood": 1},
    "giddy": {"energy": 2, "stability": -1, "mood": 2},
    "graceless": {"refine": -2, "social": -1},
    "gracious": {"warmth": 1, "care": 1, "refine": 1, "social": 1},
    "grateful": {"warmth": 2, "social": 1, "mood": 1},
    "gregarious": {"warmth": 1, "express": 1, "social": 2},
    "gritty": {"energy": 1, "stability": 2, "refine": -1},
    "grounded": {"depth": -1, "stability": 2, "refine": 1},
    "grudging": {"warmth": -1, "care": -1, "mood": -1, "order": -1},
    "guarded": {"warmth": -1, "depth": 1, "disclose": -2},
    "guileless": {"warmth": 1, "depth": -1, "disclose": 2},
    "gullible": {"depth": -1, "risk": 1, "disclose": 1},
    "hallowed": {"warmth": 1, "depth": 2, "order": 2},
    "hands-off": {"energy": -1, "care": -1, "social": -1, "order": -1},
    "hard-headed": {"warmth": -1, "depth": -1, "refine": 1, "order": 1},
    "hard-hearted": {"warmth": -2, "care": -2},
    "hard-line": {"warmth": -1, "stability": 2, "care": -1, "order": 2},
    "hard-nosed": {"warmth": -1, "care": -1, "refine": 1, "order": 1},
    "hardbitten": {"warmth": -2, "stability": 2, "care": -1, "mood": -1},
    "hasty": {"energy": 2, "stability": -2, "refine": -1},
    "haunting": {"depth": 2, "express": 1, "mood": -1},
    "hazy": {"energy": -1, "depth": 1, "stability": -1, "express": -1},
    "headlong": {"energy": 2, "stability": -1, "risk": 2},
    "headstrong": {"stability": 1, "risk": 1, "order": -2},
    "heartening": {"warmth": 2, "care": 1, "mood": 2},
    "heartfelt": {"warmth": 2, "express": 1, "disclose": 2},
    "heavy-handed": {"energy": 1, "care": -1, "refine": -2},
    "hedging": {"risk": -1, "express": -1, "disclose": -1},
    "hedonistic": {"risk": 1, "refine": -1, "express": 1, "mood": 1},
    "heedless": {"risk": 2, "care": -1, "refine": -1},
    "hermetic": {"depth": 1, "social": -2, "disclose": -2},
    "hesitant": {"energy": -1, "stability": -1, "risk": -2},
    "heterodox": {"depth": 1, "risk": 1, "order": -2},
    "highly-strung": {"energy": 2, "stability": -2, "mood": -1},
    "histrionic": {"stability": -2, "express": 2, "mood": -1},
    "homespun": {"warmth": 1, "refine": -1, "social": 1, "order": 1},
    "hopeful": {"warmth": 1, "risk": 1, "mood": 2},
    "humble": {"warmth": 1, "express": -1},
    "humdrum": {"depth": -1, "express": -1, "mood": -1},
    "iconoclastic": {"risk": 1, "express": 1, "order": -2},
    "idle": {"energy": -2, "order": -1},
    "imitative": {"express": -2, "order": 1},
    "immaculate": {"refine": 2, "order": 2},
    "impassioned": {"energy": 2, "warmth": 1, "express": 2},
    "impatient": {"energy": 2, "stability": -1},
    "impenitent": {"stability": 1, "care": -1, "disclose": -1, "order": -2},
    "imperceptive": {"depth": -2, "care": -1},
    "impervious": {"warmth": -1, "stability": 2, "care": -1, "disclose": -1},
    "imposing": {"warmth": -1, "stability": 1, "express": 2, "order": 1},
    "impressionistic": {"depth": -1, "refine": -2, "express": 1},
    "improvident": {"stability": -1, "risk": 1, "order": -2},
    "impulsive": {"energy": 1, "stability": -2, "risk": 1},
    "inattentive": {"depth": -1, "care": -2},
    "incorruptible": {"stability": 2, "refine": 1, "order": 2},
    "incurious": {"energy": -1, "depth": -1, "social": -1},
    "independent": {"stability": 1, "risk": 1, "social": -1},
    "indifferent": {"warmth": -1, "care": -2, "mood": -1},
    "indignant": {"warmth": -1, "express": 2, "mood": -1, "order": 1},
    "industrious": {"energy": 1, "stability": 1, "order": 1},
    "inexhaustible": {"energy": 2, "stability": 2},
    "ingenuous": {"warmth": 1, "depth": -1, "disclose": 2},
    "inquisitive": {"energy": 1, "depth": 1},
    "inscrutable": {"warmth": -1, "depth": 2, "disclose": -2},
    "insightful": {"depth": 2, "refine": 1},
    "insincere": {"care": -1, "disclose": -2, "order": -1},
    "insulating": {"energy": -1, "express": -1, "social": -1},
    "intemperate": {"stability": -2, "risk": 1, "refine": -1},
    "interpretive": {"depth": 2, "express": 1},
    "intimidating": {"warmth": -2, "care": -1, "express": 1, "social": -1},
    "intolerant": {"care": -2, "social": -1, "order": 1},
    "intricate": {"depth": 2, "refine": 1},
    "introspective": {"depth": 2, "social": -1, "disclose": -1},
    "intuitive": {"depth": 2, "care": 1},
    "inured": {"warmth": -1, "stability": 2, "care": -1, "mood": -1},
    "invested": {"energy": 1, "stability": 1, "care": 1},
    "iridescent": {"stability": -1, "refine": 1, "express": 2},
    "irrational": {"depth": -1, "stability": -1, "refine": -2},
    "irrepressible": {"energy": 2, "express": 2, "mood": 1},
    "irresolute": {"stability": -2, "risk": -1},
    "irreverent": {"express": 1, "mood": 1, "order": -2},
    "jocular": {"express": 1, "social": 1, "mood": 2},
    "joyless": {"warmth": -1, "express": -1, "mood": -2},
    "jubilant": {"energy": 1, "express": 2, "social": 1, "mood": 2},
    "jumpy": {"energy": 1, "stability": -2, "mood": -1},
    "kindly": {"warmth": 2, "care": 2},
    "kinetic": {"energy": 2, "stability": -1},
    "knowing": {"depth": 2, "disclose": -1},
    "laconic": {"express": -2, "disclose": -1},
    "languid": {"energy": -2, "mood": -1},
    "lavish": {"care": 1, "refine": 1, "express": 2},
    "lax": {"refine": -2, "order": -2},
    "layered": {"depth": 2, "refine": 1},
    "leaden": {"energy": -2, "express": -1, "mood": -1},
    "legible": {"depth": -1, "disclose": 2},
    "leisurely": {"energy": -2, "mood": 1},
    "lenient": {"warmth": 1, "care": 1, "refine": -1, "order": -1},
    "lighthearted": {"energy": 1, "depth": -1, "mood": 2},
    "literal": {"depth": -1, "refine": 1, "express": -1},
    "low-key": {"energy": -1, "express": -2, "social": -1},
    "lowly": {"refine": -1, "express": -1, "social": -1},
    "lukewarm": {"energy": -1, "warmth": -1, "mood": -1},
    "luminous": {"warmth": 1, "express": 2, "mood": 1},
    "matter-of-fact": {"depth": -1, "refine": 1, "express": -1},
    "maverick": {"risk": 1, "express": 1, "social": -1, "order": -2},
    "mawkish": {"warmth": 1, "refine": -2, "express": 1, "mood": 1},
    "mealy-mouthed": {"care": 1, "express": -1, "disclose": -2},
    "measured": {"energy": -1, "stability": 2, "refine": 1},
    "medicinal": {"warmth": -1, "care": 1, "refine": 1},
    "meek": {"risk": -2, "express": -2, "order": 1},
    "mercurial": {"energy": 1, "stability": -2, "express": 1},
    "meticulous": {"stability": 1, "refine": 2},
    "mischievous": {"express": 1, "mood": 1, "order": -1},
    "monochrome": {"refine": 1, "express": -2},
    "mordant": {"warmth": -2, "depth": 1, "express": 1},
    "mournful": {"warmth": 1, "depth": 1, "mood": -2},
    "mundane": {"depth": -1, "refine": -1, "express": -1},
    "munificent": {"warmth": 2, "care": 2, "express": 1},
    "musing": {"energy": -1, "depth": 2},
    "muted": {"express": -2, "mood": -1},
    "mysterious": {"depth": 2, "disclose": -2},
    "naturalised": {"warmth": 1, "stability": 1, "social": 1},
    "neglectful": {"care": -2, "order": -1},
    "neighbourly": {"warmth": 1, "care": 1, "social": 2, "order": 1},
    "neutral": {"warmth": -1, "care": -1, "express": -1, "order": 1},
    "nimble": {"energy": 1, "stability": -1, "refine": 1},
    "nonchalant": {"energy": -1, "care": -1, "mood": 1},
    "nostalgic": {"energy": -1, "warmth": 1, "depth": 1},
    "nourishing": {"warmth": 1, "care": 2},
    "numb": {"energy": -2, "warmth": -2, "express": -1, "mood": -2},
    "obedient": {"risk": -1, "express": -1, "order": 2},
    "oblique": {"depth": 1, "express": -1},
    "obvious": {"depth": -2, "disclose": 1},
    "off-putting": {"warmth": -1, "social": -2},
    "offbeat": {"stability": -1, "express": 1, "order": -1},
    "offhand": {"care": -1, "express": -1, "order": -1},
    "openhanded": {"warmth": 1, "care": 2, "social": 1},
    "openhearted": {"warmth": 2, "care": 1, "disclose": 2},
    "oracular": {"depth": 2, "express": 1, "disclose": -1},
    "ornate": {"refine": 1, "express": 2},
    "outward": {"depth": -1, "social": 2, "disclose": 2},
    "palliative": {"energy": -1, "warmth": 1, "care": 2},
    "pampered": {"energy": -1, "risk": -1, "care": -1, "refine": 1},
    "parochial": {"depth": -1, "social": -1, "order": 1},
    "parsimonious": {"warmth": -1, "risk": -1, "care": -2, "refine": 1},
    "partisan": {"care": -1, "social": 1, "order": 1},
    "patient": {"energy": -1, "stability": 2, "care": 1},
    "perceptive": {"depth": 2},
    "perennial": {"stability": 2},
    "perfunctory": {"energy": -1, "care": -1, "refine": -2},
    "peripheral": {"stability": -1, "social": -1, "order": -1},
    "perishable": {"stability": -2, "risk": -1},
    "philistine": {"refine": -2, "express": -2},
    "philosophical": {"depth": 2},
    "placid": {"energy": -1, "stability": 1},
    "plain": {"refine": -1, "express": -1, "disclose": 1},
    "plainspoken": {"refine": -1, "express": 1, "disclose": 2},
    "playful": {"energy": 1, "express": 2, "mood": 1},
    "pliable": {"stability": -1, "care": 1, "order": 1},
    "pliant": {"stability": -1, "care": 1, "order": 1},
    "poetic": {"depth": 2, "express": 2},
    "poised": {"stability": 2, "refine": 1},
    "ponderous": {"energy": -2, "refine": -1},
    "posed": {"refine": 1, "express": 1, "disclose": -2},
    "potent": {"energy": 2, "depth": 1},
    "pragmatic": {"depth": -1, "stability": 1, "refine": 1},
    "precipitous": {"energy": 2, "stability": -2, "risk": 1},
    "premeditated": {"depth": 1, "stability": 1, "refine": 1, "order": 1},
    "prescient": {"depth": 2, "refine": 1},
    "prim": {"warmth": -1, "refine": 2, "express": -1, "order": 2},
    "primal": {"energy": 2, "refine": -2, "order": -2},
    "primed": {"energy": 1, "stability": 1, "risk": 1},
    "principled": {"stability": 1, "refine": 1, "order": 2},
    "private": {"express": -1, "social": -1, "disclose": -2},
    "probing": {"depth": 2, "care": -1, "express": 1},
    "profane": {"refine": -1, "express": 1, "order": -2},
    "profound": {"depth": 2},
    "profuse": {"energy": 1, "warmth": 1, "refine": -1, "express": 2},
    "proper": {"refine": 1, "express": -1, "order": 2},
    "prosaic": {"depth": -1, "refine": -1, "express": -1},
    "proud": {"express": 1, "disclose": -1, "order": -1},
    "provident": {"stability": 1, "risk": -1, "care": 1, "order": 1},
    "provisional": {"stability": -2, "risk": -1, "order": -1},
    "public": {"social": 2, "disclose": 2},
    "pungent": {"energy": 1, "express": 2},
    "puritanical": {"risk": -1, "refine": 1, "mood": -1, "order": 2},
    "qualified": {"stability": -1, "refine": 1, "express": -1, "disclose": -1},
    "quelled": {"energy": -2, "express": -1, "mood": -1},
    "questioning": {"depth": 1, "order": -1},
    "quick-witted": {"energy": 2, "depth": 1, "express": 1},
    "quiescent": {"energy": -2, "stability": 1, "express": -1},
    "rallying": {"energy": 2, "express": 1, "social": 2, "mood": 1},
    "rambling": {"depth": -1, "refine": -2, "express": 1},
    "rapt": {"energy": 1, "depth": 2, "express": -1, "social": -1},
    "rarefied": {"refine": 2, "social": -1},
    "rational": {"warmth": -1, "depth": 1, "refine": 1},
    "rationed": {"risk": -1, "care": -1, "refine": 1, "order": 1},
    "reductive": {"depth": -2, "care": -1, "refine": 1},
    "regal": {"refine": 2, "express": 1, "order": 1},
    "relenting": {"energy": -1, "care": 1, "order": 1},
    "relentless": {"energy": 2, "stability": 2, "care": -1},
    "reluctant": {"energy": -1, "risk": -2, "mood": -1},
    "remote": {"warmth": -2, "social": -2, "disclose": -1},
    "replenishing": {"warmth": 1, "care": 2},
    "reserved": {"express": -2, "social": -1, "disclose": -2},
    "resolved": {"stability": 2, "risk": 1, "order": -1},
    "respectful": {"warmth": 1, "care": 1, "order": 2},
    "responsible": {"stability": 2, "care": 1, "order": 2},
    "restful": {"energy": -2, "warmth": 1, "mood": 1},
    "restive": {"energy": 1, "stability": -2, "order": -1},
    "reticent": {"express": -2, "disclose": -2},
    "retiring": {"express": -1, "social": -2, "disclose": -1},
    "reverent": {"warmth": 1, "express": -1, "order": 2},
    "reverential": {"warmth": 1, "depth": 1, "order": 2},
    "rhapsodic": {"energy": 1, "express": 2, "mood": 2},
    "righteous": {"care": 1, "express": 1, "order": 2},
    "robust": {"energy": 1, "stability": 2},
    "romantic": {"warmth": 2, "depth": 1, "express": 1, "mood": 1},
    "rooted": {"depth": 1, "stability": 2, "order": 1},
    "rough-and-ready": {"energy": 1, "risk": 1, "refine": -2, "order": -1},
    "rousing": {"energy": 2, "express": 2, "social": 1, "mood": 1},
    "rudimentary": {"depth": -1, "refine": -2},
    "ruminative": {"energy": -1, "depth": 2},
    "sanguine": {"stability": 1, "risk": 1, "mood": 2},
    "sardonic": {"warmth": -1, "express": 1, "mood": -1},
    "sated": {"energy": -1, "risk": -1, "mood": 1},
    "satirical": {"warmth": -1, "express": 2, "order": -1},
    "satisfied": {"energy": -1, "stability": 1, "risk": -1, "mood": 1},
    "scattered": {"stability": -2, "refine": -1, "order": -1},
    "sceptical": {"warmth": -1, "depth": 1, "order": -1},
    "scheming": {"depth": 1, "care": -1, "disclose": -2, "order": -1},
    "scrupulous": {"refine": 2, "order": 2},
    "searching": {"depth": 2, "stability": -1},
    "secretive": {"warmth": -1, "depth": 1, "disclose": -2},
    "self-aware": {"depth": 2, "disclose": 1},
    "self-contained": {"stability": 2, "social": -1, "disclose": -1},
    "self-deprecating": {"express": 1, "mood": 1, "disclose": 1},
    "self-directed": {"energy": 1, "stability": 1, "social": -1, "order": -1},
    "self-effacing": {"care": 1, "express": -2, "disclose": -1},
    "self-evident": {"depth": -2, "disclose": 1},
    "self-protective": {"warmth": -1, "risk": -2, "disclose": -2},
    "self-reliant": {"stability": 2, "risk": 1, "social": -1},
    "sensible": {"stability": 1, "risk": -1, "refine": 1, "order": 1},
    "sensuous": {"warmth": 1, "risk": 1, "refine": -1, "express": 1},
    "sentimental": {"warmth": 1, "depth": 1, "express": 1, "mood": 1},
    "serene": {"energy": -1, "warmth": 1, "stability": 1, "mood": 1},
    "set": {"stability": 2, "risk": -1, "order": 1},
    "severe": {"warmth": -2, "care": -1, "refine": 1, "order": 2},
    "shallow": {"depth": -2},
    "shameless": {"risk": 1, "express": 1, "disclose": 1, "order": -2},
    "sharp": {"energy": 1, "care": -1, "refine": 1},
    "sheepish": {"risk": -1, "express": -1, "disclose": -1},
    "sheltered": {"depth": -1, "risk": -2, "social": -1},
    "shortsighted": {"depth": -1, "refine": -1, "order": -1},
    "shrewd": {"depth": 1, "risk": 1, "refine": 1},
    "silly": {"refine": -1, "express": 2, "mood": 2},
    "sincere": {"warmth": 1, "disclose": 2},
    "single-minded": {"energy": 1, "stability": 2, "social": -1},
    "skittish": {"energy": 1, "stability": -2, "risk": -1},
    "slapdash": {"stability": -1, "refine": -2},
    "sloppy": {"refine": -2, "order": -1},
    "slow-burning": {"energy": -1, "depth": 1, "stability": 2},
    "slow-witted": {"energy": -2, "depth": -1},
    "sly": {"depth": 1, "care": -1, "refine": 1, "disclose": -2},
    "smouldering": {"energy": 1, "depth": 1, "express": -1},
    "sober": {"energy": -1, "refine": 1, "mood": -1, "order": 1},
    "soft": {"warmth": 1, "stability": -1, "care": 1},
    "soft-hearted": {"warmth": 2, "care": 2, "order": -1},
    "softening": {"energy": -1, "warmth": 1, "care": 1, "order": -1},
    "solemn": {"depth": 1, "express": -1, "mood": -1, "order": 1},
    "sombre": {"depth": 1, "express": -1, "mood": -2},
    "soothing": {"energy": -1, "warmth": 1, "care": 2},
    "soporific": {"energy": -2, "mood": -1},
    "sovereign": {"stability": 2, "express": 1, "social": -1, "order": -1},
    "sparing": {"risk": -1, "care": -1, "refine": 1, "express": -1},
    "spartan": {"warmth": -1, "care": -1, "refine": 1, "order": 1},
    "speculative": {"depth": 1, "risk": 1, "express": 1},
    "spellbinding": {"depth": 2, "express": 2},
    "spilling": {"stability": -1, "express": 2, "disclose": 1},
    "spontaneous": {"energy": 1, "stability": -2, "risk": 1},
    "staid": {"energy": -1, "express": -1, "order": 1},
    "standoffish": {"warmth": -1, "social": -2, "disclose": -1},
    "stark": {"warmth": -1, "refine": 1, "express": -1},
    "static": {"energy": -2, "stability": 2},
    "steadfast": {"stability": 2, "care": 1, "order": 1},
    "steadying": {"energy": -1, "stability": 2, "care": 1},
    "steely": {"warmth": -1, "stability": 2},
    "steeped": {"depth": 2, "stability": 1},
    "stern": {"warmth": -1, "mood": -1, "order": 2},
    "stingy": {"care": -2, "social": -1, "order": 1},
    "stirring": {"energy": 2, "express": 2, "mood": 1},
    "stoic": {"warmth": -1, "stability": 2, "express": -1},
    "stolid": {"energy": -1, "stability": 2, "express": -2},
    "storied": {"depth": 1, "express": 1, "social": 1},
    "straightforward": {"depth": -1, "disclose": 2},
    "straitlaced": {"express": -1, "mood": -1, "order": 2},
    "strange": {"express": 1, "social": -1, "order": -1},
    "stringent": {"care": -1, "refine": 2, "order": 1},
    "striving": {"energy": 2, "risk": 1, "order": 1},
    "stylish": {"refine": 2, "express": 2},
    "suave": {"warmth": 1, "refine": 2, "social": 2, "disclose": -1},
    "subdued": {"energy": -1, "express": -1, "mood": -1},
    "submissive": {"risk": -1, "express": -1, "order": 2},
    "subversive": {"depth": 1, "risk": 1, "order": -2},
    "superficial": {"depth": -2, "refine": -1},
    "surefooted": {"stability": 2, "risk": -1, "refine": 1},
    "surgical": {"care": -1, "refine": 2},
    "swaggering": {"risk": 1, "care": -1, "express": 2, "order": -1},
    "swift": {"energy": 2, "stability": -1},
    "sworn": {"stability": 2, "disclose": 1, "order": 2},
    "sympathetic": {"warmth": 1, "care": 2},
    "syrupy": {"warmth": 1, "refine": -2, "mood": 1},
    "tame": {"energy": -1, "risk": -1, "order": 1},
    "tart": {"care": -1, "refine": 1, "mood": -1},
    "temperamental": {"energy": 1, "stability": -2},
    "temperate": {"energy": -1, "stability": 1, "refine": 1},
    "tempered": {"stability": 1, "refine": 1, "order": 1},
    "temporising": {"energy": -1, "stability": -1, "risk": -1, "disclose": -1},
    "tender-hearted": {"warmth": 2, "care": 2},
    "tentative": {"stability": -1, "risk": -1, "express": -1},
    "tepid": {"energy": -1, "warmth": -1, "mood": -1},
    "terse": {"warmth": -1, "express": -2, "disclose": -1},
    "tested": {"stability": 2, "risk": 1},
    "thick-skinned": {"warmth": -1, "stability": 2, "care": -1, "mood": 1},
    "thin": {"depth": -2, "refine": -1},
    "thin-skinned": {"warmth": -1, "stability": -2, "mood": -1},
    "thorough": {"depth": 1, "stability": 1, "refine": 2, "order": 1},
    "thoughtless": {"care": -2, "refine": -1},
    "tight-fisted": {"care": -2, "social": -1, "order": 1},
    "tight-lipped": {"express": -2, "disclose": -2},
    "timeless": {"depth": 1, "stability": 2, "order": 1},
    "tinkering": {"energy": 1, "risk": 1, "refine": 1, "order": -1},
    "tone-deaf": {"depth": -1, "care": -2, "social": -1},
    "toothless": {"energy": -1, "risk": -1, "care": 1},
    "tough": {"warmth": -1, "stability": 2, "risk": 1},
    "transactional": {"warmth": -2, "care": -1, "social": 1, "order": 1},
    "transfixing": {"energy": 1, "depth": 1, "express": 2},
    "transient": {"stability": -2},
    "trenchant": {"depth": 1, "care": -1, "refine": 1, "express": 2},
    "trusting": {"warmth": 1, "risk": 1, "disclose": 1},
    "trustworthy": {"warmth": 1, "stability": 2, "order": 1},
    "turbulent": {"energy": 2, "stability": -2, "mood": -1},
    "unabashed": {"risk": 1, "express": 1, "disclose": 1},
    "unaccountable": {"care": -1, "disclose": -2, "order": -2},
    "unadorned": {"refine": -1, "express": -1, "disclose": 1},
    "unaffected": {"warmth": 1, "refine": -1, "disclose": 1},
    "unaligned": {"stability": -1, "social": -1, "order": -2},
    "unambiguous": {"depth": -1, "express": 1, "disclose": 2},
    "unamused": {"warmth": -1, "express": -1, "mood": -1},
    "unappeasable": {"warmth": -2, "stability": 1, "care": -2, "order": -1},
    "unassertive": {"express": -2, "social": -1, "order": 1},
    "uncaring": {"warmth": -1, "care": -2},
    "unceremonious": {"refine": -1, "express": -1, "order": -2},
    "uncertain": {"stability": -1, "express": -1, "order": -1},
    "uncomplaining": {"stability": 2, "care": 1, "express": -1, "mood": 1},
    "unconditional": {"warmth": 2, "stability": 2, "care": 2},
    "undecided": {"stability": -1, "risk": -1, "order": -1},
    "undemanding": {"energy": -1, "care": 1, "refine": -2, "order": -1},
    "undiluted": {"energy": 1, "refine": -1, "express": 2},
    "undiscerning": {"depth": -1, "refine": -2},
    "undisciplined": {"stability": -1, "refine": -1, "order": -2},
    "undistinguished": {"refine": -2, "express": -1},
    "undramatic": {"energy": -1, "stability": 1, "express": -2},
    "unembarrassable": {"express": 1, "social": 1, "disclose": 1, "order": -1},
    "unemotional": {"warmth": -2, "express": -2, "disclose": -1},
    "unerring": {"stability": 1, "refine": 2},
    "unexamined": {"depth": -2, "disclose": -1},
    "unexpressive": {"warmth": -1, "express": -2, "disclose": -1},
    "unfailing": {"stability": 2, "care": 1, "order": 1},
    "unflinching": {"stability": 2, "risk": 1, "care": -1},
    "unforgetting": {"warmth": -1, "depth": 1, "stability": 2, "care": -1},
    "unfussy": {"care": 1, "refine": -2, "social": 1},
    "unguarded": {"warmth": 1, "disclose": 2},
    "unhesitating": {"energy": 2, "stability": 1, "risk": 1},
    "unillusioned": {"warmth": -1, "depth": 1, "risk": -1, "mood": -1},
    "unimaginative": {"depth": -1, "express": -2},
    "unimposing": {"energy": -1, "express": -1, "social": -1},
    "unimpressed": {"warmth": -1, "refine": 1, "express": -1, "mood": -1},
    "uninvolved": {"energy": -1, "care": -2, "social": -2},
    "unloving": {"warmth": -2, "care": -1},
    "unlyrical": {"depth": -1, "refine": -1, "express": -2},
    "unnoticeable": {"express": -2, "social": -1},
    "unperceptive": {"depth": -2},
    "unpolished": {"refine": -2, "disclose": 1},
    "unprincipled": {"care": -1, "order": -2},
    "unquenchable": {"energy": 2, "stability": 2, "mood": 1},
    "unread": {"depth": -2, "social": 1},
    "unready": {"energy": -1, "stability": -1, "order": -1},
    "unrehearsed": {"stability": -1, "refine": -1, "express": 1},
    "unremarkable": {"depth": -1, "express": -2},
    "unremembered": {"depth": -1, "express": -2, "social": -1},
    "unrepentant": {"stability": 1, "care": -1, "disclose": -1, "order": -2},
    "unsavoury": {"care": -1, "refine": -2, "order": -1},
    "unscrupulous": {"risk": 1, "care": -1, "order": -2},
    "unseeing": {"depth": -2, "care": -1},
    "unshockable": {"stability": 2, "mood": 1, "order": -1},
    "unsparing": {"care": -2, "refine": 1, "disclose": 1},
    "unstinting": {"energy": 1, "warmth": 2, "care": 2},
    "untethered": {"stability": -2, "order": -1},
    "unthinking": {"depth": -2, "refine": -1},
    "untouched": {"warmth": -1, "care": -1, "disclose": -1},
    "untried": {"stability": -1, "risk": -1},
    "untroubled": {"energy": -1, "stability": 2, "mood": 2},
    "unvarnished": {"refine": -1, "disclose": 2},
    "unwitting": {"depth": -2, "disclose": 1},
    "uprooted": {"stability": -2, "social": -1, "order": -1},
    "urbane": {"warmth": 1, "refine": 2, "social": 2},
    "urgent": {"energy": 2, "care": 1},
    "utilitarian": {"depth": -1, "refine": -1, "express": -1, "order": 1},
    "vanishing": {"stability": -2, "express": -1, "social": -1},
    "verbose": {"refine": -1, "express": 2},
    "visionary": {"depth": 1, "risk": 1, "express": 1},
    "voluble": {"express": 2, "social": 1, "disclose": 1},
    "votive": {"depth": 1, "care": 1, "order": 2},
    "walled": {"warmth": -1, "social": -1, "disclose": -2},
    "watchful": {"depth": 1, "stability": 1, "disclose": -1},
    "wavering": {"stability": -2, "order": -1},
    "wearying": {"energy": -1, "care": -1, "mood": -1},
    "weighty": {"energy": -1, "depth": 1, "mood": -1},
    "whimsical": {"stability": -1, "express": 2, "mood": 1},
    "whiny": {"stability": -1, "care": -1, "express": 1, "mood": -2},
    "wholehearted": {"energy": 1, "warmth": 2, "disclose": 2},
    "wholesome": {"warmth": 1, "care": 1, "order": 1},
    "wide-eyed": {"depth": -1, "risk": 1, "mood": 1, "disclose": 1},
    "wild": {"energy": 2, "stability": -2, "risk": 1, "order": -2},
    "wishy-washy": {"stability": -2, "express": -1, "disclose": -1, "order": -1},
    "withdrawn": {"express": -1, "social": -2, "disclose": -1},
    "withered": {"energy": -2, "mood": -2},
    "witty": {"depth": 1, "express": 1, "mood": 1},
    "workaday": {"depth": -1, "express": -1, "order": 1},
    "world-weary": {"energy": -1, "warmth": -1, "depth": 1, "mood": -2},
    "worldly": {"depth": 1, "refine": 1, "social": 1},
    "wry": {"warmth": -1, "express": 1, "mood": 1},
    "zealous": {"energy": 2, "risk": 1, "order": 1},
}

TRAIT_WEIGHT = 3.0  # how strongly the authored trait/inverse pulls vs. the triple


def parse_frontmatter(text):
    """Return (dict, lines) from a markdown file's frontmatter (flat YAML only)."""
    lines = text.split("\n")
    data = {}
    for line in lines:
        m = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", line)
        if not m:
            continue
        key, raw = m.group(1), m.group(2).strip()
        lst = re.match(r"^\[(.*)\]$", raw)
        if lst:
            data[key] = [x.strip() for x in lst.group(1).split(",") if x.strip()]
        else:
            data[key] = raw
    return data, lines


def collection_traits(name):
    out = {}
    for f in (CONTENT / name).glob("*.md"):
        if f.name[0].isupper():
            continue
        data, _ = parse_frontmatter(f.read_text())
        # Beans/flavours/forms split their words into positiveTraits +
        # negativeTraits; the shadow word is as characterising as the rest, so
        # both feed the vector. ("traits" is the pre-split key, kept as a
        # fallback so an un-migrated file still contributes.)
        out[data["slug"]] = (
            data.get("positiveTraits", [])
            + data.get("negativeTraits", [])
            or data.get("traits", [])
        )
    return out


def vec_from_words(words):
    v = {a: 0.0 for a in AXES}
    for w in words:
        for axis, weight in LEXICON.get(w, {}).items():
            v[axis] += weight
    return v


def add(a, b, scale=1.0):
    return {axis: a[axis] + b[axis] * scale for axis in AXES}


def cosine(a, b):
    dot = sum(a[x] * b[x] for x in AXES)
    na = math.sqrt(sum(a[x] ** 2 for x in AXES))
    nb = math.sqrt(sum(b[x] ** 2 for x in AXES))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


# Load-balancing strength: how hard we push toward an even spread of each
# candidate across all entries vs. picking purely by affinity. Higher = flatter
# distribution. cosine lives in [-1, 1]; a usage of N adds LAMBDA*N to the
# penalty, so a few-point usage gap can outweigh a small affinity gap.
LAMBDA = 0.2
# Polarity bonus. An even spread across only 12 beans forces every bean to be
# picked ~60 times per column, so we can't insist every pick be a genuine
# likeness without wrecking the distribution. POLARITY is a gentle tie-breaker:
# among candidates the usage penalty would otherwise rank together, it favours
# ones already on the right side of zero — actually like the pole they're being
# picked for — over near-orthogonal strangers. Small enough that the spread
# stays flat; see the histogram printed at the end of a run.
POLARITY = 0.3


def select(pole_vec, candidate_vecs, exclude, n, usage):
    """Pick the `n` candidates most like `pole_vec`, balancing usage.

    Both poles call this the same way: the friendly vector picks friendly tags,
    the anti vector picks anti tags. There is no "most opposed" mode — opposition
    is carried by the anti vector itself, which is built from the entry's
    authored inverse. That keeps an anti pick meaning "genuinely like the
    inverse" instead of merely "unlike the trait", where any stranger qualifies.

    `exclude` is a single slug or any iterable of slugs to keep out of the
    running — used both to bar the zodiac's own bean/form/flavour and to keep
    the anti-triple's bean/form distinct from the anti tag picks. `usage` is
    mutated to record the picks.
    """
    barred = {exclude} if isinstance(exclude, str) else set(exclude)
    scored = []
    for slug, v in candidate_vecs.items():
        if slug in barred:
            continue
        c = cosine(pole_vec, v)
        # Polarity bonus: pull genuine likenesses further above zero so they win
        # over merely orthogonal candidates when usage would rank them together.
        adj = (c + POLARITY if c > 0 else c) - LAMBDA * usage[slug]
        scored.append((slug, adj))
    scored.sort(key=lambda kv: (-kv[1], kv[0]))
    picks = [s for s, _ in scored[:n]]
    for s in picks:
        usage[s] += 1
    return picks


OLD_TAG_RE = re.compile(r"^facet(Most|High|Mid|Low|Least)Tags:")
NEW_FIELD_RE = re.compile(
    r"^(friendlyBeans|antiBeans|friendlyFlavour|antiFlavour|antiTriple|friendlyForm|antiForm):"
)


def rewrite(path, fields):
    lines = path.read_text().split("\n")
    # Drop old facet*Tags and any previously generated new fields.
    kept = [
        l for l in lines if not OLD_TAG_RE.match(l) and not NEW_FIELD_RE.match(l)
    ]
    # Find the closing frontmatter delimiter (second '---').
    delims = [i for i, l in enumerate(kept) if l.strip() == "---"]
    close = delims[1]
    # Friendly pole first, then the anti pole, each led by its triple/beans.
    block = [
        f"friendlyBeans: [{', '.join(fields['friendlyBeans'])}]",
        f"friendlyForm: {fields['friendlyForm']}",
        f"antiTriple: {fields['antiTriple']}",
        f"antiBeans: [{', '.join(fields['antiBeans'])}]",
        f"antiForm: {fields['antiForm']}",
    ]
    # Sit the block directly under `dish`, keeping the trait/inverse/excess
    # character fields and their tag expansion together. Fall back to the end of
    # the frontmatter if a file has no `dish` line.
    at = next(
        (i + 1 for i, l in enumerate(kept[:close]) if l.startswith("dish:")),
        close,
    )
    out = kept[:at] + block + kept[at:]
    path.write_text("\n".join(out))


def main():
    dry = "--dry" in sys.argv
    target = next(
        (a.split("=", 1)[1] for a in sys.argv if a.startswith("--dir=")), ZODIAC_DIR
    )
    bean_traits = collection_traits("beans")
    flavour_traits = collection_traits("flavours")
    form_traits = collection_traits("forms")

    bean_vecs = {s: vec_from_words(t) for s, t in bean_traits.items()}
    # Flavours aren't tagged on their own, but a zodiac's flavour shapes both of
    # its pole vectors and the anti-triple names one, so we keep these.
    flavour_vecs = {s: vec_from_words(t) for s, t in flavour_traits.items()}
    form_vecs = {s: vec_from_words(t) for s, t in form_traits.items()}

    # Compute every zodiac's two pole vectors up front so the balancing pass can
    # run in a stable order independent of the filesystem.
    entries = []
    unknown = {}
    for path in sorted((CONTENT / target).glob("*.md")):
        if path.name[0].isupper():
            continue
        data, _ = parse_frontmatter(path.read_text())
        bean, flavour, form, trait, inverse = (
            data["bean"],
            data["flavour"],
            data["form"],
            data["trait"],
            data["inverse"],
        )
        for word in (trait, inverse):
            if word not in LEXICON:
                unknown.setdefault(word, []).append(path.stem)
        # The triple's own character: what the entry is made of. It reads
        # forwards on the friendly pole and backwards on the anti one.
        triple = add(add(bean_vecs[bean], flavour_vecs[flavour]), form_vecs[form])
        neg_triple = {a: -v for a, v in triple.items()}
        friendly_vec = add(triple, vec_from_words([trait]), scale=TRAIT_WEIGHT)
        anti_vec = add(neg_triple, vec_from_words([inverse]), scale=TRAIT_WEIGHT)
        entries.append((path, bean, flavour, form, friendly_vec, anti_vec))

    # A word with no LEXICON entry is a silent hole — that pole falls back to its
    # triple alone — so nothing is written until the lexicon covers the corpus.
    if unknown:
        print(f"{len(unknown)} trait/inverse words missing from LEXICON:")
        for word, slugs in sorted(unknown.items()):
            print(f"  {word}  ({len(slugs)}x, e.g. {slugs[0]})")
        sys.exit(1)

    # Separate usage counters per role so each ring spreads evenly across both
    # its friendly and its anti columns. The anti-triple's bean/form get their
    # own counters (suffix "t") so the triple and the anti tags each spread
    # evenly across their ring rather than competing for the same budget.
    usage = {
        ("bean", "f"): {s: 0 for s in bean_vecs},
        ("bean", "a"): {s: 0 for s in bean_vecs},
        ("bean", "t"): {s: 0 for s in bean_vecs},
        ("flavour", "t"): {s: 0 for s in flavour_vecs},
        ("form", "f"): {s: 0 for s in form_vecs},
        ("form", "a"): {s: 0 for s in form_vecs},
        ("form", "t"): {s: 0 for s in form_vecs},
    }

    count = 0
    for path, bean, flavour, form, friendly_vec, anti_vec in entries:
        # Friendly pole first, because everything it takes is then barred from
        # the anti pole. A bean sitting on both poles is worse than a weak pick:
        # every rule that touches either pole moves it the same way, so it rises
        # whatever the tier and carries no signal at all.
        f_beans = select(friendly_vec, bean_vecs, bean, 2, usage[("bean", "f")])
        f_form = select(friendly_vec, form_vecs, form, 1, usage[("form", "f")])[0]
        # The anti-triple is the zodiac's shadow: the flavour, form and bean
        # nearest its inverse, assembled into a real `{flavour}-{form}-{bean}`
        # slug. Pick it before the anti tags and bar its bean/form from them, so
        # the anti pole itself carries 3 distinct beans and 2 distinct forms.
        anti_bean_bar = {bean, *f_beans}
        anti_form_bar = {form, f_form}
        t_flavour = select(anti_vec, flavour_vecs, flavour, 1, usage[("flavour", "t")])[0]
        t_form = select(anti_vec, form_vecs, anti_form_bar, 1, usage[("form", "t")])[0]
        t_bean = select(anti_vec, bean_vecs, anti_bean_bar, 1, usage[("bean", "t")])[0]
        a_beans = select(
            anti_vec, bean_vecs, anti_bean_bar | {t_bean}, 2, usage[("bean", "a")]
        )
        a_form = select(
            anti_vec, form_vecs, anti_form_bar | {t_form}, 1, usage[("form", "a")]
        )[0]
        fields = {
            "friendlyBeans": f_beans,
            "friendlyForm": f_form,
            "antiTriple": f"{t_flavour}-{t_form}-{t_bean}",
            "antiBeans": a_beans,
            "antiForm": a_form,
        }
        if dry:
            print(path.stem, fields)
        else:
            rewrite(path, fields)
        count += 1

    print(f"Processed {count} zodiacs.")

    def histo(label, counter):
        items = sorted(counter.items(), key=lambda kv: -kv[1])
        spread = items[0][1] - items[-1][1]
        print(f"  {label} (spread {spread}): " + ", ".join(f"{k}={v}" for k, v in items))

    print("Distribution across rings:")
    histo("friendly beans", usage[("bean", "f")])
    histo("anti beans    ", usage[("bean", "a")])
    histo("triple flavour", usage[("flavour", "t")])
    histo("triple form   ", usage[("form", "t")])
    histo("triple bean   ", usage[("bean", "t")])
    histo("friendly form ", usage[("form", "f")])
    histo("anti form     ", usage[("form", "a")])


if __name__ == "__main__":
    main()
