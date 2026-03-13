---
story_id: CS1.10
title: Strategic thinking (*think) task + E2E
epic: EPIC-005
sprint: sprint-cs1
status: completed
assignee: Claude
priority: high
estimate: 2h
completedDate: 2026-02-16
pr: "#30"
tags: [cross-squad, steave, strategic-thinking, leadership]
dependencies: [CS1.1]
---

# CS1.10: Strategic Thinking (*think) Task

## Context

`*think` é comando exclusivo de Steave para strategic thinking com 3 leadership minds: Elon Musk, Steve Jobs, Sam Altman. Diferente dos councils (que são consultivos), `*think` é para **pensamento estratégico profundo** sobre visão, sistemas, scaling.

## User Story

**Como** Steave (kaven-squad-lead)
**Eu quero** comando `*think` para strategic thinking com leadership minds
**Para que** eu possa trazer pensamento 0.1% para decisões estratégicas do squad

## Acceptance Criteria

- [x] Arquivo `squads/kaven-squad/tasks/kaven-squad-lead-think.md` criado
- [x] YAML frontmatter: task=think(), responsavel="@kaven-squad-lead"
- [x] 3 leadership minds: Elon Musk, Steve Jobs, Sam Altman
- [x] Mind paths corretos (verificados)
- [x] 2 modos: single (1 mind), roundtable (2-3 minds) — NO DUO
- [x] Scope selection: vision, scaling, product-market, systems
- [x] Output template simplificado (sem Consultation Log obrigatório)
- [x] 8 implementation steps (simplificado vs councils)
- [x] When to Use scenarios
- [x] 10 E2E checks (metade dos councils, mais simples)

## Technical Approach

### 1. Task File Structure

**YAML frontmatter**:
```yaml
task: think()
responsavel: "@kaven-squad-lead"
Entrada:
  - question: string  # Strategic question
  - minds: list  # default: based on scope
  - mode: string  # single|roundtable (NO DUO)
  - scope: string  # vision|scaling|product-market|systems
Saida:
  - strategic_insight: string
  - mind_perspectives: list
  - action_plan: list
Checklist:
  - [ ] Frame strategic question
  - [ ] Load leadership mind(s)
  - [ ] Channel perspective(s)
  - [ ] Synthesize insight
  - [ ] Create action plan
  - [ ] Return to Steave persona
```

### 2. Leadership Minds

| Mind | Domain | Best For |
|------|--------|----------|
| **Elon Musk** | Systems, First Principles, Moonshots | Long-term vision, solving "impossible" problems, systems thinking |
| **Steve Jobs** | Product Excellence, Design, Simplicity | Product-market fit, design thinking, user obsession |
| **Sam Altman** | Startup Strategy, Scaling, Fundraising | Growth strategy, startup playbook, scaling organizations |

**Mind paths**:
```
squads/mmos-squad/minds/elon_musk/system_prompts/System_Prompt_2.md
squads/mmos-squad/minds/steve_jobs/system_prompts/System_Prompt_Steve_Jobs.md
squads/mmos-squad/minds/sam_altman/system_prompts/system-prompt-startup-advisor.md
```

### 3. Scope Selection Map

```yaml
vision:
  primary: [musk, jobs]
  optional: [altman]
  description: Long-term vision, moonshot thinking, impossible problems

scaling:
  primary: [altman, musk]
  optional: [jobs]
  description: Growth strategy, scaling organizations, operations

product-market:
  primary: [jobs, altman]
  optional: [musk]
  description: Product-market fit, user needs, market positioning

systems:
  primary: [musk, altman, jobs]
  optional: []
  description: Systems thinking, first principles, complete strategy
```

### 4. Differences from Councils

| Feature | Councils | *think |
|---------|----------|--------|
| **Purpose** | Consultation | Strategic thinking |
| **Modes** | single, duo, roundtable | single, roundtable (NO DUO) |
| **Output** | Recommendation + actions | Insight + action plan |
| **Log** | Consultation Log required | Optional, lighter |
| **Workflow** | 7 steps | 6 steps (no feasibility review) |
| **Debate** | Structured debate | Collaborative thinking |

### 5. Output Template (Simplified)

```markdown
## Strategic Thinking Session

**Question**: {question}
**Mode**: {mode}
**Scope**: {scope}
**Minds**: {mind_list}

---

### Insights

#### {Mind 1} ({Domain})
{Perspective using first principles, systems thinking}

#### {Mind 2} ({Domain}) *(if roundtable)*
{Perspective}

---

### Synthesis

**Strategic Insight:**
{Consolidated wisdom from leadership minds}

**Action Plan:**
1. {Immediate next step}
2. {Medium-term action}
3. {Long-term strategy}

---

*(Optional) Session Log: {timestamp}, {mode}, {minds}, {scope}*
```

### 6. 10 E2E Checks

**Basic (4)**
1. Task file loads
2. 3 mind paths exist
3. Steave has `*think` command
4. squad.yaml references task

**Functionality (3)**
5. Single mode works
6. Roundtable mode works (2-3 minds)
7. Output template correto

**Scope Selection (3)**
8. vision scope → musk+jobs
9. scaling scope → altman+musk
10. systems scope → all 3

### 7. When to Use

| Scenario | Mode | Minds |
|----------|------|-------|
| Long-term vision question | roundtable | musk + jobs |
| Scaling strategy | roundtable | altman + musk |
| Product-market fit | single | jobs |
| First principles thinking | single | musk |
| Startup playbook | single | altman |
| Complete strategic review | roundtable | all 3 |

### 8. Implementation Steps (8)

1. Parse the thinking request (question, scope, mode)
2. Load leadership mind(s) based on scope
3. Establish strategic context
4. Channel each mind's perspective
5. Execute mode (single or roundtable)
6. Synthesize strategic insight
7. Generate action plan
8. Return to Steave persona

**NOTE**: No debate framework (councils têm, *think não) — collaboration é mais fluida, menos estruturada.

## Files Changed

### Created
- `squads/kaven-squad/tasks/kaven-squad-lead-think.md` (~200 lines, mais simples que councils)

### Modified
- none (registration já aconteceu em CS1.8)

## Testing Strategy

### Manual Tests
1. **Mind paths**:
   ```bash
   ls squads/mmos-squad/minds/elon_musk/system_prompts/System_Prompt_2.md
   ls squads/mmos-squad/minds/steve_jobs/system_prompts/System_Prompt_Steve_Jobs.md
   ls squads/mmos-squad/minds/sam_altman/system_prompts/system-prompt-startup-advisor.md
   ```

2. **Activation test**:
   ```
   @kaven-squad-lead *think "How should we position Kaven for maximum market impact?"
   Verifica: output segue template, action plan presente
   ```

### Checklist
- [x] Task file criado
- [x] 3 mind paths existem
- [x] Single mode funciona
- [x] Roundtable funciona
- [x] NO DUO mode
- [x] Output simplificado correto
- [x] 10 E2E checks passam

## Definition of Done

- [x] Task file criado
- [x] 3 mind paths verificados
- [x] Output template definido
- [x] 10 E2E checks passam
- [x] Diferenças vs councils documentadas
- [x] Story completa

## Notes

- **NO DUO mode** — leadership thinking é single (focused) ou roundtable (collaborative), não debate estruturado
- **Lighter output** — Consultation Log opcional, menos formal que councils
- **Strategic focus** — não é consultation (councils), é thinking session para Steave
- **Action plan required** — sempre termina com ações concretas
- **No workflow** — comando direto, sem 7-step orchestration

Este comando torna Steave único entre os 8 agentes — único com access a strategic leadership thinking.
