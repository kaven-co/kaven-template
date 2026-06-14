# Technical Debt: LGPD User Rights Endpoints Missing

**Date:** 2026-04-27
**Priority:** P0 CRITICAL — Compliance blocker
**Status:** RESOLVED — 2026-05-08 (PR fix/lgpd-p0-schema-fields). Service + controller + routes implementados.
**Category:** LGPD/Privacy

## Description

Os endpoints de direitos do titular (LGPD Art. 18) não estão implementados. Existem apenas como `describe.todo` nos arquivos de teste — nenhuma lógica real foi criada. Isso bloqueia completamente a conformidade com a LGPD.

## Endpoints Ausentes

| Endpoint                    | Método   | Direito LGPD                                | Status          |
| --------------------------- | -------- | ------------------------------------------- | --------------- |
| `/api/users/:id/gdpr-erase` | POST     | Art. 18, VI — Eliminação dos dados          | ✅ implementado (202 + jobId) |
| `/api/users/:id/export`     | GET      | Art. 18, V — Portabilidade dos dados        | não implementado |
| `/api/users/:id/consent`    | GET/POST | Art. 18, I — Confirmação de tratamento      | não implementado |

## Evidências

- `apps/api/tests/compliance/right-to-erasure.spec.ts` — todos os testes marcados como `.todo`
- `apps/api/tests/compliance/right-to-access.spec.ts` — sem implementação real
- `apps/api/tests/compliance/consent-management.spec.ts` — sem implementação real
- `apps/api/tests/compliance/data-portability.spec.ts` — sem implementação real

## Impacto

- **Compliance:** LGPD Art. 18 inteiramente bloqueado — titular não pode exercer nenhum direito
- **Risco legal:** Multa de até 2% do faturamento (LGPD Art. 52) por recusa de direitos do titular
- **Risco operacional:** Suporte não tem ferramenta para atender solicitações de titulares

## Esforço Estimado

16-24 horas — implementar todos os endpoints com lógica de compliance real

## Dependências

- User model (já existe)
- Sistema de capabilities (já existe)
- Background job system (necessário para erasure assíncrono)
- `docs/compliance/gdpr.md` (guia completo já existe)

## Ações Realizadas

1. Implementar endpoint `gdpr-erase` com processamento assíncrono via job
2. Implementar endpoint `export` com exportação JSON/CSV/XML
3. Implementar endpoint `consent` com GET (status) e POST (atualização)
4. Ativar e passar os testes existentes (remover `.todo`)
5. Adicionar à pipeline de CI

## Referências

- LGPD Art. 18 — Direitos do titular
- LGPD Art. 52 — Sanções administrativas
- `docs/compliance/gdpr.md`
- Debt original: `docs/technical-debt/gdpr-endpoints-debt.md`
