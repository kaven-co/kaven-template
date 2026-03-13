#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

report=$(bash scripts/migration/ui-import-report.sh)
printf '%s
' "$report"

legacy_non_zero=$(printf '%s
' "$report" | rg '^legacy_imports=' | rg -v 'legacy_imports=0' || true)
compat_non_zero=$(printf '%s
' "$report" | rg '^compat_imports=' | rg -v 'compat_imports=0' || true)

if [[ -n "$legacy_non_zero" || -n "$compat_non_zero" ]]; then
  echo "[migration-check] failed: legacy or compat imports are not zero"
  exit 1
fi

echo "[migration-check] passed: legacy_imports=0 and compat_imports=0"
