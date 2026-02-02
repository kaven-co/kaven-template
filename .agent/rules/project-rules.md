---
description: Regras específicas deste projeto.
---

# Project Rules

## Quality Gates

Antes de commit:
```bash
source .agent/config/quality.env
$AG_LINT_CMD && $AG_TYPECHECK_CMD && $AG_TEST_CMD
```

## Outputs

| Tipo | Destino |
|------|---------|
| Reports | `.agent/artifacts/reports/` |
| Evidence | `.agent/artifacts/evidence/` |
| Logs | `.agent/artifacts/logs/` |

## Proibido

- Arquivos na raiz do projeto
- Commit sem quality gates
- PR via gh CLI (sempre manual)
