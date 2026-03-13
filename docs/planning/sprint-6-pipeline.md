# Sprint 6 — AIOS Pipeline Completo

## Fase 1: @pm *gather-requirements

### Contexto Atual (Gap Analysis 2026-02-15)
- **Testes**: 570 passing, 0 failures, 42 test files
- **Typecheck**: 6/6 packages passando
- **Build**: 4/4 apps building (admin, tenant, docs, api)
- **Lint**: 0 errors, 45 warnings (minor)
- **UI Components**: ZERO gaps — todos os imports MDX resolvem para exports do @kaven/ui

### Itens Restantes para Sprint 6

#### BLOCO A — Test Coverage & CI (P1, 22h)
| Story | Título | Esforço | Deps |
|-------|--------|---------|------|
| STORY-033 | Expand test coverage for modules with minimal tests | 16h | S028-032 |
| STORY-037 | Fix CI build validation for all Next.js apps | 6h | S034-035 |

#### BLOCO B — Feature Completion (P1, 30h)
| Story | Título | Esforço | Deps |
|-------|--------|---------|------|
| STORY-039 | Avatar file upload with storage backend | 10h | — |
| STORY-040 | Bulk delete operations for admin views | 8h | — |
| STORY-043 | AWS SES email provider integration | 12h | — |

#### BLOCO C — Design System Adapters (P2, 16h)
| Story | Título | Esforço | Deps |
|-------|--------|---------|------|
| STORY-042 | Shadcn design system adapter | 8h | — |
| STORY-041 | Fluent UI design system adapter | 8h | S042 |

#### BLOCO D — Documentation (P2, 4h)
| Story | Título | Esforço | Deps |
|-------|--------|---------|------|
| STORY-046 | Finalize technical debt document | 4h | S028-035 |

#### Não-Story: Issues descobertos no Gap Analysis
| Issue | Severidade | Ação |
|-------|-----------|------|
| React Hook Form `watch()` + React Compiler incompatibility | MEDIUM | Migrar para `useWatch()` em 5 form components |
| Next.js middleware.ts deprecated → proxy convention | MEDIUM | Renomear middleware.ts para proxy.ts em admin e tenant |
| Duplicate pnpm-lock.yaml em apps/ | LOW | Remover lockfiles de apps/ (monorepo usa root lockfile) |
| 16 unused imports no tenant app | LOW | Limpar imports não utilizados |

### Total Sprint 6: 72h estimadas + ~4h de cleanup

---

## Fase 2: @architect *assess-complexity

### Análise de Complexidade por Story

| Story | Complexidade | Risco | Justificativa |
|-------|-------------|-------|---------------|
| STORY-033 | **Média** | Baixo | Padrão repetitivo (vitest + vi.mock), Sprint 5 estabeleceu templates |
| STORY-037 | **Baixa** | Baixo | Build já funciona, validação de CI é incremental |
| STORY-039 | **Alta** | Médio | Full-stack (DB migration + API + Frontend), sharp processing, edge cases de file upload |
| STORY-040 | **Média** | Médio | Transaction + RLS + audit log, mas padrão existente em single-delete |
| STORY-041 | **Alta** | Alto | Fluent UI tem semântica diferente (acrylic materials, depth), mapeamento não-trivial |
| STORY-042 | **Média** | Baixo | Shadcn CSS vars são próximas do token system existente |
| STORY-043 | **Média** | Médio | AWS SDK v3 já instalado, mas SES requer domain verification (24-48h lead time) |
| STORY-046 | **Baixa** | Baixo | Documentação pura, cross-reference com stories completadas |

### Decisões Arquiteturais Necessárias
1. **STORY-039**: Avatar storage — local only (launch) vs S3-ready abstraction?
   - Recomendação: Local only com interface para futura extensão S3
2. **STORY-041/042**: Adapters são P2 — podem ser deferidos para post-launch se Sprint 6 estourar timeline
3. **STORY-043**: SES domain verification precisa ser iniciada AGORA (24-48h lead time)

---

## Fase 3: @analyst *research-deps

### Dependências Técnicas

| Story | Deps Externas | Status |
|-------|--------------|--------|
| STORY-039 | `sharp` (image processing) | Já instalado |
| STORY-039 | `@fastify/multipart` | Já instalado e configurado |
| STORY-039 | Prisma migration (avatarUrl field) | Precisa criar |
| STORY-040 | `prisma.$transaction` | Já disponível |
| STORY-040 | `@kaven/ui` ConfirmationModal | Já exportado |
| STORY-043 | `@aws-sdk/client-ses` ^3.970.0 | Já instalado |
| STORY-043 | AWS SES domain verification | **EXTERNO** — precisa de acesso AWS console |
| STORY-042 | Shadcn CSS variables reference | Pesquisa necessária |
| STORY-041 | Fluent UI design tokens reference | Pesquisa necessária |

