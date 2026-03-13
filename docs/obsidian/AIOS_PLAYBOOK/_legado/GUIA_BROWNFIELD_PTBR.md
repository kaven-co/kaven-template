---
title: GUIA_BROWNFIELD_PTBR
version: 1.0.0
type: guide
domain: aios
audience: [iniciante,avancado]
level: quick
status: active
lang: pt-BR
squads_scope: personal
updated: 2026-02-12
tags: [aios, playbook, quick-guide, squads-personais]
---

# AIOS - Guia de Projeto Brownfield (PT-BR)

Guia rapido para evoluir um sistema existente com seguranca.

## Indice
- [Quando usar](#quando-usar)
- [Fluxo recomendado](#fluxo-recomendado)
- [Comandos de arranque (copiar e colar)](#comandos-de-arranque-copiar-e-colar)
- [Checklist de conclusao](#checklist-de-conclusao)

## Quando usar

Use este guia quando o projeto ja existe, ha codigo legado e voce precisa adicionar funcionalidades sem quebrar comportamento atual.

## Fluxo recomendado

1. Descoberta e diagnostico
- `@aios-master *workflow brownfield-discovery --mode=guided`
- `@analyst *extract-patterns`
- `@architect *analyze-project-structure`
- `@architect *map-codebase`

2. Escopo e planejamento
- `@pm *create-brownfield-prd`
- `@pm *create-epic`
- `@architect *assess-complexity`
- `@architect *create-plan`

3. Preparacao de risco
- `@qa *risk-profile {story}`
- `@qa *nfr-assess {story}`
- Se houver DB: `@data-engineer *security-audit {scope}`

4. Execucao incremental
- `@sm *draft`
- `@dev *develop {story-id}` ou `@dev *build {story-id}`
- A cada bloco: `@dev *run-tests`

5. Validacao e estabilizacao
- `@qa *review-build {story-id}`
- `@qa *validate-migrations {story}` (se aplicavel)
- `@qa *gate {story}`

6. Entrega
- `@devops *pre-push`
- `@devops *create-pr`

## Comandos de arranque (copiar e colar)

```text
@aios-master *workflow brownfield-discovery --mode=guided
@architect *analyze-project-structure
@pm *create-brownfield-prd
@qa *risk-profile STORY-123
@dev *develop STORY-123
@qa *review-build STORY-123
@devops *pre-push
```

## Checklist de conclusao

- Escopo de impacto mapeado (codigo, dados, integracoes)
- Regressao executada
- Riscos e NFRs revisados
- Gate de QA aprovado
- PR com plano de rollback quando necessario
