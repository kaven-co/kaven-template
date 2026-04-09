---
title: "Prisma Migration: DO EXCEPTION causa transaction abort"
date: 2026-04-03
severity: P0
area: database/ci
status: fixed
pr: "83"
commit: "683fa7b3"
---

# Bug: `DO $$ BEGIN ... EXCEPTION` aborta transação Prisma

## Sintoma

CI falha consistentemente no step `Run database migrations`:

```
Applying migration `20260313000001_add_caller_type_to_audit_log`
Error: ERROR: current transaction is aborted, commands ignored until end of transaction block
```

Todos os PRs do repo afetados. Parece flakiness mas é bug determinístico.

## Causa Raiz

O padrão `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$` dentro de
uma transação gerenciada externamente (Prisma) pode deixar o PostgreSQL em estado de
transação abortada mesmo quando a exceção é capturada.

Isso ocorre porque o bloco `EXCEPTION` em PL/pgSQL cria um savepoint interno. Quando
executado dentro de uma transação ativa (como a que o Prisma abre para migrations), o
PostgreSQL pode marcar a transação outer como abortada dependendo da versão e configuração.

**Arquivo problemático:**
`packages/database/prisma/migrations/20260313000001_add_caller_type_to_audit_log/migration.sql`

**SQL problemático:**
```sql
DO $$ BEGIN
    CREATE TYPE "CallerType" AS ENUM ('HUMAN', 'AGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
```

## Fix

Substituir o bloco `EXCEPTION` pelo padrão `pg_type` que não envolve savepoints:

```sql
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CallerType') THEN
        CREATE TYPE "CallerType" AS ENUM ('HUMAN', 'AGENT');
    END IF;
END;
$$;
```

Este padrão verifica a existência do tipo antes de criar, sem gerar exceções.
Seguro dentro de transações gerenciadas externamente.

## Regra para futuras migrations

**NUNCA usar** `EXCEPTION WHEN duplicate_object` em migrations Prisma.

**Sempre usar** o padrão `IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '...')`.

Para outros objetos:
```sql
-- Enum types
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'my_enum') THEN
    CREATE TYPE "MyEnum" AS ENUM ('A', 'B');
END IF;

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_name" ON "Table"("column");

-- Columns (não tem IF NOT EXISTS nativo — usar information_schema)
IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'MyTable' AND column_name = 'my_column'
) THEN
    ALTER TABLE "MyTable" ADD COLUMN "my_column" TEXT;
END IF;
```

## Impacto

- CI bloqueado em todos os PRs do repo até o fix
- Produção não afetada (migration já aplicada via `prisma migrate deploy`)
- Fix é idempotente: ambientes que já têm o tipo criado não re-executam o CREATE TYPE
