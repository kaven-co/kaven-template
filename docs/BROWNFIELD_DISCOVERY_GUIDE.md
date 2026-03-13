# 🔍 BROWNFIELD DISCOVERY - Guia de Execução

**Data:** 2026-02-03
**Branch:** `discovery/brownfield-assessment`
**Objetivo:** Análise completa do estado atual do kaven-framework
**Tempo estimado:** 4-6 horas

---

## 📋 CHECKLIST GERAL

- [ ] FASE 1: System Documentation (30-60min)
- [ ] FASE 2: Database Audit (20-40min)
- [ ] FASE 3: Frontend/UX Spec (30-45min)
- [ ] FASE 4: DRAFT Consolidation (30-45min)
- [ ] FASE 5: DB Specialist Review (30min)
- [ ] FASE 6: UX Specialist Review (30min)
- [ ] FASE 7: QA Review (1h)
- [ ] FASE 8: Final Assessment (30-45min)
- [ ] FASE 9: Executive Report (30min)
- [ ] FASE 10: Planning (30-60min)

---

## 🎯 FASE 1: SYSTEM DOCUMENTATION (30-60min)

### Objetivo
Documentar arquitetura completa do sistema, stack, estrutura, patterns e débitos técnicos.

### Prompt para Claude (Antigravity ou Chat)
```
Atue como ARCHITECT especializado em análise de sistemas.

TAREFA: Analise COMPLETAMENTE o kaven-framework e crie documentação técnica detalhada.

CONTEXTO:
- Projeto: KAVEN Framework (SaaS boilerplate multi-tenant)
- Stack: Fastify (API) + Next.js 14 App Router (Admin + Tenant App)
- Database: PostgreSQL + Prisma
- 22 features migradas do legacy boilerplate (Week 4 completo)

ANÁLISE OBRIGATÓRIA:

1. STACK TÉCNICO
   - Backend: frameworks, libs, versões
   - Frontend: frameworks, libs, versões
   - Database: schema, migrations, ORM
   - Infra: Docker, CI/CD, deployment

2. ESTRUTURA DO PROJETO
   - Monorepo (Turborepo?)
   - Apps (api, admin, tenant, docs)
   - Packages compartilhados
   - Scripts e tooling

3. ARQUITETURA MULTI-TENANT
   - Como tenantId é propagado
   - RLS (Row-Level Security)
   - Middleware de tenant detection
   - Isolamento de dados

4. FEATURES IMPLEMENTADAS (22 no total)
   - Auth (JWT, refresh tokens)
   - Users (CRUD, invites)
   - Tenants (multi-tenancy)
   - Payments (Stripe, PagueBit)
   - Invoices, Orders
   - Audit logs
   - Files/Storage
   - Notifications
   - Security
   - (listar todas)

5. PATTERNS EXISTENTES
   - API routes structure
   - Fastify plugins
   - Next.js App Router conventions
   - Error handling
   - Validation (Zod?)
   - Testing patterns

6. DÉBITOS TÉCNICOS IDENTIFICADOS
   - [ ] Tenant App: não implementado (GAP crítico)
   - [ ] Testes: cobertura?
   - [ ] Docs: completude?
   - [ ] Performance: N+1 queries?
   - [ ] Security: validações?
   - [ ] Code smell: duplicação?

OUTPUT ESPERADO:
Arquivo `docs/architecture/system-architecture.md` com:
- Executive Summary
- Stack completo
- Diagrama de arquitetura (ASCII/Mermaid)
- Features audit
- Patterns catalog
- Technical Debt Report (preliminar)

COMECE A ANÁLISE AGORA.
```

### Checklist de Validação
- [ ] Arquivo `system-architecture.md` criado
- [ ] Stack documentado (backend + frontend + db)
- [ ] 22 features listadas
- [ ] Tenant App gap identificado
- [ ] Pelo menos 5 débitos técnicos listados
- [ ] Diagrama de arquitetura incluído

---

## 🎯 FASE 2: DATABASE AUDIT (20-40min)

### Objetivo
Auditar schema, RLS policies, índices, migrations e segurança do banco de dados.

