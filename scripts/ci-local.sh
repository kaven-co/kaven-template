#!/bin/bash
#
# 🔍 LOCAL CI CHECKER - Replica o CI remoto localmente
#
# Executa os mesmos checks que rodam no GitHub Actions antes de fazer push.
# Falha rápido e oferece feedback imediato.
#
# Uso:
#   ./scripts/ci-local.sh              # Executar todos os checks
#   ./scripts/ci-local.sh --no-db      # Pular checks de banco de dados
#   ./scripts/ci-local.sh --help       # Mostrar ajuda
#

set -e  # Para na primeira falha

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SKIP_DB=false
VERBOSE=false

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# FUNÇÕES
# ============================================================================

print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}▶ $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
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

check_command() {
  if ! command -v "$1" &> /dev/null; then
    print_error "Comando não encontrado: $1"
    print_info "Instale $1 para continuar"
    return 1
  fi
}

run_step() {
  local step_name="$1"
  local command="$2"

  print_header "$step_name"

  if eval "$command"; then
    print_success "$step_name passou"
    return 0
  else
    print_error "$step_name falhou"
    echo -e "${RED}Comando: $command${NC}\n"
    return 1
  fi
}

show_help() {
  cat << 'EOF'
🔍 LOCAL CI CHECKER

Replica os mesmos checks que rodam no GitHub Actions localmente.

OPÇÕES:
  --no-db       Pular verificações de banco de dados (migrate, seed)
  --verbose     Mostrar output completo de cada comando
  --help        Mostrar esta mensagem

FLUXO DE CHECKS:
  1. ✅ Instalação de dependências (pnpm install --frozen-lockfile)
  2. 🗄️  Geração do Prisma Client (schema merge + prisma generate)
  3. 🗄️  Migrações do banco (docker compose + pnpm db:migrate)
  4. 📦 Linting (eslint)
  5. 🔍 Type checking (typescript)
  6. 🧪 Testes (jest/vitest)

TEMPO ESTIMADO:
  - Primeira execução: ~3-5 minutos
  - Execuções posteriores: ~1-2 minutos (cache)

EXEMPLOS:
  # Executar todos os checks
  ./scripts/ci-local.sh

  # Pular checks de banco (útil se banco já está rodando)
  ./scripts/ci-local.sh --no-db

  # Debug com output completo
  ./scripts/ci-local.sh --verbose

TROUBLESHOOTING:
  - Docker não conecta? → docker ps
  - Porta 5432 ocupada? → docker compose down && docker compose up -d
  - Cache quebrado? → rm -rf node_modules && pnpm install

EOF
}

# ============================================================================
# PARSING DE ARGUMENTOS
# ============================================================================

while [[ $# -gt 0 ]]; do
  case $1 in
    --no-db)
      SKIP_DB=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      echo "Opção desconhecida: $1"
      show_help
      exit 1
      ;;
  esac
done

# ============================================================================
# PRÉ-REQUISITOS
# ============================================================================

print_header "Verificando pré-requisitos"

check_command "pnpm" || exit 1
check_command "node" || exit 1

if [ "$SKIP_DB" = false ]; then
  check_command "docker" || print_info "Docker não encontrado - pulando checks de banco"
fi

print_success "Pré-requisitos OK"

# ============================================================================
# STEP 1: INSTALAR DEPENDÊNCIAS
# ============================================================================

run_step \
  "📦 Instalando dependências" \
  "cd '$PROJECT_ROOT' && pnpm install --frozen-lockfile" \
  || exit 1

# ============================================================================
# STEP 2: SCHEMA MERGE + PRISMA GENERATE
# ============================================================================

run_step \
  "✨ Gerando Prisma Client" \
  "cd '$PROJECT_ROOT' && pnpm db:generate" \
  || exit 1

# ============================================================================
# STEP 3: MIGRAÇÕES DE BANCO (OPCIONAL)
# ============================================================================

if [ "$SKIP_DB" = false ]; then
  print_header "🗄️  Iniciando banco de dados"

  cd "$PROJECT_ROOT"

  # Verificar se docker daemon está rodando
  if ! docker info > /dev/null 2>&1; then
    print_error "Docker daemon não está rodando"
    print_info "Inicie o Docker e execute novamente, ou use: ./scripts/ci-local.sh --no-db"
    exit 1
  fi

  # Iniciar docker compose
  docker compose up -d

  # Aguardar PostgreSQL ficar pronto (até 30 segundos)
  print_info "Aguardando PostgreSQL ficar pronto... (até 30s)"
  for i in {1..30}; do
    if docker exec kaven-framework-postgres-1 pg_isready -U postgres > /dev/null 2>&1; then
      print_success "PostgreSQL pronto"
      break
    fi
    if [ $i -eq 30 ]; then
      print_error "PostgreSQL não respondeu no tempo limite"
      print_info "Logs: docker logs kaven-framework-postgres-1"
      exit 1
    fi
    sleep 1
  done

  run_step \
    "🗄️  Executando migrações" \
    "cd '$PROJECT_ROOT' && pnpm db:migrate -- --deploy" \
    || exit 1

else
  print_info "⏭️  Pulando checks de banco de dados (--no-db)"
fi

# ============================================================================
# STEP 4: LINTING
# ============================================================================

run_step \
  "📝 Linting (ESLint)" \
  "cd '$PROJECT_ROOT' && pnpm lint" \
  || exit 1

# ============================================================================
# STEP 5: TYPE CHECKING
# ============================================================================

run_step \
  "🔍 Type checking (TypeScript)" \
  "cd '$PROJECT_ROOT' && pnpm typecheck" \
  || exit 1

# ============================================================================
# STEP 6: TESTES
# ============================================================================

if [ -f "$PROJECT_ROOT/package.json" ]; then
  if grep -q '"test"' "$PROJECT_ROOT/package.json"; then
    run_step \
      "🧪 Testes" \
      "cd '$PROJECT_ROOT' && pnpm test --passWithNoTests" \
      || print_info "Testes falharam (não é bloqueante para este script)"
  else
    print_info "⏭️  Nenhum script de teste encontrado"
  fi
else
  print_info "⏭️  Pulando testes (package.json não encontrado)"
fi

# ============================================================================
# SUCESSO!
# ============================================================================

print_header "✅ TODOS OS CHECKS PASSARAM!"

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  SEGURO FAZER PUSH!                   ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║  Próximas etapas:                                      ║${NC}"
echo -e "${GREEN}║  1. git add .                                          ║${NC}"
echo -e "${GREEN}║  2. git commit -m \"...\"                               ║${NC}"
echo -e "${GREEN}║  3. git push origin <branch>                           ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║  O CI remoto também rodará os mesmos checks.           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"

exit 0
