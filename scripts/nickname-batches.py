#!/usr/bin/env python3
"""Emit the nickname authoring manifest (see src/content/NICKNAMES.md).

The corpus is 12 beans x 11 other beans x 5 flavours x 6 forms = 3,960 nicknames,
keyed `{hiBean}-{loBean}-{flavour}-{form}`. Authoring happens in **132 batches of
30** — one `{hiBean} x {loBean}` pair per batch, covering all 30 flavour/form
registers at once — because that is where collisions actually happen: those 30
cells are the same person-shape thirty ways.

Batches are ordered into 12 super-groups by #1 bean, so the 11 batches sharing a
core run consecutively and the image ledger stays fresh across them.

Each batch is pre-tagged with its writing mode, decided by the cosine between the
two beans' trait vectors (not by taste):

  cos < -0.2  opposed    -> TOTALITY        (no contradiction available; name the purity)
  -0.2..+0.2  orthogonal -> MISSING FACULTY (the workhorse; name the absent faculty)
  cos > +0.2  aligned    -> TENSION         (the absence is a surprise; name the contradiction)

Usage:
  python3 scripts/nickname-batches.py --list            # all 132 batches + modes
  python3 scripts/nickname-batches.py --batch 7         # one batch's 30 keys + brief
  python3 scripts/nickname-batches.py --todo FILE.json  # batches not yet complete
"""

import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FLAVOURS = ["umami", "bitter", "sour", "sweet", "spicy"]
FORMS = ["boiled", "dried", "fermented", "fried", "roasted", "smoked"]

# Mode thresholds on cos(hiBean, loBean). See NICKNAMES.md.
OPPOSED, ALIGNED = -0.2, 0.2

MODE_BRIEF = {
    "TOTALITY": (
        "The beans are already opposites, so the absence is expected and there is no\n"
        "  contradiction to name. Name the PURITY: unmixed, undiluted, no counterweight\n"
        "  anywhere. Highest risk of drifting into negation — force a concrete noun or a\n"
        "  person into most of these. If a cell feels flat, check whether the flavour/form\n"
        "  is AGREEING with the beans; if so, that agreement is the problem — put the\n"
        "  contradiction on the register instead."
    ),
    "MISSING FACULTY": (
        "The beans are unrelated — no contradiction, no redundancy. The absence reads as a\n"
        "  faculty this person simply does not have. Name that missing faculty:\n"
        "  'brave, never looks inward' / 'heals everyone, no standards about whom'."
    ),
    "TENSION": (
        "The beans are similar, so the absence is a genuine surprise. Name the\n"
        "  CONTRADICTION: 'celebrates hard, won't work the room'."
    ),
    "PURE CORE": (
        "There is NO #12 bean — this nickname is shown when the user's lowest bean is\n"
        "  not meaningfully below the pack (see NICKNAMES.md), so there is no absence to\n"
        "  name. Name the undiluted core: the zodiac's `trait`, full strength, no\n"
        "  counterweight. This is the one mode where restating the trait is CORRECT —\n"
        "  the whole point is a person who is wholly that, with no notable lack. Fired\n"
        "  for ~46% of users, so these are first-class names, not a fallback stub."
    ),
}


