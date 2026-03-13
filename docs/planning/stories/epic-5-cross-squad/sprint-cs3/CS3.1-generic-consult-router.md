---
story_id: CS3.1
title: Generic *consult router implementation
epic: EPIC-005
sprint: sprint-cs3
status: completed
assignee: Claude
priority: high
estimate: 2h
actual: 1.5h
tags: [cross-squad, steave, generic-router, meta-command]
dependencies: [CS2.2]
completedDate: 2026-02-16
pr: "#30"
---

# CS3.1: Generic *consult Router

## Context

Steave's `*consult` command é um **generic router** que permite invocar qualquer council do squad via syntax unificada: `*consult {council} {question}`.

**Supported councils**: design, architecture, product, growth, quality

Exemplo:
```
@kaven-squad-lead *consult architecture "How should we structure our test infrastructure?"
@kaven-squad-lead *consult design "What's the best layout for multi-tenant dashboard?"
@kaven-squad-lead *consult product "Should we build feature X or Y first?"
```

## User Story

**Como** usuário do kaven-squad
**Eu quero** comando genérico `*consult` que roteia para qualquer council
**Para que** eu tenha um entry point unificado para todas as consultas cross-squad

## Acceptance Criteria

- [x] Arquivo `squads/kaven-squad/tasks/kaven-squad-lead-consult.md` criado (~280 lines)
- [x] YAML frontmatter: task=consult(), responsavel="@kaven-squad-lead"
- [x] Suporta 5 councils: design, architecture, product, growth, quality
- [x] Syntax: `*consult {council} {question}` com options opcionais
- [x] Router logic: identifica council e delega para task específico (6 steps)
- [x] Validation: council inválido → error com lista de válidos
- [x] Help text com examples para cada council (5 examples)
- [x] Implementation steps (6 steps, mais simples que councils)
- [x] Steave agent updated (dependency added: kaven-squad-lead-consult.md)
- [x] squad.yaml updated (+1 task line)
- [x] YAML validation passed (both squad.yaml and task frontmatter)

## Technical Approach

### 1. Task File Structure

**YAML frontmatter**:
```yaml
task: consult()
responsavel: "@kaven-squad-lead"
Entrada:
  - council: string  # design|architecture|product|growth|quality
  - question: string
  - minds: list  # optional, passed to target council
  - mode: string  # optional: single|duo|roundtable
  - framework: string  # optional: steel_man|socratic|hegelian
Saida:
  - council_output: string  # Output do council selecionado
  - delegation_log: string  # Tracking de qual council foi invocado
Checklist:
  - [ ] Parse council name from input
  - [ ] Validate council exists
  - [ ] Extract question and options
  - [ ] Delegate to specific council task
  - [ ] Return council output
  - [ ] Log delegation
```

### 2. Council Registry

```yaml
councils:
  design:
    owner: kaven-frontend-dev
    task: kaven-frontend-dev-consult-design.md
    minds: [brad_frost, don_norman, julie_zhuo, michael_bierut]
    description: "UX/UI decisions, component design, design systems"

  architecture:
    owner: kaven-architect
    task: kaven-architect-consult-architecture.md
    minds: [mitchell_hashimoto, kent_beck, guillermo_rauch]
    description: "Infrastructure, testing architecture, DX, system design"

  product:
    owner: kaven-squad-lead
    task: kaven-squad-lead-consult-product.md
    minds: [marty_cagan, jeff_patton, cagan_patton]
    description: "Discovery, story mapping, product strategy, validation"

  growth:
    owner: kaven-squad-lead
    task: kaven-squad-lead-consult-growth.md
    minds: [seth_godin, alex_hormozi, eugene_schwartz, paul_graham]
    description: "Positioning, pricing, copywriting, GTM strategy"

  quality:
    owner: kaven-qa
    task: kaven-qa-consult-quality.md
    minds: [kent_beck, daniel_kahneman]
    description: "Testing strategy, TDD, risk analysis, coverage"
```

