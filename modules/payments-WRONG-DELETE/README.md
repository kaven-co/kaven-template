# Kaven Payments Module

Integração Stripe + Paddle para projetos Kaven — subscriptions, invoices, webhooks e usage tracking.

## Instalação

```bash
kaven module install payments
```

## Variáveis de ambiente necessárias

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paddle (opcional — usado para billing alternativo via Paddle Billing)
PADDLE_API_KEY=pdl_live_...
PADDLE_WEBHOOK_SECRET=pdl_ntfset_...
```

## Serviços incluídos

- `payment.service.ts` — gestão de subscriptions e invoices
- `subscription.service.ts` — lifecycle de subscriptions
- `entitlement.service.ts` — verificação de permissões por plano
- `usage-tracking.service.ts` — tracking de uso por feature
- Webhook handler Stripe completo
