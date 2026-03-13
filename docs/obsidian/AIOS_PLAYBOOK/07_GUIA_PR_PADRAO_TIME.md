---
title: 07_GUIA_PR_PADRAO_TIME
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

# Guia PR Padrao do Time

## Objetivo
Padronizar PR para acelerar review e reduzir retrabalho.

## Estrutura minima da PR
- Contexto (problema e objetivo)
- Escopo (o que entrou e o que nao entrou)
- Mudancas tecnicas principais
- Evidencias (testes, logs, screenshots quando aplicavel)
- Risco e rollback

## Sequencia recomendada
1. `@dev *run-tests`
2. `@qa *review-build {story-id}`
3. `@qa *gate {story-id}`
4. `@devops *pre-push`
5. `@devops *create-pr`

## Criterio de pronto
- testes passaram
- gate QA aprovado
- sem conflito
- descricao da PR completa

## Links
- Crise/war room: [[08_GUIA_CRISE_WAR_ROOM]]
- RACI: [[09_MATRIZ_RACI_AGENTES]]
