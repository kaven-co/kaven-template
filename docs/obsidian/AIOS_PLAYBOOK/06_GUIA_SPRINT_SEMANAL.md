---
title: 06_GUIA_SPRINT_SEMANAL
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

# Guia Sprint Semanal

## Cadencia recomendada

## Segunda (planejamento)
- `@po *backlog-review`
- `@po *backlog-prioritize`
- `@sm *draft`

## Terca a quinta (execucao)
- `@dev *develop {story-id}`
- `@dev *run-tests`
- `@qa *review-build {story-id}`

## Sexta (fechamento)
- `@qa *gate {story-id}`
- `@devops *pre-push`
- `@devops *create-pr`

## Artefatos minimos
- stories atualizadas
- evidencias de teste
- gate QA
- PR com contexto

## Links
- PR padrao: [[07_GUIA_PR_PADRAO_TIME]]
- Checklists: [[10_CHECKLISTS_OPERACIONAIS]]
