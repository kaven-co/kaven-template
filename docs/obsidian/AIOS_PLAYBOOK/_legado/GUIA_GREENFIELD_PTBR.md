---
title: GUIA_GREENFIELD_PTBR
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

# AIOS - Guia de Projeto Greenfield (PT-BR)

Guia rapido para iniciar um projeto do zero no ecossistema AIOS.

## Indice
- [Quando usar](#quando-usar)
- [Fluxo recomendado](#fluxo-recomendado)
- [Comandos de arranque (copiar e colar)](#comandos-de-arranque-copiar-e-colar)
- [Checklist de conclusao](#checklist-de-conclusao)

## Quando usar

Use este guia quando o produto ainda nao existe e voce precisa criar estrutura, requisitos, arquitetura e execucao do zero.

## Fluxo recomendado

1. Orquestracao inicial
- Chame `@aios-master` e rode `*help`.
- Inicie workflow guiado: `*workflow greenfield-fullstack --mode=guided`.

2. Descoberta e requisitos
- `@analyst *create-project-brief`
- `@pm *create-prd`
- Se necessario, `@pm *gather-requirements`

3. Arquitetura
- `@architect *create-full-stack-architecture`
- `@architect *create-plan`
- `@architect *create-context`

4. Story e backlog
- `@sm *draft`
- `@po *backlog-add` para follow-ups e debitos
- `@po *stories-index` para consolidar historias

5. Implementacao
- `@dev *develop {story-id}`
- Ou fluxo autonomo: `@dev *build {story-id}`
- Validacao local: `@dev *run-tests`

6. Qualidade e gate
- `@qa *review-build {story-id}`
- `@qa *gate {story-id}`
- Se houver correcoes: `@dev *apply-qa-fixes`

7. Entrega e release
- `@devops *pre-push`
- `@devops *create-pr`
- `@devops *release` (quando aplicavel)

## Comandos de arranque (copiar e colar)

```text
@aios-master *workflow greenfield-fullstack --mode=guided
@analyst *create-project-brief
@pm *create-prd
@architect *create-full-stack-architecture
@sm *draft
@dev *develop STORY-001
@qa *review-build STORY-001
@devops *pre-push
```

## Checklist de conclusao

- PRD e arquitetura aprovados
- Stories indexadas e priorizadas
- Testes e lint passando
- Gate de QA aprovado
- PR criada com contexto completo
