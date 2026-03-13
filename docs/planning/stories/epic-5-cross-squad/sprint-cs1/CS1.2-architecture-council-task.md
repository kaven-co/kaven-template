---
story_id: CS1.2
title: Architecture Council task file
epic: EPIC-005
sprint: sprint-cs1
status: completed
assignee: Claude
priority: high
estimate: 2h
tags:
  - cross-squad
  - architecture-council
  - atlas
  - task-creation
dependencies: none
blocks:
  - CS1.3
  - CS1.4
completedDate: 2026-02-16
pr: "#30"
---

# CS1.2: Architecture Council Task File

## Context

O Architecture Council é a 2ª integração cross-squad (Design foi a 1ª). Quando Atlas (kaven-architect) precisa tomar decisões arquiteturais complexas, ele consulta 3 minds técnicos do mmos-squad:

- **Mitchell Hashimoto** — Infrastructure thinking, workflow-centric systems
- **Kent Beck** — TDD, evolutionary design, workflow-focused development
- **Guillermo Rauch** — DX (developer experience), modern tooling, performance

O task file segue **exatamente** o padrão do Design Council (`kaven-frontend-dev-consult-design.md`), adaptado para domínio de arquitetura.

## User Story

**Como** Atlas (kaven-architect)
**Eu quero** consultar o Architecture Council com 3 minds técnicos
**Para que** eu possa tomar decisões arquiteturais informadas por expertise de infraestrutura, testing, e DX

## Acceptance Criteria

- [x] Arquivo `squads/kaven-squad/tasks/kaven-architect-consult-architecture.md` criado
- [x] YAML frontmatter completo (task, responsavel, Entrada, Saida, Checklist)
- [x] 3 minds documentados: Mitchell Hashimoto, Kent Beck, Guillermo Rauch
- [x] Mind paths corretos (verificados no filesystem)
- [x] 3 modos de consulta: single, duo, roundtable
- [x] 3 debate frameworks: steel_man, socratic, hegelian
- [x] Scope selection map: infrastructure, testing, dx, system
- [x] Output templates para cada modo (single, duo, roundtable)
- [x] 10 implementation steps (seguindo padrão Design Council)
- [x] Seção "When to Use This Command" com scenarios
- [x] Cross-Squad Protocol documentation
- [x] Consultation Log obrigatório em todos os templates
- [x] Kent Beck channeling instructions DIFERENTES do Quality Council

## Technical Approach

1. **Copiar estrutura do Design Council task**
   - Arquivo: `squads/kaven-squad/tasks/kaven-frontend-dev-consult-design.md`
   - Manter estrutura exata: YAML + seções markdown
   - Adaptar apenas domínio (design → architecture)

2. **YAML frontmatter**
   ```yaml
   ---
   task: consultArchitecture()
   responsavel: "@kaven-architect"
   responsavel_type: agent
   atomic_layer: task
   Entrada:
     - question: string
     - minds: list # default: all 3
     - mode: string # single|duo|roundtable (default: roundtable)
     - context: string # optional: current code/system context
     - framework: string # optional: steel_man|socratic|hegelian
   Saida:
     - architecture_recommendation: string
     - mind_perspectives: list
     - action_items: list
     - dissenting_views: list
   Checklist:
     - [ ] Identify architectural question clearly
     - [ ] Load relevant architecture mind system prompts
     - [ ] Present current system/code context to minds
     - [ ] Capture each mind's perspective individually
     - [ ] Synthesize recommendations into actionable steps
     - [ ] Note dissenting views or trade-offs
     - [ ] Return to Atlas persona with clear next steps
   ---
   ```

3. **3 Minds Documentation**
   | Mind | Domain | Best For |
   |------|--------|----------|
   | **mitchell_hashimoto** | Infrastructure, Systems | Workflow-centric architecture, infrastructure decisions, scaling systems |
   | **kent_beck** | Testing, Evolutionary Design | TDD strategy, test architecture, evolutionary patterns, refactoring |
   | **guillermo_rauch** | DX, Modern Tooling | Developer experience, modern stack choices, performance, deployment |

4. **Mind Paths (verificar existência)**
   ```
   squads/mmos-squad/minds/mitchell_hashimoto/system_prompts/system-prompt-infrastructure-expert-v1.0.md
   squads/mmos-squad/minds/kent_beck/system_prompts/system-prompt-dev-workflow-v1.0.md
   squads/mmos-squad/minds/guillermo_rauch/system_prompts/System_Prompt_Guillermo_Rauch.md
   ```

