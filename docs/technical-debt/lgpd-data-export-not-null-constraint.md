# Technical Debt: DataExportLog.tenant_id — NOT NULL constraint pendente

**Date:** 2026-05-14
**Priority:** P1
**Status:** RESOLVED — 2026-05-14 (migration 20260514000000_lgpd_data_export_not_null)
**Category:** LGPD/Database

## Descrição

A migração `20260508000000_lgpd_p0_schema_fields` adicionou a coluna `tenant_id` na tabela `data_export_logs` com backfill via JOIN em `User`. O schema Prisma define o campo como `String` (NOT NULL), mas a linha que aplica `ALTER TABLE "data_export_logs" ALTER COLUMN "tenant_id" SET NOT NULL` está comentada na migration por segurança.

```sql
-- Linha 49 da migration (comentada intencionalmente):
-- ALTER TABLE "data_export_logs" ALTER COLUMN "tenant_id" SET NOT NULL;
```

## Risco

- O Prisma Client pode lançar erro em runtime se o DB aceitar `null` mas o schema espera `String`
- Registros sem `tenant_id` após o backfill ficam em estado inconsistente
- Novos registros via `lgpdService.exportUserData` sempre incluem `tenantId` — sem risco de inserção nula

## Ação Necessária

1. Confirmar que o backfill cobriu 100% dos registros:
   ```sql
   SELECT COUNT(*) FROM data_export_logs WHERE tenant_id IS NULL;
   ```
2. Se `COUNT = 0`, aplicar o ALTER:
   ```sql
   ALTER TABLE "data_export_logs" ALTER COLUMN "tenant_id" SET NOT NULL;
   ```
3. Criar migration Prisma formal registrando a mudança no `_prisma_migrations`

## Contexto

Detectado pelo QA (Quinn) durante revisão da PR `fix/lgpd-p0-schema-fields`. Concern C1 do gate CONCERNS.
