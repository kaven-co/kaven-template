# Kaven Framework — Padrões de Código

> Referência canônica de coding standards. Atualizado em: 2026-03-11.
> Carregado automaticamente pelo AIOX via `devLoadAlwaysFiles`.

---

## TypeScript

### Strictness obrigatória

Todos os projetos devem ter no `tsconfig.json`:

```jsonc
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitOverride": true,
  "verbatimModuleSyntax": true,
  "isolatedModules": true
}
```

### Regras de tipos

- **Proibido `any`** — usar `unknown` com type guards quando necessário
- Interfaces para contratos externos: `IUserRepository`, `ITenantContext`
- Types para unions e composição: `type UserId = string & { readonly brand: unique symbol }`
- Importações de tipo separadas: `import type { Prisma } from '@prisma/client'`

---

## Convenções de Nomenclatura

| Item | Padrão | Exemplo |
|---|---|---|
| Arquivos | kebab-case | `user-service.ts`, `auth-middleware.ts` |
| Classes | PascalCase | `UserService`, `TenantMiddleware` |
| Funções/métodos | camelCase | `getUserById`, `validateToken` |
| Variáveis | camelCase | `tenantId`, `refreshToken` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS`, `JWT_EXPIRY` |
| Interfaces | PascalCase + `I` prefix | `IUserRepository`, `ITenantContext` |
| Enums (Prisma) | UPPER_SNAKE_CASE | `Role.TENANT_ADMIN`, `Status.ACTIVE` |
| Rotas API | kebab-case | `/api/refresh-token`, `/api/grant-requests` |
| Variáveis de ambiente | UPPER_SNAKE_CASE | `DATABASE_URL`, `JWT_SECRET` |

---

## Estrutura de um Módulo Fastify

Cada módulo em `apps/api/src/modules/` segue esta estrutura:

```
modules/invoices/
├── invoice.routes.ts      # Registra rotas + middlewares + handlers
├── invoice.controller.ts  # Recebe request, chama service, retorna response
├── invoice.service.ts     # Lógica de negócio (tenantId sempre presente)
├── invoice.schema.ts      # Schemas Zod de validação (input/output)
├── invoice.types.ts       # Tipos TypeScript do módulo
└── __tests__/
    └── invoice.service.spec.ts
```

### Padrão de rota

```typescript
// invoice.routes.ts
export async function invoiceRoutes(app: FastifyInstance) {
  app.get('/invoices', {
    preHandler: [
      authMiddleware,
      requireCapability('invoices.read'),
    ],
    schema: { response: { 200: invoiceListSchema } },
    handler: invoiceController.list,
  })
}
```

### Padrão de service

```typescript
// invoice.service.ts
export class InvoiceService {
  static async create(data: CreateInvoiceDto, tenantId: string): Promise<Invoice> {
    logger.info('[InvoiceService.create] start', { tenantId })
    try {
      // 1. Validação (Zod já feita na rota, mas revalidar se necessário)
      // 2. Lógica de negócio
      // 3. Write no banco (tenantId SEMPRE incluído)
      const invoice = await prisma.invoice.create({
        data: { ...data, tenantId },
      })
      // 4. Audit log
      await auditService.log({ action: 'invoice.created', tenantId, actorId: data.userId })
      logger.info('[InvoiceService.create] success', { tenantId, invoiceId: invoice.id })
      return invoice
    } catch (error) {
      logger.error('[InvoiceService.create] error', { tenantId, error })
      throw new Error(`Failed to create invoice: ${(error as Error).message}`)
    }
  }
}
```

---

## Multi-Tenancy — Regras Absolutas

1. **Todo model de negócio DEVE ter `tenantId`** — sem exceção
2. **Todo service DEVE filtrar por `tenantId` nas queries**
3. **Nunca expor dados de outro tenant** — validar sempre no service layer
4. O `tenantId` é extraído de `request.tenantContext` (injetado pelo `tenantMiddleware`)
5. **Proteção IDOR obrigatória** — usar `idorMiddleware` em recursos sensíveis

```typescript
// CORRETO — sempre filtrar por tenantId
const invoice = await prisma.invoice.findUnique({
  where: { id, tenantId }, // tenantId na WHERE
})

