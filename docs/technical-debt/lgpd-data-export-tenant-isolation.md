# Technical Debt: DataExportLog Missing Tenant Isolation

**Date:** 2026-04-27
**Priority:** P0 CRITICAL — Compliance blocker
**Status:** RESOLVED — 2026-05-08 (PR fix/lgpd-p0-schema-fields, migration 20260508000000)
**Category:** LGPD/Privacy

## Description

O model `DataExportLog` não possui campo `tenantId`. Em uma arquitetura SaaS multi-tenant com Row Level Security (RLS), todos os logs de auditoria relacionados a dados de usuários devem ser tenant-scoped. Sem `tenantId`, é impossível:
- Filtrar logs de exportação por tenant em consultas de auditoria
- Aplicar RLS corretamente nessa tabela
- Demonstrar para um tenant específico quais exportações foram feitas com seus dados

## Impacto

| Dimensão     | Impacto                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| Compliance   | Auditoria de exportações não pode ser segmentada por tenant              |
| Segurança    | RLS não pode ser aplicado — todos os tenants podem ver logs uns dos outros |
| LGPD Art. 37 | Registro de operações de tratamento comprometido por falta de segmentação |
| Operacional  | Suporte não consegue responder "quais exportações foram feitas no tenant X" |

## Esforço Estimado

3-5 horas — migration + backfill de dados existentes + update de queries + testes

## Ações Realizadas

1. Criar migration Prisma para adicionar `tenantId String NOT NULL` no model `DataExportLog`
2. Definir estratégia de backfill para registros existentes (lookup via `userId → tenant`)
3. Atualizar todas as queries de insert em `DataExportLog` para incluir `tenantId`
4. Adicionar RLS policy na tabela para isolar por tenant
5. Adicionar índice em `tenantId` para performance
6. Atualizar testes de integração

## Schema Fix

```prisma
model DataExportLog {
  // ...campos existentes...
  tenantId    String
  tenant      Tenant  @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([tenantId, createdAt])
}
```

## Estratégia de Backfill

```sql
UPDATE "DataExportLog" del
SET "tenantId" = u."tenantId"
FROM "User" u
WHERE del."userId" = u."id"
  AND del."tenantId" IS NULL;
```

## Referências

- LGPD Art. 37 — Registro das operações de tratamento de dados pessoais
- Arquitetura multi-tenant do Kaven (RLS, tenant isolation)
- `docs/compliance/gdpr.md`
