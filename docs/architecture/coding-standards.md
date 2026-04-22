# Coding Standards — Kaven Framework

> Kaven Framework v1.1.0-alpha (Prisma 7 Consolidation)

## Git & Commits
- **Branch strategy:** `feat/`, `fix/`, `chore/`, `refactor/`, `test/`, `docs/`
- **Commits:** Conventional Commits, ≤72 chars, inglês
- **Never:** push --force em branches compartilhadas, commitar secrets
- **Always:** commitar antes de mover para próxima task

## TypeScript
- **Strict mode:** `"strict": true` em todos os tsconfig
- **No `any`:** usar `unknown` quando tipo não é conhecido
- **Zod validation:** todos os inputs externos (API body, env vars) validados OBRIGATORIAMENTE com Zod

## API (Fastify)
- **Route structure:** `src/modules/<module>/routes/<module>.routes.ts`
- **Service layer:** lógica de negócio em `src/modules/<module>/services/<module>.service.ts`
- **Middleware hooks:** registrar via `fastify.addHook('preHandler', ...)`
- **Response format:** `{ data: T }` (success) | `{ error: string, code: string }` (failure)
- **Pagination:** `{ data: T[], meta: { total, page, limit } }`
- **tenantId:** OBRIGATÓRIO em todas as queries de dados — nunca buscar sem tenant context

## Database (Prisma 7)
- **Soft delete:** campo `deletedAt` em todos os models (nunca delete físico)
- **Indexes:** composite index em `(tenantId, <primary-filter>)` em todos os models
- **Migrations:** uma migration por feature/story — nomes descritivos
- **Prisma Adapters:** usar `@prisma/adapter-neon` ou `@prisma/adapter-pg` conforme ambiente
- **Extended schema:** novos models em `schema.extended.prisma`, não no `schema.base.prisma`

## Testing
- **Framework:** Vitest + Supertest
- **Coverage target:** 80%+ (statement)
- **Test isolation:** cada teste usa transaction rollback ou memfs para filesystem
- **Multi-tenant tests:** sempre testar que tenant A não acessa dados do tenant B
- **Security tests:** IDOR tests para todos os endpoints com IDs externos

## Error Handling
- **Never empty catch:** sempre logar o erro (`request.log.error({ err }, 'message')`)
- **HTTP errors:** usar `fastify.httpErrors.<statusCode>(message)` (fastify-sensible)
- **Async errors:** sempre `await` ou `.catch()` em Promises

## AI Agents
- **Auth:** usar `X-Service-Token` header (nunca JWT humano para agents)
- **tenantId:** obrigatório mesmo para agents — service token é scoped ao tenant
- **AuditLog:** sempre registrar com `callerType: CallerType.AGENT` e `agentId`
