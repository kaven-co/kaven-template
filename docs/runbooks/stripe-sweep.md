# Runbook — Stripe Orphan Sweep

## O que é

Job semanal que reconcilia Stripe Customers com `metadata.kaven=true` contra o banco de dados Kaven. Identifica órfãos (Customer no Stripe sem match em DB) e dangling references.

## Execução manual

### Staging (dry-run — sempre seguro)
```bash
pnpm --filter @kaven/database stripe:sweep
```

### Produção — dry-run (sem deleção)
```bash
DATABASE_URL="<prod-url>" STRIPE_SECRET_KEY="sk_live_..." \
  pnpm --filter @kaven/database stripe:sweep
```

### Produção — destrutivo (IRREVERSÍVEL)
```bash
DATABASE_URL="<prod-url>" STRIPE_SECRET_KEY="sk_live_..." \
  STRIPE_SWEEP_CONFIRM=yes ALLOW_STRIPE_LIVE_DELETE=yes \
  pnpm --filter @kaven/database stripe:sweep --delete
```

⚠️ **Deleção de Stripe Customer é IRREVERSÍVEL.** Sem rollback. Use apenas após investigação completa.

## Cloud Run Job (prod)

- Schedule: toda segunda-feira 03:00 UTC
- Modo: dry-run (sem `--delete`)
- Configurar via Cloud Scheduler no projeto GCP `kaven-prod`
- Env vars necessários: `STRIPE_SECRET_KEY`, `DATABASE_URL`

## Triagem de alertas

### `stripe.sweep.alert` — orphans >= 10
1. Localizar o evento nos logs do Cloud Run (filtro: `jsonPayload.event="stripe.sweep.alert"`)
2. Investigar signup logs dos IDs órfãos — podem ser signups com tx abortada
3. Verificar age do Customer no Stripe (< 1h = ignorar, é safety do age-gate)
4. Se confirmado órfão real: executar sweep destrutivo manualmente após aprovação do squad lead

### `errors.length > 0`
1. Verificar logs do Cloud Run Job
2. Erro de conectividade Stripe → aguardar e re-executar
3. Erro de DB → verificar DATABASE_URL e conectividade Neon

### Job não executou em > 10 dias
1. Verificar Cloud Scheduler job status no GCP Console
2. Verificar se image do Cloud Run Job ainda está disponível no Artifact Registry

## Observabilidade (D3.2)

O sweep emite eventos estruturados em JSON para stdout ao final de cada execução:

- `stripe.sweep.completed` — emitido sempre (dry-run ou destrutivo)
- `stripe.sweep.alert` — emitido apenas quando `orphans >= 10`

> **TODO F2.4.5:** quando o model `AuditEvent` estiver disponível no schema Prisma, migrar de `console.log(JSON.stringify(...))` para `prisma.auditEvent.create(...)`. Ver comentário em `packages/database/scripts/stripe-orphan-sweep.ts`.

Para consultar eventos no Cloud Run Logging:
```
jsonPayload.event="stripe.sweep.completed"
jsonPayload.event="stripe.sweep.alert"
```

## Não há rollback

Deleção de Stripe Customer é permanente. Para prevenir:
- age-gate 1h (não deleta customers criados há < 1h)
- dupla confirmação via env vars (`STRIPE_SWEEP_CONFIRM` + `ALLOW_STRIPE_LIVE_DELETE`)
- dry-run por default em todos os schedules automáticos
