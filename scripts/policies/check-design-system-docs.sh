#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# Determine search tool: prefer rg (ripgrep), fallback to grep
if command -v rg &>/dev/null; then
  USE_RG=true
else
  USE_RG=false
  echo "[policy-docs] ripgrep (rg) not found, falling back to grep"
fi

# Wrapper: rg_or_grep [FLAGS] PATTERN [PATHS...]
rg_or_grep() {
  if $USE_RG; then
    rg "$@"
    return $?
  fi

  local grep_flags=()
  local pattern=""
  local paths=()

  for i in "$@"; do
    case "$i" in
      -n) grep_flags+=("-n") ;;
      -P|--pcre2) grep_flags+=("-P") ;;
      -v) grep_flags+=("-v") ;;
      -*)
        grep_flags+=("$i")
        ;;
      *)
        if [ -z "$pattern" ]; then
          pattern="$i"
        else
          paths+=("$i")
        fi
        ;;
    esac
  done

  grep "${grep_flags[@]}" "$pattern" "${paths[@]}"
  return $?
}

DOC_ROOT="apps/tenant/docs/design-system"
README_PATH="$DOC_ROOT/README.md"

REQUIRED_FILES=(
  "01-introduction.md"
  "02-colors.md"
  "03-typography.md"
  "04-tokens-and-sizing.md"
  "05-atoms.md"
  "06-molecules.md"
  "07-organisms.md"
  "08-templates.md"
  "09-pages.md"
  "10-best-practices.md"
)

echo "[policy-docs] checking required 01-10 files..."
missing=false
for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$DOC_ROOT/$file" ]]; then
    echo "Missing required file: $DOC_ROOT/$file"
    missing=true
  fi
done
if [[ "$missing" == true ]]; then
  exit 1
fi

echo "[policy-docs] checking README official index does not point to legacy..."
if rg_or_grep -n "\]\(\./legacy/" "$README_PATH" >/tmp/policy_docs_legacy_links.txt; then
  # Allowed only in dedicated Legacy section line(s)
  if rg_or_grep -n "\]\(\./legacy/" "$README_PATH" | rg_or_grep -v "Legacy \(read-only\)|Arquivo legado consolidado" >/tmp/policy_docs_legacy_index_violation.txt; then
    echo "README contains legacy links outside Legacy section:"
    cat /tmp/policy_docs_legacy_index_violation.txt
    exit 1
  fi
fi

echo "[policy-docs] checking root docs taxonomy drift (NN-*.md outside 01-10)..."
if find "$DOC_ROOT" -maxdepth 1 -type f -name '[0-9][0-9]-*.md' \
  | sed 's|.*/||' \
  | rg_or_grep -v '^(01-introduction|02-colors|03-typography|04-tokens-and-sizing|05-atoms|06-molecules|07-organisms|08-templates|09-pages|10-best-practices)\.md$' \
  >/tmp/policy_docs_taxonomy_drift.txt; then
  echo "Unexpected root taxonomy files found:"
  cat /tmp/policy_docs_taxonomy_drift.txt
  exit 1
fi

echo "[policy-docs] design-system docs checks passed"
