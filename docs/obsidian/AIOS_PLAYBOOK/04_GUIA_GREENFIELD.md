---
title: 04_GUIA_GREENFIELD
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

# Guia Greenfield

## Objetivo
Ir de ideia ate PR pronto em fluxo padrao AIOS.

## Fluxo
1. Orquestracao
- `@aios-master *workflow greenfield-fullstack --mode=guided`

2. Descoberta e produto
- `@analyst *create-project-brief`
- `@pm *create-prd`

3. Arquitetura
- `@architect *create-full-stack-architecture`
- `@architect *create-plan`
- `@architect *create-context`

4. Execucao
- `@sm *draft`
- `@dev *develop {story-id}`
- `@dev *run-tests`

5. Qualidade e entrega
- `@qa *review-build {story-id}`
- `@qa *gate {story-id}`
- `@devops *pre-push`
- `@devops *create-pr`

## Handoffs obrigatorios
- PM -> Architect: PRD + requisitos fechados
- Architect -> Dev: plano + contexto
- Dev -> QA: evidencias de teste
- QA -> DevOps: gate aprovado

## Links
- RACI: [[09_MATRIZ_RACI_AGENTES]]
- PR padrao: [[07_GUIA_PR_PADRAO_TIME]]
- Checklists: [[10_CHECKLISTS_OPERACIONAIS]]
- Referencias oficiais: [[22_REFERENCIAS_OFICIAIS]]
