# AGENTS.md — Kaven Framework
> Antigravity · Codex CLI · OpenCode · Cursor
> Atualizado: 2026-04-04

---

<!-- AIOX-MANAGED-START: core-rules -->
## Core Rules

1. PT-BR em toda interação, inglês em código, commits, nomes de arquivo
2. NUNCA deletar conteúdo sem perguntar (especialmente criado < 7 dias)
3. NUNCA declarar "concluído" sem evidência (`git diff --stat`, logs, testes)
4. NUNCA trabalhar direto na `main` — criar branch sempre (`feat/`, `fix/`, `docs/`, `chore/`)
5. Commits: conventional commits, atômicos, ≤72 chars
6. Apresentar opções como "1. X — [tradeoff], 2. Y — [tradeoff]" antes de agir em decisões arquiteturais
<!-- AIOX-MANAGED-END: core-rules -->

---

<!-- AIOX-MANAGED-START: quality -->
## Quality Gates

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm test`
- Atualizar docs ao mudar funcionalidade
<!-- AIOX-MANAGED-END: quality -->

---

<!-- AIOX-MANAGED-START: steave -->
## Meta-Agent Global — Steave

Steave é o meta-agent estratégico. Orquestra, planeja, delega. **NUNCA executa operacionalmente.**

**Ativação:** `@steave` · `/steave`
**Arquivo:** `/home/bychrisr/projects/work/squads-aios/meta-agents/steave/steave.md`

Quando acionar Steave:
- Decisões estratégicas ou cross-projeto
- Priorização P0/P1 entre múltiplos repos
- Councils (Product, Growth, Architecture, Design, Quality)
- Análise crítica de decisões (`*challenge`)

**Regra:** decisão/síntese → Steave. arquivo/código/config → delega para Kai.
<!-- AIOX-MANAGED-END: steave -->

---

<!-- AIOX-MANAGED-START: shortcuts -->
## Agent Shortcuts

Ative um agent carregando o arquivo `.md` correspondente, assumindo a persona definida no YAML até `*exit`.

**Orquestrador operacional (use para rotear qualquer request):**
- `@kai`, `/kai` → `squads/kaven-squad/agents/kai.md`

**Meta-agent estratégico do squad:**
- `@kaven-squad-lead`, `/kaven-squad-lead` → `squads/kaven-squad/agents/kaven-squad-lead.md`

**Specialists:**
- `@kaven-architect`, `/kaven-architect` → `squads/kaven-squad/agents/kaven-architect.md`
- `@kaven-api-dev`, `/kaven-api-dev` → `squads/kaven-squad/agents/kaven-api-dev.md`
- `@kaven-frontend-dev`, `/kaven-frontend-dev` → `squads/kaven-squad/agents/kaven-frontend-dev.md`
- `@kaven-db-engineer`, `/kaven-db-engineer` → `squads/kaven-squad/agents/kaven-db-engineer.md`
- `@kaven-qa`, `/kaven-qa` → `squads/kaven-squad/agents/kaven-qa.md`
- `@kaven-devops`, `/kaven-devops` → `squads/kaven-squad/agents/kaven-devops.md`
- `@kaven-module-creator`, `/kaven-module-creator` → `squads/kaven-squad/agents/kaven-module-creator.md`
- `@kaven-docs`, `/kaven-docs` → `squads/kaven-squad/agents/kaven-docs.md` (Lumen — discovery-first, multi-model)
- `@kaven-lp-copywriter`, `/kaven-lp-copywriter` → `squads/kaven-squad/agents/kaven-lp-copywriter.md`
- `@kaven-product-intel`, `/kaven-product-intel` → `squads/kaven-squad/agents/kaven-product-intel.md`
<!-- AIOX-MANAGED-END: shortcuts -->

---

<!-- AIOX-MANAGED-START: codebase -->
## Project Map

- API backend: `apps/api/src/` (Fastify 5.6, 49 módulos)
- Admin frontend: `apps/admin/src/`
- Tenant frontend: `apps/tenant/src/`
- DB schema: `packages/database/prisma/schema.prisma` (261 models, 183 enums)
- Squad agents: `squads/kaven-squad/agents/`
- Squad knowledge: `squads/kaven-squad/data/kaven-kb.md`
- Docs técnicas: `docs/architecture/`
<!-- AIOX-MANAGED-END: codebase -->
