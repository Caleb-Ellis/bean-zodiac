#!/usr/bin/env python3
"""Validate the nickname corpus (see src/content/NICKNAMES.md).

Uniqueness by intent does not survive 3,960 names — across the first three dozen
drafts "cellar", "study", "joyless" and "blade" each recurred unintentionally.
This is the mechanical backstop: run it after every batch, not at the end, since
retrofitting deduplication across a finished corpus is far more painful than
catching it 30 at a time.

Checks, in order of severity:
  1. exact duplicates                 (hard fail)
  2. near-duplicates                  (>= NEAR_SHARED shared content words)
  3. construction overuse             (Nothing X / No X / All X, No Y / ...)
  4. head-noun ledger                 (the image ledger, counted automatically)
  5. hard-rule violations             (length, banned vocabulary, second person)
  6. coverage                         (how much of the 3,960 exists)

Usage:
  python3 scripts/check-nicknames.py src/content/nicknames.json
  python3 scripts/check-nicknames.py FILE.json --batch adzuki-navy   # one pair only
"""

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

FLAVOURS = ["umami", "bitter", "sour", "sweet", "spicy"]
FORMS = ["boiled", "dried", "fermented", "fried", "roasted", "smoked"]
BEANS = [
    "adzuki", "black", "butter", "cannellini", "chickpea", "edamame",
    "fava", "green", "kidney", "mung", "navy", "pinto",
]
# Full corpus: 12 hi x 11 lo real pairs, plus 12 hi x null (no #12 bean), each
# across 5 flavours x 6 forms. See NICKNAMES.md (null-low / PURE CORE).
PAIRS = len(BEANS) * (len(BEANS) - 1) + len(BEANS)  # 132 real + 12 null = 144
TOTAL = PAIRS * len(FLAVOURS) * len(FORMS)

# Words ignored when comparing two names for near-duplication.
STOP = {"the", "a", "an", "of", "at", "in", "on", "to", "for", "and", "or", "with", "that"}
# Two names sharing this many content words are too close.
NEAR_SHARED = 2

# Construction caps across the whole corpus. These shapes go stale fastest;
# totality mode pulls hard toward the negations in particular.
CONSTRUCTIONS = {
    "Nothing X": (re.compile(r"^nothing\b", re.I), 60),
    "No X": (re.compile(r"^no\b", re.I), 60),
    "All X, No Y": (re.compile(r"^all\b.*\bno\b", re.I), 40),
    "X Without Y": (re.compile(r"\bwithout\b", re.I), 40),
    "Un- prefix": (re.compile(r"\bun[a-z]+\b", re.I), 200),
}
# Any single head noun (the last word) may not exceed this share of the corpus.
HEAD_NOUN_CAP = 25

# NICKNAMES.md hard rules. A nickname is a title, not a description, so a leading
# article is banned outright; an internal one is fine ("Early to the Edge").
MAX_WORDS = 3  # NICKNAMES.md asks for 1-2; 3 is the hard ceiling, not the target
BANNED = (set(BEANS) - {"black"}) | set(FLAVOURS) | set(FORMS) | {
    "buttery", "bitterness", "sourness", "sweetness", "spiciness",
    "gentleman", "lady", "mistress", "king", "queen", "sir", "madam",
    "you", "your", "yours",
}


def words(name):
    return re.findall(r"[a-z']+", name.lower())


