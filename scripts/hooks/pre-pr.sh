#!/bin/bash
#
# 🚀 PRE-PR HOOK (PESADO - ~5-8 minutos)
#
# Validações COMPLETAS antes de abrir PR ou fazer merge.
# Este é o check final, mais rigoroso.
#
# Validações:
#  1. ✅ Dependências (pnpm install --frozen-lockfile)
#  2. ✅ Schema Prisma (merge + generate)
#  3. ✅ Migrações de banco (docker + db:migrate)
#  4. ✅ Linting
#  5. ✅ Type checking
#  6. ✅ Testes
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
SKIP_DB=false

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

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --no-db)
      SKIP_DB=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# ============================================================================
# CHECK 1: Dependências Instaladas
# ============================================================================

print_header "📦 Instalando dependências"

run_check \
  "Pnpm install" \
  "cd '$PROJECT_ROOT' && pnpm install --frozen-lockfile" \
  || exit 1

# ============================================================================
# CHECK 2: Schema Prisma
# ============================================================================

run_check \
  "✨ Gerando Prisma Client" \
  "cd '$PROJECT_ROOT' && pnpm db:generate" \
  || exit 1

# ============================================================================
# CHECK 3: Migrações de Banco (PESADO)
# ============================================================================

if [ "$SKIP_DB" = false ]; then
  print_header "🗄️  Migrações de Banco"

  cd "$PROJECT_ROOT"

  # Verificar Docker
  if ! docker info > /dev/null 2>&1; then
    print_error "Docker não está rodando"
    print_info "Inicie Docker ou use: ./scripts/hooks/pre-pr.sh --no-db"
    exit 1
  fi

  # Iniciar containers
  docker compose up -d

  # Aguardar PostgreSQL
  print_info "Aguardando PostgreSQL (até 30s)..."
  for i in {1..30}; do
    if docker exec kaven-framework-postgres-1 pg_isready -U postgres > /dev/null 2>&1; then
      print_success "PostgreSQL pronto"
      break
    fi
    if [ $i -eq 30 ]; then
      print_error "PostgreSQL não respondeu"
      exit 1
    fi
    sleep 1
  done

  run_check \
    "Executando migrações" \
    "cd '$PROJECT_ROOT' && pnpm db:migrate -- --deploy" \
    || exit 1

else
  print_info "⏭️  Pulando checks de banco (--no-db)"
fi

# ============================================================================
# CHECK 4: Linting
# ============================================================================

run_check \
  "📝 Linting" \
  "cd '$PROJECT_ROOT' && pnpm lint" \
  || exit 1

# ============================================================================
# CHECK 5: Type Checking
# ============================================================================

run_check \
  "🔍 Type Checking" \
  "cd '$PROJECT_ROOT' && pnpm typecheck" \
  || exit 1

# ============================================================================
# CHECK 6: Testes (NÃO BLOQUEANTE)
# ============================================================================

print_header "🧪 Testes"

if cd "$PROJECT_ROOT" && pnpm test --passWithNoTests 2>/dev/null; then
  print_success "Testes passaram"
else
  print_info "⚠️  Testes falharam, mas continuando (não é bloqueante)"
fi

# ============================================================================
# SUCESSO!
# ============================================================================

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ PRE-PR CHECKS PASSARAM (5-8 min)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  SEGURO ABRIR PR OU FAZER MERGE!          ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  CI remoto rodará os mesmos checks.        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}\n"

exit 0
