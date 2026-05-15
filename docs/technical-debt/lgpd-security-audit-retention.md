# Technical Debt: SecurityAuditLog Missing Retention Policy

**Date:** 2026-04-27
**Priority:** P0 CRITICAL — Compliance blocker
**Status:** RESOLVED — 2026-05-08 (PR fix/lgpd-p0-schema-fields, migration 20260508000000)
**Category:** LGPD/Privacy

## Description

O model `SecurityAuditLog` não possui campo `retentionUntil`, ao contrário do model `AuditLog` que já implementa esse padrão. Sem esse campo, eventos de segurança (tentativas de login, mudanças de senha, acessos suspeitos) ficam sem limpeza programada — acumulando indefinidamente na base de dados e sem política de retenção rastreável.

## Inconsistência Entre Models

| Model              | Campo `retentionUntil` | Limpeza Automática | Status     |
| ------------------ | ---------------------- | ------------------ | ---------- |
| `AuditLog`         | Sim                    | Sim                | Correto    |
| `SecurityAuditLog` | Ausente                | Não funciona       | DEFEITUOSO |

## Impacto

- **Compliance:** LGPD Art. 15 — dados devem ser eliminados após o prazo necessário para a finalidade
- **Compliance:** LGPD Art. 16 — conservação apenas pelo período necessário
- **Risco técnico:** `SecurityAuditLog` cresce indefinidamente — impacto em performance e custo de storage
- **Risco de auditoria:** Sem `retentionUntil`, não é possível demonstrar política de retenção para reguladores

## Esforço Estimado

2-3 horas — migration + atualização do job de limpeza + testes

## Ações Realizadas

1. Criar migration Prisma para adicionar `retentionUntil DateTime?` no model `SecurityAuditLog`
2. Atualizar o job de criação de `SecurityAuditLog` para preencher `retentionUntil` automaticamente
3. Definir TTL padrão para eventos de segurança (sugestão: 2 anos — LGPD + boa prática de segurança)
4. Atualizar job de limpeza para incluir `SecurityAuditLog` além de `AuditLog`
5. Adicionar testes do job de limpeza para `SecurityAuditLog`

## Schema Fix

```prisma
model SecurityAuditLog {
  // ...campos existentes...
  retentionUntil  DateTime?  // calculado automaticamente no insert
}
```

## Lógica de Preenchimento

```typescript
// Ao inserir SecurityAuditLog:
const retentionUntil = new Date();
retentionUntil.setFullYear(retentionUntil.getFullYear() + 2); // 2 anos default
```

## Referências

- LGPD Art. 15 — Término do tratamento de dados pessoais
- LGPD Art. 16 — Conservação após término do tratamento
- Model `AuditLog` (referência para implementação correta)