### Prompt para Claude
```
Atue como DATA ENGINEER especializado em PostgreSQL + Prisma.

TAREFA: Faça auditoria COMPLETA do database do kaven-framework.

ANÁLISE OBRIGATÓRIA:

1. SCHEMA PRISMA
   - Ler todo `prisma/schema.prisma`
   - Listar todos os models
   - Identificar relacionamentos (1:1, 1:N, N:N)
   - Verificar campos obrigatórios vs opcionais
   - Verificar índices definidos

2. MULTI-TENANCY
   - Todos os models têm `tenantId`?
   - Modelos compartilhados (sem tenantId) identificados?
   - RLS policies implementadas?
   - Prisma middleware para auto-inject tenantId?

3. ÍNDICES E PERFORMANCE
   - Quais índices existem?
   - Campos frequentemente consultados sem índice?
   - Índices compostos necessários?
   - Queries N+1 potenciais?

4. MIGRATIONS
   - Pasta `prisma/migrations/` organizada?
   - Migrations com rollback?
   - Schema drift (diferença schema vs DB)?

5. SECURITY AUDIT
   - Campos sensíveis (passwords) hasheados?
   - SQL injection prevention?
   - Cascading deletes configurados corretamente?
   - Soft deletes vs hard deletes?

DÉBITOS TÉCNICOS:
- [ ] RLS policies faltando?
- [ ] Índices faltantes?
- [ ] Migrations desorganizadas?
- [ ] Security issues?
- [ ] Schema inconsistencies?

OUTPUT ESPERADO:
- `docs/architecture/database-schema.md`
- `docs/reviews/db-audit.md` (débitos encontrados)

COMECE A AUDITORIA AGORA.
```

### Checklist de Validação
- [ ] Schema completo documentado
- [ ] Multi-tenancy verificado
- [ ] Índices auditados
- [ ] Migrations checadas
- [ ] Security issues identificados
- [ ] Pelo menos 3 débitos DB listados

---

## 🎯 FASE 3: FRONTEND/UX SPEC (30-45min)

### Objetivo
Especificar estrutura frontend, componentes, design system, acessibilidade e UX.

### Prompt para Claude
```
Atue como UX DESIGN EXPERT especializado em Next.js e React.

TAREFA: Crie especificação COMPLETA do frontend do kaven-framework.

ANÁLISE OBRIGATÓRIA:

1. APPS FRONTEND
   - Admin Panel: onde está? estrutura?
   - Tenant App: existe? (GAP conhecido)
   - Docs: Nextra/MDX?
   - Landing: onde?

2. ADMIN PANEL AUDIT
   - Quantos componentes?
   - Estrutura de pastas (App Router)
   - Pages vs layouts vs templates
   - Rotas autenticadas
   - Dashboard principal

3. DESIGN SYSTEM
   - UI library usada (shadcn/ui, Radix?)
   - Componentes base (Button, Input, Modal, etc)
   - Consistência de estilos
   - Tailwind config customizado?
   - Color scheme (dark mode?)

4. TENANT APP (GAP CRÍTICO)
   - Existe alguma estrutura?
   - Se sim, o que tem?
   - Se não, o que DEVERIA ter?
   - Diferença vs Admin Panel?

5. ACESSIBILIDADE (a11y)
   - Semantic HTML?
   - ARIA labels?
   - Keyboard navigation?
   - Screen reader friendly?
   - Color contrast?

6. RESPONSIVENESS
   - Mobile-first?
   - Breakpoints definidos?
   - Componentes adaptam?

7. PERFORMANCE
   - Server Components usados?
   - Client Components marcados?
   - Lazy loading?
   - Image optimization?

DÉBITOS TÉCNICOS:
- [ ] Tenant App não existe (CRÍTICO)
- [ ] Design system inconsistente?
- [ ] Acessibilidade issues?
- [ ] Responsiveness problems?
- [ ] Performance bottlenecks?

OUTPUT ESPERADO:
- `docs/frontend/frontend-spec.md`
- `docs/frontend/design-system.md`
- `docs/reviews/tenant-app-gap.md`

COMECE A ESPECIFICAÇÃO AGORA.
```

### Checklist de Validação
- [ ] Admin Panel documentado
- [ ] Tenant App gap confirmado
- [ ] Design system catalogado
- [ ] A11y auditada
- [ ] Responsiveness checada
- [ ] Pelo menos 5 débitos UX listados

---

## 🎯 FASE 4: DRAFT CONSOLIDATION (30-45min)

### Objetivo
Consolidar TODOS os débitos identificados nas Fases 1-3 em um único documento preliminar.