### 3. Router Logic (Implementation Steps)

**Step 1**: Parse council name
```
Input: "*consult architecture How should we..."
Extract: council="architecture", question="How should we..."
```

**Step 2**: Validate council exists
```
Valid: design, architecture, product, growth, quality
Invalid → Error: "Unknown council 'xyz'. Available: design, architecture, product, growth, quality"
```

**Step 3**: Extract options (if provided)
```
--minds brad_frost,don_norman → minds=["brad_frost", "don_norman"]
--mode duo → mode="duo"
--framework socratic → framework="socratic"
```

**Step 4**: Determine target agent and task
```
councils[council].owner → agent to invoke
councils[council].task → task file to load
```

**Step 5**: Delegate to specific council
```
Internal call: @{owner} *{council-specific-command} {question} {options}

Example:
  *consult architecture "test infra?" --mode duo
  → @kaven-architect *consult-architecture "test infra?" --mode duo
```

**Step 6**: Return output + log delegation
```
Return: council output + delegation log
Log format: "[{timestamp}] Delegated to {council} ({owner}): {question}"
```

### 4. Usage Examples

```markdown
## Usage Examples

| Council | Command | Output |
|---------|---------|--------|
| Design | `*consult design "Should we use sidebar or topnav?"` | Delegates to Pixel, returns design recommendation |
| Architecture | `*consult architecture "Test infrastructure design?"` | Delegates to Atlas, returns architecture decision |
| Product | `*consult product "Feature X or Y first?" --mode duo` | Steave self-invokes, returns product recommendation |
| Growth | `*consult growth "How to position Kaven?" --minds godin,hormozi` | Steave self-invokes, returns growth strategy |
| Quality | `*consult quality "TDD strategy for this?" --mode single --minds beck` | Delegates to Shield, returns quality approach |
```

### 5. Error Handling

| Error | Response |
|-------|----------|
| Council not found | "Unknown council '{name}'. Available: design, architecture, product, growth, quality" |
| Empty question | "Question cannot be empty. Usage: *consult {council} {question}" |
| Invalid option | "Invalid option '{option}'. See *help for valid options" |
| Target agent unavailable | "Council owner ({agent}) is unavailable. Try again later." |

### 6. Help Text

```markdown
## *consult Command

**Syntax**: `*consult {council} {question} [options]`

**Councils**:
- `design` - UX/UI decisions (Pixel → Design Council)
- `architecture` - Infrastructure/system design (Atlas → Architecture Council)
- `product` - Discovery/strategy (Steave → Product Council)
- `growth` - Positioning/GTM (Steave → Growth Council)
- `quality` - Testing/TDD (Shield → Quality Council)

**Options**:
- `--minds {mind1},{mind2}` - Select specific minds
- `--mode {single|duo|roundtable}` - Consultation mode
- `--framework {steel_man|socratic|hegelian}` - Debate framework

**Examples**:
```
*consult design "Sidebar or topnav for dashboard?"
*consult architecture "Test infrastructure design?" --mode duo
*consult product "Feature X or Y first?" --minds cagan,patton
*consult growth "How to position?" --framework steel_man
*consult quality "TDD strategy?" --mode single --minds beck
```
```

## Implementation Summary

✅ **Story CS3.1 completed successfully** (2026-02-16)

### What Was Built

Created the **generic `*consult` router** that provides a unified entry point for all 5 councils in the kaven-squad:

1. **Task File Created** (`kaven-squad-lead-consult.md`, 282 lines)
   - Complete YAML frontmatter with task signature
   - Routing map for all 5 councils (design, architecture, product, growth, quality)
   - 6-step implementation guide (parse → validate → route → delegate → return → log)
   - 5 detailed usage examples (one per council)
   - Comprehensive error handling (4 error types)
   - Cross-squad protocol documentation
   - Future enhancements section (auto-routing, multi-council, history)

