#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

report_app() {
  local app="$1"
  local base="apps/$app"
  local globs=(
    --glob '*.{ts,tsx,js,jsx,mts,cts,mjs,cjs,mdx}'
  )

  echo "## $app"
  local legacy_count
  legacy_count=$( (rg -n "from ['\"]@/components/ui/" "$base" "${globs[@]}" || true) | wc -l | tr -d ' ' )
  local core_count
  core_count=$( (rg -n "from ['\"]@kaven/ui-base['\"]" "$base" "${globs[@]}" || true) | wc -l | tr -d ' ' )
  local compat_count
  compat_count=$( (rg -n "from ['\"]@kaven/ui-base/compat/" "$base" "${globs[@]}" || true) | wc -l | tr -d ' ' )

  echo "legacy_imports=$legacy_count"
  echo "core_imports=$core_count"
  echo "compat_imports=$compat_count"

  echo "top_compat_components:"
  rg -o "from ['\"]@kaven/ui-base/compat/[^'\"]+['\"]" "$base" "${globs[@]}" \
    | sed -E "s|from ['\"]@kaven/ui-base/compat/([^'\"]+)['\"]|\\1|" \
    | sort | uniq -c | sort -nr | head -n 15 || true
  echo
}

report_app admin
report_app tenant
report_app docs
