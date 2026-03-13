---
story_id: CS1.3
title: Architecture Council workflow
epic: EPIC-005
sprint: sprint-cs1
status: completed
assignee: Claude
priority: high
estimate: 1.5h
tags:
  - cross-squad
  - architecture-council
  - workflow
  - yaml
dependencies:
  - CS1.2
blocks:
  - CS1.4
completedDate: 2026-02-16
pr: "#30"
---

# CS1.3: Architecture Council Workflow

## Context

O workflow `kaven-architecture-council.yaml` orquestra consultas arquiteturais entre Atlas e os 3 architecture minds. Segue exatamente a estrutura do Design Council workflow (`kaven-design-council.yaml`), adaptado para domínio de arquitetura.

Workflow com **7 steps**:
1. Frame the question (Atlas)
2. Load minds (Atlas)
3. Individual perspectives (Atlas channeling minds)
4. Cross-pollination debate (minds respond to each other)
5. Synthesize recommendations (Atlas)
6. Feasibility review (Atlas self-review)
7. Generate evidence bundle

## User Story

**Como** usuário do kaven-squad
**Eu quero** um workflow estruturado para consultas arquiteturais
**Para que** decisões técnicas complexas sejam tomadas com processo consistente e rastreável

## Acceptance Criteria

- [x] Arquivo `squads/kaven-squad/workflows/kaven-architecture-council.yaml` criado
- [x] YAML válido (parseia sem erros)
- [x] 7 steps definidos com dependências corretas
- [x] 3 execution modes: yolo, interactive, preflight
- [x] Mind selection map por scope: infrastructure, testing, dx, system
- [x] 3 debate frameworks: steel_man, socratic, hegelian
- [x] Success criteria e failure handling definidos
- [x] Trigger manual com command `@kaven *architecture-council`
- [x] Input/output specifications completas
- [x] Tags corretos: cross-squad, architecture, mmos-integration

## Technical Approach

1. **Copiar Design Council workflow como base**
   ```bash
   # Usar como referência
   squads/kaven-squad/workflows/kaven-design-council.yaml
   ```

2. **Header YAML**
   ```yaml
   name: kaven-architecture-council
   version: 1.0.0
   description: >
     Cross-squad workflow orchestrating architecture consultations between kaven-squad
     agents and mmos-squad architecture minds (Mitchell Hashimoto, Kent Beck, Guillermo Rauch).
     Used for technical decisions affecting infrastructure, testing architecture, developer
     experience, or system design across the Kaven platform.

   trigger:
     manual: true
     command: "@kaven *architecture-council"
     aliases:
       - "@kaven *ac"
       - "@kaven *arch-review"
   ```

3. **Input/Output**
   ```yaml
   input:
     required:
       - architecture_question: string
       - scope: string  # "infrastructure" | "testing" | "dx" | "system"
     optional:
       - context_files: list
       - requesting_agent: string  # default: kaven-architect
       - framework: string  # steel_man | socratic | hegelian
       - urgency: string  # "quick" | "standard" | "thorough"

   output:
     - architecture_decision: string
     - council_transcript: string
     - action_items: list
     - evidence_bundle:
         - council_transcript.md
         - action_items.md
         - dissenting_views.md
   ```

4. **Execution Modes**
   ```yaml
   execution_modes:
     yolo:
       prompts: 0
       description: "Full autonomous execution"
     interactive:
       prompts: 3
       description: "Confirms mind selection, presents perspectives, asks approval"
     preflight:
       prompts: 5
       description: "Reviews question framing, validates minds, presents plan"
   ```

5. **Mind Selection Map**
   ```yaml
   mind_selection:
     infrastructure:
       primary: [mitchell_hashimoto, kent_beck]
       optional: [guillermo_rauch]
     testing:
       primary: [kent_beck, guillermo_rauch]
       optional: [mitchell_hashimoto]
     dx:
       primary: [guillermo_rauch, kent_beck]
       optional: [mitchell_hashimoto]
     system:
       primary: [mitchell_hashimoto, kent_beck, guillermo_rauch]
       optional: []

   mind_paths:
     mitchell_hashimoto: squads/mmos-squad/minds/mitchell_hashimoto/system_prompts/system-prompt-infrastructure-expert-v1.0.md
     kent_beck: squads/mmos-squad/minds/kent_beck/system_prompts/system-prompt-dev-workflow-v1.0.md
     guillermo_rauch: squads/mmos-squad/minds/guillermo_rauch/system_prompts/System_Prompt_Guillermo_Rauch.md
   ```