def content_words(name):
    return {w for w in words(name) if w not in STOP}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("corpus")
    ap.add_argument("--batch", metavar="HI-LO", help="restrict to one bean pair")
    args = ap.parse_args()

    corpus = json.loads(Path(args.corpus).read_text())
    corpus = {k: v for k, v in corpus.items() if v}
    if args.batch:
        corpus = {k: v for k, v in corpus.items() if k.startswith(args.batch + "-")}
        if not corpus:
            raise SystemExit(f"no entries for batch {args.batch}")

    fails = warns = 0

    # 1. exact duplicates
    by_name = defaultdict(list)
    for k, v in corpus.items():
        by_name[v.strip().lower()].append(k)
    dupes = {n: ks for n, ks in by_name.items() if len(ks) > 1}
    print(f"== 1. exact duplicates: {len(dupes)}")
    for n, ks in sorted(dupes.items()):
        fails += 1
        print(f"   FAIL {n!r} x{len(ks)}: {', '.join(ks)}")

    # 2. near-duplicates, via an inverted index so this stays linear-ish
    idx = defaultdict(list)
    for k, v in corpus.items():
        for w in content_words(v):
            idx[w].append(k)
    seen, near = set(), []
    for w, ks in idx.items():
        if len(ks) < 2 or len(ks) > 400:  # skip ultra-common words
            continue
        for i, a in enumerate(ks):
            for b in ks[i + 1:]:
                pair = (a, b) if a < b else (b, a)
                if pair in seen:
                    continue
                seen.add(pair)
                shared = content_words(corpus[a]) & content_words(corpus[b])
                if len(shared) >= NEAR_SHARED:
                    near.append((pair, shared))
    print(f"\n== 2. near-duplicates (>={NEAR_SHARED} shared content words): {len(near)}")
    for (a, b), sh in sorted(near)[:40]:
        warns += 1
        print(f"   WARN {corpus[a]!r} / {corpus[b]!r}  shared={sorted(sh)}")
    if len(near) > 40:
        print(f"   ... and {len(near) - 40} more")

    # 3. construction overuse
    print("\n== 3. constructions")
    scale = max(1, round(len(corpus) / TOTAL * 100) / 100) if len(corpus) < TOTAL else 1
    for label, (rx, cap) in CONSTRUCTIONS.items():
        hits = [k for k, v in corpus.items() if rx.search(v)]
        eff = cap if len(corpus) == TOTAL else max(2, round(cap * len(corpus) / TOTAL))
        flag = "OVER" if len(hits) > eff else "ok  "
        if len(hits) > eff:
            fails += 1
        print(f"   {flag} {label:14} {len(hits):4} (cap {eff})")

    # 4. head-noun ledger
    print("\n== 4. head-noun ledger (top 20)")
    heads = Counter(words(v)[-1] for v in corpus.values() if words(v))
    eff_cap = HEAD_NOUN_CAP if len(corpus) == TOTAL else max(5, round(HEAD_NOUN_CAP * len(corpus) / TOTAL))
    for w, n in heads.most_common(20):
        flag = "OVER" if n > eff_cap else "    "
        if n > eff_cap:
            fails += 1
        print(f"   {flag} {w:18} {n:4}")
    print(f"   ({len(heads)} distinct head nouns across {len(corpus)} names; cap {eff_cap})")

    # 5. hard rules
    print("\n== 5. hard-rule violations")
    viol = 0
    for k, v in sorted(corpus.items()):
        ws = words(v)
        problems = []
        if ws and ws[0] == "the":
            problems.append('leading "The"')
        if len(ws) > MAX_WORDS:
            problems.append(f"{len(ws)} words (max {MAX_WORDS})")
        bad = set(ws) & BANNED
        if bad:
            problems.append(f"banned: {sorted(bad)}")
        if problems:
            viol += 1
            fails += 1
            print(f"   FAIL {k}: {v!r} — {'; '.join(problems)}")
    if not viol:
        print("   none")

    # 6. coverage
    print(f"\n== 6. coverage: {len(corpus)}/{TOTAL} ({100 * len(corpus) / TOTAL:.1f}%)")
    pairs = Counter(f"{k.split('-')[0]}-{k.split('-')[1]}" for k in corpus)
    print(f"   {sum(1 for n in pairs.values() if n == 30)}/{PAIRS} bean pairs complete")

    print(f"\n{'FAIL' if fails else 'PASS'}: {fails} failures, {warns} warnings")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