### Prompt para Claude
```
Atue como ARCHITECT consolidando análises.

TAREFA: Consolide TODOS os débitos técnicos identificados nas Fases 1-3.

INPUT:
- `docs/architecture/system-architecture.md` (FASE 1)
- `docs/reviews/db-audit.md` (FASE 2)
- `docs/frontend/frontend-spec.md` (FASE 3)

CONSOLIDAÇÃO OBRIGATÓRIA:

1. LISTAR TODOS OS DÉBITOS
   - Categoria: Backend | Frontend | Database | Infra | Docs
   - Severidade: CRÍTICO | ALTO | MÉDIO | BAIXO
   - Descrição clara (1-2 frases)
   - Impacto no negócio
   - Esforço estimado (horas)

2. PRIORIZAÇÃO PRELIMINAR
   - Matriz 2x2: Impacto vs Esforço
   - Top 10 débitos mais críticos
   - Quick wins (baixo esforço, alto impacto)
   - Tech debt bombs (alto impacto se não resolver)

3. PERGUNTAS PARA ESPECIALISTAS
   - Dúvidas sobre DB que precisam de data-engineer
   - Dúvidas sobre UX que precisam de design-expert
   - Dúvidas sobre QA

4. ESTIMATIVA PRELIMINAR
   - Total de horas para resolver todos
   - Total de horas para top 10
   - Custo em R$ (R$150/h)

FORMATO:
Use tabela Markdown:
| ID | Categoria | Severidade | Débito | Impacto | Esforço | Custo |
|----|-----------|------------|--------|---------|---------|-------|
| TD-001 | Frontend | CRÍTICO | Tenant App não existe | Blocker para demo | 40h | R$6,000 |
| TD-002 | Database | ALTO | RLS policies faltando | Security risk | 8h | R$1,200 |

OUTPUT ESPERADO:
- `docs/prd/technical-debt-DRAFT.md`

COMECE A CONSOLIDAÇÃO AGORA.
```

### Checklist de Validação
- [ ] Todos débitos consolidados
- [ ] Severidades atribuídas
- [ ] Esforços estimados
- [ ] Custos calculados
- [ ] Top 10 identificados
- [ ] Perguntas para especialistas listadas

---

## 🎯 FASE 5-7: SPECIALIST VALIDATION (2h total)

### Objetivo
Especialistas revisam suas respectivas seções e validam/ajustam.

### FASE 5: DB Specialist Review (30min)

**Prompt:**
```
Atue como DATA ENGINEER revisando seção de database.

TAREFA: Revise a seção de Database do technical-debt-DRAFT.md

VALIDAÇÃO:
- [ ] Todos os débitos DB estão corretos?
- [ ] Severidades apropriadas?
- [ ] Esforços realistas?
- [ ] Faltou algum débito crítico?

ADICIONE/AJUSTE:
- Novos débitos não identificados
- Correções de severidade
- Ajustes de esforço
- Recomendações técnicas

OUTPUT:
- `docs/reviews/db-specialist-review.md`
```

### FASE 6: UX Specialist Review (30min)

**Prompt:**
```
Atue como UX DESIGN EXPERT revisando seção de frontend.

TAREFA: Revise a seção de Frontend/UX do technical-debt-DRAFT.md

VALIDAÇÃO:
- [ ] Tenant App gap bem descrito?
- [ ] Design system issues completos?
- [ ] A11y problems identificados?
- [ ] Responsiveness issues corretos?

ADICIONE/AJUSTE:
- Novos débitos UX
- Priorização de quick wins
- Recomendações de design

OUTPUT:
- `docs/reviews/ux-specialist-review.md`
```

### FASE 7: QA Review (1h)

**Prompt:**
```
Atue como QA ENGINEER fazendo quality gate review.

TAREFA: Revise TODO o technical-debt-DRAFT.md como QA.

QUALITY GATES:
1. TESTING
   - Cobertura de testes atual?
   - Testes unitários faltando?
   - Testes integração faltando?
   - E2E tests existem?

2. DOCUMENTATION
   - Docs estão atualizados?
   - README completo?
   - API docs existem?
   - Setup instructions claras?

3. CODE QUALITY
   - Lint passing?
   - TypeScript strict mode?
   - No console.logs em prod?
   - Error handling consistente?

4. SECURITY
   - Dependencies vulneráveis?
   - Secrets expostos?
   - Rate limiting?
   - Input validation?

ADICIONE DÉBITOS:
- Testing gaps
- Documentation gaps
- Code quality issues
- Security vulnerabilities

OUTPUT:
- `docs/reviews/qa-review.md`
```

