#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# Determine search tool: prefer rg (ripgrep), fallback to grep -rn
if command -v rg &>/dev/null; then
  USE_RG=true
else
  USE_RG=false
  echo "[policy] ripgrep (rg) not found, falling back to grep"
fi

# Wrapper: rg_or_grep [-n] [-P] [-v] [--pcre2] [--glob GLOB] PATTERN [PATHS...]
# Translates rg flags to grep equivalents when rg is unavailable.
rg_or_grep() {
  if $USE_RG; then
    rg "$@"
    return $?
  fi

  # Parse arguments for grep fallback
  local grep_flags=("-r")
  local pattern=""
  local paths=()
  local include_globs=()
  local invert=false
  local skip_next=false

  for i in "$@"; do
    if $skip_next; then
      skip_next=false
      # Previous arg was --glob, this is the glob value
      # Convert rg glob '*.{ts,tsx}' to multiple --include patterns
      local glob_val="$i"
      # Handle brace expansion like *.{ts,tsx,js}
      if [[ "$glob_val" == *"{"*"}"* ]]; then
        local prefix="${glob_val%%\{*}"
        local braces="${glob_val#*\{}"
        braces="${braces%%\}*}"
        IFS=',' read -ra exts <<< "$braces"
        for ext in "${exts[@]}"; do
          include_globs+=("--include=${prefix}${ext}")
        done
      else
        include_globs+=("--include=${glob_val}")
      fi
      continue
    fi
    case "$i" in
      -n) grep_flags+=("-n") ;;
      -P|--pcre2) grep_flags+=("-P") ;;
      -v) invert=true ;;
      --glob) skip_next=true ;;
      --glob=*)
        local glob_val="${i#--glob=}"
        if [[ "$glob_val" == *"{"*"}"* ]]; then
          local prefix="${glob_val%%\{*}"
          local braces="${glob_val#*\{}"
          braces="${braces%%\}*}"
          IFS=',' read -ra exts <<< "$braces"
          for ext in "${exts[@]}"; do
            include_globs+=("--include=${prefix}${ext}")
          done
        else
          include_globs+=("--include=${glob_val}")
        fi
        ;;
      -*)
        # Pass other flags through
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

  if $invert; then
    grep_flags+=("-v")
  fi

  grep "${grep_flags[@]}" "${include_globs[@]}" "$pattern" "${paths[@]}"
  return $?
}

POLICY_SCOPE=(
  "packages/ui"
)
IMPORT_POLICY_SCOPE=(
  "apps/admin"
  "apps/tenant"
  "apps/docs/content"
  "apps/admin/docs"
  "apps/tenant/docs"
)
DOC_POLICY_SCOPE=(
  "apps/tenant/docs/design-system/README.md"
  "apps/tenant/docs/design-system/01-introduction.md"
  "apps/tenant/docs/design-system/02-colors.md"
  "apps/tenant/docs/design-system/03-typography.md"
  "apps/tenant/docs/design-system/04-tokens-and-sizing.md"
  "apps/tenant/docs/design-system/05-atoms.md"
  "apps/tenant/docs/design-system/06-molecules.md"
  "apps/tenant/docs/design-system/07-organisms.md"
  "apps/tenant/docs/design-system/08-templates.md"
  "apps/tenant/docs/design-system/09-pages.md"
  "apps/tenant/docs/design-system/10-best-practices.md"
)

echo "[policy] checking legacy ui import paths..."
if rg_or_grep -nP "from ['\"](@/components/ui/|\\./ui/|\\.\\./ui/)" "${IMPORT_POLICY_SCOPE[@]}" --glob '*.{ts,tsx,js,jsx,mts,cts,mjs,cjs,mdx}' >/tmp/policy_legacy_ui_imports.txt; then
  echo "Legacy UI imports found:"
  cat /tmp/policy_legacy_ui_imports.txt
  exit 1
fi

echo "[policy] checking forbidden Tailwind dynamic class patterns..."
if rg_or_grep -nP 'className\s*=\s*\{[^}]*`[^`]*(shadow-\$\{|text-\$\{|bg-\$\{|border-\$\{)' "${POLICY_SCOPE[@]}" --glob '*.{ts,tsx,js,jsx}' >/tmp/policy_dynamic_classes.txt; then
  echo "Forbidden dynamic classes found:"
  cat /tmp/policy_dynamic_classes.txt
  exit 1
fi

echo "[policy] checking icon-only buttons without accessible name..."
if rg_or_grep -nP '<button[^>]*>\s*<(Icon|[A-Z][A-Za-z0-9]*)[^>]*\/?>\s*</button>' "${POLICY_SCOPE[@]}" --glob '*.{tsx,jsx}' >/tmp/policy_icon_buttons.txt; then
  echo "Potential icon-only buttons without label found:"
  cat /tmp/policy_icon_buttons.txt
  exit 1
fi

echo "[policy] checking off-brand hex usage..."
ALLOW='(?i:#10B981|#059669|#34D399|#F97316|#EA580C|#FB923C|#00D9FF|#00B8D4|#F59E0B|#D97706|#FBBF24|#FEF3C7|#3B82F6|#2563EB|#60A5FA|#93C5FD|#0F172A|#1E293B|#334155|#475569|#94A3B8|#E2E8F0|#F1F5F9|#F8FAFC|#EF4444|#B45309|#B91C1C|#0E7490|#0A0A0A|#1A1A1A|#2A2A2A|#4A4A4A|#6A6A6A|#9A9A9A|#CACACA|#E5E5E5|#F9F9F9|#FFFFFF)'
if rg_or_grep -n --pcre2 '#[0-9A-Fa-f]{6}\b' "${POLICY_SCOPE[@]}" "${DOC_POLICY_SCOPE[@]}" --glob '*.{md,tsx,ts,css}' >/tmp/policy_hex_all.txt; then
  if rg_or_grep -nv --pcre2 "$ALLOW" /tmp/policy_hex_all.txt >/tmp/policy_hex_invalid.txt; then
    echo "Potential off-brand hex values found:"
    cat /tmp/policy_hex_invalid.txt
    exit 1
  fi
fi

echo "[policy] design-system checks passed"
