# CS4.1 — Workflow `greenfield-kaven.yaml`

> **Epic:** 5 (Cross-Squad) | **Sprint:** CS4 | **Agent:** @kaven-architect
> **Priority:** P1
> **Depends on:** C3.1 (AIOX Environment Bootstrap)

---

## Contexto

O `AIOX-KAVEN-INTEGRATION.md` (GAP-2) identifica um gap crítico no fluxo de orquestração: **não existe um workflow que una as Phases 0-0.6 (bootstrap Kaven) com as Phases 1-2 (planning AIOX genérico) e Phase 3 (execução kaven-squad)**.

Atualmente, um desenvolvedor que queira usar AIOX + Kaven juntos precisa:
1. Saber executar manualmente cada phase
2. Conhecer quando chamar agents AIOX genéricos vs. agents do kaven-squad
3. Lembrar de rodar `@devops *environment-bootstrap` antes de qualquer planning
4. Saber quando acionar Kai como dispatcher vs. agents diretos

O `greenfield-fullstack.yaml` do AIOX é agnóstico de stack (correto por design) e não pode/deve ter awareness do Kaven. O `kaven-new-feature.yaml` cobre apenas features individuais dentro de um sprint.

Esta story cria o `greenfield-kaven.yaml` — o workflow que orquestra o fluxo completo, referenciando o `greenfield-fullstack.yaml` do AIOX para as phases genéricas e delegando para os agents do kaven-squad nas phases de execução. É o "manual de operação" executável do processo end-to-end.

## User Story

**As a** developer using AIOX + Kaven together to build a new SaaS,
**I want to** execute a single workflow that guides me through all phases from bootstrap to first feature delivery,
**So that** I don't need to memorize which agents to call at each phase or risk skipping critical setup steps.

---

## Acceptance Criteria

- [ ] Arquivo `squads/kaven-squad/workflows/greenfield-kaven.yaml` existe e é parseable pelo AIOX workflow executor sem erros
- [ ] O workflow define Phase 0 (Bootstrap Kaven) com steps: `kaven-init`, `env-setup`, `aiox-install`, `environment-bootstrap`, `squad-install`
- [ ] Phase 1 (Discovery & Planning) referencia `greenfield-fullstack.yaml` do AIOX via `reference:` field, com `kaven_modifications:` declarados
- [ ] Phase 2 (Document Sharding) referencia `greenfield-fullstack.yaml` com modificação para stories com seção "Kaven Impact"
- [ ] Phase 3 (Development Cycle) declara `orchestrator: kai` e substitui agents genéricos pelos do kaven-squad
- [ ] O workflow é documentado no `squads/kaven-squad/README.md` com exemplo de invocação
- [ ] Kaven modifications em Phase 1 incluem: `pm-create-prd` → output adicional `kaven-mapping.md`; `architect-create-architecture` → consulta obrigatória `@kaven-architect`
- [ ] Phase 3 define agent substitutions explícitas: `@dev → @kaven-api-dev + @kaven-frontend-dev (via Kai)`, `@qa → @kaven-qa`, `@devops → @kaven-devops`
- [ ] Arquivo inclui `version: "1.0.0"` e `aiox_min_version: "5.0.3"`

---

## Technical Notes

### Estrutura do Workflow