5. **Scope Selection Map**
   ```yaml
   infrastructure:
     primary: [hashimoto, beck]
     optional: [rauch]
     description: Infrastructure design, deployment architecture, scaling strategies

   testing:
     primary: [beck, rauch]
     optional: [hashimoto]
     description: Test architecture, TDD strategy, test infrastructure

   dx:
     primary: [rauch, beck]
     optional: [hashimoto]
     description: Developer experience, tooling choices, workflow optimization

   system:
     primary: [hashimoto, beck, rauch]
     optional: []
     description: Complete system architecture review requiring all perspectives
   ```

6. **Kent Beck Channeling Instructions (CRÍTICO)**
   - **No Architecture Council**: Foco em patterns, testing strategy, evolutionary design, DX implications
   - **No Quality Council** (CS2.4): Foco em TDD, risk analysis, coverage strategy, quality metrics
   - **Diferença clara**: Architecture = system design, Quality = testing approach

7. **Output Templates**
   - Copiar exatamente do Design Council
   - Adaptar headers: "Architecture Council Consultation"
   - Mudar domínios: (Design Systems → Infrastructure), (UX → Testing), etc.
   - Manter Consultation Log obrigatório

8. **10 Implementation Steps**
   - Copiar estrutura do Design Council
   - Step 6 (**Debate Framework Integration**): manter nota sobre integração durante Steps 4/5
   - Step 10 (**Log the Consultation**): manter tabela padronizada

9. **When to Use scenarios**
   | Scenario | Mode | Minds |
   |----------|------|-------|
   | Infrastructure decision | duo | hashimoto + beck |
   | Testing architecture | duo | beck + rauch |
   | DX evaluation | single | rauch |
   | Complete system review | roundtable | all 3 |
   | Scaling strategy | duo | hashimoto + rauch |
   | Refactoring approach | duo | beck + rauch |

10. **Cross-Squad Protocol**
    - Read-only access to mmos-squad
    - Persona channeling (não full activation)
    - Budget-aware (minds carregados on-demand)
    - Traceable (Consultation Log)
    - Composable (padrão reutilizável)

## Files Changed

### Created
- `squads/kaven-squad/tasks/kaven-architect-consult-architecture.md` (391 lines)

### Modified
- none (registration acontece em CS1.4)

## Testing Strategy

### Manual Tests
1. **Mind paths validation**
   ```bash
   # Verificar que os 3 paths existem
   ls squads/mmos-squad/minds/mitchell_hashimoto/system_prompts/system-prompt-infrastructure-expert-v1.0.md
   ls squads/mmos-squad/minds/kent_beck/system_prompts/system-prompt-dev-workflow-v1.0.md
   ls squads/mmos-squad/minds/guillermo_rauch/system_prompts/System_Prompt_Guillermo_Rauch.md
   ```

2. **YAML frontmatter validation**
   ```bash
   # Extrair e validar YAML
   sed -n '/^---$/,/^---$/p' squads/kaven-squad/tasks/kaven-architect-consult-architecture.md
   ```

3. **Structure validation**
   - [ ] YAML frontmatter presente
   - [ ] 3 minds documentados
   - [ ] Scope selection map presente
   - [ ] 3 output templates (single, duo, roundtable)
   - [ ] 10 implementation steps
   - [ ] When to Use table
   - [ ] Cross-Squad Protocol section

### Checklist
- [ ] Task file criado com estrutura completa
- [ ] YAML frontmatter válido
- [ ] 3 mind paths existem
- [ ] Kent Beck channeling instructions DIFERENTES do Quality Council
- [ ] Output templates seguem padrão Design Council
- [ ] Consultation Log presente em todos os templates
- [ ] Scope selection map completo

## Definition of Done

- [ ] Arquivo criado e commitado
- [ ] YAML frontmatter válido
- [ ] 3 mind paths verificados
- [ ] Structure validation passa
- [ ] Kent Beck instructions diferenciadas
- [ ] Output templates consistentes com Design Council
- [ ] Story marcada como completa

## Notes

- **Kent Beck aparece em 2 councils** (Architecture e Quality) — as channeling instructions DEVEM ser diferentes:
  - Architecture: patterns, testing strategy, evolutionary design, DX
  - Quality: TDD, risk analysis, coverage strategy, quality metrics

- **Scope selection map** é critical — determina quais minds são primary/optional para cada tipo de questão

- **Consultation Log obrigatório** — garante rastreabilidade cross-squad

- **Template fidelity** — seguir Design Council exatamente para manter consistência entre councils

Este task estabelece o padrão para os próximos 3 councils (Product, Growth, Quality).