6. **7 Steps Implementation**
   - Step 1: `frame_question` (Atlas)
   - Step 2: `load_minds` (Atlas)
   - Step 3: `individual_perspectives` (Atlas channeling)
   - Step 4: `cross_pollination` (debate entre minds)
   - Step 5: `synthesize` (Atlas)
   - Step 6: `architect_review` (Atlas self-review de feasibility)
   - Step 7: `generate_evidence` (Atlas)

   **Cada step tem**:
   - `id`, `name`, `agent`, `description`
   - `input`, `output`
   - `depends_on` (array de step ids)
   - `skip_if` (condições opcionais)
   - `on_failure` (fallback behavior)

7. **Frameworks Section**
   ```yaml
   frameworks:
     steel_man:
       rounds: 2
       rules: "Each mind articulates BEST version of competing perspective before defending own"
     socratic:
       rounds: 3
       rules: "Minds ask probing questions of each other"
     hegelian:
       rounds: 2
       rules: "Thesis -> Antithesis -> Synthesis progression"
   ```

8. **Success Criteria**
   ```yaml
   success_criteria:
     - Architecture question receives perspectives from at least 2 minds
     - Recommendation includes concrete action items with assignees
     - Feasibility validated by Atlas
     - Evidence bundle generated
   ```

9. **Failure Handling**
   ```yaml
   failure_handling:
     mind_load_failure:
       action: "Proceed with available minds. Minimum 1 required."
     debate_timeout:
       action: "Skip cross-pollination, use individual perspectives."
     architect_unavailable:
       action: "Skip feasibility review, note as pending."
   ```

10. **Tags**
    ```yaml
    tags:
      - cross-squad
      - architecture
      - consultation
      - mmos-integration
      - architecture-council
    ```

## Files Changed

### Created
- `squads/kaven-squad/workflows/kaven-architecture-council.yaml` (~215 lines)

### Modified
- none (registration acontece em CS1.4)

## Testing Strategy

### Manual Tests
1. **YAML validation**
   ```bash
   # Validar sintaxe YAML
   python3 -c "import yaml; yaml.safe_load(open('squads/kaven-squad/workflows/kaven-architecture-council.yaml'))"
   ```

2. **Structure validation**
   - [ ] Header completo (name, version, description)
   - [ ] Trigger definido
   - [ ] Input/output specifications
   - [ ] 3 execution modes
   - [ ] Mind selection map completo
   - [ ] 7 steps com dependências
   - [ ] Success criteria e failure handling
   - [ ] Tags presentes

3. **Mind paths validation**
   ```bash
   # Verificar paths no workflow
   grep "mind_paths:" -A 3 squads/kaven-squad/workflows/kaven-architecture-council.yaml
   ```

### Checklist
- [x] YAML válido (parseia sem erros)
- [x] 7 steps definidos
- [x] Mind selection map completo
- [x] 3 execution modes
- [x] 3 debate frameworks
- [x] Success criteria definidos
- [x] Failure handling presente
- [x] Tags corretos

## Definition of Done

- [x] Arquivo criado e commitado
- [x] YAML parseia corretamente
- [x] Structure validation passa
- [x] Mind paths corretos
- [x] Segue padrão Design Council
- [x] Story marcada como completa

## Notes

- **7-step workflow** é o padrão cross-squad — permite composição consistente
- **Mind selection map** automatiza escolha de minds baseado no scope da questão
- **3 execution modes** permitem diferentes níveis de autonomia (yolo, interactive, preflight)
- **Failure handling** garante graceful degradation se algo falhar
- **Evidence bundle** torna toda consulta rastreável e auditável

Este workflow é replicável para Product, Growth, e Quality councils com adaptações mínimas.