```yaml
# squads/kaven-squad/workflows/greenfield-kaven.yaml
workflow:
  id: greenfield-kaven
  name: Greenfield Kaven Project
  version: "1.0.0"
  aiox_min_version: "5.0.3"
  description: >-
    Fluxo completo para criar um novo SaaS sobre o Kaven Framework com AIOX.
    Phases 0-0.6: bootstrap Kaven-specific.
    Phases 1-2: planning via AIOX genérico (referencia greenfield-fullstack.yaml).
    Phase 3: execução via kaven-squad agents (orquestrado por Kai).
  tags: [greenfield, kaven, full-stack]

  prerequisites:
    tools:
      - name: kaven-cli
        version: ">=0.4.0"
        check: "kaven --version"
      - name: node
        version: ">=20.0.0"
        check: "node --version"
      - name: pnpm
        version: ">=8.0.0"
        check: "pnpm --version"
    accounts:
      - name: kaven-marketplace
        description: "Kaven account for module downloads (starter tier minimum)"

  phases:
    - phase: 0
      name: "Bootstrap Kaven"
      description: "Scaffold o projeto Kaven e instalar AIOX + kaven-squad"
      executor: human
      steps:
        - id: kaven-init
          name: "Initialize Kaven project"
          command: "kaven init <project-name> --with-squad"
          description: >-
            Clona kaven-framework, configura .env, instala AIOX Core,
            e executa environment-bootstrap automaticamente.
          output:
            - "<project-name>/.aiox-core/ (AIOX Core instalado)"
            - "<project-name>/.aiox/config.yaml"
            - "<project-name>/.aiox/environment-report.json"
            - "<project-name>/squads/kaven-squad/ (squad instalado)"
          verify: "ls squads/kaven-squad/agents/ | wc -l # deve retornar 10+"

        - id: env-setup
          name: "Configure environment variables"
          description: >-
            Copiar .env.example → .env, preencher DATABASE_URL, REDIS_URL,
            JWT_SECRET. Rodar docker:up, db:migrate, db:seed.
          commands:
            - "cp .env.example .env"
            - "pnpm docker:up"
            - "pnpm db:migrate"
            - "pnpm db:seed"
          verify: "curl http://localhost:8000/health # deve retornar 200"

        - id: kaven-config
          name: "Configure feature flags and modules"
          description: >-
            Selecionar capabilities por tier e ativar módulos necessários.
          commands:
            - "kaven config features --tier <starter|complete|pro|enterprise>"
            - "kaven module activate <modules>"
            - "pnpm db:seed # re-seed com capabilities configuradas"
          optional: true

    - phase: 1
      name: "Discovery & Planning"
      description: "Planning com agents AIOX genéricos — modificado para awareness Kaven"
      reference: ".aiox-core/development/workflows/greenfield-fullstack.yaml#phases[1]"
      kaven_modifications:
        pm-create-prd:
          description: "PRD deve referenciar models Kaven existentes (kaven-kb.md)"
          additional_output: "docs/kaven-mapping.md"
          kaven_kb_reference: "squads/kaven-squad/knowledge/kaven-kb.md"
        architect-create-architecture:
          description: "Arquitetura deve ser validada pelo @kaven-architect"
          mandatory_consultation: "@kaven-architect"
          validation_criteria:
            - "10-layer middleware stack compatível"
            - "RLS patterns respeitados"
            - "schema split (base + extended) considerado"
            - "module system usado para features isoláveis"
        ux-create-frontend-spec:
          description: "Spec deve usar @kaven/ui (76+ components, Frost theme)"
          component_library: "@kaven/ui-base"
          apps_available: [admin, tenant]

    - phase: 2
      name: "Document Sharding"
      description: "Sharding de docs com awareness Kaven"
      reference: ".aiox-core/development/workflows/greenfield-fullstack.yaml#phases[2]"
      kaven_modifications:
        po-shard-documents:
          description: "Stories devem incluir seção Kaven Impact"
          story_template_addition: |
            ## Kaven Impact
            - Models afetados: [lista]
            - Routes afetadas: [lista]
            - Components afetados: [lista]
            - Migrations necessárias: [sim/não]
            - Feature flags: [lista]

    - phase: 3
      name: "Development Cycle (kaven-squad)"
      description: "Execução com agents especializados do kaven-squad"
      orchestrator: kai
      workflow_reference: "kaven-sprint-cycle.yaml"
      agent_substitutions:
        "@dev": "@kaven-api-dev + @kaven-frontend-dev (via Kai routing)"
        "@qa": "@kaven-qa"
        "@devops": "@kaven-devops"
        "@data-engineer": "@kaven-db-engineer"
        "@architect (review)": "@kaven-architect"
      wave_execution:
        wave_1:
          parallel: true
          agents: ["@kaven-architect (review)", "@kaven-db-engineer (schema design)"]
        wave_2:
          parallel: true
          depends_on: wave_1
          agents: ["@kaven-api-dev", "@kaven-frontend-dev"]
        wave_3:
          sequential: true
          depends_on: wave_2
          agents: ["@kaven-qa", "@kaven-devops"]
```

### Localização

```
squads/kaven-squad/
├── workflows/
│   ├── greenfield-kaven.yaml      # este arquivo
│   ├── kaven-new-feature.yaml     # já existe — features individuais
│   └── kaven-sprint-cycle.yaml    # referenciado pela phase 3 — criar se não existe
```

### Referência ao `greenfield-fullstack.yaml`

O campo `reference:` segue a sintaxe do AIOX workflow executor: `<path>#<selector>`. O executor faz merge das modificações Kaven sobre o workflow base, sem alterar o arquivo original do AIOX Core.

### Documentação no README do kaven-squad

Após criação do arquivo, o `squads/kaven-squad/README.md` deve incluir:

```markdown
## Workflows

### `greenfield-kaven` — Projeto novo completo
Fluxo end-to-end para criar um SaaS sobre Kaven Framework + AIOX.

**Invocação:** `@kai *orchestrate greenfield-kaven`

**Quando usar:** Projeto novo que vai usar Kaven Framework como base.
Inclui bootstrap, planning AIOX, e execução via kaven-squad.

**Pré-requisito:** `kaven init <name> --with-squad` já executado.
```

### Arquivos Afetados

| Acao | Arquivo |
|------|---------|
| ADD | `squads/kaven-squad/workflows/greenfield-kaven.yaml` |
| MODIFY | `squads/kaven-squad/README.md` (documentar workflow) |
| ADD | `squads/kaven-squad/workflows/kaven-sprint-cycle.yaml` (se não existir) |

---

## Definition of Done

- [ ] `greenfield-kaven.yaml` existe em `squads/kaven-squad/workflows/`
- [ ] AIOX workflow executor parseia o arquivo sem erros de validação de schema
- [ ] Phases 0, 1, 2, 3 definidas com estrutura completa
- [ ] Referências ao `greenfield-fullstack.yaml` com campo `reference:` correto
- [ ] Agent substitutions para Phase 3 declaradas explicitamente
- [ ] `squads/kaven-squad/README.md` documenta o workflow com exemplo de invocação
- [ ] PR mergeado na main do kaven-framework (squad directory)
