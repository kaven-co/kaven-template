---
story_id: CS1.4
title: Architecture Council registration (Atlas update + squad.yaml)
epic: EPIC-005
sprint: sprint-cs1
status: completed
assignee: Claude
priority: high
estimate: 1h
tags:
  - cross-squad
  - architecture-council
  - registration
  - atlas
dependencies:
  - CS1.2
  - CS1.3
blocks:
  - CS1.5
completedDate: 2026-02-16
pr: "#30"
---

# CS1.4: Architecture Council Registration

## Context

Registrar o Architecture Council no kaven-squad requer 2 modificações:

1. **Atlas agent update** (`kaven-architect.md`):
   - Add `*consult-architecture` command
   - Add `cross_squad` section com 3 architecture minds
   - Update collaboration table
   - Update commands list

2. **Squad manifest update** (`squad.yaml`):
   - Add `kaven-architect-consult-architecture.md` em `tasks`
   - Add `kaven-architecture-council.yaml` em `workflows`

Mudanças são **append-only** para minimizar merge conflicts.

## User Story

**Como** Atlas (kaven-architect)
**Eu quero** ter o Architecture Council registrado no meu agent file e no squad manifest
**Para que** eu possa consultar os architecture minds via `*consult-architecture` command

## Acceptance Criteria

### Atlas Agent Update
- [x] Command `*consult-architecture` adicionado à lista de commands
- [x] Seção `cross_squad` adicionada com:
  - squad: mmos-squad
  - 3 minds: mitchell_hashimoto, kent_beck, guillermo_rauch
  - Paths verificados e corretos
- [x] Collaboration table atualizada com Architecture Council entries
- [x] Help text atualizado

### Squad.yaml Update
- [x] Task `kaven-architect-consult-architecture.md` adicionado em `components.tasks`
- [x] Workflow `kaven-architecture-council.yaml` adicionado em `components.workflows`
- [x] YAML parseia corretamente após mudanças
- [x] Append-only (não remove/reordena itens existentes)

## Technical Approach

### 1. Update `kaven-architect.md`

**Location**: `squads/kaven-squad/agents/kaven-architect.md`

**Changes**:

A. **Add command** (dentro da seção `commands:` no YAML block):
```yaml
commands:
  - "*review-feature {description} - Review a proposed feature..."
  - "*audit-security {scope} - Audit security layers..."
  - "*analyze-impact {change} - Analyze the impact..."
  - "*design-schema {requirements} - Design a new Prisma model..."
  - "*consult-architecture {question} - Consult the Architecture Council (Mitchell Hashimoto, Kent Beck, Guillermo Rauch) for infrastructure, testing, DX, or system design decisions. Options: --minds, --mode (single|duo|roundtable), --framework (steel_man|socratic|hegelian)"
  - "*help - Show available commands..."
  - "*exit - Deactivate Atlas..."
```

B. **Add `cross_squad` section** (após `dependencies:` no YAML block):
```yaml
dependencies:
  tasks:
    - kaven-architect-review-feature.md
    - kaven-architect-audit-security.md
    - kaven-architect-consult-architecture.md  # NEW
  templates:
    - architecture-decision-record.md
    - schema-design-template.prisma
  checklists:
    - feature-review-checklist.md
    - security-audit-checklist.md
  data:
    - middleware-stack-reference.md
    - schema-reference.md
  cross_squad:  # NEW SECTION
    squad: mmos-squad
    minds:
      - mitchell_hashimoto: squads/mmos-squad/minds/mitchell_hashimoto/system_prompts/system-prompt-infrastructure-expert-v1.0.md
      - kent_beck: squads/mmos-squad/minds/kent_beck/system_prompts/system-prompt-dev-workflow-v1.0.md
      - guillermo_rauch: squads/mmos-squad/minds/guillermo_rauch/system_prompts/System_Prompt_Guillermo_Rauch.md
```

C. **Update Quick Commands table** (após o YAML block):
```markdown
## Quick Commands

| Command | Description |
|---------|-------------|
| `*review-feature` | Review feature for architectural compliance |
| `*audit-security` | Audit security layers for module or system |
| `*analyze-impact` | Analyze cross-monorepo change impact |
| `*design-schema` | Design new Prisma model following conventions |
| `*consult-architecture` | Consult Architecture Council (Hashimoto, Beck, Rauch) |
| `*help` | Show available commands |
| `*exit` | Deactivate agent |
```

D. **Update Agent Collaboration table** (adicionar linhas):
```markdown
## Agent Collaboration

| Need | Delegate To |
|------|-------------|
| Implement Fastify routes/services | @kaven-api-dev (Bolt) |
| Implement Next.js pages/components | @kaven-frontend-dev (Pixel) |
| Design database schema details | @kaven-db-engineer (Schema) |
| Write/run security tests | @kaven-qa (Shield) |
| Create CLI module packaging | @kaven-module-creator (Forge) |
| Setup CI/CD and infrastructure | @kaven-devops (Deploy) |
| Infrastructure architecture decisions | Architecture Council via `*consult-architecture` (Mitchell Hashimoto) |
| Testing architecture & TDD strategy | Architecture Council via `*consult-architecture` (Kent Beck) |
| DX & modern tooling decisions | Architecture Council via `*consult-architecture` (Guillermo Rauch) |
```

