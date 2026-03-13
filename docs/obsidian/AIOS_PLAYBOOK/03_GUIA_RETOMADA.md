---
title: 03_GUIA_RETOMADA
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

# Guia Retomada

## Quick: retomar e continuar de fato (iniciante)

1. Descobrir estado:
- `@aios-master *status`
- `@aios-master *plan status`
- `@dev *build-status --all`

2. Escolher caminho:
- Se ja tem story definida: `@dev *develop {story-id}`
- Se nao sabe proximo passo: `@aios-master *workflow {name}`
- Se precisa organizar backlog primeiro: `@po *backlog-summary`

3. Continuar execucao:
- Desenvolvimento: `@dev *develop {story-id}` ou `@dev *build {story-id}`
- Qualidade: `@qa *review-build {story-id}` e `@qa *gate {story-id}`

## O `@aios-master` delega?

Sim. Para iniciantes, o fluxo mais seguro e:
1. `@aios-master *status`
2. `@aios-master *plan status`
3. `@aios-master *workflow ...` (quando precisar reorquestrar)
4. Seguir para agente executor (`@dev`, `@qa`, `@po`, etc.)

## Script pronto (retomada + continuidade)

```text
@aios-master *status
@aios-master *plan status
@po *backlog-summary
@dev *build-status --all
@dev *worktree-list
@dev *session-info
@dev *develop STORY-123
```

## Aprofundamento

- RACI para decidir o proximo agente: [[09_MATRIZ_RACI_AGENTES]]
- Sprint de execucao: [[06_GUIA_SPRINT_SEMANAL]]
- Brownfield em detalhe: [[05_GUIA_BROWNFIELD]]
- Referencias oficiais: [[22_REFERENCIAS_OFICIAIS]]
