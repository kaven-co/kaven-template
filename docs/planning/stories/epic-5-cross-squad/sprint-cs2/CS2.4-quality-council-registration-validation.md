---
story_id: CS2.4
title: Quality Council registration (Shield update) + E2E (20 checks)
epic: EPIC-005
sprint: sprint-cs2
status: completed
assignee: Claude
priority: high
estimate: 1.5h
tags: [cross-squad, quality-council, shield, registration]
dependencies: [CS2.3]
completedDate: 2026-02-16
pr: "#30"
---

# CS2.4: Quality Council Registration + E2E

## Context

Registrar Quality Council no Shield e validar com **20 checks** (10 standard + 10 extended). Menos checks que outros councils pois tem apenas 2 minds.

## Acceptance Criteria

### Registration
- [x] `kaven-qa.md` += `*consult-quality` command
- [x] cross_squad section com 2 minds
- [x] Collaboration table atualizada
- [x] squad.yaml += task e workflow
- [x] YAML parseia

### E2E Validation (20 checks)
- [x] Standard (10): basic, functionality, scope
- [x] Extended (10): frameworks, edge cases, integration
- [x] Kent Beck output DIFERENTE do Architecture Council
- [x] Todos passam

## Technical Approach

### 1. Shield Update (`kaven-qa.md`)

**Add command**:
```yaml
commands:
  - "*run-security - Run complete security test suite..."
  - "*run-gdpr - Run GDPR compliance tests..."
  - "*add-test {type} {target} - Create new test..."
  - "*run-all - Run complete test suite..."
  - "*check-coverage - Check coverage thresholds..."
  - "*consult-quality {question} - Consult Quality Council (Kent Beck, Daniel Kahneman) for testing strategy, TDD approach, risk analysis, or coverage decisions. Options: --minds, --mode (single|duo)"
  - "*help - Show available commands..."
  - "*exit - Deactivate Shield..."
```

**Add cross_squad**:
```yaml
dependencies:
  tasks:
    - kaven-qa-run-security.md
    - kaven-qa-run-gdpr.md
    - kaven-qa-add-test.md
    - kaven-qa-consult-quality.md  # NEW
  cross_squad:  # NEW SECTION
    squad: mmos-squad
    minds:
      - kent_beck: squads/mmos-squad/minds/kent_beck/system_prompts/system-prompt-dev-workflow-v1.0.md
      - daniel_kahneman: squads/mmos-squad/minds/daniel_kahneman/system_prompts/System_Prompt_Daniel_Kahneman.md
```

**Update Collaboration table** (+2 rows):
```markdown
| TDD strategy & test quality | Quality Council via `*consult-quality` (Kent Beck) |
| Risk analysis & decision-making | Quality Council via `*consult-quality` (Daniel Kahneman) |
```

### 2. Squad.yaml Update

```yaml
components:
  tasks:
    - kaven-qa-consult-quality.md  # NEW
  workflows:
    - kaven-quality-council.yaml  # NEW
```

### 3. E2E Checks (20)

**Standard (10)**:
1-3. Basic (task loads, workflow valid, 2 paths exist)
4-5. Registration (shield command, squad.yaml)
6-7. Functionality (single, duo)
8. Consultation Log presente
9. Output template correto
10. Scope selection works

**Extended (10)**:
11-12. Frameworks (steel_man, socratic)
13-15. Edge cases (mind missing, empty question, long question)
16-17. Integration (shield invokes, workflow trigger)
18. Evidence bundle
19. Consultation Log completo
20. **Kent Beck output DIFERENTE do Architecture Council** (CRÍTICO)

**Check #20 validation**:
```
Test: Consultar Kent Beck no Architecture Council sobre "test infrastructure design"
      vs Quality Council sobre "TDD strategy for this feature"

Expected: Architecture output menciona system design/patterns
          Quality output menciona TDD methodology/test quality

Validation: Outputs são meaningfully different (não apenas wording)
```

## Files Changed

### Modified
- `squads/kaven-squad/agents/kaven-qa.md` (+25 lines: command, cross_squad, tasks, collaboration)
- `squads/kaven-squad/squad.yaml` (+2 lines: task, workflow)

## Definition of Done

- [x] Shield wiring completo
- [x] squad.yaml atualizado
- [x] 20 E2E checks definidos
- [x] Standard (10) passam
- [x] Extended (10) passam
- [x] Kent Beck differentiation verificada
- [x] Story completa

## Files Changed

### Modified
- `squads/kaven-squad/agents/kaven-qa.md` (+30 lines)
- `squads/kaven-squad/squad.yaml` (+2 lines)

### Created
- `squads/kaven-squad/validation/quality-council-e2e-report.md` (20 E2E checks, 100% pass rate)
