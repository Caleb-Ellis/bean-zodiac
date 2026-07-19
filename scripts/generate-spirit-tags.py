#!/usr/bin/env python3
"""Generate spirit-tag frontmatter for every zodiac entry.

For each zodiac we derive the trait-aligned fields used by the Beanstalk's
scoring pass (see SPIRIT_TAGS.md). The model is symmetric — each zodiac has two
poles, and each pole is a triple plus an entourage of 2 beans and 1 form:

  friendly pole : the zodiac's own slug + friendlyBeans (2) + friendlyForm (1)
  anti pole     : antiTriple            + antiBeans (2)     + antiForm (1)

  friendlyBeans : 2 beans that align with the zodiac's trait (never its own)
  antiBeans     : 2 beans that align with the opposite of the trait
  antiTriple    : the zodiac's shadow — a real `{flavour}-{form}-{bean}` slug
                  built from the most-opposed flavour, form and bean
  friendlyForm  : 1 form that aligns with the trait (never its own)
  antiForm      : 1 form that aligns with the opposite of the trait

Because antiTriple carries a flavour, the anti pole gets flavour movement the
same way the friendly pole always has — through its triple — so no separate
flavour tag is needed. The anti-triple's bean/form are barred from antiBeans/
antiForm, so each pole covers 3 distinct beans and 2 distinct forms.

How it works: every personality adjective (the trait words on beans, flavours,
forms, and each zodiac's distilled `trait`) is mapped onto a handful of bipolar
semantic axes via LEXICON below. A candidate's vector is the sum of its trait
words; a zodiac's vector is its distilled trait (weighted) plus the trait words
of its own bean + flavour + form. Friendly = the candidates most aligned with
that vector (highest cosine); anti = the most opposed (lowest cosine). The
zodiac's own bean/flavour/form is always excluded from its own lists.

This is a deterministic heuristic, not a hand-tuned pass — the tags are a coarse
scoring signal, not displayed copy. Re-run after editing the lexicon:

  python3 scripts/generate-spirit-tags.py        # rewrite all 360 files
  python3 scripts/generate-spirit-tags.py --dry  # print, don't write
"""

import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src" / "content"

# Bipolar semantic axes. Each adjective contributes signed weights on the axes
# it touches; unlisted axes are zero.
AXES = ["energy", "warmth", "depth", "stability", "risk", "care", "refine", "express", "social"]

