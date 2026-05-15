# Technical Debt: Terms Acceptance Not Tracked

**Date:** 2026-04-27
**Priority:** P0 CRITICAL — Compliance blocker
**Status:** RESOLVED — 2026-05-08 (PR fix/lgpd-p0-schema-fields, migration 20260508000000)
**Category:** LGPD/Privacy

## Description

O model `User` não possui campos para registrar quando e qual versão dos termos e política de privacidade foram aceitos. Sem essa prova de consentimento, a empresa não pode demonstrar que o tratamento de dados tem base legal válida, conforme exige a LGPD Art. 7.

## Campos Ausentes no Model `User`

| Campo                  | Tipo       | Propósito                                          |
| ---------------------- | ---------- | -------------------------------------------------- |
| `termsAcceptedAt`      | `DateTime` | Timestamp exato do aceite dos termos de uso        |
| `privacyPolicyVersion` | `String`   | Versão da política aceita (ex: `"2026-01"`)        |
| `privacyAcceptedAt`    | `DateTime` | Timestamp exato do aceite da política de privacidade |

## Impacto

- **Compliance:** LGPD Art. 7, I — base legal de consentimento não pode ser comprovada
- **Risco legal:** Em caso de auditoria ou processo judicial, não há evidência de que o usuário consentiu
- **Risco operacional:** Impossível identificar usuários que precisam re-consentir após atualização de política
- **Auditoria:** Sem rastreabilidade de consentimento histórico

## Esforço Estimado

4-6 horas — migration + lógica de aceite no signup + endpoint de re-consentimento

## Ações Realizadas

1. Criar migration Prisma para adicionar `termsAcceptedAt`, `privacyAcceptedAt` e `privacyPolicyVersion` no model `User`
2. Tornar campos obrigatórios (NOT NULL) com valor default `NOW()` para usuários existentes
3. Adicionar lógica de aceite obrigatório no fluxo de signup
4. Criar endpoint/lógica de re-consentimento para versões novas de política
5. Atualizar testes de criação de usuário

## Schema Fix

```prisma
model User {
  // ...campos existentes...
  termsAcceptedAt       DateTime?
  privacyAcceptedAt     DateTime?
  privacyPolicyVersion  String?
}
```

## Referências

- LGPD Art. 7 — Hipóteses de tratamento de dados pessoais
- LGPD Art. 8 — Consentimento (forma, revogação, ônus da prova)
- LGPD Art. 9 — Informações sobre o tratamento
