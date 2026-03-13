---
title: 21_GUIA_LITERAL_SQUADS_DA_RAIZ
version: 1.0.0
type: guide
domain: aios
audience: [iniciante, avancado]
level: quick
status: active
lang: pt-BR
squads_scope: personal
updated: 2026-02-13
tags: [aios, squads, mmos, guia-literal, squads-personais]
---

# Guia Literal dos Squads da Raiz (V2)

Guia objetivo do que existe hoje em `squads/` neste projeto, com foco operacional.

## 1) Inventario real da pasta `squads/`

Hoje existe 1 squad pessoal:
- `squads/mmos-squad`

Resumo do manifesto:
- Nome: `mmos-squad`
- Versao: `3.0.1`
- Tipo: `squad` (AIOS minimo `2.1.0`)
- Minds mapeados: `27`
- Agentes: `10`
- Prefixo slash: `mmos`

## 2) Estrutura real do `mmos-squad`

Pastas principais:
- `squads/mmos-squad/agents` (10 agentes)
- `squads/mmos-squad/tasks` (26 tasks indexadas)
- `squads/mmos-squad/minds` (manifesto + clones)
- `squads/mmos-squad/lib` (motor Python)
- `squads/mmos-squad/scripts` (wrapper Node/Python)
- `squads/mmos-squad/adapters` (integracao de servicos)
- `squads/mmos-squad/config` (frameworks de debate)

Arquivos-chave:
- `squads/mmos-squad/squad.yaml`
- `squads/mmos-squad/README.md`
- `squads/mmos-squad/tasks/index.md`
- `squads/mmos-squad/minds/MIGRATION_MANIFEST.yaml`
- `squads/mmos-squad/scripts/python-wrapper.js`

## 3) O que o squad faz (na pratica)

Pipeline MMOS (6 fases):
1. `VIABILITY`
2. `RESEARCH`
3. `ANALYSIS`
4. `SYNTHESIS`
5. `PROMPT`
6. `TESTING`

Uso central:
- Criar/atualizar clone cognitivo de uma pessoa
- Validar fidelidade
- Gerar prompts prontos para uso
- Debater clones entre si

## 4) Agentes reais e papel de cada um

- `mind-mapper`: orquestrador principal do pipeline
- `mind-pm`: gestao de pipeline/checkpoints/rollback
- `research-specialist`: descoberta e coleta de fontes
- `cognitive-analyst`: analise DNA Mental em camadas
- `identity-analyst`: valores/obsessoes/contradicoes
- `charlie-synthesis-expert`: sintese, chunking e recomendacoes
- `system-prompt-architect`: compilacao de system prompts
- `debate`: debates entre clones e benchmarking
- `emulator`: ativacao e interacao com clones
- `data-importer`: importacao/validacao de fontes

## 5) Comandos essenciais por fluxo

### 5.1 Fluxo completo (greenfield)
```text
@mind-mapper *map {nome}
```

### 5.2 Atualizacao (brownfield)
```text
@mind-pm *brownfield-update
@mind-pm *status
```

### 5.3 Debate entre clones
```text
@debate *debate clone1 clone2 "topico"
@debate *leaderboard
```

### 5.4 Ativar clone e consultar
```text
@emulator *activate {mind-name}
@emulator *advice
@emulator *stats
```

### 5.5 Importacao de fontes
```text
@data-importer *preview {mind_slug}
@data-importer *validate {mind_slug}
@data-importer *import {mind_slug}
```

## 6) Operacao via wrapper (quando necessario)

Executar debate:
```bash
node squads/mmos-squad/scripts/python-wrapper.js debate sam_altman elon_musk "Should AI be open source?"
```

Listar minds:
```bash
node squads/mmos-squad/scripts/python-wrapper.js list
```

Info de mind:
```bash
node squads/mmos-squad/scripts/python-wrapper.js info sam_altman
```

Importar fontes:
```bash
node squads/mmos-squad/scripts/python-wrapper.js import sam_altman --preview
```

## 7) Rotina semanal recomendada para este squad

1. Estado global: `@aios-master *status`
2. Estado do pipeline: `@mind-pm *status`
3. Evolucao/execucao: `@mind-mapper *map {nome}` ou fase especifica
4. Qualidade: `@qa *review-build {story-id}` e `@qa *gate {story-id}`
5. Entrega: `@devops *pre-push` e `@devops *create-pr`

## 8) Privacidade (squads pessoais)

- Nao publicar prompts proprietarios completos
- Nao expor dados internos dos minds
- Sanitizar exemplos antes de compartilhar externamente

Complemento:
- [[14_GUIA_SANITIZACAO_SQUADS_PRIVADOS]]
- [[20_PLAYBOOK_SQUADS_PESSOAIS]]

## 9) Fontes lidas para este guia

- `squads/mmos-squad/squad.yaml`
- `squads/mmos-squad/README.md`
- `squads/mmos-squad/tasks/index.md`
- `squads/mmos-squad/scripts/python-wrapper.js`
- `squads/mmos-squad/adapters/index.js`
- `squads/mmos-squad/adapters/mcp-adapter.js`
- `squads/mmos-squad/minds/MIGRATION_MANIFEST.yaml`