// ERRADO — vulnerável a IDOR
const invoice = await prisma.invoice.findUnique({
  where: { id }, // SEM tenantId = VULNERABILIDADE
})
```

---

## Logging — Obrigatório

Usar Winston. Nunca usar `console.log` em produção.

```typescript
import { logger } from '@/shared/logger'

async function fetchUserData(userId: string) {
  logger.info('[fetchUserData] start', { userId })
  try {
    const result = await db.user.findUnique({ where: { id: userId } })
    logger.info('[fetchUserData] success', { userId, found: !!result })
    return result
  } catch (error) {
    logger.error('[fetchUserData] error', { userId, error })
    throw error
  }
}
```

**Regras:**
- Nunca logar credentials, tokens, PII
- Nível `debug` para detalhes de desenvolvimento (desativado em produção via `LOG_LEVEL`)
- Nível `info` para fluxo principal
- Nível `error` para falhas — sempre com contexto acionável
- `catch` vazio é **proibido** — sempre logar e re-throw

---

## Error Handling

```typescript
try {
  // operação
} catch (error) {
  logger.error(`[${operation}] failed`, { error })
  throw new Error(`Failed to ${operation}: ${(error as Error).message}`)
}
```

- Mensagens de erro devem ser acionáveis (qual operação, qual input)
- Nunca silenciar exceções
- Fail fast com mensagens claras

---

## Validação com Zod

```typescript
// invoice.schema.ts
import { z } from 'zod'

export const createInvoiceSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  customerId: z.string().uuid(),
})

export type CreateInvoiceDto = z.infer<typeof createInvoiceSchema>
```

- Schemas Zod são a fonte de verdade para tipos de entrada
- `z.infer<typeof schema>` para gerar tipos TypeScript
- Validação deve acontecer na camada de rota (schema Fastify) ou no início do service

---

## Feature Gating

Toda feature premium deve usar `requireFeature()`:

```typescript
await subscriptionService.requireFeature(tenantId, 'advanced_reports')
// Lança FeatureNotAvailableError se o plano não tem a feature
```

Para verificação sem lançar erro:

```typescript
const canUse = await subscriptionService.canUseFeature(tenantId, 'advanced_reports')
```

---

## Middleware Chain — Ordem Obrigatória

```typescript
preHandler: [
  tenantMiddleware,       // 1. Extrai tenantId
  authMiddleware,         // 2. Valida JWT
  rbac.middleware,        // 3. Valida role
  requireCapability('x'), // 4. Valida capability granular
  featureGuard('x'),      // 5. Valida feature flag do plano
  idorMiddleware,         // 6. Previne IDOR (se aplicável)
]
```

---

## Frontend (Next.js App Router)

- **Server Components por padrão** — `use client` apenas quando necessário (event handlers, hooks, browser APIs)
- **Imports absolutos** — nunca caminhos relativos com `..`
- Sem `any` — preferir `unknown` + type guards
- Usar `@tanstack/react-query` para data fetching (não fetch direto em componentes)
- Formulários via `react-hook-form` + Zod resolver
- Estado global via `zustand` (não Context para estado complexo)

---

## Testes

- Todos os serviços novos precisam de testes
- Framework: **Vitest** (não Jest — migrado)
- Arquivo: `__tests__/nome.service.spec.ts`
- Padrão: describe/it, mocks via `vi.mock`
- Rodar antes de qualquer commit: `pnpm test`

### Verificação obrigatória antes de marcar task como completa

```bash
pnpm tsc --noEmit      # zero erros TypeScript
pnpm lint              # zero warnings ESLint
pnpm typecheck         # passa
pnpm test              # todos os testes passando
```

---

## Proibido

- `any` sem justificativa explícita (`// eslint-disable-next-line @typescript-eslint/no-explicit-any — motivo`)
- `console.log` em código de produção
- Secrets hardcoded
- Acesso direto ao banco sem passar pelo service layer
- Promises sem tratamento (`void somePromise()` sem `.catch()`)
- `catch` vazio
- Imports relativos com `..` (usar imports absolutos)
- Commitar na `main` diretamente
- `npm install` ou `yarn` — sempre `pnpm`
