# Kaven Template 🚀

Produção em dias, não meses. Monorepo enterprise-grade, multi-tenant e pronto para escala.

## Quick Start
```bash
# 1. Configurar o ambiente (Instalar deps, Docker, Migrations, Seed)
pnpm setup

# 2. Rodar o servidor em desenvolvimento
pnpm dev
```

## Estrutura do Monorepo
- **apps/api:** Fastify REST API (RBAC, Multi-tenancy, JWT).
- **apps/admin:** Next.js Dashboard do administrador da plataforma.
- **apps/tenant:** Next.js Dashboard de cada cliente (tenant).
- **packages/database:** Prisma schema, migrações e dados iniciais.
- **packages/ui:** Biblioteca de componentes @kaven/ui-base.

## URLs Locais
- **API:** http://localhost:4000
- **Admin:** http://localhost:3000
- **Tenant:** http://{tenant}.localhost:3001
- **Docs:** http://localhost:3002

## Comandos Principais
- `pnpm dev`: Rodar todas as apps simultaneamente.
- `pnpm db:studio`: Interface para visualizar o banco de dados.
- `pnpm quality`: Rodar lint, testes e typecheck (Quality Gate).

## Documentação
Acesse [kaven.site/docs](https://kaven.site/docs) para guias de deploy (Vercel, Railway, GCP) e arquitetura.

---
**License:** Commercial. See [kaven.site/terms](https://kaven.site/terms).
