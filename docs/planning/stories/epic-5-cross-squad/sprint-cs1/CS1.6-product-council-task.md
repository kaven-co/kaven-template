---
story_id: CS1.6
title: Product Council task file
epic: EPIC-005
sprint: sprint-cs1
status: completed
assignee: Claude
priority: high
estimate: 2h
completedDate: 2026-02-16
pr: "#30"
tags: [cross-squad, product-council, steave, task-creation]
dependencies: [CS1.1]
blocks: [CS1.7, CS1.8]
---

# CS1.6: Product Council Task File

## Context

Product Council task para Steave consultar 3 product minds: Marty Cagan (discovery), Jeff Patton (story mapping), Cagan-Patton (strategist).Segue padrão Design/Architecture Council.

## User Story

**Como** Steave (kaven-squad-lead)
**Eu quero** consultar o Product Council
**Para que** decisões de produto sejam informadas por discovery, story mapping, e product strategy expertise

## Acceptance Criteria

- [ ] Arquivo `squads/kaven-squad/tasks/kaven-squad-lead-consult-product.md` criado
- [ ] YAML frontmatter: task, responsavel="@kaven-squad-lead", Entrada, Saida, Checklist
- [ ] 3 minds: Marty Cagan, Jeff Patton, Cagan-Patton com paths corretos
- [ ] 3 modos: single, duo, roundtable
- [ ] 3 frameworks: steel_man, socratic, hegelian
- [ ] Scope selection: discovery, story, strategy, validation
- [ ] Output templates para cada modo (single, duo, roundtable)
- [ ] 10 implementation steps
- [ ] Consultation Log obrigatório
- [ ] When to Use scenarios table

## Technical Approach

1. **Copy Design Council task structure** — adaptar para product domain
2. **YAML frontmatter**:
   ```yaml
   task: consultProduct()
   responsavel: "@kaven-squad-lead"
   Entrada: [question, minds, mode, context, framework]
   Saida: [product_recommendation, mind_perspectives, action_items, dissenting_views]
   ```
3. **3 Minds**:
   - Marty Cagan: Discovery, product-market fit, evidence-based
   - Jeff Patton: Story mapping, user journeys, outcome thinking
   - Cagan-Patton: Hybrid strategist, discovery + story mapping integrated
4. **Mind paths**:
   ```
   squads/mmos-squad/minds/marty_cagan/system_prompts/system-prompt-discovery-coach.md
   squads/mmos-squad/minds/jeff_patton/system_prompts/system-prompt-generalista-v1.0.md
   squads/mmos-squad/minds/cagan_patton/system_prompts/system-prompt-product-strategist.md
   ```
5. **Scope selection map**:
   - discovery → primary: [cagan, cagan_patton], optional: [patton]
   - story → primary: [patton, cagan_patton], optional: [cagan]
   - strategy → primary: [cagan, patton, cagan_patton]
   - validation → primary: [cagan_patton, cagan], optional: [patton]
6. **Output templates** — copiar Design Council, adaptar headers
7. **10 steps** — seguir padrão cross-squad
8. **When to Use**:
   | Scenario | Mode | Minds |
   |----------|------|-------|
   | Discovery question | duo | cagan + cagan_patton |
   | Story mapping | single | patton |
   | Product strategy | roundtable | all 3 |
   | Validation approach | duo | cagan_patton + cagan |

## Files Changed

### Created
- `squads/kaven-squad/tasks/kaven-squad-lead-consult-product.md` (~350 lines)

## Definition of Done

- [ ] Arquivo criado
- [ ] YAML válido
- [ ] 3 mind paths verificados
- [ ] Output templates completos
- [ ] Segue padrão Design/Architecture
- [ ] Story marcada completa