### Checklist de Validação
- [ ] DB review completo
- [ ] UX review completo
- [ ] QA review completo
- [ ] Novos débitos adicionados
- [ ] Ajustes de severidade feitos

---

## 🎯 FASE 8: FINAL ASSESSMENT (30-45min)

### Objetivo
Incorporar todos os feedbacks e criar assessment FINAL.

### Prompt para Claude
```
Atue como ARCHITECT criando assessment FINAL.

TAREFA: Incorpore TODOS os feedbacks e crie documento final.

INPUT:
- `technical-debt-DRAFT.md` (Fase 4)
- `db-specialist-review.md` (Fase 5)
- `ux-specialist-review.md` (Fase 6)
- `qa-review.md` (Fase 7)

FINAL ASSESSMENT:

1. ATUALIZAR LISTA DE DÉBITOS
   - Adicionar débitos dos reviews
   - Ajustar severidades conforme feedback
   - Atualizar esforços
   - Recalcular custos

2. MATRIZ DE PRIORIZAÇÃO FINAL
   | Prioridade | ID | Débito | Impacto | Esforço |
   |------------|----|---------|---------|---------|
   | P0 | TD-001 | Tenant App | CRÍTICO | 40h |
   | P1 | TD-002 | RLS policies | ALTO | 8h |

3. ROADMAP DE RESOLUÇÃO
   - Sprint 1 (1 semana): P0 débitos
   - Sprint 2 (1 semana): P1 débitos
   - Sprint 3 (1 semana): P2 débitos
   - Backlog: P3+ débitos

4. PLANO DE ATAQUE
   - Para cada débito P0/P1:
     - Descrição detalhada
     - Steps de resolução
     - Acceptance criteria
     - Riscos

OUTPUT ESPERADO:
- `docs/prd/technical-debt-assessment.md` (FINAL)

COMECE O ASSESSMENT FINAL AGORA.
```

### Checklist de Validação
- [ ] Todos feedbacks incorporados
- [ ] Lista final de débitos completa
- [ ] Matriz de priorização clara
- [ ] Roadmap de resolução definido
- [ ] Plano de ataque detalhado

---

## 🎯 FASE 9: EXECUTIVE REPORT (30min)

### Objetivo
Criar relatório executivo com ROI, custos e impacto no negócio.

### Prompt para Claude
```
Atue como BUSINESS ANALYST criando executive report.

TAREFA: Crie relatório executivo baseado no technical-debt-assessment.md

RELATÓRIO EXECUTIVO:

1. EXECUTIVE SUMMARY (3 parágrafos)
   - Estado atual do projeto
   - Principais débitos identificados
   - Impacto no negócio

2. NÚMEROS CONSOLIDADOS
   - Total de débitos: X
   - Críticos: X | Altos: X | Médios: X | Baixos: X
   - Esforço total: X horas
   - Custo total: R$ X,XXX
   - Tempo necessário: X semanas

3. ROI ANALYSIS
   - Investimento: R$ X,XXX (horas * R$150/h)
   - Riscos evitados: R$ X,XXX (bugs, refactors, clientes perdidos)
   - Ganho de velocidade: +X% dev velocity
   - ROI ratio: X:1

4. TOP 5 DÉBITOS CRÍTICOS
   Para cada um:
   - Descrição (1 frase)
   - Impacto no negócio
   - Custo de resolução
   - Custo de NÃO resolver

5. RECOMENDAÇÃO
   - Resolver AGORA vs DEPOIS vs NUNCA
   - Justificativa

FORMATO:
Linguagem de negócio, não técnica.
Foco em impacto e ROI.

OUTPUT ESPERADO:
- `docs/reports/TECHNICAL-DEBT-REPORT.md` ⭐ GOLD

COMECE O RELATÓRIO EXECUTIVO AGORA.
```

### Checklist de Validação
- [ ] Executive summary claro
- [ ] Números consolidados corretos
- [ ] ROI calculado
- [ ] Top 5 débitos destacados
- [ ] Recomendação clara
- [ ] Linguagem de negócio (não técnica)

---

