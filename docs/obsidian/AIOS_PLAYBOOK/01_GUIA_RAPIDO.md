---
title: 01_GUIA_RAPIDO
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

# Guia Rapido

## Quick Start (60-120s)

### A) Preparar ambiente deste projeto (com instalador)
```bash
pnpm setup
pnpm dev
```

### B) Preparar ambiente deste projeto (sem instalador)
```bash
pnpm install
pnpm docker:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### C) Instalar/usar AIOS globalmente (fora deste repo)
- Neste repositorio, o AIOS ja vem embarcado em `.aios-core` (modo local recomendado).
- Para uso global, siga o instalador oficial da sua distribuicao AIOS no seu ambiente.
- Referencia oficial deste projeto: [[22_REFERENCIAS_OFICIAIS]]

## Iniciar projeto novo (greenfield ou brownfield)

1. Ver estado geral:
- `@aios-master *status`
- `@aios-master *plan status`

2. Escolher trilha:
- Greenfield: [[04_GUIA_GREENFIELD]]
- Brownfield: [[05_GUIA_BROWNFIELD]]

3. Executar com governanca:
- RACI: [[09_MATRIZ_RACI_AGENTES]]
- Checklists: [[10_CHECKLISTS_OPERACIONAIS]]
- Catalogo de comandos: [[_catalogos/AIOS_COMANDOS_POR_CATEGORIA_PTBR]]

## Aprofundamento (quando precisar)

- Fluxo de retomada para continuar trabalho: [[03_GUIA_RETOMADA]]
- Sprint operacional: [[06_GUIA_SPRINT_SEMANAL]]
- PR padrao e entrega: [[07_GUIA_PR_PADRAO_TIME]]
- Documentacao oficial mapeada: [[22_REFERENCIAS_OFICIAIS]]
