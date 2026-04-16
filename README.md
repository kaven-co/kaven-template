# kaven-template

Template base for new projects using the [Kaven Framework](https://kaven.site). This repository is used internally by `kaven-cli` — the recommended way to start a project is via `kaven init`, not by cloning this repo directly.

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **kaven-cli** installed globally

```bash
npm install -g kaven-cli
```

---

## Usage

Create a new project using the CLI:

```bash
kaven init my-project
```

The CLI scaffolds the project from this template, fills in placeholders (project name, locale, database URL, etc.), and sets up the initial environment.

---

## Project Structure

```
my-project/
├── apps/
│   ├── api/          # Fastify backend (REST API, auth, billing, webhooks)
│   ├── admin/        # Next.js admin panel (tenant management, RBAC)
│   ├── tenant/       # Next.js tenant app (end-user facing)
│   └── docs/         # Internal docs app
├── packages/
│   ├── database/     # Prisma schema, migrations, seeds
│   ├── ui/           # @kaven/ui-base design system (Frost theme)
│   ├── shared/       # Shared types, utilities, constants
│   └── e2e/          # End-to-end test suite
├── .env.example      # Root environment variables (copy to .env)
└── turbo.json        # Turborepo pipeline config
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon, Supabase, or local) |
| `REDIS_URL` | Redis URL for rate limiting and sessions |
| `JWT_SECRET` / `REFRESH_TOKEN_SECRET` | Auth token secrets |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe payment keys |
| `EMAIL_PROVIDER` | Email provider: `ses`, `resend`, `postmark`, or `smtp` |
| `KAVEN_TELEMETRY` | Set to `0` to opt out of anonymous telemetry |

The tenant app (`apps/tenant`) has its own `.env.example` for `NEXT_PUBLIC_API_URL` and `API_URL`.

---

## Local Development

```bash
pnpm install
pnpm docker:up       # Start PostgreSQL + Redis via Docker Compose
pnpm db:migrate      # Run Prisma migrations
pnpm db:seed         # Seed initial data
pnpm dev             # Start all apps (Turborepo parallel)
```

Individual app ports (defaults):

| App | Port |
|---|---|
| API (Fastify) | 8000 |
| Admin (Next.js) | 3000 |
| Tenant (Next.js) | 3001 |

---

## Available Scripts

```bash
pnpm dev             # Start all apps in development mode
pnpm build           # Build all apps
pnpm test            # Run all test suites
pnpm quality         # lint + typecheck + test
pnpm db:studio       # Open Prisma Studio
pnpm docker:down     # Stop Docker services
```

---

## Links

- **Website:** [kaven.site](https://kaven.site)
- **CLI docs:** `kaven --help` or `kaven init --help`
- **Marketplace:** [marketplace.kaven.site](https://marketplace.kaven.site)
- **npm:** [kaven-cli](https://www.npmjs.com/package/kaven-cli)
