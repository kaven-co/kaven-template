# 🔗 Git Hooks

Scripts que rodam automaticamente em diferentes pontos do fluxo git.

## 📁 Estrutura

```
hooks/
├── pre-commit.sh     # Roda em: git commit (leve - ~10s)
├── pre-push.sh       # Roda em: git push (médio - ~1-2min)
├── pre-pr.sh         # Manual: antes de abrir PR (pesado - ~5-8min)
└── README.md         # Este arquivo
```

## 🔄 Fluxo de Execução

```
┌─────────────────────────────────────────┐
│  git commit                             │
│  ↓                                      │
│  .git/hooks/pre-commit                  │
│  → ./scripts/hooks/pre-commit.sh         │
│                                         │
│  Validações:                            │
│  ✅ GPG (opcional)                      │
│  ✅ ESLint (apenas staged)              │
│  ✅ Secrets                             │
│                                         │
│  Tempo: ~10s                            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  git push                               │
│  ↓                                      │
│  .git/hooks/pre-push                    │
│  → ./scripts/hooks/pre-push.sh           │
│                                         │
│  Validações:                            │
│  ✅ Linting (completo)                  │
│  ✅ Type checking                       │
│  ❌ Banco (pulado)                      │
│  ❌ Testes (pulado)                     │
│                                         │
│  Tempo: ~1-2min                         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  ./scripts/hooks/pre-pr.sh (MANUAL)     │
│  ↓                                      │
│  Validações COMPLETAS:                  │
│  ✅ Dependências                        │
│  ✅ Schema Prisma                       │
│  ✅ Migrações de banco                  │
│  ✅ Linting                             │
│  ✅ Type checking                       │
│  ✅ Testes                              │
│                                         │
│  Tempo: ~5-8min                         │
│  Execute ANTES de abrir PR              │
└─────────────────────────────────────────┘
              ↓
        gh pr create
```

## 🚀 Modo de Uso

### Setup Inicial

```bash
./scripts/setup-git-hooks-staged.sh
```

Instala hooks em `.git/hooks/`.

### Durante Desenvolvimento

Tudo é automático via git:

```bash
# Commit (roda pre-commit automaticamente)
git add .
git commit -m "feat: novo recurso"

# Push (roda pre-push automaticamente)
git push origin feat/branch
```

### Antes de Abrir PR

Execute manualmente:

```bash
./scripts/hooks/pre-pr.sh
```

Ou com opções:

```bash
./scripts/hooks/pre-pr.sh --no-db    # Pular banco (se está rodando)
```

## ⚠️ Pular Hooks

**NÃO RECOMENDADO** mas possível em emergências:

```bash
# Pular pre-commit
git commit --no-verify

# Pular pre-push
git push --no-verify
```

## 🔧 Editar Hooks

Os hooks chamam scripts em `scripts/hooks/`:

1. `.git/hooks/pre-commit` → `scripts/hooks/pre-commit.sh`
2. `.git/hooks/pre-push` → `scripts/hooks/pre-push.sh`

Para editar, modifique os scripts em `scripts/hooks/` (NÃO edite `.git/hooks/` diretamente).

## 🗑️ Desinstalar

```bash
rm .git/hooks/pre-commit .git/hooks/pre-push
```

## 📊 Comparação: Com vs Sem Hooks

| Métrica | Sem Hooks | Com Hooks |
|---------|-----------|-----------|
| Erros antes PR | 5-10 | 0-1 |
| Iterations | 5-10 | 1-2 |
| Tempo total/feature | 30-60min | 5-10min |
| Histórico Git | Poluído | Limpo |

## 🎯 Pré-requisitos

- Git 2.9+ (hooks)
- Bash 4.0+ (scripts)
- pnpm (dependências)
- Docker (para pre-pr.sh)

## 💡 Troubleshooting

### ❌ "Permission denied" ao rodar hook

```bash
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
```

### ❌ Hook não está rodando

Verifique:
```bash
ls -la .git/hooks/pre-commit
# Deve ter executável (x)
```

### ❌ Erro ao detectar secrets

Hooks usam regex simples. Para falsos positivos:
```bash
git commit --no-verify    # Pular check de secrets
```

### ❌ Docker não conecta em pre-pr.sh

```bash
docker ps    # Verificar se Docker está rodando
./scripts/hooks/pre-pr.sh --no-db    # Pular banco
```

## 📝 Para Adicionar Novo Hook

Exemplo: Adicionar hook de validação de branch name:

1. Criar `scripts/hooks/pre-push-branch-check.sh`
2. Adicionar validação em `scripts/hooks/pre-push.sh`
3. Testar localmente
4. Documentar aqui

## 🔗 Referências

- [Git Hooks Docs](https://git-scm.com/docs/githooks)
- [Husky (alternativa em Node)](https://typicode.github.io/husky/)
- Bash guide: `man bash`

---

*Hooks otimizados para fluxo de desenvolvimento em Sprint 1. ⚡*
