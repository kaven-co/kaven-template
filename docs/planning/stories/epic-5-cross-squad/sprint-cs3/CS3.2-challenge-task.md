---
story_id: CS3.2
title: Challenge mode (*challenge) task
epic: EPIC-005
sprint: sprint-cs3
status: completed
assignee: Claude
priority: medium
estimate: 1.5h
tags: [cross-squad, steave, challenge-mode, critical-thinking]
dependencies: []
completedDate: 2026-02-16
pr: "#30"
---

# CS3.2: Challenge Mode (*challenge) Task

## Context

`*challenge` é comando exclusivo de Steave para **questionar decisões** de outros agentes ou do próprio usuário. Baseado na persona de Steave (parceiro de pensamento crítico, não aceita ideias como verdade), este comando traz **critical thinking** ao squad.

## User Story

**Como** usuário ou agente do kaven-squad
**Eu quero** que Steave questione decisões com critical thinking
**Para que** eu identifique pontos cegos, contradições, e alternativas não consideradas

## Acceptance Criteria

- [x] Arquivo `squads/kaven-squad/tasks/kaven-squad-lead-challenge.md` criado (~650 lines total)
- [x] YAML frontmatter: task=challenge(), responsavel="@kaven-squad-lead", 3 modes (light/standard/deep)
- [x] Input: decision (string), context (optional), reasoning (optional), mode (optional)
- [x] Output: identified_issues, critical_questions, alternative_approaches, verdict, action_items, consultation_log
- [x] 10 implementation steps (expanded from original 5)
- [x] 7-lens critical thinking framework aplicado (Assumption Hunting, Inverse Thinking, Second-Order Effects, Scale Testing, Time Horizon, Constraint Questioning, Blind Spot Detection)
- [x] 8+ "When to Use" scenarios documented
- [x] 3 complete challenge examples (architecture decision, product decision, strategic decision)
- [x] Strategic mind integration for deep mode (Elon Musk, Steve Jobs, Sam Altman)
- [x] Steave agent already has `*challenge` command in dependencies
- [x] squad.yaml updated with new task file

## Technical Approach

### 1. Task File Structure

**YAML frontmatter**:
```yaml
task: challenge()
responsavel: "@kaven-squad-lead"
Entrada:
  - decision: string  # The decision to challenge
  - context: string  # Optional: background context
  - reasoning: string  # Optional: original reasoning
Saida:
  - counterarguments: list  # Points that challenge the decision
  - alternative_approaches: list  # Other ways to solve the problem
  - risks_identified: list  # Potential issues not considered
  - recommendation: string  # Steave's final take
Checklist:
  - [ ] Parse the decision and context
  - [ ] Apply critical thinking framework
  - [ ] Identify assumptions and gaps
  - [ ] Generate counterarguments
  - [ ] Propose alternatives
  - [ ] Highlight risks
  - [ ] Provide balanced recommendation
```

### 2. Critical Thinking Framework

**Steave's Challenge Framework (7 lenses)**:

1. **Assumption Hunting**: What's taken for granted that might not be true?
2. **Inverse Thinking**: What if we did the opposite?
3. **Second-Order Effects**: What happens next? And then what?
4. **Scale Testing**: Does this work at 10x? 100x? 0.1x scale?
5. **Time Horizon**: Is this optimizing for short-term or long-term?
6. **Constraint Questioning**: Are the constraints real or assumed?
7. **Blind Spot Detection**: What are we NOT seeing?

### 3. Implementation Steps (5)

**Step 1**: Parse decision and context
```
Input: "We should use microservices for better scalability"
Context: "Current monolith has 50k users, team of 5 devs"
```

**Step 2**: Apply challenge framework
```
Apply 7 lenses:
- Assumptions: "Microservices = better scalability" (is this always true?)
- Inverse: "What if we optimize the monolith instead?"
- Scale: "Will microservices help at 50k users, or only at 500k+?"
- etc.
```

**Step 3**: Generate counterarguments
```
1. "Microservices add operational complexity that a 5-person team may struggle with"
2. "Monolith can scale to 500k+ users with proper optimization"
3. "Microservices make sense at 10+ team size, not 5"
```

**Step 4**: Propose alternatives
```
1. Optimize monolith with caching, indexes, query optimization
2. Modular monolith (clean boundaries, future extraction ready)
3. Vertical scaling first, horizontal later
```

