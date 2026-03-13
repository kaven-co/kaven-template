---
title: 09_MATRIZ_RACI_AGENTES
version: 1.0.0
type: reference
domain: aios
audience: [iniciante,avancado]
level: quick
status: active
lang: pt-BR
squads_scope: personal
updated: 2026-02-13
tags: [aios, playbook, quick-guide, squads-personais]
---

# Matriz RACI Agentes

R = Responsible, A = Accountable, C = Consulted, I = Informed

| Etapa | aios-master | analyst | pm | po | sm | architect | dev | qa | devops | data-engineer | ux-design-expert | squad-creator |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Descoberta inicial | A | R | C | I | I | C | I | I | I | I | C | I |
| Requisitos | C | C | A/R | C | I | C | I | I | I | I | C | I |
| Planejamento de story | C | I | C | C | A/R | C | I | I | I | I | I | I |
| Arquitetura tecnica | C | I | I | I | I | A/R | C | C | I | C | C | I |
| Implementacao | I | I | I | I | C | C | A/R | C | I | C | C | I |
| Qualidade e gate | I | I | I | I | I | C | C | A/R | I | C | C | I |
| PR e release | I | I | I | I | I | I | C | C | A/R | I | I | I |
| Evolucao de framework/squad | A/R | I | I | I | I | C | C | C | C | C | C | R |

## Links
- Guia rapido: [[01_GUIA_RAPIDO]]
- Sprint semanal: [[06_GUIA_SPRINT_SEMANAL]]
