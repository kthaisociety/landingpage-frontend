#!/usr/bin/env bash
# Exports the same KTH programme list used by src/app/api/kth-programmes/route.ts,
# for pasting into Luma's custom question option list (which is imported manually).
#
# Usage: ./scripts/export-kth-programmes.sh [output-file]
#   Defaults to writing kth-programmes.txt (newline-separated) in the repo root.

set -euo pipefail

OUT="${1:-kth-programmes.txt}"

curl -sf "https://api.kth.se/api/kopps/v2/programmes/all?l=en" \
  | jq -r '
      [.[].title
        | select(. != null)
        | gsub("^\\s+|\\s+$"; "")
        | select(length > 0)
        | select(test("translation\\s+not\\s+found"; "i") | not)
      ]
      | unique
      | sort_by(ascii_downcase)
      | .[]
    ' > "$OUT"

echo "Wrote $(wc -l < "$OUT" | tr -d ' ') programmes to $OUT"
