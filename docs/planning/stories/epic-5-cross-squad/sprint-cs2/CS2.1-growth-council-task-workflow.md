---
story_id: CS2.1
title: Growth Council task + workflow
epic: EPIC-005
sprint: sprint-cs2
status: completed
assignee: Claude
priority: high
estimate: 3h
tags: [cross-squad, growth-council, steave]
dependencies: []
blocks: [CS2.2]
completedDate: 2026-02-16
pr: "#30"
---

# CS2.1: Growth Council Task + Workflow

## Context

Growth Council para Steave consultar 4 growth/marketing minds: Seth Godin (positioning), Alex Hormozi (offers/sales), Eugene Schwartz (copywriting), Paul Graham (startup wisdom, opcional).

**CRÍTICO**: Hormozi `COGNITIVE_OS.md` é ~8k tokens — adicionar WARNING recomendando Sonnet e single/duo mode.

## Acceptance Criteria

### Task File
- [x] `squads/kaven-squad/tasks/kaven-squad-lead-consult-growth.md` criado
- [x] 4 minds: Godin, Hormozi, Schwartz, Graham (opcional)
- [x] **WARNING sobre Hormozi token size** (~60k tokens, recomendar single/duo)
- [x] Scope selection: pricing, positioning, copy, gtm
- [x] 3 modos, 3 frameworks, output templates
- [x] Consultation Log obrigatório

### Workflow File
- [x] `squads/kaven-squad/workflows/kaven-growth-council.yaml` criado
- [x] 7 steps, 3 execution modes
- [x] Mind selection map com Hormozi notes
- [x] Trigger: `@kaven *growth-council`

## Technical Approach

### 1. Task File

**Minds**:
- Seth Godin: Positioning, marketing, tribes, purple cow
- Alex Hormozi: Offers, value equation, $100M offers, sales
- Eugene Schwartz: Copywriting, awareness levels, Breakthrough Advertising
- Paul Graham: Startup essays, growth hacking, YC wisdom (4º mind opcional)

**Mind paths**:
```
squads/mmos-squad/minds/seth_godin/system_prompts/SYSTEM_PROMPT_SETH_GODIN_POSICIONAMENTO.md
squads/mmos-squad/minds/alex_hormozi/system_prompts/COGNITIVE_OS.md  # ⚠️ ~8k tokens
squads/mmos-squad/minds/eugene_schwartz/system_prompts/eugene-schwartz-v2.md
squads/mmos-squad/minds/paul_graham/system_prompts/paul_graham_ultimate_system_prompt.md
```

**CRITICAL WARNING Section**:
```markdown
## ⚠️ Token Budget Warning

**Alex Hormozi's COGNITIVE_OS.md** is approximately **8,000 tokens**. Recommendations:

1. **Use Claude Sonnet** when consulting Hormozi (Haiku may truncate)
2. **Prefer single or duo mode** over roundtable when including Hormozi
3. **Consider excluding Hormozi** for quick consultations (use Godin + Schwartz)
4. **Future optimization**: Create summarized version of COGNITIVE_OS.md

When Hormozi is included in roundtable with all 4 minds, total context can exceed 25k tokens.
```

**Scope selection**:
```yaml
pricing:
  primary: [hormozi, godin]
  optional: [graham]
  note: "Hormozi for value equation, Godin for positioning angle"

positioning:
  primary: [godin, schwartz]
  optional: [hormozi]
  note: "Godin for market positioning, Schwartz for messaging"

copy:
  primary: [schwartz, hormozi]
  optional: [godin]
  note: "Schwartz for awareness levels, Hormozi for offer framing"

gtm:
  primary: [godin, hormozi, schwartz]
  optional: [graham]
  note: "Complete go-to-market strategy requires all perspectives"
```

### 2. Workflow File

**Mind selection map**:
```yaml
mind_selection:
  pricing: ...  # Same as task scope
  positioning: ...
  copy: ...
  gtm: ...

mind_paths:  # 4 minds
  seth_godin: ...
  alex_hormozi: ...  # Add note in comments about size
  eugene_schwartz: ...
  paul_graham: ...

# Add performance note
performance_notes: >
  Alex Hormozi's system prompt is ~8k tokens. Consider urgency="quick" to limit
  mind selection for faster consultations.
```

## Files Changed

### Created
- `squads/kaven-squad/tasks/kaven-squad-lead-consult-growth.md` (~400 lines, +50 lines warning section)
- `squads/kaven-squad/workflows/kaven-growth-council.yaml` (~220 lines, +performance notes)

## Definition of Done

- [x] 2 arquivos criados
- [x] 4 mind paths verificados
- [x] WARNING sobre Hormozi token size presente (~60K tokens, not 8K)
- [x] Scope selection completo (4 scopes)
- [x] Workflow com performance notes
- [x] Story completa
