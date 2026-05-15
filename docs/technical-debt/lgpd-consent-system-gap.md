# Technical Debt: User Consent System Disconnected from Marketing Consent

**Date:** 2026-04-27
**Priority:** P0 CRITICAL — Compliance blocker
**Status:** RESOLVED — 2026-05-08/2026-05-15 (PR fix/lgpd-p0-schema-fields). Schema + 5 endpoints Art. 18 implementados (consents CRUD + export + gdpr-erase). UI de gestão de consentimento pendente como débito futuro.
**Category:** LGPD/Privacy

## Description

O model `ConsentRecord` existe apenas para rastrear consentimento de contatos CRM/marketing (leads, prospects). Usuários autenticados da plataforma não possuem sistema equivalente de consentimento. Isso cria uma lacuna crítica: tratamos dados de usuários sem registro estruturado de para quê eles consentiram, quando consentiram, e se o consentimento ainda é válido para a versão atual da política.

## Estado Atual

| Entidade     | Sistema de Consentimento | Versionamento de Política | Re-consentimento |
| ------------ | ------------------------ | ------------------------- | ---------------- |
| Contatos CRM | `ConsentRecord` (existe) | Parcial                   | Não implementado |
| Usuários     | Inexistente              | Inexistente               | Inexistente      |

## Impacto

- **Compliance:** LGPD Art. 7, I e Art. 8 — consentimento deve ser específico, destacado e para finalidades determinadas
- **Compliance:** LGPD Art. 9 — usuário tem direito a saber exatamente para que seus dados são usados
- **Risco legal:** Sem sistema de consentimento por finalidade, qualquer tratamento de dado de usuário pode ser contestado
- **Risco operacional:** Sem versionamento, mudanças na política não geram solicitação de re-consentimento

## Design Proposto

### Opção A — Novo model `UserConsentRecord`
```prisma
model UserConsentRecord {
  id              String    @id @default(cuid())
  userId          String
  purpose         String    // ex: "marketing", "analytics", "platform_usage"
  version         String    // versão da política aceita
  consentedAt     DateTime
  revokedAt       DateTime?
  ipAddress       String?
  userAgent       String?
  user            User      @relation(fields: [userId], references: [id])

  @@index([userId, purpose])
}
```

### Opção B — Estender `ConsentRecord` com campo `userId`
Adicionar `userId` opcional ao model existente e unificar a lógica.

**Recomendação:** Opção A (separação de concerns, sem impacto no CRM existente)

## Esforço Estimado

12-16 horas — design do model + migration + lógica de coleta no signup + UI de gestão de consentimentos + testes

## Ações Realizadas

1. Definir lista de finalidades de tratamento (propósitos) com DPO/jurídico
2. Criar model `UserConsentRecord` (ou extensão)
3. Criar migration Prisma
4. Integrar coleta de consentimento no fluxo de signup (checkbox por finalidade)
5. Criar endpoint para usuário visualizar e revogar consentimentos
6. Implementar lógica de re-consentimento quando versão de política muda
7. Adicionar testes de cobertura completa

## Referências

- LGPD Art. 7 — Hipóteses de tratamento
- LGPD Art. 8 — Consentimento (livre, informado, específico, destacado)
- LGPD Art. 9 — Direito à informação sobre tratamento
- LGPD Art. 18, IX — Direito de revogar consentimento
