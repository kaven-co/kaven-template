---
title: AIOS_GUIA_RAPIDO_PTBR
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

# AIOS - Guia Rápido (PT-BR)

Guia direto para navegar no ecossistema AIOS com comandos por agente, visão por categoria e resumo do seu squad.

## Índice
- [Visão geral](#visao-geral)
- [Comandos completos por agente](#comandos-completos-por-agente)
- [Comandos completos por categoria](#comandos-completos-por-categoria)
- [Seu time de squad](#seu-time-de-squad)
- [Fluxo recomendado de uso](#fluxo-recomendado-de-uso)

## Visão geral

- Total de agentes AIOS mapeados: **12**
- Fonte oficial dos comandos: `.aios-core/development/agents`
- Catálogo completo por agente: [AIOS_COMANDOS_POR_AGENTE_PTBR.md](AIOS_COMANDOS_POR_AGENTE_PTBR.md)
- Catálogo completo por categoria: [AIOS_COMANDOS_POR_CATEGORIA_PTBR.md](AIOS_COMANDOS_POR_CATEGORIA_PTBR.md)

## Comandos completos por agente

Use este arquivo quando você já sabe qual persona quer acionar:
- [Abrir catálogo por agente](AIOS_COMANDOS_POR_AGENTE_PTBR.md)

## Comandos completos por categoria

Use este arquivo quando você quer decidir o agente pela natureza da tarefa:
- [Abrir catálogo por categoria](AIOS_COMANDOS_POR_CATEGORIA_PTBR.md)

## Seu time de squad

### MMOS Squad
- Nome técnico: `mmos-squad`
- Versão: **3.0.1**
- AIOS mínimo: **2.1.0**
- Mind clones mapeados: **27**
- Agentes do squad: **10**
- Manifesto do squad: `squads/mmos-squad/squad.yaml`
- Visão funcional completa: `squads/mmos-squad/README.md`

### Papéis do seu squad (resumo rápido)
- `mind-mapper`: orquestra o pipeline e atua como entrada principal
- `cognitive-analyst` e `identity-analyst`: fazem a modelagem cognitiva (camadas mentais)
- `research-specialist`: coleta e organiza fontes
- `system-prompt-architect`: transforma análise em prompts operacionais
- `mind-pm`: acompanha progresso de pipeline
- `debate` e `emulator`: validação de fidelidade e ativação de clone
- `data-importer`: integração e persistência de dados

## Fluxo recomendado de uso

1. Orquestração inicial: `@aios-master *help`
2. Descoberta e produto: `@analyst` / `@pm` / `@po` / `@sm`
3. Arquitetura e implementação: `@architect` -> `@dev`
4. Qualidade e release: `@qa` -> `@devops`
5. Quando necessário, evolua o ecossistema com `@squad-creator` e o `mmos-squad`
