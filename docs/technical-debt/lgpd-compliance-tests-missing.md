# Technical Debt: Testes de Compliance LGPD ausentes (P1)

**Date:** 2026-05-14
**Priority:** P1 — deve ser feito antes do próximo release
**Status:** RESOLVED — 2026-05-14 (testes implementados, gdpr.helpers.ts reescrito)
**Category:** LGPD/Testing

## Descrição

Os arquivos de teste de compliance LGPD continuam como `describe.todo` — nunca foram implementados com lógica real.

## Arquivos afetados

| Arquivo | Direito LGPD | Status |
|---------|-------------|--------|
| `apps/api/tests/compliance/right-to-erasure.spec.ts` | Art. 18, VI — Eliminação | `describe.todo` |
| `apps/api/tests/compliance/right-to-access.spec.ts` | Art. 18, V — Portabilidade | `describe.todo` |
| `apps/api/tests/compliance/consent-management.spec.ts` | Art. 18, I — Confirmação | `describe.todo` |
| `apps/api/tests/compliance/data-portability.spec.ts` | Art. 18, V — Portabilidade | `describe.todo` |

## Rotas disponíveis (implementadas em `fix/lgpd-p0-schema-fields`)

```
GET  /api/users/:id/consents          — listar consentimentos
POST /api/users/:id/consents          — registrar consentimento (body: {purpose, version})
DEL  /api/users/:id/consents/:purpose — revogar consentimento
GET  /api/users/:id/export            — exportar dados
POST /api/users/:id/gdpr-erase        — solicitar erasure (retorna 202)
```

## Helpers disponíveis

`apps/api/tests/helpers/gdpr.helpers.ts` — helpers existem mas usam rotas desatualizadas (pré-implementação).
Precisam ser atualizados para alinhar com as rotas reais acima.

## Ações Realizadas

1. Atualizar `gdpr.helpers.ts` com rotas corretas
2. Implementar testes reais nos 4 spec files (remover `describe.todo`)
3. Cobrir: happy path, IDOR protection, error cases, re-consent block
4. Adicionar `userConsentRecord` ao `cleanupTestData()` na fixture

## Contexto

Detectado pelo QA (Quinn). Concern C4 do gate CONCERNS na PR `fix/lgpd-p0-schema-fields`.
Gate = CONCERNS (seguro para merge). Este item deve ser P1 no próximo sprint.