def bean_vectors():
    """Reuse the trait-vector machinery from the spirit-tag generator."""
    path = ROOT / "scripts" / "generate-spirit-tags.py"
    spec = importlib.util.spec_from_file_location("spirit_tags", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    traits = mod.collection_traits("beans")
    return {s: mod.vec_from_words(t) for s, t in traits.items()}, mod.cosine


def mode_for(c):
    if c < OPPOSED:
        return "TOTALITY"
    if c > ALIGNED:
        return "TENSION"
    return "MISSING FACULTY"


def build_batches():
    vecs, cosine = bean_vectors()
    beans = sorted(vecs)
    batches = []
    for hi in beans:  # super-group: the null batch + 11 real batches, consecutive
        # Lead each super-group with its null-low batch (`{hi}-null-...`), used
        # when the user has no meaningfully-low bean. It has no #12, so no cosine
        # and no tension/faculty/totality — its own PURE CORE mode.
        batches.append({"hi": hi, "lo": "null", "cos": None, "mode": "PURE CORE"})
        for lo in beans:
            if lo == hi:
                continue
            c = cosine(vecs[hi], vecs[lo])
            batches.append({"hi": hi, "lo": lo, "cos": c, "mode": mode_for(c)})
    return batches


def keys_for(b):
    return [f"{b['hi']}-{b['lo']}-{fl}-{fm}" for fl in FLAVOURS for fm in FORMS]


def zodiac_character(bean):
    """trait/inverse/excess for the 30 zodiacs `{flavour}-{form}-{bean}`.

    Each cell of a batch maps onto a real zodiac slug built from its flavour,
    form and #1 bean — so `trait` is already a hand-authored synthesis of three
    of the nickname's four axes. Only the distilled frontmatter is returned: the
    30 full entries run to ~17.6k words and would swamp the batch, and their
    body imagery would bleed into names that sit beside them in the UI.
    """
    out = {}
    for fl in FLAVOURS:
        for fm in FORMS:
            slug = f"{fl}-{fm}-{bean}"
            path = ROOT / "src" / "content" / "zodiacs" / f"{slug}.md"
            if not path.exists():
                continue
            got = {}
            for line in path.read_text().split("\n"):
                for field in ("trait", "inverse", "excess"):
                    if line.startswith(f"{field}: "):
                        got[field] = line.split(": ", 1)[1].strip()
                if line.strip() == "---" and got:
                    break
            out[f"{fl}-{fm}"] = got
    return out


def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--list", action="store_true", help="all 144 batches with modes")
    g.add_argument("--batch", type=int, metavar="N", help="print batch N (1-144)")
    g.add_argument("--todo", metavar="FILE", help="batches missing from a corpus json")
    args = ap.parse_args()
    batches = build_batches()

    if args.list:
        counts = {}
        cur = None
        for i, b in enumerate(batches, 1):
            if b["hi"] != cur:
                cur = b["hi"]
                print(f"\n--- super-group: #1 {cur} " + "-" * 40)
            counts[b["mode"]] = counts.get(b["mode"], 0) + 1
            cos = "  n/a " if b["cos"] is None else f"{b['cos']:+.2f}"
            print(f"  {i:3}. {b['hi']:11} / {b['lo']:11} cos {cos}  {b['mode']}")
        print(f"\n{len(batches)} batches x 30 = {len(batches) * 30} nicknames")
        for m, n in sorted(counts.items(), key=lambda kv: -kv[1]):
            print(f"  {m:16} {n:3} batches ({n * 30:4} names, {100 * n / len(batches):2.0f}%)")
        return

    if args.batch:
        if not 1 <= args.batch <= len(batches):
            raise SystemExit(f"batch must be 1..{len(batches)}")
        b = batches[args.batch - 1]
        is_null = b["lo"] == "null"
        low = "— (none)" if is_null else b["lo"]
        cos = "n/a (no #12)" if is_null else f"{b['cos']:+.3f}"
        print(f"BATCH {args.batch}/{len(batches)}  #1 {b['hi']}  #12 {low}")
        print(f"cos {cos}  ->  MODE: {b['mode']}\n")
        print(f"  {MODE_BRIEF[b['mode']]}\n")
        print("Read src/content/NICKNAMES.md before writing.\n")
        if is_null:
            print(
                f"Each cell maps to the zodiac {{flavour}}-{{form}}-{b['hi']}, whose `trait` is\n"
                f"the authored synthesis of all three axes you have. There is NO #12 bean to\n"
                f"subtract: name the trait at full strength. A pure-core name that reads as a\n"
                f"clean, undiluted version of the trait is exactly right here.\n"
            )
        else:
            print(
                f"Each cell maps to the zodiac {{flavour}}-{{form}}-{b['hi']}, whose `trait` is\n"
                f"already the authored synthesis of flavour+form+bean — 3 of your 4 axes. Use it\n"
                f"as the STARTING POINT, then subtract {b['lo']}. Do not merely restate the trait:\n"
                f"a name that ignores the {b['lo']}-shaped absence has failed.\n"
            )
        chars = zodiac_character(b["hi"])
        print(f"  {'key':<40} {'trait':<16} {'inverse':<16} excess")
        for k in keys_for(b):
            reg = "-".join(k.split("-")[2:])
            c = chars.get(reg, {})
            print(
                f"  {k:<40} {c.get('trait', '?'):<16} "
                f"{c.get('inverse', '?'):<16} {c.get('excess', '?')}"
            )
        return

    corpus = json.loads(Path(args.todo).read_text())
    done = incomplete = 0
    for i, b in enumerate(batches, 1):
        have = sum(1 for k in keys_for(b) if corpus.get(k))
        if have == 30:
            done += 1
        else:
            incomplete += 1
            print(f"  batch {i:3}. {b['hi']:11}/{b['lo']:11} {b['mode']:16} {have:2}/30")
    print(f"\n{done} complete, {incomplete} outstanding ({done * 30}/{len(batches) * 30} names)")


if __name__ == "__main__":
    main()