2. **Council Routing Map**
   ```yaml
   design      → Pixel (kaven-frontend-dev) → *consult-design
   architecture → Atlas (kaven-architect)    → *consult-architecture
   product     → Steave (self-invocation)    → *consult-product
   growth      → Steave (self-invocation)    → *consult-growth
   quality     → Shield (kaven-qa)           → *consult-quality
   ```

3. **Delegation Logic**
   - Cross-agent councils: Design, Architecture, Quality (delegates to other agents)
   - Self-invoked councils: Product, Growth (Steave invokes own councils)
   - Full parameter forwarding: `--minds`, `--mode`, `--framework`
   - Delegation logging for telemetry

4. **Integration Points**
   - Steave agent: Added `kaven-squad-lead-consult.md` to dependencies
   - squad.yaml: Added task to components.tasks list
   - YAML validation: Both files parse correctly

### Benefits Delivered

**For Users:**
- Single command to remember (`*consult`)
- Don't need to know squad internal structure
- Consistent syntax across all councils
- Helpful error messages guide to correct usage

**For Squad:**
- Steave becomes central orchestrator for all domain expertise
- Clear separation of concerns (each agent owns their council)
- Easy to add new councils (just update routing map)
- Delegation is explicit and trackable

**Strategic Value:**
- Establishes Steave as the **strategic orchestrator** of the squad
- Entry point for all cross-squad knowledge
- Pattern can be adopted by other squads (mmos-squad, etc.)
- Foundation for future AI-powered auto-routing

## Files Changed

### Created
- `squads/kaven-squad/tasks/kaven-squad-lead-consult.md` (282 lines)

### Modified
- `squads/kaven-squad/agents/kaven-squad-lead.md` (+1 dependency: `kaven-squad-lead-consult.md`)
- `squads/kaven-squad/squad.yaml` (+1 line: `kaven-squad-lead-consult.md` in tasks list)

## Testing Strategy

### Manual Tests
1. **Valid council delegation**:
   ```
   *consult architecture "test design?"
   → Verifica: delega para Atlas, output correto
   ```

2. **Invalid council**:
   ```
   *consult marketing "xyz?"
   → Verifica: error message com lista de válidos
   ```

3. **Options passing**:
   ```
   *consult design "layout?" --mode duo --minds brad_frost,don_norman
   → Verifica: options chegam ao Design Council
   ```

4. **All 5 councils**:
   ```
   # Testar cada council via router
   *consult design ...
   *consult architecture ...
   *consult product ...
   *consult growth ...
   *consult quality ...
   ```

### Checklist
- [x] Task file criado
- [x] Router logic implementada
- [x] 5 councils suportados
- [x] Validation funciona
- [x] Options passing funciona
- [x] Help text completo
- [x] Delegation log presente

## Definition of Done

- [x] Task file criado (282 lines, all sections complete)
- [x] Router suporta 5 councils (design, architecture, product, growth, quality)
- [x] Validation funciona (council inválido → error with list of valid councils)
- [x] Options passing documented (--minds, --mode, --framework)
- [x] Help text completo com examples (5 examples, one per council)
- [x] Delegation log presente (Step 6 implementation)
- [x] Steave agent updated (dependencies section)
- [x] squad.yaml updated (+1 task)
- [x] YAML validation passed
- [x] Story completa com implementation summary

## Notes

- **Meta-command** — Steave é único agente com generic router
- **Self-invocation** — Product/Growth councils são self-invoke (Steave chama Steave)
- **Cross-agent invocation** — Design/Architecture/Quality delegam para outros agentes
- **Delegation log** — rastreia todas as consultas roteadas
- **Entry point unificado** — usuário não precisa saber qual agente "owns" cada council

Este router torna Steave o **strategic orchestrator** do squad — entry point para todo conhecimento cross-squad.