**Step 5**: Synthesize recommendation
```
"I challenge the assumption that microservices = scalability at your current scale.
Consider: [recommendation with trade-offs]"
```

### 4. Output Format

```markdown
## Challenge Mode: {Decision}

**Decision being challenged**: {decision}
**Context**: {context}

---

### Counterarguments

1. **{Argument 1}**
   {Explanation of why this challenges the decision}

2. **{Argument 2}**
   {Explanation}

3. **{Argument 3}**
   {Explanation}

---

### Alternative Approaches

1. **{Alternative 1}**
   - **Pros**: {benefits}
   - **Cons**: {drawbacks}
   - **When to use**: {scenario}

2. **{Alternative 2}**
   ...

---

### Risks Identified

- **Risk 1**: {description}
- **Risk 2**: {description}
- **Risk 3**: {description}

---

### Recommendation

{Steave's balanced take, considering both original decision and alternatives}

**If I had to decide**: {clear recommendation}

**Trade-offs accepted**: {what you're giving up}

---

*Challenge Log: {timestamp}, decision: {decision}, outcome: {keep|revise|replace}*
```

### 5. Usage Examples

| Scenario | Decision | Challenge Output |
|----------|----------|------------------|
| Architecture | "Use microservices for scalability" | Challenges assumption, proposes modular monolith |
| Product | "Build feature X before Y" | Questions prioritization, suggests validation first |
| Growth | "Focus on SEO for user acquisition" | Challenges single-channel approach, suggests multi-channel |
| Process | "Ship without tests to move faster" | Challenges short-term thinking, highlights long-term cost |

### 6. When to Use *challenge

**Use when**:
- Making architectural decisions with long-term impact
- Prioritizing features with unclear ROI
- Considering shortcuts that may create tech debt
- Choosing between competing approaches
- Team consensus seems too easy (groupthink risk)

**Don't use when**:
- Trivial decisions (file naming, formatting)
- Decision already validated with evidence
- Time-sensitive situations requiring fast action
- User explicitly wants support, not challenge

### 7. Integration with Other Commands

```markdown
## Challenge + Council Workflow

1. Make decision using council:
   `*consult architecture "Should we use microservices?"`

2. Challenge the council's recommendation:
   `*challenge "Architecture Council recommended microservices" --context "5-person team, 50k users"`

3. Get multiple perspectives on the challenge:
   `*think "How do we balance scalability needs with team constraints?"`

This workflow ensures **dialectic thinking** — thesis (council), antithesis (challenge), synthesis (think).
```

## Files Changed

### Created
- `squads/kaven-squad/tasks/kaven-squad-lead-challenge.md` (~200 lines)

### Modified
- `squads/kaven-squad/agents/kaven-squad-lead.md` (+1 command: `*challenge`)

## Testing Strategy

### Manual Tests
1. **Architecture decision challenge**:
   ```
   *challenge "Use microservices" --context "5-person team, 50k users"
   → Verifica: counterarguments, alternatives, recommendation
   ```

2. **Product decision challenge**:
   ```
   *challenge "Ship without tests to move faster"
   → Verifica: risks identified, long-term thinking applied
   ```

3. **Challenge output structure**:
   - [ ] Counterarguments (3+)
   - [ ] Alternatives (2+)
   - [ ] Risks identified (3+)
   - [ ] Balanced recommendation
   - [ ] Challenge Log presente

### Checklist
- [ ] Task file criado
- [ ] 7-lens framework documented
- [ ] Output format definido
- [ ] 5 implementation steps
- [ ] Usage examples (4+)
- [ ] When to use guidelines
- [ ] Integration with councils documented

## Definition of Done

- [ ] Task file criado
- [ ] Critical thinking framework definido
- [ ] Output format estruturado
- [ ] Examples completos
- [ ] Integration workflow documented
- [ ] Story completa

## Notes

- **Unique to Steave** — nenhum outro agente tem challenge mode
- **Dialectic thinking** — council (thesis) + challenge (antithesis) + think (synthesis)
- **Balanced output** — não apenas critica, mas oferece alternativas
- **Persona alignment** — baseado em "parceiro crítico, não aceita ideias como verdade"
- **No minds consulted** — Steave usa próprio framework, não consulta mmos-squad

Challenge mode torna Steave um **strategic counterweight** — previne groupthink e decisões não-examinadas.
