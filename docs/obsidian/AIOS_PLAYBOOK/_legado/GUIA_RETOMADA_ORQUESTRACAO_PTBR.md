---
title: GUIA_RETOMADA_ORQUESTRACAO_PTBR
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

# AIOS - Guia de Retomada de Orquestracao (PT-BR)

Guia de reentrada rapida quando voce abre o projeto novamente depois de um tempo.

## Indice
- [Objetivo](#objetivo)
- [Sequencia rapida (5-10 min)](#sequencia-rapida-5-10-min)
- [Quem chamar em cada caso](#quem-chamar-em-cada-caso)
- [Script de retomada (copiar e colar)](#script-de-retomada-copiar-e-colar)

## Objetivo

Recuperar contexto operacional, status de workflow/story e proximo passo executavel com minimo atrito.

## Sequencia rapida (5-10 min)

1. Estado global de orquestracao
- `@aios-master *status`
- `@aios-master *plan status`

2. Estado de produto e backlog
- `@po *backlog-summary`
- `@po *stories-index`

3. Estado de execucao tecnica
- `@dev *session-info`
- `@dev *build-status --all`
- `@dev *worktree-list`

4. Estado de qualidade
- `@qa *session-info`
- Se historia em review: `@qa *review-build {story-id}`

5. Estado de entrega
- `@devops *detect-repo`
- `@devops *pre-push` (somente se voce ja estiver em fase de entrega)

## Quem chamar em cada caso

- Sem clareza do proximo passo: `@aios-master`
- Duvida de prioridade/backlog: `@po` e `@pm`
- Duvida tecnica de implementacao: `@architect` e `@dev`
- Duvida de qualidade/gate: `@qa`
- Duvida de release/PR/pipeline: `@devops`

## Script de retomada (copiar e colar)

```text
@aios-master *status
@aios-master *plan status
@po *backlog-summary
@dev *build-status --all
@dev *worktree-list
@dev *session-info
```
