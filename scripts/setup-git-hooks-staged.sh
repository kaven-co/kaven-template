#!/bin/bash
#
# ⚙️  SETUP GIT HOOKS (STAGED/ESCALONADO)
#
# Instala hooks em 3 níveis:
#  1. Pre-commit (leve - ~10s)
#  2. Pre-push (médio - ~1-2min)
#  3. Pre-PR (pesado - ~5-8min) - MANUAL
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}⚙️  Configurando git hooks escalonados...${NC}\n"

# Criar diretório de hooks
mkdir -p "$HOOKS_DIR"

# ============================================================================
# HOOK 1: PRE-COMMIT (LEVE)
# ============================================================================

echo -e "${YELLOW}1️⃣  Instalando pre-commit hook (leve)${NC}"

cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK_SCRIPT="$SCRIPT_DIR/scripts/hooks/pre-commit.sh"

if [ -f "$HOOK_SCRIPT" ]; then
  exec "$HOOK_SCRIPT"
else
  echo "❌ Hook script não encontrado: $HOOK_SCRIPT"
  exit 1
fi
EOF

chmod +x "$HOOKS_DIR/pre-commit"
echo -e "${GREEN}✅ pre-commit instalado${NC}\n"

# ============================================================================
# HOOK 2: PRE-PUSH (MÉDIO)
# ============================================================================

echo -e "${YELLOW}2️⃣  Instalando pre-push hook (médio)${NC}"

cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK_SCRIPT="$SCRIPT_DIR/scripts/hooks/pre-push.sh"

if [ -f "$HOOK_SCRIPT" ]; then
  exec "$HOOK_SCRIPT"
else
  echo "❌ Hook script não encontrado: $HOOK_SCRIPT"
  exit 1
fi
EOF

chmod +x "$HOOKS_DIR/pre-push"
echo -e "${GREEN}✅ pre-push instalado${NC}\n"

# ============================================================================
# HOOK 3: PRE-PR (PESADO - MANUAL)
# ============================================================================

echo -e "${YELLOW}3️⃣  Pre-PR hook (manual - execute antes de abrir PR)${NC}"
echo -e "${BLUE}   Comando: ./scripts/hooks/pre-pr.sh${NC}\n"

# ============================================================================
# RESUMO
# ============================================================================

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Git hooks configurados com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}📊 FLUXO DE VALIDAÇÃO (ESCALONADO):${NC}\n"

echo -e "${YELLOW}1️⃣  COMMIT (10 segundos)${NC}"
echo -e "   ${GREEN}✅ Automático${NC} via git commit"
echo -e "   • Assinatura GPG"
echo -e "   • Lint de arquivos staged"
echo -e "   • Detecção de secrets\n"

echo -e "${YELLOW}2️⃣  PUSH (1-2 minutos)${NC}"
echo -e "   ${GREEN}✅ Automático${NC} via git push"
echo -e "   • Linting completo"
echo -e "   • Type checking"
echo -e "   • (Banco de dados NÃO é checado aqui)\n"

echo -e "${YELLOW}3️⃣  PR/MERGE (5-8 minutos)${NC}"
echo -e "   ${BLUE}⚙️  Manual${NC} - execute ANTES de abrir PR:"
echo -e "   ${BLUE}   ./scripts/hooks/pre-pr.sh${NC}"
echo -e "   • Tudo do push +"
echo -e "   • Schema Prisma + geração"
echo -e "   • Migrações de banco"
echo -e "   • Testes\n"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}💡 COMANDOS ÚTEIS:${NC}\n"

echo -e "Pular hooks (EMERGÊNCIAS APENAS):"
echo -e "  ${YELLOW}git commit --no-verify${NC}"
echo -e "  ${YELLOW}git push --no-verify${NC}\n"

echo -e "Desinstalar hooks:"
echo -e "  ${YELLOW}rm .git/hooks/pre-commit .git/hooks/pre-push${NC}\n"

echo -e "Ver documentação:"
echo -e "  ${YELLOW}cat scripts/README.md${NC}\n"

echo -e "${GREEN}✅ Pronto! Seu fluxo está otimizado.${NC}\n"
