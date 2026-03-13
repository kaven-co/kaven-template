---
title: 08_GUIA_CRISE_WAR_ROOM
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

# Guia Crise War Room

## Quando ativar
- incidente em producao
- regressao critica
- bloqueio de release

## Fluxo de resposta
1. Comando
- `@aios-master *status` para consolidar estado

2. Triage tecnico
- `@architect *analyze-project-structure` (impacto)
- `@qa *risk-profile {story}` (risco)

3. Correcao
- `@dev *develop {story-id}` ou hotfix dedicado
- `@dev *run-tests`

4. Validacao
- `@qa *review-build {story-id}`
- `@qa *gate {story-id}`

5. Entrega segura
- `@devops *pre-push`
- `@devops *create-pr`

## Regras
- nomear owner tecnico e owner comunicacao
- registrar causa raiz e mitigacao
- definir acao preventiva no backlog

## Links
- Brownfield: [[05_GUIA_BROWNFIELD]]
- Checklists: [[10_CHECKLISTS_OPERACIONAIS]]
