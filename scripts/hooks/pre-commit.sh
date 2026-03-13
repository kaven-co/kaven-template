#!/bin/bash
#
# ⚡ PRE-COMMIT HOOK (LEVE - ~10 segundos)
#
# Validações RÁPIDAS que rodam a cada commit.
# Se falhar, commit é abortado.
#
# Validações:
#  1. ✅ Assinatura de commit (GPG)
#  2. ✅ Lint apenas arquivos staged (fast)
#  3. ✅ Verifica secrets no código
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
  echo -e "\n${BLUE}▶ $1${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}\n"
}

print_error() {
  echo -e "${RED}❌ $1${NC}\n"
}

# ============================================================================
# CHECK 1: Assinatura GPG (OPCIONAL MAS RECOMENDADO)
# ============================================================================

print_header "Validando assinatura de commit"

# Verificar se GPG está configurado
if git config user.signingkey > /dev/null 2>&1; then
  # GPG está configurado, mas deixamos o commit prosseguir mesmo se falhar
  # (usuário pode estar sem GPG rodando neste momento)
  print_success "GPG está configurado (commit será assinado)"
else
  print_error "⚠️  GPG não está configurado"
  echo "Configure com: git config user.signingkey <KEY_ID>"
  echo "Continuando sem assinatura..."
fi

# ============================================================================
# CHECK 2: Lint de Arquivos Staged (RÁPIDO)
# ============================================================================

print_header "Linting arquivos staged"

# Listar arquivos staged
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
  print_success "Nenhum arquivo para lint"
else
  # Apenas lint em arquivos JS/TS/JSX/TSX staged
  LINT_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' || true)

  if [ -z "$LINT_FILES" ]; then
    print_success "Nenhum arquivo JS/TS para lint"
  else
    echo "Arquivos a fazer lint:"
    echo "$LINT_FILES" | sed 's/^/  /'
    echo ""

    # Rodar eslint apenas em apps/packages que tenham eslint.config.* (flat config)
    LINT_FAILED=false
    declare -A APP_FILES

    # Agrupar arquivos por diretório de app
    while IFS= read -r file; do
      if [[ "$file" == apps/* ]] || [[ "$file" == packages/* ]]; then
        APP_DIR=$(echo "$file" | cut -d'/' -f1-2)
      else
        APP_DIR="."
      fi
      APP_FILES["$APP_DIR"]+=" $file"
    done <<< "$LINT_FILES"

    for app_dir in "${!APP_FILES[@]}"; do
      files="${APP_FILES[$app_dir]}"

      # Só fazer lint se o diretório tiver eslint.config.* (flat config ESLint v9)
      has_eslint_config=false
      for cfg in "$app_dir"/eslint.config.{js,mjs,cjs}; do
        [ -f "$cfg" ] && has_eslint_config=true && break
      done

      if [ "$has_eslint_config" = false ]; then
        echo "  ⚠️  Sem ESLint config em $app_dir — pulando lint"
        continue
      fi

      rel_files=$(echo "$files" | sed "s|$app_dir/||g")
      if ! (cd "$app_dir" && npx eslint $rel_files --fix 2>/dev/null); then
        LINT_FAILED=true
      fi
    done

    if [ "$LINT_FAILED" = true ]; then
      print_error "Lint falhou"
      echo "Dicas:"
      echo "  • Se o lint auto-fixou, faça 'git add' novamente"
      echo "  • Se não conseguir corrigir, use: git commit --no-verify"
      exit 1
    else
      print_success "Lint passou"
    fi
  fi
fi

# ============================================================================
# CHECK 3: Detectar Secrets (BÁSICO)
# ============================================================================

print_header "Detectando secrets"

SECRETS_FOUND=false

# Padrões de secrets reais (valores hardcoded, não field labels/types)
# Detecta: PASSWORD = "valor", apiKey: 'sk-xxx', secret = "abc123"
# Ignora: password: { label: 'Password' }, token.role, process.env.SECRET
PATTERNS=(
  'api[_-]?key\s*[:=]\s*["\x27][A-Za-z0-9_\-]{16,}'
  'private[_-]?key\s*[:=]\s*["\x27]'
  'sk[_-]live[_-][A-Za-z0-9]'
  'AKIA[0-9A-Z]{16}'
  'ghp_[A-Za-z0-9]{36}'
)

for file in $(git diff --cached --name-only --diff-filter=ACM); do
  # Excluir arquivos de teste, hooks, docs, configs, lock files
  if echo "$file" | grep -qE '\.(test|spec)\.(ts|js|tsx|jsx)$'; then
    continue
  fi
  if echo "$file" | grep -qE 'scripts/hooks/|\.md$|\.mdx$|\.lock$|\.yml$|\.yaml$'; then
    continue
  fi
  for pattern in "${PATTERNS[@]}"; do
    if git diff --cached -- "$file" | grep -iE "$pattern" > /dev/null; then
      print_error "Possível secret encontrado em: $file"
      echo "Pattern: $pattern"
      SECRETS_FOUND=true
    fi
  done
done

if [ "$SECRETS_FOUND" = true ]; then
  print_error "Remova secrets antes de fazer commit!"
  echo "Use: git reset HEAD <arquivo>"
  exit 1
else
  print_success "Nenhum secret detectado"
fi

# ============================================================================
# SUCESSO!
# ============================================================================

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ PRE-COMMIT CHECKS PASSARAM${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

exit 0
