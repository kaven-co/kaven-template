---
title: 22_REFERENCIAS_OFICIAIS
version: 1.0.0
type: reference
domain: aios
audience: [iniciante,avancado]
level: quick
status: active
lang: pt-BR
squads_scope: personal
updated: 2026-02-13
tags: [aios, referencia, oficial, squads-personais]
---

# Referencias Oficiais (Projeto Atual)

Fontes oficiais locais usadas neste playbook.

## Projeto base (Kaven Framework)
- `README.md`
  - Quick Start do projeto (`pnpm setup`, `pnpm dev`)
  - comandos operacionais (`pnpm quality`, `pnpm build`, etc.)
- `package.json`
  - scripts oficiais (`setup`, `docker:up`, `db:migrate`, `db:seed`, `dev`)

## AIOS no repositório
- `.aios-core/working-in-the-brownfield.md`
  - fluxo oficial de brownfield
  - comandos e decisões para mudanças em sistema legado

## Squads pessoais (MMOS)
- `squads/mmos-squad/squad.yaml`
- `squads/mmos-squad/README.md`
- `squads/mmos-squad/tasks/index.md`
- `squads/mmos-squad/scripts/python-wrapper.js`

## Observacao sobre instalacao global do AIOS

Neste repositório, o AIOS esta embarcado localmente em `.aios-core` (modo recomendado para este projeto).

Se voce usa AIOS global no seu ambiente, use a documentacao/instalador oficial da sua distribuicao AIOS fora deste repositório.
