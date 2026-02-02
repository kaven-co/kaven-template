---
description: Regras de estrutura específicas deste projeto.
---

# Project Structure Rules

## Diretórios Permitidos para Outputs

| Tipo | Destino |
|------|---------|
| Reports | `.agent/artifacts/reports/` |
| Evidence | `.agent/artifacts/evidence/` |
| Logs | `.agent/artifacts/logs/` |
| Docs internas | `.agent/docs/` ou `docs/` |

## Proibido

- Criar arquivos na raiz do projeto
- Criar diretórios temporários fora de `.agent/artifacts/`
