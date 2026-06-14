# Technical Debt: GDPR Delete Requested Field Missing

**Date:** 2026-04-27
**Priority:** P0 CRITICAL — Compliance blocker
**Status:** RESOLVED — 2026-05-08 (PR fix/lgpd-p0-schema-fields, migration 20260508000000)
**Category:** LGPD/Privacy

## Description

O campo `gdpr_delete_requested` é referenciado no job `cleanupInactiveUsers()` para identificar usuários que solicitaram exclusão de dados, mas o campo não existe no schema Prisma. Isso faz com que o job de limpeza automática não funcione, deixando dados de usuários que solicitaram exclusão retidos indefinidamente — violação direta da LGPD Art. 15 e Art. 18.

## Evidência

- Job `cleanupInactiveUsers()` referencia `gdpr_delete_requested` em sua query de seleção
- Campo ausente no model `User` do schema Prisma
- Resultado: job falha silenciosamente ou lança erro em runtime

## Impacto

- **Compliance:** LGPD Art. 15 — dados devem ser eliminados após fim da finalidade ou a pedido do titular
- **Compliance:** LGPD Art. 18, VI — direito de eliminação não é processado automaticamente
- **Risco operacional:** Dados de usuários que solicitaram exclusão permanecem na base indefinidamente
- **Risco técnico:** Job de limpeza defeituoso sem erros explícitos

## Esforço Estimado

2-4 horas — migration + correção do job + testes

## Ações Necessárias

1. Criar migration Prisma para adicionar `gdprDeleteRequestedAt` (DateTime nullable) no model `User`
2. Corrigir job `cleanupInactiveUsers()` para usar o nome correto do campo após migration
3. Adicionar índice no campo para performance das queries do job
4. Adicionar lógica de ativação do campo quando usuário solicita exclusão (via endpoint `gdpr-erase`)
5. Testar o job em ambiente de staging

## Schema Fix

```prisma
model User {
  // ...campos existentes...
  gdprDeleteRequestedAt  DateTime?  // null = não solicitado; data = quando solicitou
}
```

## Query Fix no Job

```typescript
// Antes (quebrado):
where: { gdpr_delete_requested: true }

// Depois (correto):
where: { gdprDeleteRequestedAt: { not: null } }
```

## Referências

- LGPD Art. 15 — Término do tratamento de dados pessoais
- LGPD Art. 18, VI — Eliminação dos dados pessoais tratados
- Job: `packages/core/src/jobs/cleanup-inactive-users.ts` (verificar path exato)