## 🎯 FASE 10: PLANNING (30-60min)

### Objetivo
Criar Epic + Stories prontas para desenvolvimento.

### Prompt para Claude
```
Atue como PRODUCT MANAGER criando backlog.

TAREFA: Transforme o technical-debt-assessment.md em Epic + Stories.

PLANNING:

1. CRIAR EPIC
   ```yaml
   epic_id: EPIC-TECH-DEBT-2026-Q1
   title: "Resolução de Débitos Técnicos Críticos"
   description: |
     Epic para resolver os débitos técnicos identificados
     no Brownfield Discovery de 2026-02-03.

   total_stories: X
   estimated_effort: X horas
   priority: CRÍTICO
   target_completion: 2026-XX-XX
   ```

2. CRIAR STORIES (formato YAML)
   Para cada débito P0/P1:
   ```yaml
   story_id: STORY-001
   epic: EPIC-TECH-DEBT-2026-Q1
   title: "Implementar Tenant App - Dashboard inicial"
   priority: P0
   estimated_effort: 8h

   description: |
     Criar estrutura base do Tenant App com dashboard inicial
     para demonstrar multi-tenancy funcionando.

   acceptance_criteria:
     - [ ] Dashboard route criada
     - [ ] Tenant context hook implementado
     - [ ] RLS filtering aplicado
     - [ ] Tests passando

   technical_notes: |
     - Usar Next.js App Router
     - Reuse 80% do Admin Panel
     - Distinct visual identity

   dependencies:
     - STORY-002 (tenant context)
   ```

3. PRIORIZAÇÃO
   - Sprint 1: Stories P0 (1 semana)
   - Sprint 2: Stories P1 (1 semana)
   - Backlog: Stories P2+

OUTPUT ESPERADO:
- `docs/stories/EPIC-TECH-DEBT.md`
- `docs/stories/STORY-001.yaml`
- `docs/stories/STORY-002.yaml`
- ... (todas as stories P0/P1)

COMECE O PLANNING AGORA.
```

### Checklist de Validação
- [ ] Epic criado
- [ ] Stories P0 todas criadas
- [ ] Stories P1 todas criadas
- [ ] Acceptance criteria claros
- [ ] Dependencies mapeadas
- [ ] Esforços estimados

---

## ✅ FINALIZAÇÃO

### Commit de Discovery
```bash
git add docs/
git commit -S -m "docs: brownfield discovery complete

- System architecture documented
- Database audit complete
- Frontend/UX spec created
- Technical debt assessment (47 items)
- Executive report with ROI
- Epic + Stories for resolution

Discovery identified:
- 8 critical debts
- 15 high priority debts
- Total effort: 284h (R$42,600)
- ROI: 4.2:1

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Resultado Final
```bash
docs/
├── architecture/
│   ├── system-architecture.md       ✅ (Fase 1)
│   └── database-schema.md           ✅ (Fase 2)
├── frontend/
│   ├── frontend-spec.md             ✅ (Fase 3)
│   └── design-system.md             ✅ (Fase 3)
├── reviews/
│   ├── db-audit.md                  ✅ (Fase 2)
│   ├── db-specialist-review.md      ✅ (Fase 5)
│   ├── ux-specialist-review.md      ✅ (Fase 6)
│   └── qa-review.md                 ✅ (Fase 7)
├── prd/
│   ├── technical-debt-DRAFT.md      ✅ (Fase 4)
│   └── technical-debt-assessment.md ✅ (Fase 8) FINAL
├── reports/
│   └── TECHNICAL-DEBT-REPORT.md     ✅ (Fase 9) ⭐ GOLD
└── stories/
    ├── EPIC-TECH-DEBT.md            ✅ (Fase 10)
    ├── STORY-001.yaml               ✅ (Fase 10)
    ├── STORY-002.yaml               ✅ (Fase 10)
    └── ... (todas P0/P1)
```

---

## 🎯 PRÓXIMOS PASSOS (APÓS DISCOVERY)

### Se Discovery Prova Valor
- [ ] Revisar Executive Report
- [ ] Aprovar implementação Fase 1+2 (Agent Orchestration)
- [ ] Começar resolução de Stories P0

### Se Discovery Não Convence
- [ ] Feedback sobre o que faltou
- [ ] Ajustar approach
- [ ] Decidir não continuar com AIOS

---

**READY TO START!** 🚀