### 2. Update `squad.yaml`

**Location**: `squads/kaven-squad/squad.yaml`

**Changes** (append-only):

A. **Add task** (em `components.tasks`):
```yaml
components:
  tasks:
    - kaven-architect-review-feature.md
    - kaven-architect-audit-security.md
    - kaven-architect-consult-architecture.md  # NEW - line 27
    - kaven-api-dev-add-endpoint.md
    # ... rest
```

B. **Add workflow** (em `components.workflows`):
```yaml
components:
  workflows:
    - kaven-new-feature.yaml
    - kaven-new-module.yaml
    - kaven-security-audit.yaml
    - kaven-sprint-cycle.yaml
    - kaven-design-council.yaml
    - kaven-architecture-council.yaml  # NEW - line 50
```

### 3. Validation

```bash
# 1. YAML parsing
python3 -c "import yaml; yaml.safe_load(open('squads/kaven-squad/squad.yaml'))"

# 2. Mind paths exist
ls squads/mmos-squad/minds/mitchell_hashimoto/system_prompts/system-prompt-infrastructure-expert-v1.0.md
ls squads/mmos-squad/minds/kent_beck/system_prompts/system-prompt-dev-workflow-v1.0.md
ls squads/mmos-squad/minds/guillermo_rauch/system_prompts/System_Prompt_Guillermo_Rauch.md

# 3. Files referenced in squad.yaml exist
ls squads/kaven-squad/tasks/kaven-architect-consult-architecture.md
ls squads/kaven-squad/workflows/kaven-architecture-council.yaml
```

## Files Changed

### Modified
- `squads/kaven-squad/agents/kaven-architect.md` (+30 lines)
  - commands section (+1 command)
  - dependencies.tasks (+1 task)
  - cross_squad section (NEW, +8 lines)
  - Quick Commands table (+1 row)
  - Agent Collaboration table (+3 rows)

- `squads/kaven-squad/squad.yaml` (+2 lines)
  - components.tasks (+1 line)
  - components.workflows (+1 line)

### Total Changes
+32 lines (append-only, minimiza merge conflicts)

## Testing Strategy

### Manual Tests
1. **Atlas agent loads correctly**
   ```
   @kaven *activate kaven-architect
   Verifica: greeting + *help lista *consult-architecture
   ```

2. **squad.yaml parseia**
   ```bash
   python3 -c "import yaml; print('OK' if yaml.safe_load(open('squads/kaven-squad/squad.yaml')) else 'FAIL')"
   ```

3. **Mind paths validation**
   ```bash
   for file in kaven-architect-consult-architecture.md kaven-architecture-council.yaml; do
     test -f "squads/kaven-squad/tasks/$file" -o -f "squads/kaven-squad/workflows/$file" && echo "$file: OK" || echo "$file: MISSING"
   done
   ```

### Checklist
- [x] Atlas command list updated
- [x] cross_squad section added
- [x] Collaboration table updated
- [x] squad.yaml tasks updated
- [x] squad.yaml workflows updated
- [x] YAML parseia sem erros
- [x] Mind paths existem
- [x] Append-only (não removeu/reordenou)

## Definition of Done

- [x] 2 arquivos modificados e commitados
- [x] Atlas *help lista *consult-architecture
- [x] squad.yaml parseia corretamente
- [x] Mind paths validados
- [x] Append-only strategy seguida
- [x] Story marcada como completa

## Notes

- **Append-only strategy** — adiciona ao final das listas, não reordena. Minimiza merge conflicts.
- **Kent Beck aparece aqui E no Quality Council** — channeling instructions diferentes garantem contextos separados
- **3 entries na collaboration table** — um por mind, mostrando especialização de cada
- **cross_squad section é nova** — Atlas não tinha antes, agora tem

Esta registration torna o Architecture Council acessível via `@kaven-architect *consult-architecture`.

## Implementation Notes (2026-02-16)

### Path Correction
Story file had incorrect path for Guillermo Rauch:
- ❌ Story spec: `System_Prompt_Guillermo_Rauch.md`
- ✅ Actual file: `system-prompt-dx-specialist-v1.0.md`

Path was corrected during implementation.

### Files Modified
1. `squads/kaven-squad/agents/kaven-architect.md` (+32 lines)
   - commands: +1 command (*consult-architecture)
   - dependencies.tasks: +1 task
   - cross_squad: NEW section (+8 lines)
   - Quick Commands table: +1 row
   - Agent Collaboration table: +3 rows

2. `squads/kaven-squad/squad.yaml` (+2 lines)
   - components.tasks: +1 task (line 28)
   - components.workflows: +1 workflow (line 55)

### Validation Results
- ✅ YAML parsing: successful
- ✅ Mind paths: all 3 verified and exist
- ✅ Append-only: no deletions or reordering
- ✅ All acceptance criteria met