# adjective -> {axis: weight}. Covers every trait word used by the 12 beans,
# 5 flavours, and 6 forms, plus many of the distilled zodiac trait words. A
# zodiac trait not found here simply contributes nothing (the triple carries it).
LEXICON = {
    # flavour trait words
    "discerning": {"depth": 1, "refine": 2},
    "complex": {"depth": 2},
    "cultivated": {"refine": 2, "depth": 1},
    "intelligent": {"depth": 2},
    "cold": {"warmth": -2},
    "sharp": {"care": -1, "refine": 1, "energy": 1},
    "clarifying": {"depth": 1, "refine": 1},
    "precise": {"refine": 2},
    "honest": {"depth": -1},
    "nasty": {"care": -2},
    "bold": {"risk": 2, "energy": 1},
    "transformative": {"risk": 1, "energy": 1, "express": 1},
    "immediate": {"energy": 2, "stability": -1},
    "intense": {"energy": 2},
    "overwhelming": {"energy": 2, "stability": -1},
    "joyful": {"warmth": 2, "express": 1},
    "comforting": {"warmth": 2, "care": 1},
    "generous": {"warmth": 2, "care": 1},
    "effortless": {"stability": 1, "energy": -1},
    "lazy": {"energy": -2},
    "rich": {"depth": 1, "express": 1},
    "satisfying": {"warmth": 1, "care": 1},
    "warm": {"warmth": 2},
    "deep": {"depth": 2},
    "slow": {"energy": -2, "stability": 1},
    # form trait words
    "patient": {"stability": 2, "energy": -1},
    "steady": {"stability": 2},
    "nourishing": {"care": 2, "warmth": 1},
    "composed": {"stability": 2},
    "melancholic": {"warmth": -1, "depth": 1, "energy": -1},
    "austere": {"refine": 1, "warmth": -2},
    "concentrated": {"depth": 1, "refine": 1, "stability": 1},
    "stoic": {"stability": 2, "warmth": -1},
    "solitary": {"social": -2},
    "unyielding": {"stability": 2, "care": -1},
    "introspective": {"depth": 2, "warmth": -1},
    "unconventional": {"express": 1, "stability": -1, "depth": 1},
    "perceptive": {"depth": 2},
    "weird": {"express": 1, "stability": -1},
    "decisive": {"energy": 1, "stability": 1},
    "passionate": {"energy": 2, "warmth": 1, "express": 1},
    "energetic": {"energy": 2},
    "irascible": {"energy": 1, "care": -1, "stability": -1},
    "radiant": {"express": 2, "warmth": 1},
    "convivial": {"social": 2, "express": 1, "warmth": 1},
    "hedonistic": {"risk": 1, "refine": -1, "express": 1},
    "enigmatic": {"depth": 2, "express": -1},
    "inscrutable": {"depth": 2, "warmth": -1, "express": -1},
    "elusive": {"depth": 1, "stability": -1, "warmth": -1},
    "oblique": {"depth": 1, "express": -1},
    "uncanny": {"depth": 1, "express": 1, "stability": -1},
    # bean trait words
    "celebratory": {"warmth": 2, "express": 2},
    "lucky": {"risk": 1},
    "avoidant": {"warmth": -1, "risk": -1, "care": -1},
    "resilient": {"stability": 2, "risk": 1},
    "determined": {"stability": 1, "energy": 1, "risk": 1},
    "guarded": {"warmth": -2, "depth": 1},
    "easygoing": {"stability": 1, "energy": -1, "refine": -1, "warmth": 1},
    "peaceful": {"energy": -1, "warmth": 1, "stability": 1},
    "content": {"energy": -1, "risk": -1, "stability": 1},
    "indulgent": {"refine": -1, "risk": 1},
    "inert": {"energy": -2, "risk": -1},
    "refined": {"refine": 2},
    "elegant": {"refine": 2, "express": 1},
    "gracious": {"warmth": 1, "refine": 1, "care": 1},
    "perfectionist": {"refine": 2, "stability": 1},
    "adaptable": {"stability": -1, "risk": 1},
    "sociable": {"social": 2, "express": 1, "warmth": 1},
    "resourceful": {"risk": 1, "energy": 1},
    "uncommitted": {"stability": -2},
    "practical": {"refine": 1, "depth": -1, "stability": 1},
    "direct": {"depth": -1, "express": 1},
    "quick": {"energy": 2, "stability": -1},
    "dismissive": {"care": -2, "warmth": -1},
    "courageous": {"risk": 2, "energy": 1},
    "daring": {"risk": 2},
    "pioneering": {"risk": 2, "express": 1},
    "reckless": {"risk": 2, "stability": -2},
    "enthusiastic": {"energy": 2, "warmth": 1, "express": 1},
    "fresh": {"energy": 1, "express": 1},
    "optimistic": {"warmth": 1, "energy": 1},
    "restless": {"stability": -2, "energy": 1},
    "protective": {"care": 2, "warmth": 1},
    "tenacious": {"stability": 1, "energy": 1, "risk": 1},
    "vital": {"energy": 2},
    "overextended": {"stability": -1, "energy": 1},
    "healing": {"care": 2},
    "gentle": {"care": 2, "warmth": 1, "energy": -1},
    "nurturing": {"care": 2, "warmth": 1},
    "regenerative": {"care": 1, "risk": 1},
    "insecure": {"stability": -1, "warmth": -1},
    "principled": {"stability": 2, "refine": 1},
    "loyal": {"warmth": 1, "stability": 2},
    "dependable": {"stability": 2},
    "enduring": {"stability": 2},
    "rigid": {"stability": 2, "risk": -1, "care": -1},
    "creative": {"express": 2},
    "expressive": {"express": 2, "warmth": 1},
    "spontaneous": {"stability": -2, "energy": 1},
    "imaginative": {"express": 2, "depth": 1},
    "overemotional": {"express": 1, "stability": -1, "energy": 1},
    # extra coverage for distilled zodiac trait words (partial; unknowns -> 0)
    "irrepressible": {"energy": 2, "express": 2, "stability": -1},
    "judicious": {"depth": 1, "stability": 2, "refine": 1},
    "zealous": {"energy": 2, "risk": 1},
    "wry": {"depth": 1, "warmth": -1},
    "witty": {"express": 1, "depth": 1},
    "withering": {"care": -2, "refine": 1},
    "wistful": {"warmth": -1, "depth": 1, "energy": -1},
    "wholesome": {"care": 1, "warmth": 1},
    "whimsical": {"express": 2, "stability": -1},
    "wary": {"warmth": -1, "depth": 1, "risk": -1},
    "volatile": {"stability": -2, "energy": 1},
    "visionary": {"express": 1, "risk": 1, "depth": 1},
    "vigilant": {"depth": 1, "stability": 1},
    "versatile": {"risk": 1, "stability": -1},
    "untethered": {"stability": -2},
    "unsparing": {"care": -2, "refine": 1},
    "unreliable": {"stability": -2},
    "unpredictable": {"stability": -2, "energy": 1},
    "unguarded": {"warmth": 1, "express": 1},
    "unflinching": {"stability": 2, "risk": 1},
    "unerring": {"refine": 2, "stability": 1},
    "understated": {"express": -2, "refine": 1},
    "uncompromising": {"stability": 2, "care": -1},
    "uncomplicated": {"depth": -1, "warmth": 1},
    "unbridled": {"energy": 2, "stability": -2},
    "trustworthy": {"stability": 2, "warmth": 1},
    "transparent": {"depth": -1, "express": 1},
    "tolerant": {"warmth": 1, "care": 1},
    "timid": {"energy": -1, "risk": -2, "warmth": -1},
    "timeless": {"stability": 2},
    "thoughtful": {"depth": 2, "care": 1},
    "terse": {"express": -2, "warmth": -1},
    "tender": {"care": 2, "warmth": 1},
    "temperamental": {"stability": -2, "energy": 1},
    "tart": {"refine": 1, "care": -1},
    "tactful": {"refine": 1, "care": 1},
    "sympathetic": {"care": 2, "warmth": 1},
    "surgical": {"refine": 2, "care": -1},
    "suppressed": {"express": -2, "energy": -1},
    "subversive": {"stability": -1, "express": 1, "risk": 1},
    "substantive": {"depth": 2},
    "stubborn": {"stability": 2, "care": -1},
    "storied": {"depth": 1, "express": 1},
    "steely": {"stability": 2, "warmth": -1},
    "steadfast": {"stability": 2},
    "stark": {"refine": 1, "warmth": -1, "express": -1},
    "spirited": {"energy": 2, "express": 1},
    "spare": {"express": -2, "refine": 1},
    "solemn": {"warmth": -1, "depth": 1, "energy": -1},
    "skeptical": {"depth": 1, "warmth": -1},
    "sleepy": {"energy": -2},
    "serene": {"energy": -1, "stability": 1, "warmth": 1},
    "sentimental": {"warmth": 1, "express": 1},
    "self-possessed": {"stability": 2},
    "secretive": {"depth": 2, "warmth": -1, "express": -1},
    "scrupulous": {"refine": 2, "stability": 1},
    "reserved": {"express": -2, "warmth": -1},
    "resolute": {"stability": 2, "risk": 1},
    "restrained": {"express": -1, "stability": 1},
    "reflective": {"depth": 2},
    "reckoning": {"depth": 1},
    "rebellious": {"stability": -1, "risk": 1},
    "quiet": {"express": -1, "energy": -1},
    "quirky": {"express": 1, "stability": -1},
    "playful": {"express": 2, "energy": 1},
    "placid": {"energy": -1, "stability": 1},
    "pensive": {"depth": 2, "energy": -1},
    "patient": {"stability": 2, "energy": -1},
    "outspoken": {"express": 2, "care": -1},
    "observant": {"depth": 2},
    "nimble": {"energy": 1, "stability": -1},
    "mischievous": {"express": 1, "stability": -1},
    "methodical": {"refine": 1, "stability": 2},
    "meticulous": {"refine": 2, "stability": 1},
    "mellow": {"energy": -1, "warmth": 1},
    "magnetic": {"express": 2, "warmth": 1},
    "luminous": {"express": 2, "warmth": 1},
    "loyal": {"warmth": 1, "stability": 2},
    "lively": {"energy": 2, "express": 1},
    "level-headed": {"stability": 2},
    "kind": {"care": 2, "warmth": 1},
    "jovial": {"warmth": 1, "social": 2, "express": 1},
    "intrepid": {"risk": 2, "energy": 1},
    "introverted": {"social": -2, "express": -1},
    "intuitive": {"depth": 2},
    "impulsive": {"stability": -2, "energy": 1},
    "impish": {"express": 1, "stability": -1},
    "imperturbable": {"stability": 2, "energy": -1},
    "humble": {"express": -1, "warmth": 1},
    "hot-headed": {"energy": 2, "stability": -1, "care": -1},
    "hardy": {"stability": 2, "risk": 1},
    "guileless": {"depth": -1, "warmth": 1},
    "grounded": {"stability": 2},
    "graceful": {"refine": 2, "express": 1},
    "fierce": {"energy": 2, "risk": 1, "care": -1},
    "fervent": {"energy": 2, "warmth": 1},
    "fastidious": {"refine": 2},
    "exuberant": {"energy": 2, "express": 2, "warmth": 1},
    "exacting": {"refine": 2, "care": -1},
    "evasive": {"depth": 1, "warmth": -1, "stability": -1},
    "even-tempered": {"stability": 2},
    "ethereal": {"express": 1, "depth": 1, "energy": -1},
    "earnest": {"warmth": 1, "depth": 1},
    "ebullient": {"energy": 2, "express": 2},
    "dry": {"warmth": -1, "depth": 1},
    "dreamy": {"express": 1, "depth": 1, "energy": -1},
    "downcast": {"warmth": -1, "energy": -1},
    "dogged": {"stability": 2, "energy": 1},
    "diligent": {"stability": 2, "refine": 1},
    "devoted": {"warmth": 1, "stability": 2, "care": 1},
    "demure": {"express": -1, "warmth": 1},
    "deliberate": {"stability": 2, "refine": 1},
    "defiant": {"risk": 1, "stability": -1, "care": -1},
    "cunning": {"depth": 1, "care": -1},
    "curious": {"depth": 1, "energy": 1},
    "cryptic": {"depth": 2, "express": -1},
    "contemplative": {"depth": 2, "energy": -1},
    "considerate": {"care": 2, "warmth": 1},
    "composed": {"stability": 2},
    "commanding": {"express": 1, "energy": 1, "stability": 1},
    "candid": {"depth": -1, "express": 1, "care": -1},
    "calm": {"energy": -1, "stability": 1},
    "buoyant": {"energy": 1, "warmth": 1, "express": 1},
    "brooding": {"depth": 2, "warmth": -1},
    "brisk": {"energy": 1, "stability": 1},
    "brave": {"risk": 2, "energy": 1},
    "boisterous": {"energy": 2, "express": 2},
    "blunt": {"depth": -1, "care": -1, "express": 1},
    "austere": {"refine": 1, "warmth": -2},
    "audacious": {"risk": 2, "express": 1},
    "attentive": {"depth": 1, "care": 1},
    "assured": {"stability": 2},
    "aloof": {"warmth": -1, "social": -2, "express": -1},
    "affable": {"warmth": 1, "social": 2, "express": 1},
    "adventurous": {"risk": 2, "energy": 1},
    "abrasive": {"care": -2, "warmth": -1},
    # distilled zodiac trait words — second coverage pass (was falling to zero)
    "abiding": {"stability": 2, "warmth": 1},
    "acerbic": {"care": -1, "warmth": -1, "express": 1},
    "acrid": {"care": -1, "warmth": -1},
    "adamant": {"stability": 2, "care": -1},
    "adoring": {"warmth": 2, "care": 1},
    "adrift": {"stability": -2, "energy": -1},
    "affectionate": {"warmth": 2, "care": 1},
    "aggressive": {"energy": 2, "care": -1, "risk": 1},
    "agreeable": {"warmth": 1, "social": 1, "care": 1},
    "ambitious": {"energy": 1, "risk": 1, "stability": 1},
    "analytical": {"depth": 2, "refine": 1},
    "anxious": {"stability": -1, "energy": 1, "warmth": -1},
    "apathetic": {"energy": -2, "care": -1},
    "argumentative": {"express": 1, "care": -1, "social": -1},
    "arrogant": {"express": 1, "care": -1, "warmth": -1},
    "artistic": {"express": 2, "depth": 1},
    "ascetic": {"refine": 1, "warmth": -1, "social": -1},
    "assertive": {"express": 1, "energy": 1, "stability": 1},
    "astringent": {"refine": 1, "warmth": -1, "care": -1},
    "atmospheric": {"depth": 1, "express": 1, "energy": -1},
    "authentic": {"depth": 1, "warmth": 1},
    "barbed": {"care": -2, "express": 1},
    "beguiling": {"express": 1, "warmth": 1, "depth": 1},
    "biting": {"care": -2, "express": 1},
    "bookish": {"depth": 2, "social": -1},
    "bracing": {"energy": 1, "refine": 1, "warmth": -1},
    "budding": {"energy": 1, "risk": 1},
    "calculating": {"depth": 1, "care": -1, "refine": 1},
    "capricious": {"stability": -2, "express": 1},
    "careful": {"stability": 1, "refine": 1, "risk": -1},
    "catalytic": {"energy": 2, "risk": 1, "express": 1},
    "cautious": {"risk": -2, "stability": 1},
    "chaotic": {"stability": -2, "energy": 1},
    "charismatic": {"express": 2, "social": 2, "warmth": 1},
    "chastened": {"express": -1, "energy": -1, "stability": 1},
    "cheerful": {"warmth": 1, "energy": 1, "express": 1},
    "circumspect": {"stability": 1, "depth": 1, "risk": -1},
    "clever": {"depth": 1, "express": 1},
    "clingy": {"social": 1, "stability": -1, "care": 1},
    "clinical": {"refine": 2, "warmth": -1, "care": -1},
    "collaborative": {"social": 2, "warmth": 1, "care": 1},
    "compassionate": {"care": 2, "warmth": 2},
    "competitive": {"energy": 1, "risk": 1, "care": -1},
    "compliant": {"stability": 1, "express": -1, "social": 1},
    "compulsive": {"stability": -1, "refine": 1, "energy": 1},
    "conductive": {"energy": 1, "social": 1, "express": 1},
    "confident": {"stability": 2, "express": 1},
    "confiding": {"warmth": 1, "social": 1, "depth": 1},
    "conflicted": {"stability": -2, "depth": 1},
    "confrontational": {"express": 1, "care": -1, "energy": 1},
    "conscientious": {"refine": 1, "stability": 2, "care": 1},
    "consuming": {"energy": 2, "stability": -1},
    "contrarian": {"express": 1, "social": -1, "risk": 1},
    "conventional": {"stability": 2, "refine": 1, "risk": -1},
    "critical": {"refine": 1, "care": -1, "depth": 1},
    "cynical": {"warmth": -1, "depth": 1, "care": -1},
    "daydreamy": {"express": 1, "depth": 1, "energy": -1},
    "dazzling": {"express": 2, "warmth": 1},
    "dedicated": {"stability": 2, "care": 1},
    "defensive": {"warmth": -1, "stability": -1, "care": -1},
    "delicate": {"care": 1, "refine": 1, "energy": -1},
    "detached": {"warmth": -1, "social": -1, "energy": -1},
    "detail-oriented": {"refine": 2, "stability": 1},
    "diplomatic": {"refine": 1, "social": 1, "care": 1},
    "disarming": {"warmth": 1, "social": 1, "express": 1},
    "disciplined": {"stability": 2, "refine": 1},
    "distinguished": {"refine": 2, "express": 1},
    "distractible": {"stability": -2, "energy": 1},
    "dogmatic": {"stability": 2, "care": -1, "express": 1},
    "dreamlike": {"express": 1, "depth": 1, "energy": -1},
    "driven": {"energy": 2, "stability": 1, "risk": 1},
    "dutiful": {"stability": 2, "care": 1},
    "eccentric": {"express": 1, "stability": -1, "social": -1},
    "eerie": {"depth": 1, "warmth": -1, "express": 1},
    "efficient": {"refine": 2, "energy": 1},
    "electric": {"energy": 2, "express": 1},
    "emotive": {"express": 2, "warmth": 1},
    "empathetic": {"care": 2, "warmth": 1, "depth": 1},
    "empowering": {"warmth": 1, "care": 1, "express": 1},
    "enamored": {"warmth": 2, "express": 1},
    "entrepreneurial": {"risk": 2, "energy": 1, "express": 1},
    "erratic": {"stability": -2, "energy": 1},
    "exalted": {"express": 2, "depth": 1},
    "excitable": {"energy": 2, "stability": -1, "express": 1},
    "exquisite": {"refine": 2, "express": 1},
    "extravagant": {"express": 2, "refine": -1, "risk": 1},
    "fair": {"stability": 1, "care": 1, "refine": 1},
    "fairylike": {"express": 1, "depth": 1, "energy": -1},
    "faithful": {"warmth": 1, "stability": 2, "care": 1},
    "fearless": {"risk": 2, "energy": 1},
    "ferocious": {"energy": 2, "risk": 1, "care": -1},
    "fidgety": {"stability": -1, "energy": 1},
    "flexible": {"stability": -1, "risk": 1},
    "focused": {"refine": 1, "stability": 2, "depth": 1},
    "forensic": {"depth": 2, "refine": 2, "care": -1},
    "formidable": {"stability": 2, "energy": 1, "express": 1},
    "forthright": {"express": 1, "depth": -1, "care": -1},
    "foundational": {"stability": 2, "depth": 1},
    "frenetic": {"energy": 2, "stability": -2},
    "frugal": {"refine": 1, "risk": -1, "stability": 1},
    "fun": {"warmth": 1, "express": 1, "energy": 1},
    "funny": {"express": 2, "warmth": 1, "social": 1},
    "gritty": {"stability": 2, "energy": 1, "risk": 1},
    "grumpy": {"warmth": -1, "care": -1, "social": -1},
    "hallowed": {"depth": 2, "stability": 1},
    "happy": {"warmth": 2, "express": 1},
    "hardened": {"stability": 2, "warmth": -1, "care": -1},
    "hardworking": {"stability": 2, "energy": 1},
    "haunted": {"depth": 2, "warmth": -1, "stability": -1},
    "hazy": {"depth": 1, "stability": -1, "energy": -1},
    "headstrong": {"stability": 1, "care": -1, "energy": 1},
    "hermetic": {"social": -2, "depth": 1, "warmth": -1},
    "high-strung": {"stability": -1, "energy": 1, "warmth": -1},
    "honed": {"refine": 2, "stability": 1},
    "hushed": {"express": -2, "energy": -1},
    "idealistic": {"express": 1, "depth": 1, "risk": 1},
    "impartial": {"refine": 1, "care": 1, "warmth": -1},
    "impenetrable": {"depth": 2, "warmth": -1, "express": -1},
    "implacable": {"stability": 2, "care": -1},
    "impractical": {"depth": 1, "refine": -1, "stability": -1},
    "independent": {"social": -1, "stability": 1, "risk": 1},
    "indomitable": {"stability": 2, "energy": 1, "risk": 1},
    "innovative": {"express": 1, "risk": 1, "depth": 1},
    "inquisitive": {"depth": 1, "energy": 1},
    "insightful": {"depth": 2},
    "insistent": {"energy": 1, "express": 1, "stability": 1},
    "intricate": {"depth": 2, "refine": 1},
    "inventive": {"express": 2, "risk": 1, "depth": 1},
    "invested": {"care": 1, "stability": 1, "energy": 1},
    "iridescent": {"express": 2, "warmth": 1},
    "irreverent": {"express": 1, "care": -1, "risk": 1},
    "judgmental": {"care": -1, "refine": 1, "warmth": -1},
    "keen": {"depth": 1, "energy": 1, "refine": 1},
    "laconic": {"express": -2, "warmth": -1},
    "languid": {"energy": -2, "stability": 1},
    "layered": {"depth": 2, "refine": 1},
    "lighthearted": {"warmth": 1, "express": 1, "energy": 1},
    "liminal": {"depth": 1, "stability": -1, "express": 1},
    "lingering": {"depth": 1, "energy": -1, "stability": 1},
    "literal-minded": {"depth": -1, "refine": 1, "express": -1},
    "logical": {"depth": 1, "refine": 2, "warmth": -1},
    "manipulative": {"care": -2, "depth": 1, "social": 1},
    "measured": {"stability": 2, "refine": 1, "energy": -1},
    "melancholy": {"warmth": -1, "depth": 1, "energy": -1},
    "mercurial": {"stability": -2, "energy": 1, "express": 1},
    "minimalist": {"express": -1, "refine": 2},
    "moody": {"stability": -1, "warmth": -1, "express": 1},
    "mordant": {"care": -1, "depth": 1, "express": 1},
    "motivated": {"energy": 2, "stability": 1},
    "murky": {"depth": 1, "express": -1, "stability": -1},
    "mysterious": {"depth": 2, "express": -1, "warmth": -1},
    "mystical": {"depth": 2, "express": 1},
    "nonchalant": {"energy": -1, "stability": 1, "warmth": -1},
    "nostalgic": {"warmth": 1, "depth": 1, "energy": -1},
    "obsessive": {"refine": 1, "stability": -1, "energy": 1},
    "offbeat": {"express": 1, "stability": -1, "social": -1},
    "ominous": {"depth": 1, "warmth": -1, "express": 1},
    "open-minded": {"social": 1, "risk": 1, "warmth": 1},
    "opinionated": {"express": 2, "care": -1, "stability": 1},
    "oracular": {"depth": 2, "express": 1},
    "organized": {"refine": 2, "stability": 1},
    "otherworldly": {"depth": 1, "express": 1, "social": -1},
    "outgoing": {"social": 2, "warmth": 1, "express": 1},
    "overachieving": {"energy": 1, "refine": 1, "stability": 1},
    "overprotective": {"care": 2, "warmth": 1, "stability": -1},
    "pallid": {"energy": -1, "warmth": -1, "express": -1},
    "pedantic": {"refine": 2, "depth": 1, "care": -1},
    "perennial": {"stability": 2},
    "persnickety": {"refine": 2, "care": -1},
    "pessimistic": {"warmth": -1, "energy": -1, "risk": -1},
    "philosophical": {"depth": 2, "energy": -1},
    "piercing": {"depth": 1, "refine": 1, "care": -1},
    "piquant": {"express": 1, "refine": 1, "energy": 1},
    "poetic": {"express": 2, "depth": 1},
    "pointed": {"express": 1, "care": -1, "refine": 1},
    "polished": {"refine": 2, "express": 1},
    "potent": {"energy": 2, "depth": 1},
    "practiced": {"refine": 2, "stability": 1},
    "pragmatic": {"refine": 1, "depth": -1, "stability": 1},
    "prescient": {"depth": 2},
    "primal": {"energy": 2, "risk": 1, "refine": -1},
    "primed": {"energy": 1, "stability": 1, "risk": 1},
    "proactive": {"energy": 1, "stability": 1, "risk": 1},
    "profound": {"depth": 2},
    "prolific": {"express": 2, "energy": 1},
    "proud": {"express": 1, "stability": 1, "warmth": -1},
    "provocative": {"express": 1, "risk": 1, "care": -1},
    "prudent": {"refine": 1, "risk": -2, "stability": 1},
    "pungent": {"express": 1, "energy": 1, "refine": -1},
    "questioning": {"depth": 1, "risk": 1, "express": 1},
    "rarefied": {"refine": 2, "social": -1, "depth": 1},
    "rational": {"depth": 1, "refine": 2, "warmth": -1},
    "receptive": {"warmth": 1, "social": 1, "care": 1},
    "relentless": {"energy": 2, "stability": 1, "care": -1},
    "restorative": {"care": 2, "warmth": 1},
    "reticent": {"express": -2, "social": -1, "warmth": -1},
    "reverential": {"depth": 1, "warmth": 1, "care": 1},
    "righteous": {"stability": 1, "care": -1, "express": 1},
    "risk-taking": {"risk": 2, "energy": 1},
    "romantic": {"warmth": 2, "express": 1, "depth": 1},
    "sarcastic": {"express": 1, "care": -1, "warmth": -1},
    "sardonic": {"express": 1, "care": -1, "depth": 1},
    "scary": {"warmth": -1, "express": 1, "care": -1},
    "scholarly": {"depth": 2, "refine": 1, "social": -1},
    "seething": {"energy": 1, "express": -1, "care": -1},
    "selective": {"refine": 1, "social": -1, "care": -1},
    "self-absorbed": {"social": -1, "care": -1, "express": 1},
    "self-aware": {"depth": 2, "refine": 1},
    "self-deprecating": {"express": -1, "warmth": 1, "depth": 1},
    "self-reliant": {"social": -1, "stability": 2, "risk": 1},
    "sensitive": {"care": 1, "warmth": 1, "depth": 1},
    "serious": {"depth": 1, "warmth": -1, "express": -1},
    "shrewd": {"depth": 1, "refine": 1, "care": -1},
    "silly": {"express": 2, "energy": 1, "refine": -1},
    "sincere": {"warmth": 1, "depth": 1, "express": 1},
    "steeped": {"depth": 2, "stability": 1},
    "transfixing": {"express": 2, "depth": 1},
    "untempered": {"energy": 1, "stability": -1, "refine": -1},
    "wispy": {"express": -1, "energy": -1, "stability": -1},
    "wordless": {"express": -2, "depth": 1},
    "worrisome": {"stability": -1, "warmth": -1, "energy": 1},
    # distilled zodiac trait words — third coverage pass (were falling to zero)
    "challenging": {"risk": 1, "care": -1, "energy": 1},
    "regal": {"refine": 2, "express": 1, "stability": 1},
    "foreboding": {"depth": 1, "warmth": -1, "express": 1},
    "feisty": {"energy": 2, "risk": 1, "care": -1},
    "straightforward": {"depth": -1, "express": 1},
    "incisive": {"depth": 1, "refine": 1, "care": -1},
}

