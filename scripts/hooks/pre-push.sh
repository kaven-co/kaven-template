#!/bin/bash
#
# 🔍 PRE-PUSH HOOK (MÉDIO - ~1-2 minutos)
#
# Validações IMPORTANTES antes de fazer push.
# Se falhar, push é abortado.
#
# Validações:
#  1. ✅ Linting (completo)
#  2. ✅ Type checking (TypeScript)
#  3. ❌ NÃO roda migrações (pesado demais)
#  4. ❌ NÃO roda testes completos
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}▶ $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}\n"
}

print_error() {
  echo -e "${RED}❌ $1${NC}\n"
}

print_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}\n"
}

run_check() {
  local name="$1"
  local command="$2"

  print_header "$name"

  if eval "$command"; then
    print_success "$name passou"
    return 0
  else
    print_error "$name falhou"
    echo -e "${RED}Comando: $command${NC}\n"
    return 1
  fi
}

# ============================================================================
# CHECK 1: Dependências Instaladas
# ============================================================================

print_header "Verificando dependências"

if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  print_error "node_modules não encontrado"
  print_info "Execute: pnpm install"
  exit 1
fi

print_success "Dependências OK"

# ============================================================================
# CHECK 2: Linting (RÁPIDO - ~30s)
# ============================================================================

run_check "📝 Linting" \
  "cd '$PROJECT_ROOT' && pnpm lint" \
  || exit 1

# ============================================================================
# CHECK 3: Design System Policy Checks
# ============================================================================

run_check "🎨 Design System Policies" \
  "cd '$PROJECT_ROOT' && pnpm policy:design-system" \
  || exit 1

# ============================================================================
# CHECK 4: Type Checking (RÁPIDO - ~30s)
# ============================================================================

run_check "🔍 Type Checking" \
  "cd '$PROJECT_ROOT' && pnpm typecheck" \
  || exit 1

# ============================================================================
# SUCESSO!
# ============================================================================

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ PRE-PUSH CHECKS PASSARAM (~1-2 min)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}ℹ️  Antes de fazer PR/merge, rode também:${NC}"
echo -e "${YELLOW}   ./scripts/hooks/pre-pr.sh${NC}\n"

exit 0
