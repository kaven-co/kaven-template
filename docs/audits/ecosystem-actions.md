# Ecosystem Audit - Ações Recomendadas

**Data:** 2026-04-19  
**Veredicto:** NEEDS_WORK (51% pass rate)

---

## 🔴 P0 — Imediato (essa semana)

| #   | Ação                                  | Projeto                                     | Esforço | Status |
| --- | ------------------------------------- | ------------------------------------------- | ------- | ------ |
| 1   | Adicionar `*.env` ao `.gitignore`     | kaven-ui-base                               | 5min    | ⏳     |
| 2   | Adicionar script `"lint": "eslint ."` | kaven-ui-base                               | 5min    | ⏳     |
| 3   | Corrigir link quebrado                | docs/migrations/003-permissions-tenantid.md | 10min   | ⏳     |

---

## 🟠 P1 — Curto prazo (próximas 2 sprints)

| #   | Ação                            | Projeto                         | Esforço | Status |
| --- | ------------------------------- | ------------------------------- | ------- | ------ |
| 4   | Migrar Prisma 5.x → 7.x         | kaven-framework                 | 4h      | ⏳     |
| 5   | Fragmentar AuthorizationService | kaven-framework                 | 8h      | ⏳     |
| 6   | Fragmentar AuthService          | kaven-framework                 | 8h      | ⏳     |
| 7   | Atualizar schema reference      | kaven-schema-reference.md       | 2h      | ⏳     |
| 8   | Atualizar docs Next.js 16       | infra-map.md, BROWNFIELD\_\*.md | 1h      | ⏳     |
| 9   | Limpar branches órfãs           | kaven-framework                 | 2h      | ⏳     |

---

## 🟡 P2 — Médio prazo (esse mês)

| #   | Ação                                 | Projeto           | Esforço | Status |
| --- | ------------------------------------ | ----------------- | ------- | ------ |
| 10  | Executar full codebase-quality       | kaven-framework   | 4h      | ⏳     |
| 11  | Review TODOs críticos (~34 arquivos) | kaven-framework   | 8h      | ⏳     |
| 12  | Expandir .gitignore                  | kaven-marketplace | 1h      | ⏳     |
| 13  | Validar Zod 4.x compatibility        | kaven-cli         | 2h      | ⏳     |

---

## 🟢 P3 — Manutenção contínua

| #   | Ação                          | Projeto | Esforço | Status |
| --- | ----------------------------- | ------- | ------- | ------ |
| 14  | Configurar lint automático    | todos   | 4h      | ⏳     |
| 15  | Consolidar versões de pacotes | todos   | 8h      | ⏳     |
| 16  | Setup CI/CD para auditoria    | todos   | 8h      | ⏳     |

---

## Artefatos Gerados

| Arquivo        | Caminho                                                      |
| -------------- | ------------------------------------------------------------ |
| Relatório YAML | `docs/audits/ecosystem-audit-report.yaml`                    |
| Issues CSV     | `docs/audits/ecosystem-issues.csv`                           |
| Checklist      | `.aios-core/product/checklists/ecosystem-audit-checklist.md` |
| Workflow       | `.aios-core/development/workflows/full-ecosystem-audit.yaml` |

---

## Como Executar Novamente

```bash
# Executar workflow de auditoria
*run-workflow full-ecosystem-audit --mode=engine

# Executar checklist
*execute-checklist ecosystem-audit-checklist

# Ver relatório
cat docs/audits/ecosystem-audit-report.yaml
```
