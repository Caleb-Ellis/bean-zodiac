#!/usr/bin/env bash
# Repetition audit for zodiac fortunes.
#   ./scripts/fortune-tics.sh              # whole corpus
#   ./scripts/fortune-tics.sh '*-butter'   # one bean/batch
set -euo pipefail
cd "$(dirname "$0")/.."
glob="${1:-*}"
files=(src/content/zodiacs/${glob}.md)

lines() { grep -hE '^fortune(Most|High|Mid|Low|Least):' "${files[@]}" | sed -E 's/^[^:]+: *//'; }

echo "== two-word openers used 3+ times"
lines | awk '{print tolower($1" "$2)}' | sed 's/[[:punct:]]*$//' \
  | sort | uniq -c | sort -rn | awk '$1>=3'

echo
echo "== hedge frames (Not every / Some things / Nothing much / There's a ...)"
lines | grep -icE "^(not every|some (things|days|rooms|of)|nothing much|there's a difference)" \
  | xargs -I{} echo "  {} of $(lines | wc -l | tr -d ' ') lines"

echo
echo "== same opener repeated within a slot"
for slot in Most High Mid Low Least; do
  grep -hE "^fortune${slot}:" "${files[@]}" | sed -E 's/^[^:]+: *//' \
    | awk -v s="$slot" '{print s" | "tolower($1" "$2)}' | sed 's/[[:punct:]]*$//'
done | sort | uniq -c | sort -rn | awk '$1>=2'

echo
echo "== duplicate or near-duplicate lines"
lines | sed 's/[[:punct:]]//g' | awk '{print tolower($0)}' | sort | uniq -d