### Riscos de Dependência
- **SES domain verification** é bloqueante para teste real (não para unit test com mock)
- **React Compiler** incompatibilidade com `react-hook-form` pode exigir upgrade ou opt-out
- **Next.js 16.1.5** middleware deprecation não é urgente mas deve ser planejada

---

## Fase 4: @pm *write-spec

### Sprint 6 Spec — Wave Analysis

#### Wave 1 (parallelizable, ~22h efetivos)
Sem dependências entre si:
- **STORY-033**: Expand test coverage (16h) — Backend Engineer
- **STORY-037**: CI build validation (6h) — Frontend Engineer
- **STORY-039**: Avatar file upload (10h) — Full Stack Engineer
- **STORY-040**: Bulk delete operations (8h) — Full Stack Engineer
- **STORY-043**: AWS SES email integration (12h) — Backend Engineer

> Com 3 devs paralelos: Wave 1 = ~16h (STORY-033 é o gargalo)

#### Wave 2 (depende de nada, mas P2)
- **STORY-042**: Shadcn adapter (8h) — Frontend Engineer

#### Wave 3 (depende de STORY-042)
- **STORY-041**: Fluent adapter (8h) — Frontend Engineer

#### Wave 4 (depende de Wave 1)
- **STORY-046**: Tech debt document (4h) — Tech Lead

### Cleanup Tasks (não-story, paralelo)
- Fix React Hook Form `watch()` → `useWatch()` (2h)
- Clean unused imports em tenant app (1h)
- Remove duplicate pnpm-lock.yaml (0.5h)

---

## Fase 5: @qa *critique-spec

### Revisão QA das Stories

| Story | Issue | Severidade | Recomendação |
|-------|-------|-----------|-------------|
| STORY-033 | "at least 5 test cases per module" — quais módulos especificamente? | HIGH | Listar módulos com <3 tests no AC |
| STORY-039 | AC não menciona tenant isolation no upload (FileService) | HIGH | Adicionar: "Upload files scoped to tenantId" |
| STORY-040 | Batch size limit não definido | MEDIUM | Adicionar: "Max 50 items per batch request" |
| STORY-043 | AC não menciona rate limiting SES (14 emails/sec default) | MEDIUM | Adicionar: "Implement send queue with rate limiting" |
| STORY-041 | Depende de STORY-042 mas dependencies[] está vazio | HIGH | Corrigir dependencies para incluir STORY-042 |
| STORY-046 | files_to_remove lista technical-debt-DRAFT.md — git mv é melhor | LOW | Usar git mv para preservar history |

### Gate Decision: **PASS com fixes recomendados**
- 0 CRITICAL issues
- 3 HIGH (especificidade de escopo)
- 2 MEDIUM (limites operacionais)
- 1 LOW (git best practice)

---

## Fase 6: @architect *create-plan

### Plano de Execução Sprint 6

```
Timeline (estimativa com 1 dev):

Week 1 (Days 1-3): Wave 1 Priority
├── Day 1: STORY-037 (CI build validation, 6h) — QUICK WIN
├── Day 1: Start STORY-043 SES (domain verification lead time)
├── Day 2: STORY-040 (Bulk delete, 8h)
├── Day 3: STORY-039 (Avatar upload, 10h)

Week 1 (Days 4-5): Wave 1 Continued
├── Day 4-5: STORY-033 (Test expansion, 16h) — pode ser parcial

Week 2 (Days 6-7): Wave 2-4
├── Day 6: STORY-042 (Shadcn adapter, 8h)
├── Day 7: STORY-041 (Fluent adapter, 8h) — se tempo permitir
├── Day 7: STORY-046 (Tech debt doc, 4h) — QUICK WIN
```

### Critical Path
`STORY-043 (SES domain verification 24-48h) → STORY-043 (implementation 12h)`

### Recomendações
1. **Iniciar SES domain verification HOJE** — lead time externo
2. **STORY-037 primeiro** — é o quick win que valida o pipeline inteiro
3. **STORY-041 (Fluent)** pode ser deferido para Sprint 7 se timeline apertar
4. **Cleanup tasks** podem ser feitas em paralelo por subagents
