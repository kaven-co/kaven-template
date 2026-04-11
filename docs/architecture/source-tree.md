# Source Tree — Kaven Framework

> Kaven Framework v1.0.0-rc1

## Root Structure

```
kaven-framework/
├── apps/
│   ├── api/              # Fastify 5 REST API (port 8000)
│   ├── admin/            # Next.js 16 Admin Panel (port 3000)
│   ├── tenant/           # Next.js 16 Tenant App (port 3001)
│   └── docs/             # Nextra Documentation (port 3002)
├── packages/
│   ├── database/         # Prisma schema, client, migrations, seeds
│   ├── ui/               # @kaven/ui-base — 76+ components
│   └── shared/           # Zod schemas, DTOs, types, constants
├── squads/               # AIOX squads (kaven-squad + outros)
│   └── kaven-squad/      # 11 agents especializados em Kaven
├── infra/
│   └── monitoring/       # Prometheus, Grafana, Loki configs
├── docs/
│   └── architecture/     # Este diretório — docs para AIOX agents
├── docker-compose.yml    # 13+ services
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example          # 122+ variáveis
```

## API Structure (apps/api/)

```
apps/api/src/
├── app.ts                # Fastify app factory + middleware registration
├── server.ts             # Entry point + cron jobs startup
├── middleware/           # 10 middleware layers
│   ├── auth.middleware.ts
│   ├── tenant.middleware.ts
│   ├── rbac.middleware.ts
│   ├── capability.middleware.ts
│   ├── idor.middleware.ts
│   └── service-token.middleware.ts
├── modules/              # Feature modules (auth, tenants, users, ...)
│   └── <module>/
│       ├── routes/
│       ├── services/
│       └── tests/
└── jobs/                 # Background jobs / cron
    ├── email-health-check-cron.service.ts
    ├── security-jobs.service.ts
    └── service-token-cleanup.job.ts
```

## Database (packages/database/)

```
packages/database/
├── prisma/
│   ├── schema.base.prisma     # Core models (sempre ativos)
│   ├── schema.extended.prisma # Optional models (billing, projects, etc.)
│   ├── migrations/
│   └── seeds/
│       ├── index.ts
│       ├── admin.seed.ts
│       └── capabilities.seed.ts
└── src/
    ├── client.ts          # Prisma client singleton + RLS middleware
    └── index.ts           # Re-exports
```
