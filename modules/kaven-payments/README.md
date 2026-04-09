# Kaven Payments Module

Multi-provider payment integration for Kaven projects — Stripe (primary) + Paddle (optional), subscriptions, invoices, and webhook handling.

## Installation

```bash
kaven module install payments
```

The CLI will:
1. Copy all files to their destination paths
2. Inject route registrations into `apps/api/src/app.ts` and `apps/tenant/app/layout.tsx`
3. Run `npm install` for Stripe and Paddle SDK dependencies
4. Merge Prisma models and run `npx prisma db push`

## Required Environment Variables

### Stripe (required)
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Paddle (optional)
```env
PADDLE_API_KEY=...
PADDLE_WEBHOOK_SECRET=...
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
```

## What's Included

### Backend
- `billing.routes.ts` — subscription create/cancel + invoice listing
- `payments.ts` (checkout) — Stripe Checkout session creation
- `subscriptions.ts` — subscription lifecycle (upgrade, downgrade, cancel)
- `webhooks/stripe.ts` — Stripe webhook handler (checkout, subscription, invoice events)
- `webhooks/paddle.ts` — Paddle webhook handler (subscription, payment events)

### Services
- `payment.service.ts` — core billing logic + Paddle webhook processing
- `subscription.service.ts` — subscription lifecycle management
- `entitlement.service.ts` — plan-based feature access control
- `usage-tracking.service.ts` — per-feature usage metering
- `stripe-client.ts` — Stripe SDK wrapper
- `paddle-client.ts` — Paddle API client

### Frontend
- `UpgradeButton.tsx` — opens Stripe/Paddle checkout
- `frontend/lib/paddle.ts` — Paddle.js initialization helper

### Prisma Models
- `Subscription` — tenant subscription records
- `Invoice` — billing invoice records
- `Payment` — payment transaction records

## Webhook Configuration

### Stripe
Set webhook URL in Stripe Dashboard: `https://api.yourdomain.com/api/webhooks/stripe`

Events to enable:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Paddle
Set webhook URL: `https://api.yourdomain.com/api/webhooks/paddle`

## Uninstall

```bash
kaven module remove payments
```

Removes all files and cleans injected code from host files.