TRAIT_WEIGHT = 3.0  # how strongly the distilled trait word pulls vs. the triple


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
        out[data["slug"]] = data.get("traits", [])
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
# picked as an anti ~60 times, so we can't insist every anti pick be a genuine
# opposite without wrecking the distribution. POLARITY is a gentle tie-breaker:
# among candidates the usage penalty would otherwise rank together, it favours
# ones already on the correct side of zero (truly opposed for anti, truly
# aligned for friendly) over near-orthogonal strangers. Small enough that the
# spread stays flat; see the histogram printed at the end of a run.
POLARITY = 0.3


def select(zodiac_vec, candidate_vecs, exclude, n, friendly, usage):
    """Pick `n` candidates, balancing usage. friendly=True takes the highest
    cosine (penalised by usage); friendly=False takes the most *opposed* —
    lowest cosine — likewise. `usage` is mutated to record the picks.

    `exclude` is a single slug or any iterable of slugs to keep out of the
    running — used both to bar the zodiac's own bean/form/flavour and to keep
    the anti-triple's bean/form distinct from the anti tag picks.

    Anti picks should mean "genuinely opposed," not merely "unrelated": an
    orthogonal candidate (cosine ~0) is a stranger, not an opponent. So the
    usage penalty is split — a bounded, polarity-respecting nudge (`SOFT`) plus
    a per-bucket term that only kicks in once everyone in the relevant polarity
    has been used at least `usage_floor` times. This keeps the spread even
    without letting load-balancing drag a pick across the zero line off a true
    opposite onto a stranger.
    """
    barred = {exclude} if isinstance(exclude, str) else set(exclude)
    scored = []
    for slug, v in candidate_vecs.items():
        if slug in barred:
            continue
        c = cosine(zodiac_vec, v)
        # Polarity bonus: pull genuine opposites further below zero (anti) or
        # genuine matches further above it (friendly), so they win over merely
        # orthogonal candidates when usage would otherwise rank them together.
        if friendly:
            adj = (c + POLARITY if c > 0 else c) - LAMBDA * usage[slug]
        else:
            adj = (c - POLARITY if c < 0 else c) + LAMBDA * usage[slug]
        scored.append((slug, adj))
    scored.sort(key=lambda kv: (-kv[1], kv[0]) if friendly else (kv[1], kv[0]))
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
    # Sit the block directly under `excess`, keeping the trait/inverse/excess
    # character fields and their tag expansion together. Fall back to the end of
    # the frontmatter if a file has no `excess` line.
    at = next(
        (i + 1 for i, l in enumerate(kept[:close]) if l.startswith("excess:")),
        close,
    )
    out = kept[:at] + block + kept[at:]
    path.write_text("\n".join(out))


