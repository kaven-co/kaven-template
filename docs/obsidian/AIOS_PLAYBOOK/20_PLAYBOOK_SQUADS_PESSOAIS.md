---
title: 20_PLAYBOOK_SQUADS_PESSOAIS
version: 1.0.0
type: playbook
domain: aios
audience: [iniciante, avancado]
level: quick
status: active
lang: pt-BR
squads_scope: personal
updated: 2026-02-13
tags: [aios, squads, pessoal, playbook, privacidade]
---

# Playbook de Squads Pessoais

Guia operacional rapido para manter, evoluir e proteger squads pessoais no dia a dia.

## 1) Objetivo
- Ter um fluxo pratico para criar, manter e retomar squads pessoais sem documentacao pesada.

## 2) Rotina minima (semanal)
1. Validar estado do ecossistema
- `@aios-master *status`
- `@aios-master *plan status`

2. Revisar prioridades do squad
- `@po *backlog-summary`
- `@po *backlog-prioritize`

3. Evoluir componente necessario
- `@squad-creator *analyze-squad`
- `@squad-creator *extend-squad`

4. Validar qualidade antes de entregar
- `@qa *review-build {story-id}`
- `@qa *gate {story-id}`

5. Entrega segura
- `@devops *pre-push`
- `@devops *create-pr`

## 3) Fluxo de criacao/expansao de squad pessoal
1. Desenho inicial
- `@squad-creator *design-squad`

2. Criacao
- `@squad-creator *create-squad`

3. Validacao
- `@squad-creator *validate-squad`

4. Evolucao incremental
- `@squad-creator *extend-squad`
- `@squad-creator *analyze-squad`

## 4) Regras de privacidade (obrigatorias)
- Nao publicar prompts proprietarios completos
- Nao publicar paths internos sensiveis
- Nao publicar tokens/chaves/endpoints reais
- Sanitizar exemplos antes de compartilhar
- Segregar materiais publicos e privados em pastas diferentes

Referencia: [[14_GUIA_SANITIZACAO_SQUADS_PRIVADOS]]

## 5) Estrutura recomendada de notas (Obsidian)
- Nota de squad (1 por squad): objetivo, escopo, owners, comandos chave
- Nota de handoff: [[18_TEMPLATE_HANDOFF_AGENTE]]
- Nota de decisao: [[17_TEMPLATE_DECISAO_RAPIDA]]
- Nota de incidente: [[12_TEMPLATE_POSTMORTEM_LIGHT]]

## 6) Checklist de saude do squad
- [ ] Squad com objetivo claro e escopo atual
- [ ] Comandos essenciais documentados
- [ ] Fluxo de retomada testado
- [ ] Regras de privacidade seguidas
- [ ] Backlog atualizado
- [ ] Ultima validacao de qualidade registrada

## 7) Atalhos
```text
@squad-creator *list-squads
@squad-creator *analyze-squad
@squad-creator *extend-squad
@aios-master *status
@po *backlog-summary
```

## Links
- [[00_MOC_AIOS_PLAYBOOK]]
- [[02_KANBAN_OPERACIONAL]]
- [[03_GUIA_RETOMADA]]
- [[10_CHECKLISTS_OPERACIONAIS]]
- [[21_GUIA_LITERAL_SQUADS_DA_RAIZ]]
