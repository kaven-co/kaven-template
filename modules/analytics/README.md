# Analytics Module

Product analytics for Kaven tenants. Dual-write architecture: DB (always) + PostHog (optional).

## Features

- **Event tracking** — `POST /api/analytics/events` registra eventos por tenant
- **Dashboard metrics** — `GET /api/analytics/dashboard` retorna totalEvents, recentEvents (30d) e top 5 eventos
- **PostHog integration** — fire-and-forget, não bloqueia a resposta. Desabilitado se `POSTHOG_API_KEY` não estiver definido
- **LGPD compliance** — `userId` é sempre hasheado SHA-256 antes de persistir. PII nunca é salvo no DB

## Installation

```bash
kaven module install analytics
```

Após instalar:

1. Rodar `prisma migrate dev` para criar a tabela `analytics_events`
2. (Opcional) Definir `POSTHOG_API_KEY` no `.env` para habilitar dual-write

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `POSTHOG_API_KEY` | No | — | PostHog project API key |
| `POSTHOG_HOST` | No | `https://app.posthog.com` | PostHog host (self-hosted) |
| `ANALYTICS_SALT` | No | `""` | Salt para hash SHA-256 do userId |

## API Endpoints

### `POST /api/analytics/events`

Registra um evento de produto para o tenant autenticado.

```json
{
  "eventName": "feature_used",
  "properties": { "feature": "billing", "plan": "builder" }
}
```

### `GET /api/analytics/dashboard`

Retorna métricas do tenant autenticado.

```json
{
  "totalEvents": 1500,
  "recentEvents": 420,
  "topEvents": [
    { "event": "page_view", "count": 300 },
    { "event": "feature_used", "count": 120 }
  ]
}
```

## Frontend Components

```tsx
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

// Widget auto-fetch — usa /api/analytics/dashboard internamente
<AnalyticsDashboard />
```

## Architecture

```
trackEvent()
  ├── prisma.analyticsEvent.create()   ← sempre (fonte primária)
  └── posthog.capture()                ← fire-and-forget (se POSTHOG_API_KEY)
```

O DB é o fallback primário. PostHog é um sink secundário para segmentação e funis no dashboard externo.
