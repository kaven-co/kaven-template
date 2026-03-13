---
story_id: CS1.8
title: Product Council registration (Steave wiring + squad.yaml)
epic: EPIC-005
sprint: sprint-cs1
status: completed
assignee: Claude
priority: high
estimate: 1.5h
completedDate: 2026-02-16
pr: "#30"
tags: [cross-squad, product-council, registration, steave]
dependencies: [CS1.1, CS1.6, CS1.7]
blocks: [CS1.9]
---

# CS1.8: Product Council Registration

## Context

Registrar Product Council requer 2 modificações:
1. **Steave wiring** (`kaven-squad-lead.md`) — adicionar Product Council na seção cross_squad
2. **Squad.yaml** — adicionar task e workflow

Esta story também adiciona Leadership minds section (para `*think`).

## User Story

**Como** Steave (kaven-squad-lead)
**Eu quero** ter Product Council E Leadership minds registrados
**Para que** eu possa usar `*consult-product` e `*think`

## Acceptance Criteria

### Steave Wiring
- [ ] Seção `cross_squad` adicionada com 3 grupos:
  - `leadership_minds`: Musk, Jobs, Altman (para `*think`)
  - `product_minds`: Cagan, Patton, Cagan-Patton (para `*consult-product`)
  - `growth_minds`: Godin, Hormozi, Schwartz, Graham (placeholder para CS2.2)
- [ ] dependencies.tasks inclui `kaven-squad-lead-consult-product.md`
- [ ] Commands lista `*consult-product` e `*think`
- [ ] Collaboration table atualizada

### Squad.yaml
- [ ] Task `kaven-squad-lead-consult-product.md` em components.tasks
- [ ] Workflow `kaven-product-council.yaml` em components.workflows
- [ ] YAML parseia
- [ ] Append-only

## Technical Approach

### 1. Update `kaven-squad-lead.md`

**Add cross_squad section** (após dependencies):
```yaml
dependencies:
  tasks:
    - kaven-squad-lead-consult-product.md
    - kaven-squad-lead-think.md  # CS1.10
  cross_squad:
    squad: mmos-squad
    leadership_minds:  # Para *think
      - elon_musk: squads/mmos-squad/minds/elon_musk/system_prompts/System_Prompt_2.md
      - steve_jobs: squads/mmos-squad/minds/steve_jobs/system_prompts/System_Prompt_Steve_Jobs.md
      - sam_altman: squads/mmos-squad/minds/sam_altman/system_prompts/system-prompt-startup-advisor.md
    product_minds:  # Para *consult-product
      - marty_cagan: squads/mmos-squad/minds/marty_cagan/system_prompts/system-prompt-discovery-coach.md
      - jeff_patton: squads/mmos-squad/minds/jeff_patton/system_prompts/system-prompt-generalista-v1.0.md
      - cagan_patton: squads/mmos-squad/minds/cagan_patton/system_prompts/system-prompt-product-strategist.md
    growth_minds:  # Para *consult-growth (CS2.2)
      - seth_godin: squads/mmos-squad/minds/seth_godin/system_prompts/SYSTEM_PROMPT_SETH_GODIN_POSICIONAMENTO.md
      - alex_hormozi: squads/mmos-squad/minds/alex_hormozi/system_prompts/COGNITIVE_OS.md
      - eugene_schwartz: squads/mmos-squad/minds/eugene_schwartz/system_prompts/eugene-schwartz-v2.md
      - paul_graham: squads/mmos-squad/minds/paul_graham/system_prompts/paul_graham_ultimate_system_prompt.md
```

**Update Collaboration table**:
```markdown
| Product strategy & discovery | Product Council via `*consult-product` (Marty Cagan) |
| Story mapping & user journeys | Product Council via `*consult-product` (Jeff Patton) |
| Integrated product thinking | Product Council via `*consult-product` (Cagan-Patton) |
| Strategic vision & systems | Leadership thinking via `*think` (Elon Musk) |
| Product excellence & design | Leadership thinking via `*think` (Steve Jobs) |
| Startup strategy & scaling | Leadership thinking via `*think` (Sam Altman) |
```

### 2. Update `squad.yaml`

**Add** (append-only):
```yaml
components:
  agents:
    - kaven-squad-lead.md  # NEW
  tasks:
    - kaven-squad-lead-consult-product.md  # NEW
    - kaven-squad-lead-think.md  # NEW (CS1.10)
  workflows:
    - kaven-product-council.yaml  # NEW
```

### 3. Validation

```bash
# YAML parsing
python3 -c "import yaml; yaml.safe_load(open('squads/kaven-squad/squad.yaml'))"

# Mind paths (10 total: 3 leadership + 3 product + 4 growth)
for mind in elon_musk steve_jobs sam_altman marty_cagan jeff_patton cagan_patton seth_godin alex_hormozi eugene_schwartz paul_graham; do
  find squads/mmos-squad/minds/$mind/system_prompts/ -type f | head -1
done
```

## Files Changed

### Modified
- `squads/kaven-squad/agents/kaven-squad-lead.md` (+50 lines):
  - cross_squad section (NEW, 3 grupos de minds)
  - dependencies.tasks (+2 tasks)
  - Collaboration table (+6 rows)
- `squads/kaven-squad/squad.yaml` (+4 lines):
  - agents (+1: kaven-squad-lead.md)
  - tasks (+2: product, think)
  - workflows (+1: product-council)

## Definition of Done

- [ ] Steave wiring completo (3 mind groups)
- [ ] squad.yaml atualizado
- [ ] YAML parseia
- [ ] 10 mind paths existem
- [ ] Append-only
- [ ] Story completa