def main():
    dry = "--dry" in sys.argv
    bean_traits = collection_traits("beans")
    flavour_traits = collection_traits("flavours")
    form_traits = collection_traits("forms")

    bean_vecs = {s: vec_from_words(t) for s, t in bean_traits.items()}
    # Flavours aren't tagged, but a zodiac's own flavour still shapes its
    # character vector, so we keep these for the zvec contribution below.
    flavour_vecs = {s: vec_from_words(t) for s, t in flavour_traits.items()}
    form_vecs = {s: vec_from_words(t) for s, t in form_traits.items()}

    # Compute every zodiac vector up front so the balancing pass can run in a
    # stable order independent of the filesystem.
    entries = []
    unknown = set()
    for path in sorted((CONTENT / "zodiacs").glob("*.md")):
        if path.name[0].isupper():
            continue
        data, _ = parse_frontmatter(path.read_text())
        bean, flavour, form, trait = (
            data["bean"],
            data["flavour"],
            data["form"],
            data["trait"],
        )
        if trait not in LEXICON:
            unknown.add(trait)
        zvec = {a: 0.0 for a in AXES}
        zvec = add(zvec, bean_vecs[bean])
        zvec = add(zvec, flavour_vecs[flavour])
        zvec = add(zvec, form_vecs[form])
        zvec = add(zvec, vec_from_words([trait]), scale=TRAIT_WEIGHT)
        entries.append((path, bean, flavour, form, zvec))

    # Separate usage counters per role so each ring spreads evenly across both
    # its friendly and its anti columns.
    # Separate usage counters per role. The anti-triple's bean/form get their own
    # counters (suffix "t") so the triple and the anti tags each spread evenly
    # across their ring rather than competing for the same budget.
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
    for path, bean, flavour, form, zvec in entries:
        # The anti-triple is the zodiac's shadow: the most-opposed flavour, form
        # and bean, assembled into a real `{flavour}-{form}-{bean}` slug. Pick it
        # first, then bar its bean/form from the anti tag picks so each pole
        # carries 3 distinct beans (triple + 2 tags) and 2 distinct forms.
        t_flavour = select(zvec, flavour_vecs, flavour, 1, False, usage[("flavour", "t")])[0]
        t_form = select(zvec, form_vecs, form, 1, False, usage[("form", "t")])[0]
        t_bean = select(zvec, bean_vecs, bean, 1, False, usage[("bean", "t")])[0]
        fields = {
            "friendlyBeans": select(zvec, bean_vecs, bean, 2, True, usage[("bean", "f")]),
            "antiBeans": select(zvec, bean_vecs, {bean, t_bean}, 2, False, usage[("bean", "a")]),
            "antiTriple": f"{t_flavour}-{t_form}-{t_bean}",
            "friendlyForm": select(zvec, form_vecs, form, 1, True, usage[("form", "f")])[0],
            "antiForm": select(zvec, form_vecs, {form, t_form}, 1, False, usage[("form", "a")])[0],
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
    if unknown:
        print(f"{len(unknown)} trait words not in LEXICON (fell back to triple).")


if __name__ == "__main__":
    main()
