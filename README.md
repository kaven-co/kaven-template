# Kaven Template

Production-ready SaaS boilerplate — multi-tenant, enterprise-grade, ship in days not months.

## What is this?

`kaven-template` is the GitHub template used by the **Kaven CLI** to scaffold new projects via `kaven init`. It is a snapshot of the [Kaven Framework](https://kaven.site) — a full-stack monorepo with authentication, multi-tenancy, payments, and 22+ modules built in.

**Do not clone this repo directly.** Use the CLI instead (see [Quick Start](#quick-start)).

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| pnpm | 9.15+ |
| Docker + Docker Compose | latest |

Install pnpm if needed:

```bash
npm install -g pnpm
```

## Quick Start

The recommended way to use this template is via the Kaven CLI:

```bash
npx kaven-cli init my-project
cd my-project
pnpm setup
pnpm dev
```

`pnpm setup` will:
1. Install all dependencies
2. Start Docker services (PostgreSQL + Redis)
3. Run database migrations
4. Seed the database with initial data

## Project Structure

```
.
├── apps/
│   ├── api/          # Fastify REST API (multi-tenant, RBAC, JWT auth)
│   ├── admin/        # Next.js Admin panel (App Router)
│   ├── tenant/       # Next.js Tenant-facing app (App Router)
│   └── docs/         # Documentation site
├── packages/
│   ├── database/     # Prisma schema, migrations, seed
│   ├── ui/           # @kaven/ui-base — shared React component library
│   └── shared/       # Shared types, validation, i18n helpers
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json
```

### apps/api

Fastify-based REST API with:
- JWT authentication + refresh tokens
- Multi-tenancy (subdomain + custom domain routing)
- RBAC (role-based access control)
- Feature flags (40+ capabilities)
- Prisma ORM + PostgreSQL
- Redis for caching and rate limiting
- AWS SES / Resend email
- Stripe + Paddle payment integration

### apps/admin

Next.js 15 App Router panel for platform administrators. Manages tenants, users, billing, analytics, and module configuration.

### apps/tenant

Next.js 15 App Router app for end-users of each tenant. Authentication, dashboard, settings, and module-provided pages.

### packages/database

Central Prisma schema split across base + module files. Contains migrations and seed scripts.

### packages/ui

Design system built on Shadcn/UI with the Frost theme (Amber/Geist, dark-first). Published standalone as `kaven-ui-base` on npm.

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for access tokens |
| `REFRESH_TOKEN_SECRET` | Secret for refresh tokens |
| `NEXTAUTH_SECRET` | NextAuth.js secret |
| `NEXTAUTH_URL` | App base URL (e.g. `http://localhost:3000`) |
| `PROJECT_NAME` | Your project identifier |

See `.env.example` for the full list including email, payments, and storage providers.

## Commands

```bash
# Development
pnpm dev            # Start all apps in watch mode

# Database
pnpm db:migrate     # Run pending migrations
pnpm db:seed        # Seed the database
pnpm db:studio      # Open Prisma Studio

# Docker
pnpm docker:up      # Start PostgreSQL + Redis
pnpm docker:down    # Stop containers
pnpm docker:logs    # Tail container logs
pnpm docker:clean   # Stop and remove volumes (destructive)

# Quality gates
pnpm lint           # ESLint across all packages
pnpm typecheck      # TypeScript checks
pnpm test           # Run all tests
pnpm quality        # lint + typecheck + test (CI equivalent)
pnpm build          # Production build all apps
```

## Modules

The Kaven Marketplace provides optional modules you can install via the CLI:

```bash
kaven marketplace browse   # Browse available modules
kaven module install payments
kaven module install auth-social
```

Each module extends the Prisma schema, adds API routes, and injects frontend components into the appropriate app.

## Documentation

Full documentation at [kaven.site/docs](https://kaven.site/docs), including:

- Getting started guide
- Multi-tenancy architecture
- Module system reference
- Deployment guides (Vercel + Railway + Cloud Run)
- API reference

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API | Fastify, Prisma, PostgreSQL, Redis |
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Auth | JWT + Refresh Tokens, NextAuth.js |
| Payments | Stripe, Paddle |
| Email | AWS SES, Resend |
| Storage | AWS S3, MinIO |
| Build | Turborepo, tsup, pnpm workspaces |
| Tests | Vitest, Supertest, MSW |

## License

Commercial license. See [kaven.site/terms](https://kaven.site/terms).
