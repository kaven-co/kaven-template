---
title: 05_GUIA_BROWNFIELD
version: 1.0.0
type: guide
domain: aios
audience: [iniciante,avancado]
level: quick
status: active
lang: pt-BR
squads_scope: personal
updated: 2026-02-13
tags: [aios, playbook, quick-guide, squads-personais]
---

# Guia Brownfield

## Objetivo
Adicionar valor sem quebrar comportamento legado.

## Fluxo
1. Descoberta de legado
- `@aios-master *workflow brownfield-discovery --mode=guided`
- `@architect *analyze-project-structure`
- `@architect *map-codebase`

2. Escopo e risco
- `@pm *create-brownfield-prd`
- `@qa *risk-profile {story}`
- `@qa *nfr-assess {story}`

3. Implementacao incremental
- `@sm *draft`
- `@dev *develop {story-id}`
- `@dev *run-tests`

4. Gate e release
- `@qa *review-build {story-id}`
- `@qa *gate {story-id}`
- `@devops *pre-push`
- `@devops *create-pr`

## Regras de seguranca
- Rodar regressao antes de merge
- Se houver DB, validar migracoes
- Preparar plano de rollback no PR

## Links
- Crise/war room: [[08_GUIA_CRISE_WAR_ROOM]]
- PR padrao: [[07_GUIA_PR_PADRAO_TIME]]
- Checklists: [[10_CHECKLISTS_OPERACIONAIS]]
- Guia oficial brownfield: [[22_REFERENCIAS_OFICIAIS]]
