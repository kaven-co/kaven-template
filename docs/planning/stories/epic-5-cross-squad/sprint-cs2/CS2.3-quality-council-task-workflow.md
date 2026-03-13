---
story_id: CS2.3
title: Quality Council task + workflow
epic: EPIC-005
sprint: sprint-cs2
status: completed
assignee: Claude
priority: high
estimate: 2.5h
completedDate: 2026-02-16
pr: "#30"
tags: [cross-squad, quality-council, shield]
dependencies: []
blocks: [CS2.4]
---

# CS2.3: Quality Council Task + Workflow

## Context

Quality Council para Shield consultar 2 quality/risk minds: Kent Beck (TDD, testing), Daniel Kahneman (risk analysis, cognitive biases).

**CRÍTICO**: Kent Beck já aparece no Architecture Council — channeling instructions DEVEM ser diferentes:
- **Architecture**: patterns, testing strategy, evolutionary design, DX
- **Quality**: TDD methodology, risk analysis, coverage strategy, quality metrics

## Acceptance Criteria

### Task File
- [x] `squads/kaven-squad/tasks/kaven-qa-consult-quality.md` criado (350 lines)
- [x] 2 minds: Kent Beck, Daniel Kahneman
- [x] **Kent Beck channeling instructions DIFERENTES do Architecture Council**
- [x] Scope selection: strategy, tdd, risk, coverage
- [x] 2 modos: single, duo (roundtable com 2 minds = duo)
- [x] Output templates adaptados para 2 minds
- [x] Consultation Log obrigatório

### Workflow File
- [x] `squads/kaven-squad/workflows/kaven-quality-council.yaml` criado (213 lines)
- [x] 7 steps (simplificados para 2 minds)
- [x] Mind selection map
- [x] Trigger: `@kaven *quality-council`

## Technical Approach

### 1. Task File

**Minds**:
- Kent Beck: TDD, test-first development, simple design, refactoring, quality culture
- Daniel Kahneman: Risk analysis, cognitive biases, decision-making, thinking fast & slow

**Mind paths**:
```
squads/mmos-squad/minds/kent_beck/system_prompts/system-prompt-dev-workflow-v1.0.md  # SAME FILE as Architecture
squads/mmos-squad/minds/daniel_kahneman/system_prompts/System_Prompt_Daniel_Kahneman.md
```

**CRITICAL: Kent Beck Differentiation Section**:
```markdown
## Kent Beck Channeling Context

Kent Beck appears in **2 councils** with different contexts:

### Architecture Council (Atlas)
- **Focus**: Testing architecture, evolutionary design patterns, developer experience
- **Questions**: "How should we architect our test infrastructure?" / "What patterns support testability?"
- **Output**: System design recommendations, architectural patterns

### Quality Council (Shield)
- **Focus**: TDD methodology, quality metrics, risk-based testing, coverage strategy
- **Questions**: "What's our TDD strategy for this feature?" / "How do we assess test quality?"
- **Output**: Testing approach, quality gates, risk mitigation

**Channeling Instructions**: When loading Kent Beck for Quality Council, emphasize TDD methodology,
test quality assessment, and risk-based testing. Avoid architecture-level system design discussions.
```

**Scope selection** (4 scopes):
```yaml
strategy:
  primary: [beck, kahneman]
  description: "Overall quality strategy and risk management"

tdd:
  primary: [beck]
  optional: [kahneman]
  description: "Test-driven development methodology and practices"

risk:
  primary: [kahneman, beck]
  description: "Risk analysis, cognitive biases in testing, decision-making"

coverage:
  primary: [beck]
  optional: [kahneman]
  description: "Coverage strategy, what to test, test quality metrics"
```

**Modes** (2 only):
- `single`: 1 mind consulted
- `duo`: 2 minds discuss (same as roundtable structure, but only 2 minds)

**NOTE**: No separate "roundtable" mode — duo IS the multi-mind mode for 2 minds.

### 2. Workflow File

**Simplified for 2 minds**:
- Steps 1-7 same structure
- cross_pollination step always runs (no skip_if)
- Mind selection simpler (only 2 combinations)

**Mind selection map**:
```yaml
mind_selection:
  strategy: [beck, kahneman]
  tdd: [beck], optional: [kahneman]
  risk: [kahneman, beck]
  coverage: [beck], optional: [kahneman]
```

## Files Changed

### Created
- `squads/kaven-squad/tasks/kaven-qa-consult-quality.md` (350 lines, +kent beck differentiation section)
- `squads/kaven-squad/workflows/kaven-quality-council.yaml` (213 lines, simplified for 2 minds)

## Definition of Done

- [x] 2 arquivos criados
- [x] 2 mind paths verificados (both exist in mmos-squad)
- [x] Kent Beck differentiation section presente (lines 49-73 in task file)
- [x] Channeling instructions explícitas (Step 4, lines 224-244)
- [x] Scope selection (4 scopes: strategy, tdd, risk, coverage)
- [x] 2 modos (single, duo)
- [x] Output templates adaptados (single mode + duo mode)
- [x] Story completa
