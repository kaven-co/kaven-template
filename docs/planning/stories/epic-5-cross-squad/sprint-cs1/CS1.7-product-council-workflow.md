---
story_id: CS1.7
title: Product Council workflow
epic: EPIC-005
sprint: sprint-cs1
status: completed
assignee: Claude
priority: high
estimate: 1.5h
tags: [cross-squad, product-council, workflow, yaml]
dependencies: [CS1.6]
blocks: [CS1.8]
completedDate: 2026-02-16
pr: "#30"
---

# CS1.7: Product Council Workflow

## Context

Workflow `kaven-product-council.yaml` orquestra consultas de produto entre Steave e 3 product minds. Segue estrutura Design/Architecture Council (7 steps).

## User Story

**Como** usuário do kaven-squad
**Eu quero** workflow estruturado para consultas de produto
**Para que** decisões de produto sejam tomadas com processo consistente

## Acceptance Criteria

- [x] Arquivo `squads/kaven-squad/workflows/kaven-product-council.yaml` criado
- [x] YAML válido
- [x] 7 steps: frame → load → perspectives → debate → synthesize → feasibility → evidence
- [x] 3 execution modes: yolo, interactive, preflight
- [x] Mind selection map: discovery, story, strategy, validation
- [x] 3 debate frameworks
- [x] Trigger: `@kaven *product-council`
- [x] Success criteria e failure handling

## Technical Approach

1. **Copy Architecture Council workflow** — adaptar para product
2. **Header**:
   ```yaml
   name: kaven-product-council
   version: 1.0.0
   trigger:
     command: "@kaven *product-council"
     aliases: ["@kaven *pc", "@kaven *product-review"]
   ```
3. **Input/Output**:
   ```yaml
   input:
     required: [product_question, scope]  # scope: discovery|story|strategy|validation
     optional: [context_files, requesting_agent, framework, urgency]
   output: [product_decision, council_transcript, action_items, evidence_bundle]
   ```
4. **Mind selection map**:
   ```yaml
   discovery: [cagan, cagan_patton], optional: [patton]
   story: [patton, cagan_patton], optional: [cagan]
   strategy: [all 3]
   validation: [cagan_patton, cagan], optional: [patton]
   ```
5. **7 steps** — agent=kaven-squad-lead em todos
6. **Success criteria**: 2+ minds, action items, evidence bundle
7. **Failure handling**: graceful degradation

## Files Changed

### Created
- `squads/kaven-squad/workflows/kaven-product-council.yaml` (~215 lines)

## Definition of Done

- [x] Arquivo criado
- [x] YAML parseia
- [x] 7 steps definidos
- [x] Mind selection completo
- [x] Segue padrão
- [x] Story completa
