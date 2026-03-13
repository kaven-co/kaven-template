#!/bin/bash
#
# ⚙️  SETUP GIT HOOKS
#
# Configura git hooks locais para rodarpré-push checks automaticamente.
# Isso evita push com erros que parariam o CI.
#
# Uso:
#   ./scripts/setup-git-hooks.sh
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "⚙️  Configurando git hooks..."

# Criar diretório de hooks se não existir
mkdir -p "$HOOKS_DIR"

# Criar pre-push hook
cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash
#
# 🔍 GIT PRE-PUSH HOOK
#
# Executa CI local antes de fazer push.
# Se falhar, o push é cancelado.
#
# Para pular este hook (não recomendado):
#   git push --no-verify
#

echo ""
echo "🔍 Executando pre-push checks..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CI_SCRIPT="$SCRIPT_DIR/scripts/ci-local.sh"

if [ ! -f "$CI_SCRIPT" ]; then
  echo "❌ Script de CI não encontrado: $CI_SCRIPT"
  exit 1
fi

# Executar CI local
if "$CI_SCRIPT" --no-db; then
  echo ""
  echo "✅ Pre-push checks passaram! Fazendo push..."
  echo ""
  exit 0
else
  echo ""
  echo "❌ Pre-push checks falharam!"
  echo ""
  echo "Corrija os erros acima e tente novamente:"
  echo ""
  echo "  git push origin <branch>"
  echo ""
  echo "Para pular estes checks (NÃO RECOMENDADO):"
  echo "  git push --no-verify"
  echo ""
  exit 1
fi
EOF

chmod +x "$HOOKS_DIR/pre-push"

echo ""
echo "✅ Git hooks configurados com sucesso!"
echo ""
echo "Hooks instalados:"
echo "  • .git/hooks/pre-push (rodará antes de fazer push)"
echo ""
echo "Para desativar o pre-push hook:"
echo "  rm .git/hooks/pre-push"
echo ""
echo "Para pular o hook em um push específico:"
echo "  git push --no-verify"
echo ""
